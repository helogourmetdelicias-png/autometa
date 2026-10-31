// Serviço de publicação automática de posts no Facebook
import { readConfig } from '@/lib/postsConfig';
import { DailyPost, DailyPostsConfig, PublicationEntry } from '@/types/scheduler';
import { publishDailyPost } from '@/services/publishDailyPost';
import { claimPublication } from '@/lib/jsonStore';
import { savePublication } from '@/lib/logger';
import { readState } from '@/lib/schedulerState';


function currentDay(timezone = process.env.PUBLICATION_TIMEZONE || 'Europe/Lisbon'): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone }).format(new Date()).toLowerCase();
}

/**
 * Lê a configuração de posts diários
 */
async function readDailyPostsConfig(): Promise<DailyPostsConfig> {
  return readConfig();
}

/**
 * Retorna o post apropriado para o dia da semana atual
 */
export async function getNextPost(kind: 'feed' | 'reel' = 'feed'): Promise<DailyPost | null> {
  const config = await readDailyPostsConfig();
  
  // Obtém o dia da semana atual (0 = domingo, 6 = sábado)
  const configTimezone = kind === 'reel' ? 'Europe/Lisbon' : process.env.PUBLICATION_TIMEZONE || config.schedule.timezone || 'Europe/Lisbon';
  const dayName = currentDay(configTimezone);
  
  // Busca o post que corresponde ao dia atual
  const post = config.posts.find(p => (p.kind || 'feed') === kind && p.days.includes(dayName));
  
  return post || null;
}

/**
 * Publica o post agendado para o dia atual
 */
export async function publishScheduledPost(kind: 'feed' | 'reel' = 'feed'): Promise<{
  success: boolean;
  postId?: string;
  error?: string;
  message?: string;
  pending?: boolean;
}> {
  try {
    // Verifica se o agendamento está habilitado
    const { enabled } = await readState();
    if (!enabled) {
      return {
        success: false,
        error: 'Agendamento desabilitado (SCHEDULER_ENABLED=false)',
      };
    }
    
    // Obtém o post do dia
    const post = await getNextPost(kind);
    
    if (!post) {
      if (kind === 'reel') return { success: true, message: 'Nenhum Reel configurado para hoje. Nenhum vídeo foi enviado.' };
      const dayName = currentDay();
      return {
        success: false,
        error: `Nenhum post configurado para ${dayName}`,
      };
    }
    
    if (kind === 'reel') {
      const timezone = 'Europe/Lisbon';
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      if (!await claimPublication(`reel-daily:${date}`)) {
        return { success: true, message: 'O Reel deste dia já foi enviado ou está em verificação. Consulte o histórico antes de reenviar.' };
      }
    }
    const result = await publishDailyPost(post);
    
    // Cria entrada para o log
    const entry: PublicationEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      postId: result.success ? result.postId : null,
      message: post.message,
      link: post.link || undefined,
      kind,
      status: result.success ? (result.pending ? 'processing' : 'success') : 'error',
      timestamp: new Date().toISOString(),
      error: result.success ? undefined : result.error,
      dayOfWeek: currentDay(kind === 'reel' ? 'Europe/Lisbon' : undefined),
    };
    
    // Salva no histórico
    await savePublication(entry);
    
    if (result.success) {
      return {
        success: true,
        postId: result.postId,
        pending: result.pending,
        message: result.pending ? `Reel enviado à Meta e em processamento: ${post.id}. Consulte o histórico para confirmar a publicação.` : `Post publicado com sucesso: ${post.id}`,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Salva erro no log
    const entry: PublicationEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      postId: null,
      message: 'Erro ao processar publicação',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      dayOfWeek: currentDay(kind === 'reel' ? 'Europe/Lisbon' : undefined),
    };
    
    await savePublication(entry);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verifica se é hora de publicar baseado no horário configurado
 */
export function isTimeToPublish(scheduledTime: string, timezone: string): boolean {
  try {
    // Para implementação completa com timezone, usaríamos date-fns-tz aqui
    // Por simplicidade, comparamos apenas hora e minuto locais
    const now = new Date();
    const [hour, minute] = scheduledTime.split(':').map(Number);
    
    return now.getHours() === hour && now.getMinutes() === minute;
  } catch {
    return false;
  }
}
