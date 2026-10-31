# 🚀 Guia de Deploy - Vercel via GitHub

**Deploy automático configurado!**  
Push para GitHub → Vercel faz deploy automaticamente

---

## ⚡ Deploy Rápido (3 Passos)

### 1️⃣ Preparar Repositório Git

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar remote do GitHub
git remote add origin https://github.com/helogourmetdelicias-png/autometa.git

# Verificar remote
git remote -v
```

### 2️⃣ Fazer Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Criar commit
git commit -m "feat: sistema completo de publicação automática no Facebook"

# Push para GitHub (primeira vez)
git push -u origin main

# OU se a branch for 'master'
git push -u origin master
```

### 3️⃣ Conectar Vercel ao GitHub

**Opção A: Via Dashboard da Vercel (Recomendado)**

1. Acessar: https://vercel.com/dashboard
2. Clicar em **"Add New Project"**
3. Selecionar **"Import Git Repository"**
4. Escolher o repositório: `helogourmetdelicias-png/autometa`
5. Clicar em **"Import"**
6. **Framework Preset:** Next.js (detectado automaticamente)
7. **Root Directory:** `./` (deixar padrão)
8. Clicar em **"Deploy"**

**Opção B: Via Vercel CLI**

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Login na Vercel
vercel login
# Escolher: Continue with Google
# Email: martinsantosric@gmail.com

# Deploy
vercel --prod
```

---

## 🔧 Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Após primeiro deploy, configurar as variáveis de ambiente.

### Via Dashboard (Recomendado)

1. Acessar: https://vercel.com/dashboard
2. Selecionar o projeto **"autometa"**
3. Ir em **Settings** → **Environment Variables**
4. Adicionar cada variável:

| Nome | Valor | Ambientes |
|------|-------|-----------|
| `META_PAGE_ID` | `1416962368160245` | Production, Preview, Development |
| `META_PAGE_ACCESS_TOKEN` | `<SEU_TOKEN_AQUI>` | Production, Preview, Development |
| `ADMIN_SECRET` | `<GERAR_NOVO_UUID>` | Production, Preview, Development |
| `CRON_SECRET` | `<GERAR_NOVO_UUID>` | Production, Preview, Development |
| `ALLOWED_ORIGINS` | `https://autometa.vercel.app` | Production |
| `SCHEDULER_ENABLED` | `true` | Production |
| `PUBLICATION_TIME` | `09:00` | Production |
| `PUBLICATION_TIMEZONE` | `Europe/Lisbon` | Production |

**Gerar UUIDs para secrets:**
```powershell
# PowerShell (executar 2x para gerar ADMIN_SECRET e CRON_SECRET)
[guid]::NewGuid().ToString()
```

### Via CLI (Alternativa)

```bash
# Configurar uma variável
vercel env add META_PAGE_ID

# Quando perguntar, colar o valor: 1416962368160245
# Escolher ambientes: Production, Preview, Development
```

---

## ✅ Verificar Deploy

### 1. Ver URL de Produção

Após deploy, Vercel fornece URLs:
- **Produção:** `https://autometa.vercel.app`
- **Preview:** `https://autometa-<hash>.vercel.app`

### 2. Testar Funcionalidades

```bash
# Testar página de marketing
https://autometa.vercel.app/marketing

# Testar scheduler
https://autometa.vercel.app/marketing/scheduler

# Testar cron (manualmente, com CRON_SECRET)
curl -X POST https://autometa.vercel.app/api/cron/daily-post \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

### 3. Verificar Cron Configurado

1. Dashboard Vercel → Projeto → Settings → **Cron**
2. Deve aparecer: `/api/cron/daily-post` agendado para `0 9 * * *` (9h diárias)

---

## 🔄 Workflow de Desenvolvimento

### Desenvolvimento Local → Produção

```bash
# 1. Fazer alterações localmente
# ... editar arquivos ...

# 2. Testar localmente
npm run dev
# Abrir: http://localhost:3000

# 3. Quando estiver pronto, commit
git add .
git commit -m "feat: minha nova funcionalidade"

# 4. Push para GitHub
git push origin main

# 5. Vercel detecta push e faz deploy AUTOMÁTICO ✅
# Aguardar ~2 minutos

# 6. Verificar em produção
# Abrir: https://autometa.vercel.app
```

---

## 📊 Monitorar Deploys

### Via Dashboard Vercel

1. Acessar: https://vercel.com/dashboard
2. Selecionar projeto: **autometa**
3. Ver:
   - ✅ **Deployments:** Histórico de deploys
   - ✅ **Logs:** Logs em tempo real
   - ✅ **Analytics:** Métricas de uso
   - ✅ **Cron:** Status das execuções agendadas

### Via CLI

```bash
# Ver logs do último deploy
vercel logs

# Ver logs de produção
vercel logs --prod

# Ver logs do cron
vercel logs --prod | Select-String "cron"
```

---

## 🐛 Troubleshooting

### Deploy Falha com Erro de Build

**Verificar:**
```bash
# Testar build localmente primeiro
npm run build

# Se passar local mas falhar na Vercel:
# 1. Verificar Node.js version na Vercel (Settings → General)
# 2. Verificar variáveis de ambiente configuradas
# 3. Ver logs detalhados no dashboard
```

### Cron Não Executa

**Checklist:**
- [ ] Arquivo `vercel.json` existe e está commitado
- [ ] Variável `CRON_SECRET` configurada na Vercel
- [ ] Rota `/api/cron/daily-post` responde (testar manualmente)
- [ ] Verificar logs do cron no dashboard

**Testar manualmente:**
```bash
curl -X POST https://autometa.vercel.app/api/cron/daily-post \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Variáveis de Ambiente Não Funcionam

**Solução:**
1. Verificar se estão configuradas no dashboard
2. **Importante:** Após adicionar/modificar variáveis, fazer REDEPLOY:
   - Dashboard → Deployments → Último deploy → "⋯" → **Redeploy**

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] `META_PAGE_ACCESS_TOKEN` configurado APENAS na Vercel (não no código)
- [ ] `.env.local` NÃO commitado (verificar `.gitignore`)
- [ ] `ADMIN_SECRET` configurado e forte
- [ ] `CRON_SECRET` configurado e forte
- [ ] `ALLOWED_ORIGINS` contém apenas domínio de produção
- [ ] HTTPS obrigatório (Vercel faz automaticamente)

---

## 📅 Primeira Publicação Automática

Após deploy em produção:

1. **Cron executará automaticamente às 09:00 (Europe/Lisbon)**
2. Ver histórico em: `https://autometa.vercel.app/marketing/scheduler`
3. Ver post publicado na [Página Facebook](https://www.facebook.com/profile.php?id=61571849513936)

**Para testar antes das 09:00:**
```bash
# Ir para: https://autometa.vercel.app/marketing/scheduler
# Clicar no botão: "Testar Publicação Agora"
```

---

## 🎯 Resumo do Fluxo Completo

```
Você edita código localmente (c:\projetos\Meta)
    ↓
git push origin main
    ↓
GitHub recebe o código
    ↓ (webhook automático)
Vercel detecta push
    ↓
Vercel faz build (npm run build)
    ↓
Deploy em produção (https://autometa.vercel.app)
    ↓
Vercel Cron executa diariamente (09:00)
    ↓
Chama /api/cron/daily-post
    ↓
Seleciona próximo post da rotação
    ↓
Publica no Facebook via Meta Graph API
    ↓
Salva no histórico (/logs/publications.json)
    ↓
✅ Post visível na Página Montante - PDV
```

---

## 🔗 Links Rápidos

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Repositório GitHub:** https://github.com/helogourmetdelicias-png/autometa
- **Site Produção:** https://autometa.vercel.app
- **Marketing:** https://autometa.vercel.app/marketing
- **Scheduler:** https://autometa.vercel.app/marketing/scheduler
- **Página Facebook:** https://www.facebook.com/profile.php?id=61571849513936

---

## 📞 Suporte

**Documentação Vercel:** https://vercel.com/docs  
**Documentação Next.js:** https://nextjs.org/docs  
**Documentação Meta Graph API:** https://developers.facebook.com/docs/graph-api

---

*Última atualização: 30 de outubro de 2026*
