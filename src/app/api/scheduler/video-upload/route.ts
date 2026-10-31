import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseConfig } from '@/lib/jsonStore';

// O vídeo vai direto do navegador ao Supabase, sem atravessar o limite de corpo do Vercel.
export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: 'Configure o Supabase para enviar vídeos.' }, { status: 503 });
  try {
    const body = await request.json();
    if (body.type !== 'video/mp4' || !Number.isSafeInteger(body.size) || body.size <= 0 || body.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Envie um vídeo MP4 de até 50 MB.' }, { status: 400 });
    }
    const object = `reels/${randomUUID()}.mp4`;
    const response = await fetch(`${config.url}/storage/v1/object/upload/sign/marketing-videos/${object}`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Não foi possível preparar o upload. Execute supabase/reels.sql para criar o bucket de vídeos.');
    const data = await response.json();
    if (typeof data.url !== 'string') throw new Error('O Supabase não retornou um endereço de upload.');
    const signedUrl = new URL(`${config.url}/storage/v1${data.url}`);
    if (signedUrl.origin !== new URL(config.url).origin) throw new Error('Endereço de upload inválido.');
    return NextResponse.json({ signedUrl: signedUrl.toString(), videoUrl: `${config.url}/storage/v1/object/public/marketing-videos/${object}` }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao preparar vídeo.' }, { status: 500 });
  }
}
