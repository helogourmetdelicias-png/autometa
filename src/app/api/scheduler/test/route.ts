// Rota para testar publicação imediata
import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledPost, getNextPost } from '@/services/autoPublisher';
import { publishToFacebook } from '@/services/facebook';
import { savePublication } from '@/lib/logger';
import { readConfig } from '@/lib/postsConfig';
import { DailyPostsConfig, PublicationEntry } from '@/types/scheduler';

export async function POST(request: NextRequest) {
  try {
    // Verificação de autenticação
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

    // Verifica se foi especificado um postId
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const postId = body && typeof body === 'object' && 'postId' in body ? (body as { postId?: string }).postId : undefined;

    if (postId) {
      // Testa um post específico
      const config = await readConfig();
      
      const post = config.posts.find(p => p.id === postId);
      
      if (!post) {
        return NextResponse.json(
          { error: `Post com ID "${postId}" não encontrado.` },
          { status: 404 }
        );
      }

      const result = await publishToFacebook(post.message, post.link || undefined, post.imageUrl || undefined);

      // Salva no log
      const entry: PublicationEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        postId: result.success ? result.postId : null,
        message: post.message,
        link: post.link || undefined,
        status: result.success ? 'success' : 'error',
        timestamp: new Date().toISOString(),
        error: result.success ? undefined : result.error,
        dayOfWeek: 'test',
      };

      await savePublication(entry);

      if (result.success) {
        return NextResponse.json({
          success: true,
          postId: result.postId,
          message: `Post de teste publicado com sucesso: ${post.id}`,
          content: post.message.substring(0, 100) + (post.message.length > 100 ? '...' : ''),
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 500 }
        );
      }
    } else {
      // Publica o post do dia atual
      const result = await publishScheduledPost();

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 500 }
        );
      }

      const post = await getNextPost();

      return NextResponse.json({
        success: true,
        postId: result.postId,
        message: result.message,
        content: post?.message.substring(0, 100) + (post && post.message.length > 100 ? '...' : ''),
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
