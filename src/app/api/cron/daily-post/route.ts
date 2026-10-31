// Rota protegida para execução via Vercel Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledPost } from '@/services/autoPublisher';

export async function GET(request: NextRequest) {
  try {
    // Verificação de autenticação via CRON_SECRET
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Servidor mal configurado: CRON_SECRET não definido.' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado. Token de cron inválido ou ausente.' },
        { status: 401 }
      );
    }

    // Executa a publicação agendada
    const result = await publishScheduledPost();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        postId: result.postId,
        message: result.message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
