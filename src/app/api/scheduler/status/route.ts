// Rota para verificar e controlar o status do agendamento
import { NextRequest, NextResponse } from 'next/server';
import { getNextPost } from '@/services/autoPublisher';
import { getPublicationStats } from '@/lib/logger';
import { readState, writeState } from '@/lib/schedulerState';

export async function GET(request: NextRequest) {
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

    // Obtém estado atual
    const state = await readState();
    const nextPost = await getNextPost();
    const stats = await getPublicationStats();

    // Calcula próximo horário de publicação
    const publicationTime = process.env.PUBLICATION_TIME || '09:00';
    const [hour, minute] = publicationTime.split(':');
    const nextDate = new Date();
    nextDate.setHours(Number(hour), Number(minute), 0, 0);
    
    // Se o horário de hoje já passou, agenda para amanhã
    if (nextDate < new Date()) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return NextResponse.json({
      enabled: state.enabled,
      nextPost,
      nextPublicationTime: state.enabled ? nextDate.toISOString() : null,
      lastPublication: stats.lastPublication,
      stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
}

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

    const body: unknown = await request.json();

    if (!body || typeof body !== 'object' || !('enabled' in body)) {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido. Campo "enabled" é obrigatório.' },
        { status: 400 }
      );
    }

    const { enabled } = body as { enabled: boolean };

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'O campo "enabled" deve ser booleano.' },
        { status: 400 }
      );
    }

    // Salva novo estado
    await writeState({ enabled });

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled ? 'Agendamento ativado com sucesso' : 'Agendamento desativado com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
}
