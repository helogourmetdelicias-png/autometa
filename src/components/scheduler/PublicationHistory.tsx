'use client';

import { useState, useEffect } from 'react';
import { PublicationEntry } from '@/types/scheduler';

export function PublicationHistory() {
  const [publications, setPublications] = useState<PublicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 30;

  const fetchHistory = async (currentPage: number) => {
    setLoading(true);
    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const offset = currentPage * limit;
      const response = await fetch(`/api/scheduler/history?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPublications(data.publications);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
    const timer = setInterval(() => { void fetchHistory(page); }, 60000);
    return () => clearInterval(timer);
  }, [page]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  if (loading && publications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas de Resumo */}
      {total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              📊 Total de publicações: {total}
            </p>
            <p className="text-xs text-blue-700">
              Taxa de sucesso: {total > 0 ? ((publications.filter(p => p.status === 'success').length / publications.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">
              Página {page + 1} de {totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Tabela Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Data/Hora</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Mensagem</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Post ID</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr key={pub.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-900">
                  {new Date(pub.timestamp).toLocaleString('pt-PT', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                  {pub.dayOfWeek}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                  {pub.message.substring(0, 80)}
                  {pub.message.length > 80 ? '...' : ''}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                  {pub.postId ? pub.postId.substring(0, 20) + '...' : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {pub.status === 'processing' ? (
                    <span className="inline-flex px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Processando na Meta</span>
                  ) : pub.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ✅ Sucesso
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full cursor-help"
                      title={pub.error || 'Erro desconhecido'}
                    >
                      ❌ Erro
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-3">
        {publications.map((pub) => (
          <div key={pub.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-gray-500">
                {new Date(pub.timestamp).toLocaleString('pt-PT', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
              {pub.status === 'processing' ? (
                <span className="text-xs text-amber-800">Processando na Meta</span>
              ) : pub.status === 'success' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✅
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  ❌
                </span>
              )}
            </div>
            <p className="text-xs text-gray-900 mb-1 line-clamp-2">{pub.message}</p>
            {pub.kind === 'reel' && <p className="text-xs text-blue-700">Reel</p>}
            <p className="text-xs text-gray-500 capitalize">
              <strong>Dia:</strong> {pub.dayOfWeek}
            </p>
            {pub.postId && (
              <p className="text-xs text-gray-500 font-mono truncate">
                <strong>ID:</strong> {pub.postId}
              </p>
            )}
            {pub.error && (
              <p className="text-xs text-red-600 mt-2">
                <strong>Erro:</strong> {pub.error}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Mensagem se não houver histórico */}
      {publications.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 text-sm">
          📭 Nenhuma publicação registrada ainda.
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!hasPrev || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNext || loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
