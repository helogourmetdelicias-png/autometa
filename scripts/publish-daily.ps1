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
