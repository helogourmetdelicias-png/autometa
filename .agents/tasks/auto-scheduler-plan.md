# Plano de Implementação - Sistema de Publicação Automática Diária no Facebook

**Projeto:** Montante - PDV | Módulo de Automação Facebook  
**Data:** 2024  
**Versão:** 1.0.0  
**Objetivo:** Implementar sistema completo de publicação automática diária de posts no Facebook

---

## 📋 Contexto do Projeto

**Sistema existente:**
- Next.js 14.2.35 com TypeScript e App Router
- Tailwind CSS para estilização
- Serviço Facebook funcional: `src/services/facebook.ts`
- Rota de API protegida: `src/app/api/marketing/publish-facebook/route.ts`
- Interface de marketing: `src/app/marketing/page.tsx`
- Server Actions para segurança: `src/app/marketing/actions.ts`

**Estado atual:** Sistema de publicação manual está 100% funcional e validado.

**Objetivo:** Adicionar agendamento automático para publicar um post diferente a cada dia da semana no horário configurado (padrão: 09:00 em Lisboa).

---

## 🎯 Arquitetura da Solução

### Abordagem Escolhida: Sistema Híbrido

**Por que híbrido?**
- **Vercel Cron Jobs** para produção (ambiente Vercel)
- **Node.js scheduler local** para desenvolvimento
- **Windows Task Scheduler** como alternativa on-premise

**Razões da decisão:**
1. Vercel é a plataforma de deploy nativa do Next.js
2. Desenvolvimento local precisa de solução alternativa (Vercel Cron não funciona em localhost)
3. Empresas que hospedam on-premise precisam de opção Windows
4. Sistema rotativo de posts baseado no dia da semana é simples e previsível

### Fluxo de Dados

```
1. Conteúdo dos Posts → content/daily-posts.json (7 posts, um por dia)
2. Scheduler (Vercel Cron/Node/Windows) → API /api/cron/daily-post
3. API valida CRON_SECRET → chama autoPublisher.publishScheduledPost()
4. autoPublisher seleciona post do dia → chama facebook.publishToFacebook()
5. Meta Graph API publica → retorna postId
6. Logger salva histórico → logs/publications.json
```

---

## 📦 Dependências Necessárias

### 1. Adicionar ao package.json

**Dependências de produção:**
```json
"node-cron": "^3.0.3",
"date-fns-tz": "^3.2.0"
```

**Por que estas dependências?**
- `node-cron`: Agendamento de tarefas estilo cron (para desenvolvimento local)
- `date-fns-tz`: Manipulação de datas com timezone (Europa/Lisboa)

**Comando de instalação:**
```bash
npm install node-cron date-fns-tz
npm install --save-dev @types/node-cron
```

---

## 🔐 Variáveis de Ambiente

### Adicionar ao .env.example e .env.local

```env
# Segurança para o Cron Job
CRON_SECRET="SEU_SECRET_ALEATORIO_AQUI_MINIMO_32_CARACTERES"

# Configuração do Scheduler
SCHEDULER_ENABLED=true
PUBLICATION_TIME=09:00
PUBLICATION_TIMEZONE=Europe/Lisbon
```

**Descrição:**
- `CRON_SECRET`: Token de autenticação para proteger a rota do cron (similar ao ADMIN_SECRET)
- `SCHEDULER_ENABLED`: Liga/desliga o agendamento automático
- `PUBLICATION_TIME`: Horário da publicação no formato HH:mm
- `PUBLICATION_TIMEZONE`: Timezone IANA (Europe/Lisbon para Portugal)

---

## 📝 Implementação Detalhada

### ITEM 1: Atualizar package.json com novas dependências

**O que fazer:**
Adicionar as dependências `node-cron` e `date-fns-tz` ao arquivo `package.json` e instalar.

**Arquivos:**
- `c:\projetos\Meta\package.json`

**Ação:**
```bash
npm install node-cron date-fns-tz
npm install --save-dev @types/node-cron
```

**Verificação:**
```bash
npm list node-cron date-fns-tz
```
Deve listar as versões instaladas sem erros.

---

### ITEM 2: Atualizar .env.example com novas variáveis

**O que fazer:**
Adicionar as 4 novas variáveis de ambiente ao arquivo de exemplo.

**Arquivos:**
- `c:\projetos\Meta\.env.example`

**Conteúdo a adicionar:**
```env
# === SCHEDULER CONFIGURATION === #
CRON_SECRET="YOUR_STRONG_RANDOM_SECRET_HERE_MIN_32_CHARS"
SCHEDULER_ENABLED=true
PUBLICATION_TIME=09:00
PUBLICATION_TIMEZONE=Europe/Lisbon
```

**Verificação:**
Abrir `.env.example` e confirmar que as 4 variáveis estão presentes.

---

### ITEM 3: Criar arquivo de conteúdo dos posts diários

**O que fazer:**
Criar o diretório `content/` na raiz do projeto e o arquivo `daily-posts.json` com 7 posts em português (um para cada dia da semana).

**Arquivos:**
- `c:\projetos\Meta\content\daily-posts.json`

**Estrutura JSON:**
```json
{
  "posts": [
    {
      "id": "monday-motivation",
      "message": "💪 Boa semana, empreendedor! Que esta segunda-feira seja produtiva e cheia de vendas no seu PDV. O Montante está aqui para facilitar sua gestão! 🚀",
      "link": null,
      "days": ["monday"]
    },
    {
      "id": "tuesday-sales-tip",
      "message": "📊 Dica de Terça: Acompanhe seus relatórios diários no Montante PDV! Análise de vendas em tempo real ajuda a tomar melhores decisões. 💼",
      "link": null,
      "days": ["tuesday"]
    },
    {
      "id": "wednesday-stock-alert",
      "message": "📦 Dia de conferir o estoque! Com o Montante PDV, você recebe alertas automáticos quando os produtos estão acabando. Nunca mais perca vendas por falta de mercadoria! 🚨",
      "link": null,
      "days": ["wednesday"]
    },
    {
      "id": "thursday-feature",
      "message": "🎯 Quinta-feira do Recurso: Sabia que o Montante PDV permite controlar múltiplos caixas simultaneamente? Perfeito para lojas com grande movimento! ✨",
      "link": null,
      "days": ["thursday"]
    },
    {
      "id": "friday-trial-promo",
      "message": "🎉 Sexta-feira especial! Experimente o Montante PDV GRÁTIS por 3 meses. Sistema completo de gestão para o seu negócio. Teste agora sem compromisso! 🚀",
      "link": "https://montante.app/trial",
      "days": ["friday"]
    },
    {
      "id": "saturday-weekend",
      "message": "☀️ Bom fim de semana! Lembre-se: mesmo no sábado, o Montante PDV está trabalhando para você. Sistema 100% na nuvem, acessível de qualquer lugar! 🌐",
      "link": null,
      "days": ["saturday"]
    },
    {
      "id": "sunday-planning",
      "message": "📅 Domingo é dia de planejar a semana! Prepare-se para segunda-feira revisando os relatórios e metas no Montante PDV. Sucesso começa com organização! 💡",
      "link": null,
      "days": ["sunday"]
    }
  ],
  "schedule": {
    "time": "09:00",
    "timezone": "Europe/Lisbon",
    "enabled": true
  }
}
```

**Verificação:**
```bash
cat content/daily-posts.json | ConvertFrom-Json
```
Deve exibir o JSON sem erros de sintaxe.

---

### ITEM 4: Criar arquivo de log inicial

**O que fazer:**
Criar o diretório `logs/` na raiz do projeto e o arquivo `publications.json` vazio.

**Arquivos:**
- `c:\projetos\Meta\logs\publications.json`

**Conteúdo:**
```json
{
  "publications": []
}
```

**Observação:** O arquivo `.gitignore` já deve incluir `/logs` para não versionar histórico.

**Verificação:**
```bash
Test-Path "c:\projetos\Meta\logs\publications.json"
```
Deve retornar `True`.

---

### ITEM 5: Adicionar /logs ao .gitignore

**O que fazer:**
Garantir que o diretório `logs/` não seja versionado no Git.

**Arquivos:**
- `c:\projetos\Meta\.gitignore`

**Conteúdo a adicionar (se não existir):**
```
# Logs de publicação
/logs
logs/
*.log
```

**Verificação:**
```bash
git check-ignore logs/publications.json
```
Deve retornar o caminho do arquivo (indicando que está ignorado).

---

### ITEM 6: Criar módulo de logging (logger.ts)

**O que fazer:**
Criar biblioteca utilitária para salvar e recuperar histórico de publicações.

**Arquivos:**
- `c:\projetos\Meta\src\lib\logger.ts`

**Funcionalidades:**
- `savePublication(entry)`: Adiciona nova entrada ao histórico
- `getPublicationHistory(limit, offset)`: Retorna histórico paginado
- `getPublicationStats()`: Estatísticas (total, sucesso, falhas, última publicação)

**Padrão de implementação:**
- Usar `fs.promises` para operações assíncronas de arquivo
- Criar estrutura de diretório se não existir
- Tratamento de erro robusto (arquivo não existe, JSON inválido)
- Validar estrutura de dados antes de salvar

**Tipos esperados:**
```typescript
interface PublicationEntry {
  id: string;              // UUID ou timestamp
  postId: string | null;   // ID do Facebook (null se falhou)
  message: string;         // Conteúdo publicado
  link?: string;           // Link opcional
  status: 'success' | 'error';
  timestamp: string;       // ISO 8601
  error?: string;          // Mensagem de erro (se falhou)
  dayOfWeek: string;       // 'monday', 'tuesday', etc.
}
```

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros TypeScript.

---

### ITEM 7: Criar serviço de auto-publicação (autoPublisher.ts)

**O que fazer:**
Criar serviço que seleciona o post apropriado e executa a publicação.

**Arquivos:**
- `c:\projetos\Meta\src\services\autoPublisher.ts`

**Funcionalidades:**
- `getNextPost()`: Lê `content/daily-posts.json` e retorna o post do dia da semana atual
- `publishScheduledPost()`: Obtém post do dia, chama `publishToFacebook()`, salva log
- `isTimeToPublish()`: Verifica se a hora atual corresponde ao horário configurado

**Lógica de seleção:**
```typescript
const dayMap = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

const today = new Date().getDay(); // 0-6
const dayName = dayMap[today];
const post = posts.find(p => p.days.includes(dayName));
```

**Padrão de implementação:**
- Importar `publishToFacebook` de `@/services/facebook`
- Importar `savePublication` de `@/lib/logger`
- Usar `date-fns-tz` para timezone correto
- Tratamento de erro completo (arquivo não encontrado, post não encontrado, falha na API)

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros TypeScript.

---

### ITEM 8: Criar serviço de agendamento local (scheduler.ts)

**O que fazer:**
Criar serviço node-cron para desenvolvimento local (não usado em produção Vercel).

**Arquivos:**
- `c:\projetos\Meta\src\services\scheduler.ts`

**Funcionalidade:**
- `startScheduler()`: Inicia cron job local baseado em `PUBLICATION_TIME` e `SCHEDULER_ENABLED`
- `stopScheduler()`: Para o cron job

**Expressão cron:**
```typescript
// Para 09:00 diariamente: '0 9 * * *'
const [hour, minute] = process.env.PUBLICATION_TIME.split(':');
const cronExpression = `${minute} ${hour} * * *`;
```

**Observação importante:** Este serviço NÃO deve ser importado/executado automaticamente. Será usado apenas via script `scripts/run-scheduler.js`.

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros TypeScript.

---

### ITEM 9: Criar tipos TypeScript para scheduler

**O que fazer:**
Adicionar interfaces ao arquivo de tipos existente ou criar novo arquivo.

**Arquivos:**
- `c:\projetos\Meta\src\types\scheduler.ts` (novo)

**Tipos necessários:**
```typescript
export interface DailyPost {
  id: string;
  message: string;
  link?: string;
  days: string[];
}

export interface DailyPostsConfig {
  posts: DailyPost[];
  schedule: {
    time: string;
    timezone: string;
    enabled: boolean;
  };
}

export interface PublicationEntry {
  id: string;
  postId: string | null;
  message: string;
  link?: string;
  status: 'success' | 'error';
  timestamp: string;
  error?: string;
  dayOfWeek: string;
}

export interface PublicationLog {
  publications: PublicationEntry[];
}

export interface PublicationStats {
  total: number;
  success: number;
  failed: number;
  lastPublication: PublicationEntry | null;
}

export interface SchedulerStatus {
  enabled: boolean;
  nextPost: DailyPost | null;
  nextPublicationTime: string | null;
  lastPublication: PublicationEntry | null;
}
```

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros TypeScript.

---

### ITEM 10: Criar rota API de status do scheduler

**O que fazer:**
Criar rota para verificar e controlar o status do agendamento.

**Arquivos:**
- `c:\projetos\Meta\src\app\api\scheduler\status\route.ts`

**Endpoints:**
- `GET /api/scheduler/status`: Retorna status atual (ativo/inativo, próximo post, última publicação)
- `POST /api/scheduler/status`: Liga/desliga o agendamento (toggle)

**Segurança:** Rota protegida por `ADMIN_SECRET` (mesmo padrão da rota de publicação).

**Resposta GET:**
```json
{
  "enabled": true,
  "nextPost": {
    "id": "monday-motivation",
    "message": "💪 Boa semana...",
    "days": ["monday"]
  },
  "nextPublicationTime": "2024-01-15T09:00:00+00:00",
  "lastPublication": {
    "id": "...",
    "status": "success",
    "timestamp": "2024-01-14T09:00:00+00:00"
  }
}
```

**Resposta POST:**
```json
{
  "success": true,
  "enabled": false,
  "message": "Agendamento desativado com sucesso"
}
```

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 11: Criar rota API de gestão de posts

**O que fazer:**
Criar CRUD para gerenciar os posts rotativos.

**Arquivos:**
- `c:\projetos\Meta\src\app\api\scheduler\posts\route.ts`

**Endpoints:**
- `GET /api/scheduler/posts`: Lista todos os posts
- `POST /api/scheduler/posts`: Adiciona novo post
- `PUT /api/scheduler/posts`: Edita post existente (identificado por `id`)
- `DELETE /api/scheduler/posts`: Remove post (identificado por `id` via query param)

**Segurança:** Protegido por `ADMIN_SECRET`.

**Lógica:**
- Ler `content/daily-posts.json`
- Modificar array `posts`
- Salvar de volta no arquivo com `JSON.stringify(data, null, 2)`

**Validações:**
- Mensagem obrigatória (1-63206 caracteres)
- Ao menos um dia da semana selecionado
- ID único ao adicionar
- Post existe ao editar/deletar

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 12: Criar rota API de histórico

**O que fazer:**
Criar endpoint para visualizar histórico de publicações.

**Arquivos:**
- `c:\projetos\Meta\src\app\api\scheduler\history\route.ts`

**Endpoint:**
- `GET /api/scheduler/history?limit=30&offset=0`: Retorna histórico paginado

**Segurança:** Protegido por `ADMIN_SECRET`.

**Resposta:**
```json
{
  "publications": [
    {
      "id": "...",
      "postId": "123456_789012",
      "message": "...",
      "status": "success",
      "timestamp": "2024-01-15T09:00:00Z",
      "dayOfWeek": "monday"
    }
  ],
  "pagination": {
    "limit": 30,
    "offset": 0,
    "total": 45
  }
}
```

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 13: Criar rota API de teste manual

**O que fazer:**
Criar endpoint para disparar publicação de teste imediatamente.

**Arquivos:**
- `c:\projetos\Meta\src\app\api\scheduler\test\route.ts`

**Endpoint:**
- `POST /api/scheduler/test`: Publica o post do dia atual imediatamente

**Segurança:** Protegido por `ADMIN_SECRET`.

**Corpo da requisição (opcional):**
```json
{
  "postId": "friday-trial-promo"  // Opcional: especificar qual post testar
}
```

**Resposta:**
```json
{
  "success": true,
  "postId": "123456_789012",
  "message": "Post de teste publicado com sucesso",
  "content": "🎉 Sexta-feira especial!..."
}
```

**Verificação:**
Executar após build e testar com:
```bash
curl -X POST http://localhost:3000/api/scheduler/test -H "Authorization: Bearer $ADMIN_SECRET"
```

---

### ITEM 14: Criar rota Vercel Cron

**O que fazer:**
Criar endpoint protegido que será chamado pelo Vercel Cron Job.

**Arquivos:**
- `c:\projetos\Meta\src\app\api\cron\daily-post\route.ts`

**Endpoint:**
- `GET /api/cron/daily-post`: Executa publicação agendada

**Segurança:** Protegido por `CRON_SECRET` (header `Authorization: Bearer <CRON_SECRET>`).

**Lógica:**
1. Validar `CRON_SECRET`
2. Verificar se `SCHEDULER_ENABLED=true`
3. Chamar `publishScheduledPost()` do `autoPublisher`
4. Retornar resultado

**Resposta:**
```json
{
  "success": true,
  "postId": "123456_789012",
  "message": "Publicação agendada executada com sucesso",
  "timestamp": "2024-01-15T09:00:00Z"
}
```

**Headers obrigatórios:**
```
Authorization: Bearer <CRON_SECRET>
```

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 15: Criar arquivo vercel.json

**O que fazer:**
Configurar Vercel Cron Job para executar diariamente às 09:00 (UTC).

**Arquivos:**
- `c:\projetos\Meta\vercel.json`

**Conteúdo:**
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-post",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Observações:**
- Vercel Cron usa UTC (não timezone local)
- Para 09:00 em Lisboa (UTC+0/UTC+1), ajustar para `0 8 * * *` (UTC) no inverno ou `0 9 * * *` no verão
- Alternativa: fazer conversão de timezone no código da API

**Verificação:**
Validar JSON:
```bash
cat vercel.json | ConvertFrom-Json
```

---

### ITEM 16: Criar componente SchedulerStatus

**O que fazer:**
Criar componente React para exibir status do agendamento.

**Arquivos:**
- `c:\projetos\Meta\src\components\scheduler\SchedulerStatus.tsx`

**Funcionalidades:**
- Badge visual: ✅ Ativo / ⏸️ Inativo
- Próxima publicação: "Segunda-feira, 15/01 às 09:00"
- Última publicação: "Domingo, 14/01 às 09:00 - ✅ Sucesso"
- Botão toggle: "Ativar Agendamento" / "Desativar Agendamento"

**Estado:**
```typescript
const [status, setStatus] = useState<SchedulerStatus | null>(null);
const [loading, setLoading] = useState(true);
```

**API calls:**
- `GET /api/scheduler/status` ao carregar
- `POST /api/scheduler/status` ao clicar no botão

**Padrão de implementação:**
- Usar componentes existentes: `Button`, `Alert`
- Seguir estilo Tailwind do projeto
- Usar `date-fns` para formatação de datas em português
- Feedback visual de loading e erro

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros TypeScript/React.

---

### ITEM 17: Criar componente ScheduleConfig

**O que fazer:**
Criar componente para configurar horário e timezone.

**Arquivos:**
- `c:\projetos\Meta\src\components\scheduler\ScheduleConfig.tsx`

**Funcionalidades:**
- Input de horário: `<input type="time" value="09:00" />`
- Select de timezone: opções comuns (Europe/Lisbon, America/Sao_Paulo, UTC)
- Botão "Salvar Configuração"

**Estado:**
```typescript
const [time, setTime] = useState('09:00');
const [timezone, setTimezone] = useState('Europe/Lisbon');
const [saving, setSaving] = useState(false);
```

**Observação:** Esta configuração pode ser salva em `content/daily-posts.json` ou em variáveis de ambiente (requerer rebuild). Implementar como edição do arquivo JSON é mais flexível.

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 18: Criar componente PostList

**O que fazer:**
Criar componente para listar e gerenciar posts rotativos.

**Arquivos:**
- `c:\projetos\Meta\src\components\scheduler\PostList.tsx`

**Funcionalidades:**
- Listar todos os posts de `content/daily-posts.json`
- Exibir: ID, mensagem (truncada), dias da semana, link
- Botão "Editar" para cada post
- Botão "Remover" para cada post
- Formulário para adicionar novo post

**Estado:**
```typescript
const [posts, setPosts] = useState<DailyPost[]>([]);
const [editing, setEditing] = useState<string | null>(null);
const [formData, setFormData] = useState<Partial<DailyPost>>({});
```

**API calls:**
- `GET /api/scheduler/posts` ao carregar
- `POST /api/scheduler/posts` ao adicionar
- `PUT /api/scheduler/posts` ao editar
- `DELETE /api/scheduler/posts?id=...` ao remover

**Padrão de implementação:**
- Usar componentes existentes: `Button`, `Textarea`, `Alert`
- Checkboxes para selecionar dias da semana
- Modal ou inline form para edição
- Confirmação antes de remover

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 19: Criar componente PublicationHistory

**O que fazer:**
Criar componente de tabela para exibir histórico de publicações.

**Arquivos:**
- `c:\projetos\Meta\src\components\scheduler\PublicationHistory.tsx`

**Funcionalidades:**
- Tabela com colunas: Data/Hora, Dia da Semana, Status, ID do Post, Mensagem (truncada)
- Paginação: 30 itens por página
- Filtro por status (sucesso/erro)
- Badge colorido para status: 🟢 Sucesso / 🔴 Erro

**Estado:**
```typescript
const [history, setHistory] = useState<PublicationEntry[]>([]);
const [page, setPage] = useState(0);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);
```

**API call:**
- `GET /api/scheduler/history?limit=30&offset=${page * 30}`

**Padrão de implementação:**
- Responsivo: tabela em desktop, cards em mobile
- Usar `date-fns` para formatação de datas
- Botões "Anterior" e "Próxima" para paginação

**Verificação:**
```bash
npm run build
```
Deve compilar sem erros.

---

### ITEM 20: Criar página de gestão do scheduler

**O que fazer:**
Criar página Next.js que compõe todos os componentes do scheduler.

**Arquivos:**
- `c:\projetos\Meta\src\app\marketing\scheduler\page.tsx`

**Layout:**
```tsx
<div>
  <header>
    <h1>Agendamento Automático de Publicações</h1>
    <Link href="/marketing">← Voltar para Marketing</Link>
  </header>

  <main>
    <section>
      <h2>Status do Agendamento</h2>
      <SchedulerStatus />
    </section>

    <section>
      <h2>Configuração de Horário</h2>
      <ScheduleConfig />
    </section>

    <section>
      <h2>Posts Rotativos</h2>
      <PostList />
    </section>

    <section>
      <h2>Histórico de Publicações</h2>
      <PublicationHistory />
    </section>
  </main>
</div>
```

**Segurança:** Página protegida (mesma autenticação que `/marketing`).

**Verificação:**
```bash
npm run build
npm run dev
```
Acessar `http://localhost:3000/marketing/scheduler` e verificar que a página carrega sem erros.

---

### ITEM 21: Adicionar link na página de marketing

**O que fazer:**
Atualizar `src/app/marketing/page.tsx` para incluir link para a nova página de agendamento.

**Arquivos:**
- `c:\projetos\Meta\src\app\marketing\page.tsx`

**Modificação:**
Adicionar botão no header ou seção informativa:

```tsx
<Link 
  href="/marketing/scheduler"
  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
>
  ⏰ Gerenciar Publicações Automáticas
</Link>
```

**Verificação:**
Acessar `http://localhost:3000/marketing` e verificar que o link está visível e funcional.

---

### ITEM 22: Criar script PowerShell para Windows Task Scheduler

**O que fazer:**
Criar script PowerShell que executa a publicação diária localmente (para ambientes on-premise Windows).

**Arquivos:**
- `c:\projetos\Meta\scripts\publish-daily.ps1`

**Conteúdo:**
```powershell
# Script de publicação automática diária para Windows Task Scheduler
# Configurar no Agendador de Tarefas do Windows para executar diariamente

$ErrorActionPreference = "Stop"

# Configurações
$ProjectPath = "C:\projetos\Meta"
$LogFile = "$ProjectPath\logs\scheduler-windows.log"
$EnvFile = "$ProjectPath\.env.local"

# Função de log
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Output $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

try {
    Write-Log "=== Iniciando publicação automática ==="
    
    # Carregar variáveis de ambiente
    if (Test-Path $EnvFile) {
        Get-Content $EnvFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.+)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"')
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
            }
        }
        Write-Log "Variáveis de ambiente carregadas"
    } else {
        Write-Log "ERRO: Arquivo .env.local não encontrado"
        exit 1
    }
    
    # Verificar se está habilitado
    $enabled = [Environment]::GetEnvironmentVariable("SCHEDULER_ENABLED", "Process")
    if ($enabled -ne "true") {
        Write-Log "Agendamento desabilitado (SCHEDULER_ENABLED=$enabled)"
        exit 0
    }
    
    # Chamar a API local
    $adminSecret = [Environment]::GetEnvironmentVariable("ADMIN_SECRET", "Process")
    $cronSecret = [Environment]::GetEnvironmentVariable("CRON_SECRET", "Process")
    
    $headers = @{
        "Authorization" = "Bearer $cronSecret"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/cron/daily-post" -Method GET -Headers $headers
    
    if ($response.success) {
        Write-Log "Publicação realizada com sucesso: PostID=$($response.postId)"
    } else {
        Write-Log "ERRO na publicação: $($response.error)"
        exit 1
    }
    
} catch {
    Write-Log "EXCEÇÃO: $($_.Exception.Message)"
    exit 1
} finally {
    Write-Log "=== Fim da execução ==="
}
```

**Verificação:**
```powershell
powershell -File scripts\publish-daily.ps1
```
Deve executar sem erros de sintaxe.

---

### ITEM 23: Criar script Node.js para scheduler local

**O que fazer:**
Criar script Node.js que inicia o scheduler local (para desenvolvimento).

**Arquivos:**
- `c:\projetos\Meta\scripts\run-scheduler.js`

**Conteúdo:**
```javascript
// Script para executar o scheduler localmente durante desenvolvimento
// Uso: node scripts/run-scheduler.js

require('dotenv').config({ path: '.env.local' });
const { startScheduler } = require('../src/services/scheduler');

console.log('🚀 Iniciando scheduler local...');
console.log(`📅 Horário configurado: ${process.env.PUBLICATION_TIME || '09:00'}`);
console.log(`🌍 Timezone: ${process.env.PUBLICATION_TIMEZONE || 'Europe/Lisbon'}`);
console.log(`📊 Status: ${process.env.SCHEDULER_ENABLED === 'true' ? '✅ Habilitado' : '⏸️ Desabilitado'}`);
console.log('');

if (process.env.SCHEDULER_ENABLED !== 'true') {
  console.warn('⚠️  Scheduler desabilitado. Defina SCHEDULER_ENABLED=true no .env.local');
  process.exit(0);
}

startScheduler();

console.log('✅ Scheduler iniciado com sucesso!');
console.log('📝 Aguardando horário de publicação...');
console.log('🛑 Pressione Ctrl+C para parar');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando scheduler...');
  process.exit(0);
});
```

**Observação:** Este script requer que `src/services/scheduler.ts` seja compilado para JavaScript ou que usemos `ts-node`.

**Verificação:**
```bash
node scripts/run-scheduler.js
```
Deve iniciar sem erros.

---

### ITEM 24: Criar script de teste manual

**O que fazer:**
Criar script Node.js para testar a publicação imediatamente.

**Arquivos:**
- `c:\projetos\Meta\scripts\test-automation.js`

**Conteúdo:**
```javascript
// Script para testar a publicação automática manualmente
// Uso: node scripts/test-automation.js

require('dotenv').config({ path: '.env.local' });

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
      console.log(`📄 Conteúdo: ${data.content.substring(0, 100)}...`);
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
```

**Verificação:**
Com o servidor rodando:
```bash
node scripts/test-automation.js
```
Deve executar e publicar um post de teste.

---

### ITEM 25: Adicionar scripts npm ao package.json

**O que fazer:**
Adicionar comandos npm para facilitar o uso do scheduler.

**Arquivos:**
- `c:\projetos\Meta\package.json`

**Scripts a adicionar:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "scheduler:start": "node scripts/run-scheduler.js",
    "scheduler:test": "node scripts/test-automation.js"
  }
}
```

**Verificação:**
```bash
npm run scheduler:test
```
Deve executar o script de teste.

---

### ITEM 26: Criar documentação AUTOMATION.md

**O que fazer:**
Criar guia completo de uso do sistema de automação.

**Arquivos:**
- `c:\projetos\Meta\AUTOMATION.md`

**Seções:**
1. **Introdução**: Visão geral do sistema
2. **Opções de Agendamento**: Vercel Cron, Node.js local, Windows Task Scheduler
3. **Configuração**: Variáveis de ambiente, conteúdo dos posts
4. **Uso em Desenvolvimento**: Como testar localmente
5. **Uso em Produção Vercel**: Como configurar no Vercel
6. **Uso em Servidor Windows**: Como configurar no Task Scheduler
7. **API Reference**: Documentação de todos os endpoints
8. **Troubleshooting**: Problemas comuns e soluções

**Verificação:**
Abrir `AUTOMATION.md` e verificar que todas as seções estão completas.

---

### ITEM 27: Criar guia Windows Task Scheduler

**O que fazer:**
Criar tutorial passo a passo para configurar no Agendador de Tarefas do Windows.

**Arquivos:**
- `c:\projetos\Meta\TASK-SCHEDULER-SETUP.md`

**Conteúdo (estrutura):**
```markdown
# Configuração do Windows Task Scheduler

## Pré-requisitos
- Windows 10/11 ou Windows Server
- Node.js instalado e no PATH
- Projeto Montante PDV funcionando localmente

## Passo a Passo

### 1. Abrir o Agendador de Tarefas
[Print screen e instruções]

### 2. Criar Nova Tarefa
[Configurações detalhadas]

### 3. Configurar Gatilho (Trigger)
- Diariamente às 09:00
- Timezone correto

### 4. Configurar Ação
- Programa: `powershell.exe`
- Argumentos: `-ExecutionPolicy Bypass -File "C:\projetos\Meta\scripts\publish-daily.ps1"`
- Iniciar em: `C:\projetos\Meta`

### 5. Configurar Condições
- Executar mesmo sem energia
- Não interromper se computador entrar em standby

### 6. Testar
- Executar manualmente
- Verificar log em `logs/scheduler-windows.log`
```

**Verificação:**
Seguir o guia e verificar que todas as instruções estão claras.

---

### ITEM 28: Atualizar README.md

**O que fazer:**
Adicionar seção sobre Publicação Automática no README principal.

**Arquivos:**
- `c:\projetos\Meta\README.md`

**Seção a adicionar (após "Como Usar"):**
```markdown
## ⏰ Publicação Automática

O sistema suporta publicação automática diária de posts no Facebook. Configure uma vez e deixe o sistema publicar automaticamente todos os dias.

### Funcionalidades
- ✅ Rotação automática de posts por dia da semana
- 📅 Agendamento configurável (horário e timezone)
- 📊 Histórico completo de publicações
- 🎨 Interface de gestão web
- 🔄 Suporte para múltiplos ambientes (Vercel, local, Windows)

### Configuração Rápida

1. **Adicionar variáveis de ambiente** ao `.env.local`:
```env
CRON_SECRET="seu_secret_aleatorio_aqui"
SCHEDULER_ENABLED=true
PUBLICATION_TIME=09:00
PUBLICATION_TIMEZONE=Europe/Lisbon
```

2. **Acessar interface de gestão**:
```
http://localhost:3000/marketing/scheduler
```

3. **Escolher método de agendamento**:
- **Vercel (Produção)**: Automático via `vercel.json`
- **Local (Dev)**: `npm run scheduler:start`
- **Windows Server**: Agendador de Tarefas (ver TASK-SCHEDULER-SETUP.md)

### Documentação Completa
- **[AUTOMATION.md](./AUTOMATION.md)**: Guia completo de automação
- **[TASK-SCHEDULER-SETUP.md](./TASK-SCHEDULER-SETUP.md)**: Configuração Windows

### Teste Rápido
```bash
npm run scheduler:test
```
```

**Verificação:**
Abrir README.md e verificar que a nova seção está bem integrada.

---

### ITEM 29: Atualizar status.md

**O que fazer:**
Atualizar arquivo de status do projeto com a nova funcionalidade.

**Arquivos:**
- `c:\projetos\Meta\status.md`

**Modificações:**
1. Atualizar data de última atualização
2. Adicionar seção "Publicação Automática" na lista de funcionalidades
3. Atualizar status geral para incluir novo módulo
4. Adicionar métricas (novos arquivos, componentes, rotas API)

**Seção a adicionar:**
```markdown
### 7. Módulo de Publicação Automática ✅

| Componente | Status | Detalhes |
|------------|--------|----------|
| Sistema de Agendamento | ✅ Implementado | 3 opções: Vercel, Local, Windows |
| Posts Rotativos | ✅ Implementado | 7 posts (um por dia da semana) |
| Interface de Gestão | ✅ Implementado | `/marketing/scheduler` |
| API de Controle | ✅ Implementado | 4 endpoints protegidos |
| Histórico de Publicações | ✅ Implementado | Log persistente com paginação |
| Documentação | ✅ Completa | AUTOMATION.md + TASK-SCHEDULER-SETUP.md |

**Funcionalidades:**
- ✅ Rotação automática baseada no dia da semana
- ✅ Configuração de horário e timezone
- ✅ Ativar/desativar via interface web
- ✅ Gestão CRUD de posts rotativos
- ✅ Histórico completo com filtros
- ✅ Teste manual de publicação
- ✅ Suporte para Vercel Cron Jobs
- ✅ Suporte para ambiente local (Node.js)
- ✅ Suporte para Windows Task Scheduler
```

**Verificação:**
Abrir `status.md` e verificar que as atualizações estão corretas.

---

### ITEM 30: Build final e verificação

**O que fazer:**
Executar build de produção completo e verificar que tudo compila sem erros.

**Comando:**
```bash
npm run build
```

**Verificações:**
1. TypeScript compila sem erros
2. Next.js constrói todas as páginas e rotas
3. Não há warnings críticos
4. Todas as importações estão resolvidas

**Saída esperada:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
├ ○ /                                    XXX kB   XXX kB
├ ○ /api/cron/daily-post                 0 B      0 B
├ ○ /api/scheduler/history               0 B      0 B
├ ○ /api/scheduler/posts                 0 B      0 B
├ ○ /api/scheduler/status                0 B      0 B
├ ○ /api/scheduler/test                  0 B      0 B
├ ○ /marketing                           XXX kB   XXX kB
└ ○ /marketing/scheduler                 XXX kB   XXX kB
```

**Se houver erros:**
- Voltar ao arquivo com erro
- Corrigir problema de tipo, importação ou sintaxe
- Executar build novamente

**Verificação:**
```bash
npm run build
npm start
```
Acessar todas as páginas e verificar que funcionam.

---

## 📊 Resumo da Implementação

### Arquivos Criados (25 novos)

**Configuração:**
1. `content/daily-posts.json` - Conteúdo dos 7 posts rotativos
2. `logs/publications.json` - Log inicial vazio
3. `vercel.json` - Configuração do Vercel Cron

**Bibliotecas:**
4. `src/lib/logger.ts` - Funções de logging
5. `src/types/scheduler.ts` - Tipos TypeScript

**Serviços:**
6. `src/services/autoPublisher.ts` - Lógica de publicação automática
7. `src/services/scheduler.ts` - Agendador node-cron local

**Rotas API (6):**
8. `src/app/api/scheduler/status/route.ts` - Status do agendamento
9. `src/app/api/scheduler/posts/route.ts` - CRUD de posts
10. `src/app/api/scheduler/history/route.ts` - Histórico
11. `src/app/api/scheduler/test/route.ts` - Teste manual
12. `src/app/api/cron/daily-post/route.ts` - Endpoint Vercel Cron

**Componentes UI (4):**
13. `src/components/scheduler/SchedulerStatus.tsx` - Status visual
14. `src/components/scheduler/ScheduleConfig.tsx` - Configuração
15. `src/components/scheduler/PostList.tsx` - Lista de posts
16. `src/components/scheduler/PublicationHistory.tsx` - Tabela de histórico

**Páginas:**
17. `src/app/marketing/scheduler/page.tsx` - Interface de gestão

**Scripts (3):**
18. `scripts/publish-daily.ps1` - PowerShell para Windows
19. `scripts/run-scheduler.js` - Node.js local
20. `scripts/test-automation.js` - Teste manual

**Documentação (2):**
21. `AUTOMATION.md` - Guia completo de automação
22. `TASK-SCHEDULER-SETUP.md` - Tutorial Windows Task Scheduler

**Atualizações:**
23. `package.json` - Novas dependências e scripts
24. `.env.example` - Novas variáveis
25. `README.md` - Nova seção
26. `status.md` - Status atualizado
27. `.gitignore` - Ignorar logs

### Dependências Adicionadas (2)

- `node-cron` ^3.0.3
- `date-fns-tz` ^3.2.0

### Endpoints API Criados (6)

1. `GET /api/scheduler/status` - Status do agendamento
2. `POST /api/scheduler/status` - Toggle ativo/inativo
3. `GET /api/scheduler/posts` - Listar posts
4. `POST/PUT/DELETE /api/scheduler/posts` - CRUD posts
5. `GET /api/scheduler/history` - Histórico paginado
6. `POST /api/scheduler/test` - Teste manual
7. `GET /api/cron/daily-post` - Cron job (Vercel)

### Componentes React Criados (4)

1. `SchedulerStatus` - Visualização de status
2. `ScheduleConfig` - Configuração de horário
3. `PostList` - Gestão de posts rotativos
4. `PublicationHistory` - Histórico com paginação

---

## 🎯 Ordem de Implementação Recomendada

### Fase 1: Fundação (Itens 1-5)
1. Dependências
2. Variáveis de ambiente
3. Arquivo de conteúdo
4. Log inicial
5. Atualizar .gitignore

**Por que primeiro?** Estabelece a base de dados e configuração necessária para todo o resto.

### Fase 2: Serviços Backend (Itens 6-9)
6. Logger
7. Auto Publisher
8. Scheduler local
9. Tipos TypeScript

**Por que agora?** A lógica de negócio deve existir antes das rotas API que a consomem.

### Fase 3: APIs (Itens 10-14)
10. API Status
11. API Posts
12. API History
13. API Test
14. API Cron

**Por que agora?** Com os serviços prontos, criar as interfaces HTTP é direto.

### Fase 4: Infraestrutura (Item 15)
15. vercel.json

**Por que agora?** Configuração de deploy pode ser feita após APIs estarem definidas.

### Fase 5: Frontend (Itens 16-21)
16-19. Componentes UI
20. Página de gestão
21. Atualizar página marketing

**Por que agora?** UI depende das APIs estarem funcionais para testar.

### Fase 6: Automação Local (Itens 22-25)
22. Script PowerShell
23. Script Node.js
24. Script de teste
25. Scripts npm

**Por que agora?** Scripts precisam de todo o sistema funcionando para serem testados.

### Fase 7: Documentação (Itens 26-29)
26. AUTOMATION.md
27. TASK-SCHEDULER-SETUP.md
28. Atualizar README
29. Atualizar status

**Por que agora?** Documentar após implementação garante precisão.

### Fase 8: Validação Final (Item 30)
30. Build e verificação

**Por que último?** Teste completo do sistema integrado.

---

## ✅ Critérios de Verificação Final

### Funcional
- [ ] Publicação manual funciona (`npm run scheduler:test`)
- [ ] Interface web carrega sem erros (`/marketing/scheduler`)
- [ ] API de status retorna dados corretos
- [ ] API de posts permite CRUD completo
- [ ] Histórico registra publicações
- [ ] Vercel cron está configurado (`vercel.json`)
- [ ] Scheduler local inicia sem erros (`npm run scheduler:start`)

### Técnico
- [ ] `npm run build` executa sem erros
- [ ] TypeScript compila 100% tipado
- [ ] Todas as rotas API estão protegidas por autenticação
- [ ] Logs são salvos em `logs/publications.json`
- [ ] Posts rotativos em `content/daily-posts.json` estão completos
- [ ] Variáveis de ambiente documentadas em `.env.example`

### Documentação
- [ ] README.md tem seção de automação
- [ ] AUTOMATION.md explica todas as opções
- [ ] TASK-SCHEDULER-SETUP.md tem tutorial completo
- [ ] status.md reflete novo módulo
- [ ] Código tem comentários em pontos críticos

---

## 🚀 Próximos Passos Após Implementação

1. **Testar localmente:**
   ```bash
   npm run scheduler:test
   ```

2. **Acessar interface web:**
   ```
   http://localhost:3000/marketing/scheduler
   ```

3. **Deploy no Vercel:**
   ```bash
   vercel deploy --prod
   ```

4. **Configurar variável CRON_SECRET no Vercel:**
   ```bash
   vercel env add CRON_SECRET
   ```

5. **Monitorar logs de execução:**
   - Vercel: Dashboard → Logs → Functions
   - Local: `logs/publications.json`
   - Windows: `logs/scheduler-windows.log`

---

## 📞 Suporte e Referências

### Documentação Oficial
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [node-cron](https://www.npmjs.com/package/node-cron)
- [date-fns-tz](https://www.npmjs.com/package/date-fns-tz)

### Troubleshooting Comum

**Problema:** Cron não executa no Vercel  
**Solução:** Verificar se `CRON_SECRET` está nas variáveis de ambiente

**Problema:** Timezone incorreto  
**Solução:** Ajustar `PUBLICATION_TIMEZONE` ou usar UTC no `vercel.json`

**Problema:** Post não publica  
**Solução:** Verificar logs em `logs/publications.json` e `META_PAGE_ACCESS_TOKEN`

---

**Fim do Plano de Implementação**
