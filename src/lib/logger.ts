// Sistema de logging para publicações automáticas
import { promises as fs } from 'fs';
import path from 'path';
import { PublicationEntry, PublicationLog, PublicationStats } from '@/types/scheduler';

const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'publications.json');

/**
 * Garante que o diretório de logs existe
 */
async function ensureLogsDir(): Promise<void> {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    // Ignora erro se o diretório já existe
    if (error instanceof Error && 'code' in error && error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Lê o arquivo de log de publicações
 */
async function readLog(): Promise<PublicationLog> {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    const data: unknown = JSON.parse(content);
    
    // Validação básica da estrutura
    if (typeof data === 'object' && data !== null && 'publications' in data && Array.isArray((data as PublicationLog).publications)) {
      return data as PublicationLog;
    }
    
    // Se o arquivo está corrompido, retorna estrutura vazia
    return { publications: [] };
  } catch (error) {
    // Se o arquivo não existe, retorna estrutura vazia
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return { publications: [] };
    }
    throw error;
  }
}

/**
 * Salva o log de publicações
 */
async function writeLog(log: PublicationLog): Promise<void> {
  await ensureLogsDir();
  await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
}

/**
 * Adiciona uma nova entrada ao histórico de publicações
 */
export async function savePublication(entry: PublicationEntry): Promise<void> {
  const log = await readLog();
  log.publications.unshift(entry); // Adiciona no início (mais recente primeiro)
  
  // Limita o histórico a 1000 entradas para evitar arquivo muito grande
  if (log.publications.length > 1000) {
    log.publications = log.publications.slice(0, 1000);
  }
  
  await writeLog(log);
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
