# Configuração do Windows Task Scheduler

Guia passo a passo para configurar publicações automáticas no Windows.

## 📋 Pré-requisitos

- Windows 10/11 ou Windows Server
- Node.js instalado e no PATH
- Projeto Montante PDV funcionando localmente
- Servidor Next.js rodando (port 3000)

## 🚀 Passo a Passo

### 1. Preparar o Script

O script `scripts/publish-daily.ps1` já está pronto. Certifique-se de que:

- O caminho do projeto está correto (padrão: `C:\projetos\Meta`)
- O arquivo `.env.local` existe e está configurado
- As variáveis `CRON_SECRET` e `SCHEDULER_ENABLED=true` estão definidas

### 2. Testar o Script Manualmente

Abra o PowerShell como Administrador e execute:

```powershell
cd C:\projetos\Meta
.\scripts\publish-daily.ps1
```

Verifique o log em `logs/scheduler-windows.log`.

### 3. Abrir o Agendador de Tarefas

1. Pressione `Win + R`
2. Digite `taskschd.msc`
3. Pressione Enter

### 4. Criar Nova Tarefa

1. No painel direito, clique em **"Criar Tarefa..."** (não "Criar Tarefa Básica")
2. Dê um nome: **"Montante PDV - Publicação Diária"**
3. Descrição: **"Publica automaticamente no Facebook às 09:00"**
4. Selecione **"Executar estando o utilizador conectado ou não"**
5. Marque **"Executar com privilégios mais elevados"**

### 5. Configurar Gatilho (Trigger)

1. Vá para a aba **"Acionadores"**
2. Clique em **"Novo..."**
3. Configurações:
   - **Iniciar a tarefa:** Em um agendamento
   - **Configurações:** Diariamente
   - **Iniciar em:** (Data de hoje)
   - **Horário:** 09:00:00
   - **Recorrer a cada:** 1 dias
   - Marque: **Ativada**
4. Clique em **OK**

### 6. Configurar Ação

1. Vá para a aba **"Ações"**
2. Clique em **"Novo..."**
3. Configurações:
   - **Ação:** Iniciar um programa
   - **Programa/script:** `powershell.exe`
   - **Adicionar argumentos (opcional):**
     ```
     -ExecutionPolicy Bypass -File "C:\projetos\Meta\scripts\publish-daily.ps1"
     ```
   - **Iniciar em (opcional):** `C:\projetos\Meta`
4. Clique em **OK**

### 7. Configurar Condições

1. Vá para a aba **"Condições"**
2. **Desmarque:** "Iniciar a tarefa apenas se o computador estiver conectado à energia CA"
3. **Desmarque:** "Parar se o computador passar a usar bateria"
4. **Marque:** "Ativar tarefa caso o computador esteja ocioso por..."

### 8. Configurar Definições

1. Vá para a aba **"Definições"**
2. Configurações:
   - **Marque:** "Permitir que a tarefa seja executada sob demanda"
   - **Marque:** "Executar tarefa o mais rápido possível após perder um agendamento"
   - **Se a tarefa falhar, reiniciar a cada:** 1 minuto
   - **Tentar reiniciar até:** 3 vezes
3. Clique em **OK**

### 9. Salvar Credenciais

1. Será solicitada a senha do usuário Windows
2. Digite a senha e clique em **OK**

### 10. Testar a Tarefa

1. Localize a tarefa criada na lista
2. Clique com botão direito
3. Selecione **"Executar"**
4. Verifique o log em `C:\projetos\Meta\logs\scheduler-windows.log`
5. Verifique a publicação no Facebook

## 📊 Monitoramento

### Ver Histórico de Execuções

1. No Agendador de Tarefas, selecione a tarefa
2. Clique na aba **"Histórico"** (painel inferior)
3. Veja todas as execuções com timestamps

### Verificar Logs

```powershell
Get-Content C:\projetos\Meta\logs\scheduler-windows.log -Tail 20
```

### Desabilitar Temporariamente

1. Clique com botão direito na tarefa
2. Selecione **"Desabilitar"**

## ⚠️ Problemas Comuns

### Tarefa executa mas não publica

**Causa:** Servidor Next.js não está rodando.

**Solução:** Configure o servidor Next.js para iniciar automaticamente ou crie outra tarefa para iniciá-lo.

### Erro de ExecutionPolicy

**Causa:** PowerShell bloqueando scripts.

**Solução:** Use `-ExecutionPolicy Bypass` nos argumentos (já incluído no guia).

### Credenciais expiram

**Causa:** Senha do Windows foi alterada.

**Solução:**
1. Clique com botão direito na tarefa
2. Selecione **"Propriedades"**
3. Clique em **OK** e redigite a senha

### Publicação duplicada

**Causa:** Múltiplas tarefas ou schedulers rodando.

**Solução:** Verifique se não há outras tarefas ou processos fazendo a mesma publicação.

## 🔒 Segurança

- O script lê credenciais do `.env.local` (não versionado)
- Logs locais não contêm tokens
- Execute com usuário de serviço dedicado (recomendado para produção)

## 📚 Documentos Relacionados

- `AUTOMATION.md` - Guia completo de automação
- `README.md` - Documentação principal
