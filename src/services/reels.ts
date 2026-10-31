import { PublishResponse } from '@/types/facebook';

const GRAPH = 'https://graph.facebook.com/v26.0';
class MetaReelError extends Error {}

export function validVideoUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

async function meta(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(45000), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok || data.error) {
    // Não devolver textos da Meta que possam conter credenciais.
    throw new MetaReelError(`A Meta recusou a operação de vídeo (código ${data.error?.code || response.status}). Confira o token, as permissões e o formato do vídeo.`);
  }
  return data;
}

export async function getReelStatus(videoId: string): Promise<'success' | 'processing' | 'error'> {
  if (!/^\d+$/.test(videoId)) throw new Error('ID de vídeo inválido.');
  const data = await meta(`${GRAPH}/${videoId}?fields=status`, {
    headers: { Authorization: `Bearer ${process.env.META_PAGE_ACCESS_TOKEN}` },
  });
  const status = data.status;
  if (status?.publishing_phase?.publish_status === 'published') return 'success';
  if (['error', 'expired', 'upload_failed'].includes(status?.video_status) ||
      [status?.uploading_phase, status?.processing_phase, status?.publishing_phase].some(phase => phase?.status === 'error' || phase?.publish_status === 'error')) return 'error';
  return 'processing';
}

export async function publishReel(message: string, videoUrl: string, link?: string): Promise<PublishResponse> {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return { success: false, error: 'Configure as credenciais da Página no servidor.' };
  if (!validVideoUrl(videoUrl)) return { success: false, error: 'Informe o endereço HTTPS público do vídeo.' };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' };
  let videoId: string | undefined;
  let finishing = false;
  try {
    const session = await meta(`${GRAPH}/${pageId}/video_reels`, {
      method: 'POST', headers, body: new URLSearchParams({ upload_phase: 'start' }),
    });
    if (typeof session.video_id !== 'string' || !/^\d+$/.test(session.video_id)) throw new Error('A Meta não retornou um ID de vídeo válido.');
    const createdVideoId: string = session.video_id;
    videoId = createdVideoId;
    const upload = new URL(session.upload_url);
    if (upload.origin !== 'https://rupload.facebook.com' || upload.username || upload.password) throw new Error('A Meta retornou um endereço de upload inesperado.');
    const transferred = await meta(upload.toString(), { method: 'POST', headers: { Authorization: `OAuth ${token}`, file_url: videoUrl } });
    if (transferred.success !== true) throw new Error('A Meta não confirmou o recebimento do vídeo.');
    finishing = true;
    const finished = await meta(`${GRAPH}/${pageId}/video_reels`, {
      method: 'POST', headers,
      body: new URLSearchParams({ upload_phase: 'finish', video_id: createdVideoId, video_state: 'PUBLISHED', description: [message.trim(), link?.trim()].filter(Boolean).join('\n\n') }),
    });
    if (finished.success !== true) { finishing = false; throw new Error('A Meta não aceitou a publicação do Reel.'); }
    // O processamento continua na Meta, sem manter a função do Vercel aberta.
    return { success: true, postId: createdVideoId, pending: true };
  } catch (error) {
    // Se a resposta final se perdeu, não sugerir reenvio: o Reel pode ter sido aceito.
    if (finishing && videoId && !(error instanceof MetaReelError)) return { success: true, postId: videoId, pending: true };
    return { success: false, error: error instanceof Error && !/fetch|timeout|abort/i.test(error.message) ? error.message : 'Falha de conexão no envio do Reel. Consulte o histórico antes de tentar novamente.' };
  }
}
