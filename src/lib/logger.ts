// Sistema de logging para publicações automáticas
import { readJson, writeJson } from './jsonStore';
import { PublicationEntry, PublicationLog, PublicationStats } from '@/types/scheduler';
import { getReelStatus } from '@/services/reels';

async function readLog(): Promise<PublicationLog> {
  return readJson('logs/publications.json', { publications: [] });
}

async function writeLog(log: PublicationLog): Promise<void> {
  await writeJson('logs/publications.json', log);
}

/**
 * Adiciona uma nova entrada ao histórico de publicações
 */
export async function savePublication(entry: PublicationEntry): Promise<void> {
  try {
    const log = await readLog();
    log.publications.unshift(entry); // Adiciona no início (mais recente primeiro)
  
    // Limita o histórico a 1000 entradas para evitar arquivo muito grande
    if (log.publications.length > 1000) {
      log.publications = log.publications.slice(0, 1000);
    }
  
    await writeLog(log);
  } catch {
    // A publicação já pode ter sido enviada; falha no histórico não deve sugerir reenvio.
    console.error('Não foi possível registrar o histórico da publicação.', { id: entry.id, status: entry.status });
  }
}

/**
 * Retorna o histórico de publicações com paginação
 */
export async function getPublicationHistory(
  limit: number = 30,
  offset: number = 0
): Promise<PublicationEntry[]> {
  const log = await readLog();
  const page = log.publications.slice(offset, offset + limit);
  const updates: Record<string, 'success' | 'error'> = {};
  await Promise.all(page.filter(entry => entry.kind === 'reel' && entry.status === 'processing' && entry.postId).slice(0, 5).map(async entry => {
    try {
      const status = await getReelStatus(entry.postId!);
      if (status !== 'processing') updates[entry.id] = status;
    } catch { /* Falha de consulta não significa falha da publicação: manter pendente. */ }
  }));
  if (Object.keys(updates).length) {
    // Releitura preserva publicações adicionadas enquanto a Meta era consultada.
    const latest = await readLog();
    for (const entry of latest.publications) {
      if (updates[entry.id] && entry.status === 'processing') {
        entry.status = updates[entry.id];
        if (entry.status === 'error') entry.error = 'A Meta recusou o processamento do Reel. Confira o formato do vídeo e as permissões antes de reenviar.';
      }
    }
    await writeLog(latest);
    return latest.publications.slice(offset, offset + limit);
  }
  return page;
}

/**
 * Retorna estatísticas das publicações
 */
export async function getPublicationStats(): Promise<PublicationStats> {
  const log = await readLog();
  
  const total = log.publications.length;
  const success = log.publications.filter(p => p.status === 'success').length;
  const failed = log.publications.filter(p => p.status === 'error').length;
  const processing = log.publications.filter(p => p.status === 'processing').length;
  const lastPublication = log.publications.length > 0 ? log.publications[0] : null;
  
  return {
    total,
    success,
    failed,
    processing,
    lastPublication,
  };
}

/**
 * Retorna o total de publicações (para paginação)
 */
export async function getTotalPublications(): Promise<number> {
  const log = await readLog();
  return log.publications.length;
}
