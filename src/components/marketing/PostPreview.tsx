// Pré-visualização simulada de um post do Facebook
import { formatDate } from '@/lib/utils';

interface PostPreviewProps {
  message: string;
  link?: string;
}

export function PostPreview({ message, link }: PostPreviewProps) {
  const hasContent = message.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">Pré-visualização</p>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Cabeçalho do post */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Montante - PDV</span>
            <span className="text-xs text-gray-500">{formatDate(new Date())} · 🌐</span>
          </div>
        </div>
        {/* Corpo do post */}
        <div className="p-4">
          {hasContent ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{message}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">A pré-visualização aparecerá aqui...</p>
          )}
          {link && link.trim().length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 truncate">🔗 {link}</p>
            </div>
          )}
        </div>
        {/* Rodapé do post */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">👍 Gosto · 💬 Comentar · ↗️ Partilhar</span>
        </div>
      </div>
    </div>
  );
}
