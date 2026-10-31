# ⚡ Quick Start - Deploy Imediato

**Tempo estimado:** 5 minutos  
**Resultado:** Sistema rodando em produção com publicação automática diária

---

## 🎯 Passo a Passo Rápido

### ✅ Passo 1: Commit e Push (2 min)

```bash
# Ir para a pasta do projeto
cd c:\projetos\Meta

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "feat: sistema completo Montante com publicação automática Facebook"

# Push para GitHub (primeira vez)
git push -u origin main
```

**⚠️ Se der erro "main" não existe, tentar com "master":**
```bash
git branch -M main
git push -u origin main
```

---

### ✅ Passo 2: Deploy na Vercel (2 min)

**Opção A: Via Dashboard (Mais Fácil)**

1. Abrir: https://vercel.com/dashboard
2. Login com Google: `martinsantosric@gmail.com`
3. Clicar: **"Add New Project"**
4. Clicar: **"Import Git Repository"**
5. Selecionar: `helogourmetdelicias-png/autometa`
6. Clicar: **"Import"**
7. Framework: **Next.js** (detectado automaticamente)
8. Clicar: **"Deploy"** 🚀

**Aguardar ~2 minutos** ⏳

✅ **Deploy Completo!** URL disponível (ex: `https://autometa.vercel.app`)

---

### ✅ Passo 3: Configurar Variáveis de Ambiente (1 min)

**No Dashboard da Vercel:**

1. Selecionar projeto: **autometa**
2. Ir em: **Settings** → **Environment Variables**
3. Adicionar **8 variáveis:**

```
META_PAGE_ID = 1416962368160245
META_PAGE_ACCESS_TOKEN = <COPIAR_DO_.env.local>
ADMIN_SECRET = <GERAR_NOVO_UUID_ABAIXO>
CRON_SECRET = <GERAR_NOVO_UUID_ABAIXO>
ALLOWED_ORIGINS = https://SEU-DOMINIO.vercel.app
SCHEDULER_ENABLED = true
PUBLICATION_TIME = 09:00
PUBLICATION_TIMEZONE = Europe/Lisbon
```

**Gerar UUIDs (rodar 2x no PowerShell):**
```powershell
[guid]::NewGuid().ToString()
```

**Para cada variável:**
- ✅ Marcar: **Production**
- ✅ Marcar: **Preview**
- ✅ Marcar: **Development**

4. Clicar: **Save**

5. **IMPORTANTE:** Fazer Redeploy após adicionar variáveis:
   - **Deployments** → Último deploy → "⋯" → **Redeploy**

---

## 🎉 Pronto! Sistema no Ar

### Testar Agora:

1. **Abrir site:** `https://SEU-DOMINIO.vercel.app`
2. **Ir para Marketing:** `/marketing`
3. **Testar publicação manual**
4. **Ir para Scheduler:** `/marketing/scheduler`
5. **Clicar: "Testar Publicação Agora"**
6. **Verificar post no Facebook:** https://www.facebook.com/profile.php?id=61571849513936

### Publicação Automática:

✅ **Já está configurada!**  
- **Horário:** 09:00 (todos os dias)
- **Timezone:** Europe/Lisbon (Portugal)
- **Primeiro post:** Amanhã às 09:00
- **Conteúdo:** Rotação automática dos 7 posts configurados

---

## 📋 Checklist de Verificação

Antes de encerrar, verificar:

- [ ] ✅ Código no GitHub
- [ ] ✅ Deploy na Vercel funcionando
- [ ] ✅ URL de produção acessível
- [ ] ✅ 8 variáveis de ambiente configuradas
- [ ] ✅ Redeploy feito após adicionar variáveis
- [ ] ✅ Página `/marketing` abre
- [ ] ✅ Página `/marketing/scheduler` abre
- [ ] ✅ Teste de publicação manual funcionou
- [ ] ✅ Post apareceu no Facebook
- [ ] ✅ Cron agendado visível na Vercel (Settings → Cron)

---

## 🔄 Próximos Deploys (Automático)

De agora em diante, qualquer alteração é automática:

```bash
# Editar código...
# Quando pronto:

git add .
git commit -m "feat: minha alteração"
git push

# Vercel faz deploy AUTOMATICAMENTE em ~2 minutos ✅
```

---

## 📊 Monitorar Publicações

### Via Dashboard:

1. **Site:** `https://SEU-DOMINIO.vercel.app/marketing/scheduler`
2. Ver:
   - ✅ Próxima publicação agendada
   - ✅ Histórico das últimas 30 publicações
   - ✅ Status do scheduler (ativo/inativo)

### Via Vercel:

1. **Dashboard Vercel** → Projeto → **Cron**
2. Ver execuções do cron job
3. Ver logs de cada execução

---

## 🆘 Problemas Comuns

### Push para GitHub dá erro de autenticação

**Solução:**
```bash
# Usar token pessoal do GitHub
# Gerar em: https://github.com/settings/tokens
# Permissions: repo (full control)

# Configurar credencial
git config credential.helper store
git push
# Inserir: username = helogourmetdelicias-png
# Inserir: password = <TOKEN_PESSOAL>
```

### Deploy na Vercel falha

**Solução:**
1. Ver logs detalhados no dashboard
2. Verificar se `npm run build` funciona localmente
3. Verificar Node.js version (Settings → General)

### Cron não executa

**Solução:**
1. Verificar se `vercel.json` foi commitado
2. Verificar `CRON_SECRET` configurado
3. Testar rota manualmente:
```bash
curl -X POST https://SEU-DOMINIO.vercel.app/api/cron/daily-post \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 📁 Arquivos Criados

Documentação completa criada:

- ✅ `ACCOUNTS.md` - Todas as contas e credenciais
- ✅ `DEPLOY.md` - Guia completo de deploy
- ✅ `QUICK-START.md` - Este guia rápido
- ✅ `AUTOMATION.md` - *(será criado pelo workflow)*
- ✅ `TASK-SCHEDULER-SETUP.md` - *(será criado pelo workflow)*
- ✅ `README.md` - Documentação principal
- ✅ `status.md` - Status do projeto

---

## 🎯 Resumo Ultra-Rápido

```bash
# 1. Push para GitHub
git add . && git commit -m "initial commit" && git push -u origin main

# 2. Vercel → Import Repository → Deploy
# 3. Vercel → Settings → Environment Variables → Adicionar 8 variáveis
# 4. Vercel → Redeploy

# ✅ PRONTO! Sistema no ar com publicação automática diária às 09:00
```

---

## 🔗 Links Importantes

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Repositório:** https://github.com/helogourmetdelicias-png/autometa
- **Página Facebook:** https://www.facebook.com/profile.php?id=61571849513936
- **Meta Developers:** https://developers.facebook.com

---

**🚀 Boa sorte com o deploy!**

Em caso de dúvidas, consultar:
- `DEPLOY.md` - Guia detalhado
- `ACCOUNTS.md` - Informações de contas
- `README.md` - Documentação completa

---

*Criado em: 30 de outubro de 2026*
