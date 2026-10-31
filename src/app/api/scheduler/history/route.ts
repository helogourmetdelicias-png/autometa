// Rota para visualizar histórico de publicações
import { NextRequest, NextResponse } from 'next/server';
import { getPublicationHistory, getTotalPublications } from '@/lib/logger';

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

    // Parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 30, 1), 100);
    const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

    // Busca histórico
    const publications = await getPublicationHistory(limit, offset);
    const total = await getTotalPublications();

    return NextResponse.json({
      publications,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
}
