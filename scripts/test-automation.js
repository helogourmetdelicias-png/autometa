// Script para testar a publicação automática manualmente
// Uso: node scripts/test-automation.js

const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testPublish() {
  const adminSecret = process.env.ADMIN_SECRET;
  
  if (!adminSecret) {
    console.error('❌ ADMIN_SECRET não configurado no .env.local');
    process.exit(1);
  }
  
  console.log('🧪 Testando publicação automática...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/scheduler/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminSecret}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Teste bem-sucedido!');
      console.log(`📝 Post ID: ${data.postId}`);
      console.log(`📄 Conteúdo: ${data.content}`);
    } else {
      console.error('❌ Erro no teste:', data.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Exceção:', error.message);
    console.error('💡 Verifique se o servidor está rodando: npm run dev');
    process.exit(1);
  }
}

testPublish();
