# Guia de Automação - Montante PDV

Sistema de publicação automática diária no Facebook com posts rotativos.

## 🎯 Visão Geral

O sistema permite agendar publicações automáticas no Facebook com diferentes posts para cada dia da semana.

## 📋 Opções de Agendamento

### 1. Vercel Cron Jobs (Recomendado para Produção)

**Prós:**
- ✅ Configuração automática via `vercel.json`
- ✅ Altamente confiável
- ✅ Sem necessidade de servidor sempre ligado
- ✅ Gratuito no plano Hobby

**Contras:**
- ❌ Funciona apenas em produção (Vercel)
- ❌ Horário em UTC (necessita conversão)

**Como Usar:**
1. Deploy na Vercel
2. Configure `CRON_SECRET` nas variáveis de ambiente
3. O arquivo `vercel.json` já está configurado
4. Cron executa automaticamente às 09:00 UTC

### 2. Node.js Scheduler Local (Desenvolvimento)

**Prós:**
- ✅ Perfeito para desenvolvimento
- ✅ Suporta timezone local
- ✅ Fácil de debugar

**Contras:**
- ❌ Requer processo rodando continuamente
- ❌ Não recomendado para produção

**Como Usar:**
```bash
npm run scheduler:start
```

### 3. Windows Task Scheduler (On-Premise)

**Prós:**
- ✅ Ideal para servidores Windows dedicados
- ✅ Não depende de serviços cloud
- ✅ Controle total do agendamento

**Contras:**
- ❌ Requer servidor Windows sempre ligado
- ❌ Configuração manual necessária

**Como Usar:**
Veja o guia completo em `TASK-SCHEDULER-SETUP.md`

## 🔧 Configuração

### Variáveis de Ambiente

```env
CRON_SECRET="secret-aleatorio-minimo-32-caracteres"
SCHEDULER_ENABLED=true
PUBLICATION_TIME=09:00
PUBLICATION_TIMEZONE=Europe/Lisbon
```

### Arquivo de Posts

Edite `content/daily-posts.json` ou use a interface web em `/marketing/scheduler`.

## 📡 API Endpoints

### GET `/api/cron/daily-post`
Executa publicação agendada (chamado pelo Vercel Cron).

**Headers:**
```
Authorization: Bearer ${CRON_SECRET}
```

### GET `/api/scheduler/status`
Retorna status do agendamento e última publicação.

### POST `/api/scheduler/test`
Executa publicação de teste imediatamente.

### GET `/api/scheduler/history`
Retorna histórico de publicações.

### GET/POST/PUT/DELETE `/api/scheduler/posts`
CRUD dos posts rotativos.

## 🧪 Testes

```bash
# Testar publicação imediata
npm run scheduler:test

# Verificar status
curl -H "Authorization: Bearer $ADMIN_SECRET" http://localhost:3000/api/scheduler/status
```

## 🔒 Segurança

- Todas as rotas protegidas por `ADMIN_SECRET` ou `CRON_SECRET`
- Logs salvos localmente (não versionados)
- Validação de entrada rigorosa

## 📊 Monitoramento

- Interface web: `/marketing/scheduler`
- Histórico completo de publicações
- Estatísticas de sucesso/falha
- Logs salvos em `logs/publications.json`

## ⚠️ Troubleshooting

### Publicação não está acontecendo

1. Verifique `SCHEDULER_ENABLED=true`
2. Confirme que `META_PAGE_ACCESS_TOKEN` está válido
3. Verifique logs em `logs/publications.json`
4. Execute teste manual: `npm run scheduler:test`

### Erro "Post não encontrado"

- Verifique se há post configurado para o dia da semana atual em `content/daily-posts.json`

### Erro de autenticação no Cron

- Confirme que `CRON_SECRET` está configurado na Vercel
- Verifique que o header `Authorization` está correto

## 📚 Documentos Relacionados

- `README.md` - Documentação principal
- `TASK-SCHEDULER-SETUP.md` - Guia Windows Task Scheduler
- `status.md` - Status de implementação
