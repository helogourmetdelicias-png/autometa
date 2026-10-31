// Script para executar o scheduler localmente durante desenvolvimento
// Uso: node scripts/run-scheduler.js

const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Importa o scheduler (precisa ser compilado ou usar ts-node)
// Como estamos usando JavaScript puro, vamos fazer uma implementação simplificada
const cron = require('node-cron');
const https = require('https');

console.log('🚀 Iniciando scheduler local...');
console.log(`📅 Horário configurado: ${process.env.PUBLICATION_TIME || '09:00'}`);
console.log(`🌍 Timezone: ${process.env.PUBLICATION_TIMEZONE || 'Europe/Lisbon'}`);
console.log(`📊 Status: ${process.env.SCHEDULER_ENABLED === 'true' ? '✅ Habilitado' : '⏸️ Desabilitado'}`);
console.log('');

if (process.env.SCHEDULER_ENABLED !== 'true') {
  console.warn('⚠️  Scheduler desabilitado. Defina SCHEDULER_ENABLED=true no .env.local');
  process.exit(0);
}

// Configurar expressão cron
const publicationTime = process.env.PUBLICATION_TIME || '09:00';
const [hour, minute] = publicationTime.split(':');
const cronExpression = `${minute} ${hour} * * *`;

console.log(`⏰ Agendamento configurado: ${cronExpression}`);
console.log('✅ Scheduler iniciado com sucesso!');
console.log('📝 Aguardando horário de publicação...');
console.log('🛑 Pressione Ctrl+C para parar\n');

// Cria tarefa agendada
const task = cron.schedule(cronExpression, async () => {
  console.log(`\n⏰ Executando publicação agendada (${new Date().toISOString()})`);
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/cron/daily-post',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            console.log(`✅ Publicação bem-sucedida! Post ID: ${result.postId}`);
          } else {
            console.error(`❌ Erro na publicação: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar resposta: ${error.message}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro na requisição: ${error.message}`);
    });

    req.end();
  } catch (error) {
    console.error(`❌ Exceção durante publicação: ${error.message}`);
  }
});

task.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando scheduler...');
  task.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando scheduler...');
  task.stop();
  process.exit(0);
});
