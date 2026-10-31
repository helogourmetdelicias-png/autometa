'use client';

import Link from 'next/link';
import { SchedulerStatus } from '@/components/scheduler/SchedulerStatus';
import { ScheduleConfig } from '@/components/scheduler/ScheduleConfig';
import { PostList } from '@/components/scheduler/PostList';
import { PublicationHistory } from '@/components/scheduler/PublicationHistory';

export default function SchedulerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/marketing"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Voltar para Marketing"
              >
                ← Voltar
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">Publicação Automática</h1>
                  <p className="text-xs text-gray-500">Agendamento de Posts</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Automação
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">⏰ Agendamento Automático</h2>
          <p className="text-gray-600 mt-1">
            Configure publicações automáticas diárias no Facebook. Um post diferente para cada dia da semana.
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Coluna Esquerda - Status e Configuração */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status do Agendamento */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
              <SchedulerStatus />
            </div>

            {/* Configuração de Horário */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração</h3>
              <ScheduleConfig />
            </div>
          </div>

          {/* Coluna Direita - Posts Rotativos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts Rotativos</h3>
              <PostList />
            </div>
          </div>
        </div>

        {/* Histórico de Publicações */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Histórico de Publicações</h3>
          <PublicationHistory />
        </div>

        {/* Informações */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Como Funciona</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• O sistema publica automaticamente um post por dia no horário configurado.</li>
            <li>• Cada dia da semana pode ter posts diferentes, criando uma rotação semanal.</li>
            <li>• Em produção, use Vercel Cron Jobs para agendamento confiável.</li>
            <li>• No desenvolvimento local, execute <code className="bg-blue-100 px-1 rounded">npm run scheduler:start</code>.</li>
            <li>• Use o botão "Testar Agora" para validar o post do dia atual imediatamente.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
