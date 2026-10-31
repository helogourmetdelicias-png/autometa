'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { DailyPost, DailyPostsConfig } from '@/types/scheduler';

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
  const [formData, setFormData] = useState<Partial<DailyPost>>({
    id: '',
    message: '',
    link: '',
    days: [],
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const adminSecret = localStorage.getItem('adminSecret');
      const response = await fetch('/api/scheduler/posts', {
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      if (response.ok) {
        const data: DailyPostsConfig = await response.json();
        setPosts(data.posts);
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
      const adminSecret = localStorage.getItem('adminSecret');
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
      const adminSecret = localStorage.getItem('adminSecret');
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
      const adminSecret = localStorage.getItem('adminSecret');
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
      {feedback && (
        <Alert variant={feedback.type} title={feedback.type === 'success' ? 'Sucesso' : 'Erro'}>
          {feedback.message}
        </Alert>
      )}

      {/* Botão Adicionar */}
      {!adding && !editing && (
        <Button
          variant="primary"
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
            maxCharacters={63206}
            currentLength={(formData.message || '').length}
            placeholder="Escreva a mensagem do post..."
          />

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
              className="flex-1"
            >
              {editing ? '💾 Salvar' : '➕ Adicionar'}
            </Button>
            <Button
              variant="secondary"
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
                <button
                  onClick={() => handleEdit(post)}
                  className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
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
