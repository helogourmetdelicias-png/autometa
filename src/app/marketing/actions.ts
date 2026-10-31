'use server';

import { publishToFacebook } from '@/services/facebook';

/**
 * Server Action para publicar post no Facebook
 * Esta função roda no servidor e tem acesso às variáveis de ambiente
 */
export async function publishPostAction(message: string, link?: string) {
  // Validação básica
  if (!message || message.trim().length === 0) {
    return {
      success: false,
      error: 'O campo "message" é obrigatório e não pode estar vazio.',
    };
  }

  if (message.trim().length > 63206) {
    return {
      success: false,
      error: 'A mensagem excede o limite de 63.206 caracteres do Facebook.',
    };
  }

  // Chamar o serviço de publicação
  const result = await publishToFacebook(message, link);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    postId: result.postId,
  };
}
