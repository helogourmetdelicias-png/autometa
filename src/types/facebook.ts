// Interfaces e tipos para integração com a Meta Graph API

export interface FacebookPostRequest {
  message: string;
  link?: string;
}

export interface FacebookPostResponse {
  id: string;
}

export interface FacebookError {
  message: string;
  type: string;
  code: number;
  fbtrace_id: string;
}

export interface FacebookApiError {
  error: FacebookError;
}

export interface PublishResult {
  success: true;
  postId: string;
  pending?: boolean;
}

export interface PublishError {
  success: false;
  error: string;
}

export type PublishResponse = PublishResult | PublishError;

// Type guard para verificar se a resposta é um erro da API do Facebook
export function isFacebookApiError(response: unknown): response is FacebookApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as FacebookApiError).error === 'object'
  );
}
