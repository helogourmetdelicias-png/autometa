'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SchedulerStatus as SchedulerStatusType } from '@/types/scheduler';

export function SchedulerStatus() {
  const [status, setStatus] = useState<SchedulerStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/status', {
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Erro ao buscar status');
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    if (!status) return;

    setToggling(true);
    setFeedback(null);

    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !status.enabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback({ type: 'success', message: data.message });
        await fetchStatus();
      } else {
        const data = await response.json();
        setFeedback({ type: 'error', message: data.error || 'Erro ao alterar status' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro de rede ao alterar status' });
    } finally {
      setToggling(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setFeedback(null);

    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedback({ type: 'success', message: `Teste bem-sucedido! Post ID: ${data.postId}` });
        await fetchStatus();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao testar publicação' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro de rede ao testar publicação' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <Alert variant="error" title="Erro ao carregar status">
        Não foi possível carregar o status do agendamento.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            status.enabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${status.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {status.enabled ? '✅ Ativo' : '⏸️ Inativo'}
        </span>
      </div>

      {/* Próxima Publicação */}
      {status.enabled && status.nextPost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">📅 Próxima Publicação</h4>
          <p className="text-xs text-blue-700 mb-1">
            {status.nextPublicationTime
              ? new Date(status.nextPublicationTime).toLocaleString('pt-PT', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })
              : 'Horário não definido'}
          </p>
          <p className="text-xs text-blue-600 italic line-clamp-2">
            {status.nextPost.message.substring(0, 100)}
            {status.nextPost.message.length > 100 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Última Publicação */}
      {status.lastPublication && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Última Publicação</h4>
          <p className="text-xs text-gray-600 mb-1">
            {new Date(status.lastPublication.timestamp).toLocaleString('pt-PT', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            {' - '}
            {status.lastPublication.status === 'success' ? (
              <span className="text-green-600 font-medium">✅ Sucesso</span>
            ) : (
              <span className="text-red-600 font-medium">❌ Erro</span>
            )}
          </p>
          {status.lastPublication.error && (
            <p className="text-xs text-red-600 mt-1">{status.lastPublication.error}</p>
          )}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{status.stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{status.stats.success}</p>
          <p className="text-xs text-gray-600">Sucesso</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{status.stats.failed}</p>
          <p className="text-xs text-gray-600">Falhas</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.type} title={feedback.type === 'success' ? 'Sucesso' : 'Erro'}>
          {feedback.message}
        </Alert>
      )}

      {/* Botões de Controle */}
      <div className="flex gap-2">
        <Button
          variant={status.enabled ? 'secondary' : 'primary'}
          onClick={handleToggle}
          loading={toggling}
          disabled={toggling || testing}
          className="flex-1"
        >
          {status.enabled ? '⏸️ Desativar' : '▶️ Ativar'} Agendamento
        </Button>
        <Button
          variant="secondary"
          onClick={handleTest}
          loading={testing}
          disabled={toggling || testing}
        >
          🧪 Testar Agora
        </Button>
      </div>
    </div>
  );
}
