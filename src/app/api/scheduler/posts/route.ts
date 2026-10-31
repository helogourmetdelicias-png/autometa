// Rota CRUD para gerenciar posts rotativos
import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/postsConfig';
import { DailyPostsConfig, DailyPost } from '@/types/scheduler';
import { validVideoUrl } from '@/services/reels';


function validImageUrl(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function validatePost(post: Partial<DailyPost>, posts: DailyPost[]): string | null {
  if (post.kind !== undefined && post.kind !== 'feed' && post.kind !== 'reel') return 'Tipo de publicação inválido.';
  if (typeof post.message !== 'string' || !post.message.trim()) return 'Informe a mensagem da publicação.';
  if (!Array.isArray(post.days) || !post.days.length || post.days.some(day => !['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(day))) return 'Selecione dias da semana válidos.';
  if (post.kind === 'reel') {
    if (!validVideoUrl(post.videoUrl)) return 'Informe ou envie um vídeo HTTPS público para o Reel.';
    if (post.imageUrl) return 'Reels usam vídeo. Remova a foto ou selecione Feed.';
    if (post.message.length > 2200) return 'A legenda do Reel deve ter até 2.200 caracteres.';
    if (posts.some(other => other.id !== post.id && other.kind === 'reel' && other.days.some(day => post.days!.includes(day)))) return 'Já existe um Reel para um dos dias selecionados. Edite esse Reel ou escolha outro dia.';
  } else if (post.videoUrl) return 'Selecione Reel para usar um vídeo.';
  return null;
}


function validateAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('Authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return NextResponse.json(
      { error: 'Servidor mal configurado: ADMIN_SECRET não definido.' },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { error: 'Não autorizado. Token de acesso inválido ou ausente.' },
      { status: 401 }
    );
  }

  return null;
}

// GET - Lista todos os posts
export async function GET(request: NextRequest) {
  const authError = validateAuth(request);
  if (authError) return authError;

  try {
    const config = await readConfig();
    return NextResponse.json(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro ao ler posts: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Adiciona novo post
export async function POST(request: NextRequest) {
  const authError = validateAuth(request);
  if (authError) return authError;

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido.' },
        { status: 400 }
      );
    }

    const newPost = body as Partial<DailyPost>;

    if (!validImageUrl(newPost.imageUrl)) {
      return NextResponse.json({ error: 'Informe um endereço HTTPS público para a foto.' }, { status: 400 });
    }

    // Validações
    if (!newPost.id || typeof newPost.id !== 'string') {
      return NextResponse.json(
        { error: 'Campo "id" é obrigatório e deve ser string.' },
        { status: 400 }
      );
    }

    if (!newPost.message || typeof newPost.message !== 'string' || newPost.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Campo "message" é obrigatório e não pode estar vazio.' },
        { status: 400 }
      );
    }

    if (newPost.message.length > 63206) {
      return NextResponse.json(
        { error: 'Mensagem excede o limite de 63.206 caracteres do Facebook.' },
        { status: 400 }
      );
    }

    if (!newPost.days || !Array.isArray(newPost.days) || newPost.days.length === 0) {
      return NextResponse.json(
        { error: 'Campo "days" é obrigatório e deve conter ao menos um dia da semana.' },
        { status: 400 }
      );
    }

    const config = await readConfig();

    // Verifica se ID já existe
    if (config.posts.some(p => p.id === newPost.id)) {
      return NextResponse.json(
        { error: `Post com ID "${newPost.id}" já existe.` },
        { status: 409 }
      );
    }

    const validationError = validatePost(newPost, config.posts);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    // Adiciona o novo post
    config.posts.push({
      id: newPost.id,
      message: newPost.message,
      link: newPost.link || null,
      imageUrl: newPost.imageUrl || null,
      kind: newPost.kind || 'feed',
      videoUrl: newPost.videoUrl || null,
      days: newPost.days,
    });

    await writeConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Post adicionado com sucesso',
      post: config.posts[config.posts.length - 1],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro ao adicionar post: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT - Edita post existente
export async function PUT(request: NextRequest) {
  const authError = validateAuth(request);
  if (authError) return authError;

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido.' },
        { status: 400 }
      );
    }

    const updates = body as Partial<DailyPost> & { id: string };

    if (!validImageUrl(updates.imageUrl)) {
      return NextResponse.json({ error: 'Informe um endereço HTTPS público para a foto.' }, { status: 400 });
    }

    if (!updates.id || typeof updates.id !== 'string') {
      return NextResponse.json(
        { error: 'Campo "id" é obrigatório.' },
        { status: 400 }
      );
    }

    const config = await readConfig();
    const postIndex = config.posts.findIndex(p => p.id === updates.id);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: `Post com ID "${updates.id}" não encontrado.` },
        { status: 404 }
      );
    }

    // Aplica atualizações
    const updatedPost = {
      ...config.posts[postIndex],
      ...(updates.message !== undefined && { message: updates.message }),
      ...(updates.link !== undefined && { link: updates.link }),
      ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
      ...(updates.kind !== undefined && { kind: updates.kind }),
      ...(updates.videoUrl !== undefined && { videoUrl: updates.videoUrl }),
      ...(updates.days !== undefined && { days: updates.days }),
    };

    const validationError = validatePost(updatedPost, config.posts);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    // Validações
    if (updatedPost.message.length > 63206) {
      return NextResponse.json(
        { error: 'Mensagem excede o limite de 63.206 caracteres do Facebook.' },
        { status: 400 }
      );
    }

    if (updatedPost.days.length === 0) {
      return NextResponse.json(
        { error: 'Post deve ter ao menos um dia da semana.' },
        { status: 400 }
      );
    }

    config.posts[postIndex] = updatedPost;
    await writeConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Post atualizado com sucesso',
      post: updatedPost,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro ao atualizar post: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove post
export async function DELETE(request: NextRequest) {
  const authError = validateAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro "id" é obrigatório.' },
        { status: 400 }
      );
    }

    const config = await readConfig();
    const postIndex = config.posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: `Post com ID "${id}" não encontrado.` },
        { status: 404 }
      );
    }

    config.posts.splice(postIndex, 1);
    await writeConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Post removido com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro ao remover post: ${errorMessage}` },
      { status: 500 }
    );
  }
}
