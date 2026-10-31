# Reels automáticos — 31/10/2026

## Programação aprovada

- Um Reel diferente por dia da semana, repetindo os mesmos sete vídeos nas semanas seguintes.
- Reels: **18h de Lisboa (Europe/Lisbon)**, com tratamento de verão/inverno.
- O feed mantém o cron existente: **09:00 UTC**, sem mudança nesta implementação.
- A chave geral de ativação do painel controla os dois formatos.
- O plano Hobby do Vercel pode executar durante a hora agendada, sem garantir o minuto.
  O processamento da Meta também pode atrasar a exibição pública do Reel.

## Configuração necessária no Supabase

Execute **`supabase/reels.sql`** no SQL Editor do projeto já criado.
Esse arquivo adiciona o bucket público `marketing-videos`, aceitando MP4 de até 50 MB.
Não precisa executar novamente o SQL de fotos nem trocar as variáveis existentes.
O serviço usa as mesmas `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `ADMIN_SECRET` e `CRON_SECRET`.

Os vídeos ficam públicos para que a Meta possa buscá-los. A chave de servidor não
vai ao navegador: o servidor autoriza um único caminho de upload temporariamente.
Os arquivos vão diretamente do navegador ao Supabase; não passam pelo limite de corpo do Vercel.

## Como cadastrar os sete vídeos

1. Entre em `/marketing/scheduler` com `ADMIN_SECRET`.
2. Adicione um post e escolha **Reel — vídeo às 18h de Lisboa**.
3. Informe ID, legenda e, se desejar, um link na legenda.
4. Envie o MP4 ou cole seu endereço HTTPS público direto.
5. Marque o dia correspondente e salve. Repita para os demais dias.
6. O indicador mostra quantos dos sete dias já têm Reel configurado.

O feed e o Reel podem ocupar o mesmo dia: são programações separadas.
Não é permitido cadastrar dois Reels para o mesmo dia. Um dia sem vídeo é ignorado.
Os posts existentes, sem o campo `kind`, continuam sendo tratados como feed.

Para os vídeos enviados pelo computador, esta versão verifica MP4, tamanho até 50 MB,
resolução mínima de 540 × 960, proporção vertical 9:16 e duração de 4 a 60 segundos.
Recomendado: **1080 × 1920, MP4 com H.264/AAC**. A Meta faz a validação final de codecs e formato.
Para links externos, a validação de mídia é feita pela Meta.

## Envio e confirmação

O fluxo cria a sessão, entrega a URL do MP4 e finaliza com `video_state=PUBLISHED`.
O retorno de aceitação não significa que o vídeo já está no ar. O histórico mostra
**Processando na Meta** até consultar uma confirmação de publicação ou um erro.
O histórico consulta o status dos Reels pendentes ao ser aberto e atualiza a cada minuto.
Sem o painel aberto, a Meta continua processando e publicando o vídeo normalmente.

**Publicar agora** cria uma publicação real imediatamente, além da programação.
Use uma única vez para o primeiro teste; aguarde a confirmação no histórico antes de repetir.

## Agendamento e proteção contra duplicatas

Os crons dos Reels executam diariamente às 17:00 e 18:00 UTC em rotas distintas.
Cada execução verifica se o horário em Lisboa está na janela das 18h; a outra não envia.
Assim cada cron tem frequência diária, compatível com o Hobby, e os Reels acompanham o horário de verão.
Uma inserção exclusiva em `autometa_data` reserva a data local antes do envio.
Uma chamada duplicada não inicia um novo vídeo. Em caso de erro, a reserva permanece
por segurança; uma repetição intencional é feita pelo botão **Publicar agora**, após conferir o histórico.
As reservas diárias ficam no banco; não há limpeza automática nesta versão.

## Validação e limites

- Build local e 11 testes simulados passaram; nenhuma credencial real é usada nos testes.
- Não houve publicação de teste real nesta implementação: os sete vídeos ainda serão produzidos.
- Falta executar `supabase/reels.sql` e validar um upload/publicação real após o deploy.
- O histórico usa JSON compartilhado: evite edições e testes simultâneos em várias abas.
- Nenhuma chave secreta é incluída neste documento.

## Referências

- [Meta: upload de Reel hospedado](https://www.postman.com/meta/facebook/request/cfr4gjf/2-b-upload-hosted-reel)
- [Meta: finalização/publicação do Reel](https://www.postman.com/meta/facebook/request/juhnm3q/4-publish-reel)
- [Supabase: upload por autorização temporária](https://supabase.com/docs/reference/javascript/file-buckets-uploadtosignedurl)
- [Vercel: limites e precisão do cron](https://vercel.com/docs/cron-jobs/usage-and-pricing)
