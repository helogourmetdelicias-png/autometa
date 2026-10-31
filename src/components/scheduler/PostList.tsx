'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { DailyPost, DailyPostsConfig } from '@/types/scheduler';
import { ReelUpload } from './ReelUpload';

const DAYS = [
  { value: 'monday', label: 'Seg' },
  { value: 'tuesday', label: 'Ter' },
  { value: 'wednesday', label: 'Qua' },
  { value: 'thursday', label: 'Qui' },
  { value: 'friday', label: 'Sex' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
];

export function PostList() {
  const [posts, setPosts] = useState<DailyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<DailyPost>>({
    id: '',
    message: '',
    link: '',
    days: [],
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/posts', {
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      if (response.ok) {
        const data: DailyPostsConfig = await response.json();
        setPosts(data.posts);
      } else {
        const data = await response.json();
        setFeedback({ type: 'error', message: data.error || 'Não foi possível carregar os posts.' });
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAdd = async () => {
    if (!formData.message || !formData.id || !formData.days || formData.days.length === 0) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios' });
      return;
    }

    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          message: formData.message,
          link: formData.link || null,
          imageUrl: formData.imageUrl || null,
          kind: formData.kind || 'feed',
          videoUrl: formData.videoUrl || null,
          days: formData.days,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Post adicionado com sucesso' });
        setFormData({ id: '', message: '', link: '', days: [] });
        setAdding(false);
        await fetchPosts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao adicionar post' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro de rede ao adicionar post' });
    }
  };

  const handleEdit = (post: DailyPost) => {
    setEditing(post.id);
    setFormData(post);
    setAdding(false);
  };

  const handleUpdate = async () => {
    if (!formData.id) return;

    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/posts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Post atualizado com sucesso' });
        setEditing(null);
        setFormData({ id: '', message: '', link: '', days: [] });
        await fetchPosts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao atualizar post' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro de rede ao atualizar post' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Tem certeza que deseja remover o post "${id}"?`)) {
      return;
    }

    try {
      const adminSecret = sessionStorage.getItem('adminSecret');
      const response = await fetch(`/api/scheduler/posts?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Post removido com sucesso' });
        await fetchPosts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao remover post' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro de rede ao remover post' });
    }
  };

  const toggleDay = (day: string) => {
    const currentDays = formData.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setFormData({ ...formData, days: newDays });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
        <p className="font-semibold">Reels às 18h de Lisboa · repetição semanal</p>
        <p className="mt-1">{DAYS.filter(day => posts.some(post => post.kind === 'reel' && post.days.includes(day.value))).length}/7 dias com vídeo. Cadastre um Reel para cada dia; o feed mantém o agendamento atual.</p>
        <p className="mt-1 text-blue-700">No plano gratuito do Vercel, o envio pode ocorrer durante a hora das 18h. A Meta ainda precisa processar o vídeo.</p>
      </div>
      {feedback && (
        <Alert variant={feedback.type} title={feedback.type === 'success' ? 'Sucesso' : 'Erro'}>
          {feedback.message}
        </Alert>
      )}

      {/* Botão Adicionar */}
      {!adding && !editing && (
        <Button
          variant="primary"
          disabled={uploading}
          onClick={() => {
            setAdding(true);
            setFormData({ id: '', message: '', link: '', days: [] });
            setFeedback(null);
          }}
          className="w-full"
        >
          ➕ Adicionar Novo Post
        </Button>
      )}

      {/* Formulário de Adicionar/Editar */}
      {(adding || editing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm text-blue-900">
            {editing ? '✏️ Editar Post' : '➕ Novo Post'}
          </h4>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ID do Post</label>
            <input
              type="text"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={!!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="ex: monday-motivation"
            />
          </div>

          <Textarea
            label="Mensagem"
            value={formData.message || ''}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            maxCharacters={formData.kind === 'reel' ? 2200 : 63206}
            currentLength={(formData.message || '').length}
            placeholder="Escreva a mensagem do post..."
          />

          <div>
            <label htmlFor="post-kind" className="block text-xs font-medium text-gray-700 mb-1">Tipo de publicação</label>
            <select id="post-kind" disabled={uploading} value={formData.kind || 'feed'} onChange={e => setFormData({ ...formData, kind: e.target.value as 'feed' | 'reel', imageUrl: null, videoUrl: null })} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="feed">Feed — texto ou foto</option>
              <option value="reel">Reel — vídeo às 18h de Lisboa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Link (opcional)</label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>

          {formData.kind === 'reel' ? (
            <ReelUpload value={formData.videoUrl || ''} onChange={url => setFormData(current => ({ ...current, videoUrl: url }))} onBusyChange={setUploading} />
          ) : <div>
            <label htmlFor="post-image" className="block text-xs font-medium text-gray-700 mb-1">Foto (opcional)</label>
            <input
              id="post-image"
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://seu-site.com/foto.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Use o link direto de uma imagem pública em HTTPS. O link do post será incluído na legenda.</p>
            <label htmlFor="post-photo-file" className="block text-xs font-medium text-gray-700 mt-3 mb-1">Ou envie uma foto do computador (JPG/PNG, até 3 MB)</label>
            <input id="post-photo-file" type="file" accept="image/jpeg,image/png" disabled={uploading} className="text-xs w-full" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 3 * 1024 * 1024) {
                setFeedback({ type: 'error', message: 'A imagem deve ter até 3 MB.' });
                return;
              }
              setUploading(true);
              try {
                const body = new FormData();
                body.append('file', file);
                const response = await fetch('/api/scheduler/upload', {
                  method: 'POST', headers: { Authorization: `Bearer ${sessionStorage.getItem('adminSecret')}` }, body,
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Erro no envio da foto.');
                setFormData(current => ({ ...current, imageUrl: data.imageUrl }));
                setFeedback({ type: 'success', message: 'Foto enviada. Salve o post para usá-la na publicação.' });
              } catch (error) {
                setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Falha ao enviar foto.' });
              } finally { setUploading(false); }
            }} />
            {uploading && <p role="status" className="text-xs mt-1">Enviando foto...</p>}
            {formData.imageUrl && <a href={formData.imageUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 underline mt-2">Conferir foto selecionada</a>}
          </div>}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Dias da Semana</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (formData.days || []).includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={editing ? handleUpdate : handleAdd}
              disabled={uploading}
              className="flex-1"
            >
              {editing ? '💾 Salvar' : '➕ Adicionar'}
            </Button>
            <Button
              variant="secondary"
              disabled={uploading}
              onClick={() => {
                setAdding(false);
                setEditing(null);
                setFormData({ id: '', message: '', link: '', days: [] });
                setFeedback(null);
              }}
            >
              ❌ Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Posts */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold text-gray-900 mb-1">{post.id}</h5>
                <p className="text-xs font-medium text-blue-700 mb-1">{post.kind === 'reel' ? 'Reel · 18h de Lisboa' : 'Feed · agendamento atual'}</p>
                {post.kind === 'reel' && post.videoUrl && <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Ver vídeo</a>}
                {post.imageUrl && <a href={post.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Ver foto anexada</a>}
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {post.message.substring(0, 150)}
                  {post.message.length > 150 ? '...' : ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  {post.days.map((day) => {
                    const dayLabel = DAYS.find(d => d.value === day)?.label || day;
                    return (
                      <span
                        key={day}
                        className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {dayLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-1">
                <button disabled={uploading} className="px-2 py-1 text-xs text-blue-700 rounded hover:bg-blue-50" onClick={async () => {
                  if (!confirm(`Publicar "${post.id}" agora no Facebook? Isso cria uma publicação real, além da programação automática.`)) return;
                  setUploading(true);
                  try {
                    const response = await fetch('/api/scheduler/test', { method: 'POST', headers: { Authorization: `Bearer ${sessionStorage.getItem('adminSecret')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Falha ao publicar.');
                    setFeedback({ type: 'success', message: data.message });
                  } catch (error) { setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Falha ao publicar.' }); }
                  finally { setUploading(false); }
                }}>Publicar agora</button>
                <button
                  disabled={uploading}
                  onClick={() => handleEdit(post)}
                  className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  disabled={uploading}
                  onClick={() => handleDelete(post.id)}
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remover"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum post configurado. Clique em "Adicionar Novo Post" para começar.
        </div>
      )}
    </div>
  );
}
