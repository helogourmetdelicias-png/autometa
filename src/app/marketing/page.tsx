'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { TemplateButtons } from '@/components/marketing/TemplateButtons';
import { PostPreview } from '@/components/marketing/PostPreview';
import { publishPostAction } from './actions';

const MAX_MESSAGE_LENGTH = 63206;

interface PublishState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  postId?: string;
}

export default function MarketingPage() {
  const [postMessage, setPostMessage] = useState('');
  const [postLink, setPostLink] = useState('');
  const [publishState, setPublishState] = useState<PublishState>({ status: 'idle' });

  const handleTemplateSelect = (message: string, link?: string) => {
    setPostMessage(message);
    if (link) setPostLink(link);
    setPublishState({ status: 'idle' });
  };

  const handlePublish = async () => {
    if (!postMessage.trim()) return;

    setPublishState({ status: 'loading' });

    try {
      // Usar Server Action ao invés de chamar a API diretamente
      const result = await publishPostAction(postMessage, postLink || undefined);

      if (!result.success) {
        setPublishState({
          status: 'error',
          message: result.error || 'Ocorreu um erro ao publicar. Tente novamente.',
        });
      } else {
        setPublishState({
          status: 'success',
          postId: result.postId,
          message: `Post publicado com sucesso! ID: ${result.postId}`,
        });
        setPostMessage('');
        setPostLink('');
      }
    } catch (error) {
      setPublishState({
        status: 'error',
        message: 'Erro de rede. Verifique sua conexão e tente novamente.',
      });
    }
  };

  const isLoading = publishState.status === 'loading';
  const canPublish = postMessage.trim().length > 0 && postMessage.length <= MAX_MESSAGE_LENGTH && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Montante - PDV</h1>
                <p className="text-xs text-gray-500">Gestão de Marketing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/marketing/scheduler"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                ⏰ Automatização
              </Link>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Facebook
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Publicação no Facebook</h2>
          <p className="text-gray-600 mt-1">
            Gerencie e publique posts diretamente na página <strong>Montante - PDV</strong> no Facebook.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna de Edição */}
          <div className="flex flex-col gap-5">
            {/* Templates */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <TemplateButtons onSelect={handleTemplateSelect} />
            </div>

            {/* Editor */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <Textarea
                  id="post-message"
                  label="Legenda do Post"
                  placeholder="Escreva a mensagem para publicar no Facebook..."
                  value={postMessage}
                  onChange={(e) => {
                    setPostMessage(e.target.value);
                    if (publishState.status !== 'idle') setPublishState({ status: 'idle' });
                  }}
                  rows={6}
                  maxCharacters={MAX_MESSAGE_LENGTH}
                  currentLength={postMessage.length}
                  error={
                    postMessage.length > MAX_MESSAGE_LENGTH
                      ? 'Mensagem excede o limite do Facebook'
                      : undefined
                  }
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="post-link" className="text-sm font-medium text-gray-700">
                    Link (opcional)
                  </label>
                  <input
                    id="post-link"
                    type="url"
                    placeholder="https://..."
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
                    aria-label="URL opcional para incluir no post"
                  />
                </div>

                {/* Feedback */}
                {publishState.status === 'success' && (
                  <Alert variant="success" title="Post Publicado!">
                    {publishState.message}
                  </Alert>
                )}
                {publishState.status === 'error' && (
                  <Alert variant="error" title="Erro ao Publicar">
                    {publishState.message}
                  </Alert>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={!canPublish}
                  onClick={handlePublish}
                  className="w-full"
                  aria-label="Publicar post no Facebook"
                >
                  {isLoading ? 'Publicando...' : '📘 Publicar no Facebook Agora'}
                </Button>
              </div>
            </div>
          </div>

          {/* Coluna de Pré-visualização */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <PostPreview message={postMessage} link={postLink} />
            </div>

            {/* Informações */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Informações Importantes</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Os posts são publicados imediatamente na página do Facebook.</li>
                <li>• Emojis e quebras de linha são suportados.</li>
                <li>• Limite máximo de 63.206 caracteres por post.</li>
                <li>• Links incluídos geram uma pré-visualização automática no Facebook.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
