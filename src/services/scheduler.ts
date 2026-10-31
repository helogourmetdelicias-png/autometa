// Serviço de agendamento local usando node-cron
// NOTA: Este serviço é apenas para desenvolvimento local
// Em produção, usamos Vercel Cron Jobs
import cron from 'node-cron';
import { publishScheduledPost } from './autoPublisher';

let schedulerTask: ReturnType<typeof cron.schedule> | null = null;

/**
 * Inicia o agendamento local de publicações
 */
export function startScheduler(): void {
  // Verifica se já está rodando
  if (schedulerTask) {
    console.warn('⚠️  Scheduler já está rodando');
    return;
  }
  
  // Verifica se está habilitado
  const enabled = process.env.SCHEDULER_ENABLED === 'true';
  if (!enabled) {
    console.warn('⚠️  Scheduler desabilitado (SCHEDULER_ENABLED=false)');
    return;
  }
  
  // Obtém configuração de horário
  const publicationTime = process.env.PUBLICATION_TIME || '09:00';
  const [hour, minute] = publicationTime.split(':');
  
  // Cria expressão cron (minuto hora dia-do-mês mês dia-da-semana)
  const cronExpression = `${minute} ${hour} * * *`;
  
  console.log(`📅 Configurando scheduler para: ${publicationTime} (cron: ${cronExpression})`);
  
  // Cria tarefa agendada
  schedulerTask = cron.schedule(cronExpression, async () => {
    console.log(`\n⏰ Executando publicação agendada (${new Date().toISOString()})`);
    
    try {
      const result = await publishScheduledPost();
      
      if (result.success) {
        console.log(`✅ Publicação bem-sucedida! Post ID: ${result.postId}`);
      } else {
        console.error(`❌ Erro na publicação: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ Exceção durante publicação: ${errorMessage}`);
    }
  });
  
  schedulerTask.start();
  console.log('✅ Scheduler iniciado com sucesso!');
}

/**
 * Para o agendamento local
 */
export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('🛑 Scheduler parado');
  } else {
    console.warn('⚠️  Scheduler não está rodando');
  }
}

/**
 * Verifica se o scheduler está rodando
 */
export function isSchedulerRunning(): boolean {
  return schedulerTask !== null;
}
