# Montante - PDV | Sistema de Publicação no Facebook

Sistema completo de gestão e publicação automática de posts na página do Facebook utilizando a Meta Graph API v26.0.

## 📋 Descrição

O **Montante - PDV** é uma aplicação web desenvolvida em Next.js 14 que permite gerir e publicar posts diretamente na página "Montante - PDV" do Facebook. O sistema oferece:

- ✅ Interface intuitiva para criação de posts
- 📝 Templates pré-configurados para diferentes tipos de conteúdo
- 👁️ Pré-visualização em tempo real dos posts
- 🔗 Suporte a links e emojis
- 🚀 Publicação instantânea via Meta Graph API v26.0

## 🛠️ Requisitos

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- Conta no Facebook com uma Página criada
- Acesso ao [Meta for Developers](https://developers.facebook.com/)

## 📦 Instalação

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd Meta
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Copie o ficheiro `.env.example` para `.env.local` e preencha os valores:

```bash
cp .env.example .env.local
```

Edite `.env.local` e configure:

```env
META_PAGE_ID="1416962368160245"
META_PAGE_ACCESS_TOKEN="SEU_PAGE_ACCESS_TOKEN_AQUI"
ADMIN_SECRET="SEU_SECRET_FORTE_ALEATORIO_AQUI"
ALLOWED_ORIGINS="http://localhost:3000"
```

**⚠️ IMPORTANTE - SEGURANÇA:**
- O ficheiro `.env.local` **NUNCA** deve ser versionado no Git (já está no .gitignore)
- Use um `ADMIN_SECRET` forte e único em produção
- Em produção, adicione todos os domínios permitidos em `ALLOWED_ORIGINS` separados por vírgula
- **NUNCA** exponha o `META_PAGE_ACCESS_TOKEN` em código cliente ou logs

## 🔑 Como Obter o Page Access Token

1. Aceda ao [Meta for Developers](https://developers.facebook.com/)
2. Crie uma nova App ou selecione uma existente
3. No painel da App, vá para **Tools** → **Graph API Explorer**
4. Selecione a sua Página no menu **User or Page**
5. Clique em **Generate Access Token**
6. Conceda as permissões necessárias:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
7. Copie o token gerado e cole no ficheiro `.env.local`

**⚠️ IMPORTANTE:** Para uso em produção, é necessário:
- Converter o token temporário em um token de longa duração
- Submeter a App para revisão do Facebook
- Obter aprovação das permissões necessárias

## 🚀 Como Usar

### Modo de Desenvolvimento

```bash
npm run dev
```

Aceda a [http://localhost:3000](http://localhost:3000) no navegador.

### Build de Produção

```bash
npm run build
npm start
```

### Acessar a Interface

1. Abra [http://localhost:3000](http://localhost:3000)
2. Clique em **"📱 Gestão de Marketing"**
3. Selecione um template ou escreva sua própria mensagem
4. Adicione um link (opcional)
5. Visualize a pré-visualização do post
6. Clique em **"📘 Publicar no Facebook Agora"**

## ⏰ Publicação Automática

O sistema suporta publicações automáticas diárias no Facebook com posts rotativos por dia da semana.

### Como Funciona

- Um post diferente para cada dia da semana (segunda a domingo)
- Horário configurável (padrão: 09:00 hora de Lisboa)
- Sistema híbrido: Vercel Cron (produção) + Node.js local (desenvolvimento)
- Histórico completo de todas as publicações
- Interface de gestão para criar/editar/remover posts

### Configuração Inicial

1. **Adicione as variáveis de ambiente ao `.env.local`:**

```env
CRON_SECRET="SEU_SECRET_ALEATORIO_MINIMO_32_CARACTERES"
SCHEDULER_ENABLED=true
PUBLICATION_TIME=09:00
PUBLICATION_TIMEZONE=Europe/Lisbon
```

2. **Acesse a interface de automação:**
   - Vá para `/marketing/scheduler`
   - Configure o horário de publicação
   - Gerencie os posts rotativos
   - Ative o agendamento

### Opções de Agendamento

#### 1. Vercel Cron Jobs (Produção Recomendada)

Para ambientes hospedados na Vercel:

- **Configuração automática** via `vercel.json`
- **Altamente confiável** e escalável
- **Sem custo adicional** no plano Hobby
- Executa às 09:00 UTC diariamente

#### 2. Scheduler Local (Desenvolvimento)

Para desenvolvimento local:

```bash
npm run scheduler:start
```

Mantém o processo rodando e executa no horário configurado.

#### 3. Windows Task Scheduler (On-Premise)

Para servidores Windows:

1. Siga o guia em `TASK-SCHEDULER-SETUP.md`
2. Configure a tarefa para executar `scripts/publish-daily.ps1`
3. Defina o horário desejado no Agendador de Tarefas

### Testar Publicação Automática

```bash
npm run scheduler:test
```

Este comando publica imediatamente o post do dia atual para validação.

### Documentação Completa

- `AUTOMATION.md` - Guia completo de automação
- `TASK-SCHEDULER-SETUP.md` - Configuração do Windows Task Scheduler

## 📡 API Endpoints

### POST `/api/marketing/publish-facebook`

⚠️ **Rota Protegida:** Esta rota requer autenticação via header `Authorization` com o token `ADMIN_SECRET`.

**Nota:** A interface web do sistema usa Server Actions do Next.js que executam no servidor, evitando a exposição de credenciais no cliente. A rota de API está disponível para integrações externas quando necessário.

Publica um post no feed da Página do Facebook.

**Headers Obrigatórios:**

```
Authorization: Bearer SEU_ADMIN_SECRET_AQUI
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Texto da postagem com suporte a emojis 🎉",
  "link": "https://montante.app/trial" // opcional
}
```

**Response (Sucesso):**

```json
{
  "success": true,
  "postId": "123456789_987654321"
}
```

**Response (Erro - Não Autorizado):**

```json
{
  "error": "Não autorizado. Token de acesso inválido ou ausente."
}
```

**Response (Erro - Origem Bloqueada):**

```json
{
  "error": "Origem não autorizada."
}
```

**Response (Erro - Servidor Mal Configurado):**

```json
{
  "error": "Servidor mal configurado: ADMIN_SECRET não definido."
}
```

**Response (Erro - Validação):**

```json
{
  "error": "Mensagem de erro detalhada"
}
```

## 📂 Estrutura do Projeto

```
Meta/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── marketing/
│   │   │       └── publish-facebook/
│   │   │           └── route.ts          # Rota de API
│   │   ├── marketing/
│   │   │   └── page.tsx                  # Página de gestão
│   │   ├── layout.tsx                    # Layout principal
│   │   ├── page.tsx                      # Página inicial
│   │   └── globals.css                   # Estilos globais
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                # Componente de botão
│   │   │   ├── Textarea.tsx              # Campo de texto
│   │   │   └── Alert.tsx                 # Alertas/feedback
│   │   └── marketing/
│   │       ├── TemplateButtons.tsx       # Templates pré-configurados
│   │       └── PostPreview.tsx           # Pré-visualização
│   ├── services/
│   │   └── facebook.ts                   # Serviço Meta Graph API
│   ├── types/
│   │   └── facebook.ts                   # Tipos TypeScript
│   └── lib/
│       └── utils.ts                      # Funções utilitárias
├── .env.local                            # Variáveis de ambiente (não versionado)
├── .env.example                          # Exemplo de configuração
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🎨 Templates Pré-configurados

O sistema inclui 4 templates prontos:

1. **📦 Alerta de Estoque** - Notificações sobre stock baixo
2. **🔧 Ordem de Serviço** - Avisos de manutenção
3. **✅ Abertura de Caixa** - Anúncio de início de operações
4. **🎉 Promoção Trial** - Divulgação do trial gratuito de 3 meses

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

### Proteção de Credenciais
- Todas as credenciais (Page Access Token, Admin Secret) são armazenadas em variáveis de ambiente
- O ficheiro `.env.local` está protegido pelo `.gitignore` e nunca deve ser versionado
- O Page Access Token é enviado como query parameter (padrão Meta Graph API) e nunca exposto ao cliente

### Autenticação e Autorização
- A rota de API `/api/marketing/publish-facebook` requer autenticação obrigatória via `ADMIN_SECRET`
- O servidor valida que `ADMIN_SECRET` está configurado antes de aceitar qualquer requisição
- A interface web usa Server Actions do Next.js que executam no servidor, mantendo as credenciais seguras

### Proteção CORS
- Validação de origem (origin) para prevenir requisições cross-origin não autorizadas
- Lista de origens permitidas configurável via `ALLOWED_ORIGINS`
- Requisições same-origin são sempre permitidas

### Validação de Entrada
- Validação rigorosa de todos os inputs (mensagem, link, formato)
- Limite de caracteres respeitado (63.206 caracteres do Facebook)
- Sanitização de dados antes do envio à API do Facebook

### Tratamento de Erros
- Erros são tratados sem expor detalhes sensíveis ao cliente
- Logging estruturado para debugging sem vazamento de tokens
- Mensagens de erro amigáveis para o utilizador final

**⚠️ IMPORTANTE EM PRODUÇÃO:**
1. Rotate o `META_PAGE_ACCESS_TOKEN` se ele foi exposto
2. Use um `ADMIN_SECRET` forte (mínimo 32 caracteres aleatórios)
3. Configure `ALLOWED_ORIGINS` com todos os domínios autorizados
4. Utilize HTTPS em produção
5. Considere implementar rate limiting para prevenir abuso
6. Monitore os logs para detectar tentativas de acesso não autorizado

## 📝 Limitações

- Máximo de 63.206 caracteres por post (limite do Facebook)
- Requer Page Access Token válido
- Publicação apenas em páginas onde você tem permissão de administrador

## 🤝 Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto é privado e propriedade do sistema Montante - PDV.

---

**Desenvolvido com ❤️ para o Montante - PDV**
