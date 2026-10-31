// Sistema de logging para publicações automáticas
import { readJson, writeJson } from './jsonStore';
import { PublicationEntry, PublicationLog, PublicationStats } from '@/types/scheduler';

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
  return log.publications.slice(offset, offset + limit);
}

/**
 * Retorna estatísticas das publicações
 */
export async function getPublicationStats(): Promise<PublicationStats> {
  const log = await readLog();
  
  const total = log.publications.length;
  const success = log.publications.filter(p => p.status === 'success').length;
  const failed = log.publications.filter(p => p.status === 'error').length;
  const lastPublication = log.publications.length > 0 ? log.publications[0] : null;
  
  return {
    total,
    success,
    failed,
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
