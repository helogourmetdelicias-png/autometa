import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseConfig } from '@/lib/jsonStore';

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ error: 'Configure o Supabase para enviar fotos.' }, { status: 503 });
  if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Envie uma imagem de até 3 MB.' }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'Envie uma imagem JPG ou PNG de até 3 MB.' }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b, i) => bytes[i] === b);
    const jpg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!png && !jpg) return NextResponse.json({ error: 'Use uma imagem JPG ou PNG válida.' }, { status: 400 });
    const object = `posts/${randomUUID()}.${png ? 'png' : 'jpg'}`;
    const response = await fetch(`${config.url}/storage/v1/object/marketing-images/${object}`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': png ? 'image/png' : 'image/jpeg' },
      body: bytes,
    });
    if (!response.ok) throw new Error('Não foi possível enviar a foto. Confira o bucket marketing-images no Supabase.');
    return NextResponse.json({ imageUrl: `${config.url}/storage/v1/object/public/marketing-images/${object}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao enviar foto.' }, { status: 500 });
  }
}
