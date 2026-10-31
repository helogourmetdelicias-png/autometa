// Serviço de integração com a Meta Graph API v26.0
import { FacebookPostResponse, isFacebookApiError, PublishResponse } from '@/types/facebook';

const GRAPH_API_BASE = 'https://graph.facebook.com/v26.0';

/**
 * Publica uma mensagem no feed da Página do Facebook
 * @param message - Texto da postagem (suporta emojis e quebras de linha)
 * @param link - URL opcional de direcionamento
 * @returns Promise com o ID da publicação ou mensagem de erro
 */
export async function publishToFacebook(message: string, link?: string): Promise<PublishResponse> {
  const pageId = process.env.META_PAGE_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return {
      success: false,
      error: 'Variáveis de ambiente META_PAGE_ID ou META_PAGE_ACCESS_TOKEN não configuradas.',
    };
  }

  if (!message || message.trim().length === 0) {
    return {
      success: false,
      error: 'A mensagem não pode estar vazia.',
    };
  }

  // Construir URL com access_token como query parameter (padrão da Meta Graph API)
  const url = new URL(`${GRAPH_API_BASE}/${pageId}/feed`);
  url.searchParams.append('access_token', accessToken);

  const body: Record<string, string> = {
    message: message.trim(),
  };

  if (link && link.trim().length > 0) {
    body.link = link.trim();
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: unknown = await response.json();

    if (!response.ok || isFacebookApiError(data)) {
      if (isFacebookApiError(data)) {
        return {
          success: false,
          error: `Erro da Meta Graph API: ${data.error.message} (Código: ${data.error.code})`,
        };
      }
      return {
        success: false,
        error: `Erro HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const postResponse = data as FacebookPostResponse;
    return {
      success: true,
      postId: postResponse.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return {
      success: false,
      error: `Erro de rede: ${errorMessage}`,
    };
  }
}
