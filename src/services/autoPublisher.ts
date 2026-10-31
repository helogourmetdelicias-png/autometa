// Serviço de publicação automática de posts no Facebook
import { readConfig } from '@/lib/postsConfig';
import { DailyPost, DailyPostsConfig, PublicationEntry } from '@/types/scheduler';
import { publishToFacebook } from '@/services/facebook';
import { savePublication } from '@/lib/logger';
import { readState } from '@/lib/schedulerState';


// Mapeamento de índices de dia da semana para nomes
const DAY_NAMES: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

/**
 * Lê a configuração de posts diários
 */
async function readDailyPostsConfig(): Promise<DailyPostsConfig> {
  return readConfig();
}

/**
 * Retorna o post apropriado para o dia da semana atual
 */
export async function getNextPost(): Promise<DailyPost | null> {
  const config = await readDailyPostsConfig();
  
  // Obtém o dia da semana atual (0 = domingo, 6 = sábado)
  const configTimezone = process.env.PUBLICATION_TIMEZONE || config.schedule.timezone || 'Europe/Lisbon';
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: configTimezone }).format(new Date()).toLowerCase();
  const today = Object.keys(DAY_NAMES).map(Number).find(day => DAY_NAMES[day] === weekday)!;
  const dayName = DAY_NAMES[today];
  
  // Busca o post que corresponde ao dia atual
  const post = config.posts.find(p => p.days.includes(dayName));
  
  return post || null;
}

/**
 * Publica o post agendado para o dia atual
 */
export async function publishScheduledPost(): Promise<{
  success: boolean;
  postId?: string;
  error?: string;
  message?: string;
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
    const post = await getNextPost();
    
    if (!post) {
      const today = new Date().getDay();
      const dayName = DAY_NAMES[today];
      return {
        success: false,
        error: `Nenhum post configurado para ${dayName}`,
      };
    }
    
    // Publica no Facebook
    const result = await publishToFacebook(post.message, post.link || undefined, post.imageUrl || undefined);
    
    // Cria entrada para o log
    const entry: PublicationEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      postId: result.success ? result.postId : null,
      message: post.message,
      link: post.link || undefined,
      status: result.success ? 'success' : 'error',
      timestamp: new Date().toISOString(),
      error: result.success ? undefined : result.error,
      dayOfWeek: DAY_NAMES[new Date().getDay()],
    };
    
    // Salva no histórico
    await savePublication(entry);
    
    if (result.success) {
      return {
        success: true,
        postId: result.postId,
        message: `Post publicado com sucesso: ${post.id}`,
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
      dayOfWeek: DAY_NAMES[new Date().getDay()],
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
