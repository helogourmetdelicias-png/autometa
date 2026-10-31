import { NextRequest, NextResponse } from 'next/server';
import { publishToFacebook } from '@/services/facebook';
import { FacebookPostRequest } from '@/types/facebook';

export async function POST(request: NextRequest) {
  try {
    // Verificação de autenticação obrigatória via header
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    // ADMIN_SECRET é obrigatório para segurança
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'Servidor mal configurado: ADMIN_SECRET não definido.' },
        { status: 500 }
      );
    }

    // Validação do token de autenticação
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado. Token de acesso inválido ou ausente.' },
        { status: 401 }
      );
    }

    // Verificação de origem (CORS) - apenas same-origin ou origens confiáveis
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Se houver header origin (requisição cross-origin), verificar se é permitido
    if (origin) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      const originHost = new URL(origin).host;
      
      // Permitir same-origin ou origens explicitamente permitidas
      if (originHost !== host && !allowedOrigins.includes(origin)) {
        return NextResponse.json(
          { error: 'Origem não autorizada.' },
          { status: 403 }
        );
      }
    }

    const body: unknown = await request.json();

    // Validação do corpo da requisição
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido.' },
        { status: 400 }
      );
    }

    const { message, link } = body as FacebookPostRequest;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'O campo "message" é obrigatório e não pode estar vazio.' },
        { status: 400 }
      );
    }

    if (message.trim().length > 63206) {
      return NextResponse.json(
        { error: 'A mensagem excede o limite de 63.206 caracteres do Facebook.' },
        { status: 400 }
      );
    }

    const result = await publishToFacebook(message, link);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, postId: result.postId },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` },
      { status: 500 }
    );
  }
}
