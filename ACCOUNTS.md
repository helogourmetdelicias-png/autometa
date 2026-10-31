# 🔐 Contas e Credenciais do Projeto Montante

**Data de Criação:** 30 de outubro de 2026  
**Projeto:** Montante - PDV com Publicação Automática no Facebook

---

## 📧 Contas Principais

### 1. Vercel (Hosting & Deployment)

**Plataforma:** [vercel.com](https://vercel.com)  
**Conta:** Google OAuth  
**Email:** `martinsantosric@gmail.com`  
**Tipo:** Conta Gratuita (Hobby Plan)

**Funcionalidades Utilizadas:**
- ✅ Deploy automático via GitHub
- ✅ Vercel Cron Jobs (publicação diária)
- ✅ Variáveis de ambiente (secrets)
- ✅ CI/CD automático

**Dashboard:** https://vercel.com/dashboard

---

### 2. GitHub (Repositório)

**Plataforma:** [github.com](https://github.com)  
**Conta:** `helogourmetdelicias-png`  
**Email:** `helogourmetdelicias@gmail.com`  
**Repositório:** https://github.com/helogourmetdelicias-png/autometa.git

**Branch Principal:** `main`

**Integração:**
- ✅ Conectado à conta Vercel
- ✅ Deploy automático no push para `main`
- ✅ Preview deploys em pull requests

---

### 3. Meta for Developers (Facebook API)

**Plataforma:** [developers.facebook.com](https://developers.facebook.com)  
**Página Facebook:** [Montante - PDV](https://www.facebook.com/profile.php?id=61571849513936)  
**Page ID:** `1416962368160245`

**Credenciais:**
- `META_PAGE_ID`: `1416962368160245`
- `META_PAGE_ACCESS_TOKEN`: (configurado no `.env.local` e Vercel)

**Permissões Necessárias:**
- `pages_manage_posts`
- `pages_read_engagement`

---

## 🔗 Conexões Entre Contas

### Supabase — posts automáticos e fotos

- **Conta informada:** `evelyncristini2013@gmail.com` (criada com ajuda do ChatGPT).
- **Registro:** 30/10/2026.
- **Projeto:** `suldwxsybezgoyhvpwre`.
- **URL:** https://suldwxsybezgoyhvpwre.supabase.co
- **Painel:** https://supabase.com/dashboard/project/suldwxsybezgoyhvpwre

Conta criada; integração ainda pendente de configuração e teste real.
Detalhes, chave pública fornecida e próximos passos: [SUPABASE.md](SUPABASE.md).
Chaves de servidor devem ficar nas variáveis de ambiente, sem inclusão neste arquivo.

```
GitHub (helogourmetdelicias@gmail.com)
    ↓ conectado via OAuth
Vercel (martinsantosric@gmail.com)
    ↓ deploy automático
Produção (montante-pdv.vercel.app)
    ↓ publica via API
Meta Graph API (Facebook)
    ↓
Página: Montante - PDV
```

---

## 🚀 Fluxo de Deploy

### Deploy Automático

1. **Desenvolvimento Local**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

2. **GitHub recebe o push**
   - Webhook automático notifica Vercel

3. **Vercel faz deploy automático**
   - Build do Next.js
   - Testes de produção
   - Deploy em produção
   - URL disponível em ~2 minutos

4. **Vercel Cron executa diariamente**
   - Às 09:00 (horário configurado)
   - Chama `/api/cron/daily-post`
   - Publica no Facebook automaticamente

---

## 🔑 Variáveis de Ambiente

### Desenvolvimento (`.env.local`)
```env
META_PAGE_ID="1416962368160245"
META_PAGE_ACCESS_TOKEN="<TOKEN_CONFIGURADO>"
ADMIN_SECRET="<SECRET_LOCAL>"
CRON_SECRET="<SECRET_PARA_CRON>"
ALLOWED_ORIGINS="http://localhost:3000"
SCHEDULER_ENABLED="true"
PUBLICATION_TIME="09:00"
PUBLICATION_TIMEZONE="Europe/Lisbon"
```

### Produção (Vercel Dashboard)
**Configurar em:** https://vercel.com/dashboard → Projeto → Settings → Environment Variables

Adicionar as mesmas variáveis acima, mas com:
- `ALLOWED_ORIGINS="https://seu-dominio.vercel.app"`
- Demais valores iguais ou específicos de produção

---

## 📝 Comandos Úteis

### Git (Repositório)
```bash
# Configurar remote (primeira vez)
git remote add origin https://github.com/helogourmetdelicias-png/autometa.git

# Verificar remote
git remote -v

# Push para GitHub (deploy automático)
git push origin main

# Ver status
git status

# Ver histórico
git log --oneline
```

### Vercel CLI (Opcional)
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy manual
vercel --prod

# Ver logs em tempo real
vercel logs

# Ver variáveis de ambiente
vercel env ls
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE - Nunca Compartilhar:
- ❌ `META_PAGE_ACCESS_TOKEN`
- ❌ `ADMIN_SECRET`
- ❌ `CRON_SECRET`
- ❌ Senhas das contas

### ✅ Boas Práticas:
- ✅ Tokens no `.env.local` (nunca no código)
- ✅ `.env.local` está no `.gitignore`
- ✅ Variáveis de ambiente configuradas na Vercel
- ✅ HTTPS obrigatório em produção
- ✅ Autenticação em todas as rotas sensíveis

---

## 📞 Suporte e Recuperação

### Se perder acesso ao Vercel:
1. Acessar: https://vercel.com
2. Login com Google: `martinsantosric@gmail.com`
3. Recuperar via email se necessário

### Se perder acesso ao GitHub:
1. Acessar: https://github.com
2. Login com: `helogourmetdelicias@gmail.com`
3. Recuperar via email se necessário

### Se precisar regenerar token do Facebook:
1. Acessar: https://developers.facebook.com
2. Apps → Seu App → Tools → Access Token Tool
3. Gerar novo token com permissões: `pages_manage_posts`
4. Atualizar `.env.local` E Vercel Dashboard

---

## 🔄 Rotação de Credenciais

### Page Access Token (Facebook)
**Validade:** Depende do tipo (curto prazo: 1-2h, longo prazo: 60 dias, permanente: sem expiração)  
**Recomendação:** Verificar validade mensalmente  
**Como renovar:** Meta for Developers → Access Token Tool

### ADMIN_SECRET e CRON_SECRET
**Validade:** Permanente (você controla)  
**Recomendação:** Trocar a cada 3-6 meses  
**Como renovar:** Gerar novo UUID e atualizar em todos os lugares

```bash
# Gerar novo secret (PowerShell)
[guid]::NewGuid().ToString()
```

---

## 📊 Monitoramento

### Vercel Dashboard
- Ver logs de deployment
- Ver logs de execução do cron
- Métricas de uso
- Status de builds

### Facebook Page Insights
- Ver engajamento dos posts
- Estatísticas de alcance
- Horários de maior atividade

---

## 🆘 Troubleshooting

### Deploy não acontece automaticamente
1. Verificar webhook no GitHub: Settings → Webhooks
2. Verificar conexão Vercel ↔ GitHub
3. Ver logs de build na Vercel

### Cron não executa
1. Verificar `vercel.json` está commitado
2. Verificar `CRON_SECRET` configurado
3. Ver logs do cron na Vercel

### Posts não publicam
1. Verificar token do Facebook não expirou
2. Verificar permissões da página
3. Ver logs em `/marketing/scheduler` (histórico)

---

## 📅 Checklist de Manutenção

### Mensal
- [ ] Verificar validade do Page Access Token
- [ ] Revisar logs de publicações
- [ ] Verificar posts foram publicados corretamente

### Trimestral
- [ ] Atualizar dependências do projeto (`npm update`)
- [ ] Revisar posts rotativos (atualizar conteúdo)
- [ ] Considerar rotação de secrets

### Anual
- [ ] Renovar Page Access Token (se necessário)
- [ ] Atualizar Next.js para versão LTS mais recente
- [ ] Revisar estratégia de conteúdo

---

## 📧 Contatos

**Email Principal:** martinsantosric@gmail.com  
**Email Secundário:** helogourmetdelicias@gmail.com  
**Página Facebook:** https://www.facebook.com/profile.php?id=61571849513936

---

**⚠️ ATENÇÃO:**
Este arquivo contém informações sensíveis. NÃO compartilhar publicamente.
Manter seguro e atualizado.

---

*Última atualização: 30 de outubro de 2026*
