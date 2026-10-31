# Fotos nos posts automáticos

## Projeto criado — 30/10/2026

- Conta informada pelo responsável: `evelyncristini2013@gmail.com` (criada com ajuda do ChatGPT).
- URL do projeto: https://suldwxsybezgoyhvpwre.supabase.co
- Referência do projeto: `suldwxsybezgoyhvpwre`.
- Painel: https://supabase.com/dashboard/project/suldwxsybezgoyhvpwre
- Chave pública (publishable) fornecida:
  `sb_publishable_K3Z_9xbINNPbhtQWU64eXA_a1BcKCZh`.

A chave publishable não substitui `SUPABASE_SERVICE_ROLE_KEY` na integração
preparada neste projeto. A chave de servidor não foi fornecida nem registrada
nesta documentação; deve ser configurada diretamente no Vercel e, se necessário,
no `.env.local`, nunca no repositório.

### Situação atual

- [x] Conta e projeto criados, conforme informado pelo responsável.
- [x] Código local preparado para fotos por link ou upload JPG/PNG até 3 MB.
- [x] Build local e testes simulados de publicação e persistência passaram.
- [x] Executar `supabase/setup.sql` no SQL Editor do projeto (execução informada pelo responsável).
- [x] Configurar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no Vercel (configuração informada pelo responsável).
- [ ] Enviar a integração preparada ao GitHub e fazer o deploy.
- [ ] Testar salvamento, upload real e publicação com foto.

Não foi verificado acesso ao projeto Supabase nesta etapa.

## Preparação no Supabase

1. Crie um projeto Supabase e guarde a senha do banco em local seguro.
2. Abra **SQL Editor**, copie o conteúdo de `supabase/setup.sql` e execute.
   Isso cria a tabela privada `autometa_data` e o bucket público `marketing-images`.
   As fotos desse bucket poderão ser vistas por quem tiver o link, inclusive pelo Facebook.
3. Nas configurações do projeto, copie a URL do projeto e a chave legada `service_role`
   (em API Keys / Legacy API Keys). Essa chave fica somente no servidor.
4. Adicione em Vercel → Settings → Environment Variables → Production:

```env
SUPABASE_URL=https://suldwxsybezgoyhvpwre.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
```

5. Faça o deploy da versão com essa integração.

## Uso

1. Abra `/marketing/scheduler` e informe o valor de `ADMIN_SECRET` configurado no Vercel.
   A chave fica na sessão desta aba; não é incluída no código público.
2. Edite ou crie um post. Use o endereço HTTPS de uma foto pública ou envie um JPG/PNG de até 3 MB.
3. Selecione os dias e salve. O upload isolado não salva o post.
4. Com foto, o Facebook recebe uma publicação de foto e a mensagem como legenda.
   Se existir link, ele vai ao final da legenda. Sem foto, o comportamento permanece texto/link.

Posts, histórico e estado de ativação passam a ser guardados no Supabase. Os posts
do arquivo `content/daily-posts.json` são usados inicialmente, até salvar a primeira edição.
Arquivos enviados e depois removidos de um post não são apagados automaticamente do bucket.

## Limites atuais

- A integração precisa ser testada com o projeto Supabase configurado antes de ser considerada operacional.
- O horário real do Vercel Cron continua definido no `vercel.json` em UTC.
  Alterar o horário exibido no painel não reprograma o cron; o painel informa erro ao tentar salvar uma configuração não suportada.
- Alterações simultâneas nos posts/histórico usam a última gravação. Use um administrador por vez.
- O token da Meta pode expirar ou ser revogado independentemente do Supabase.
