import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledPost } from '@/services/autoPublisher';

export const maxDuration = 180;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  // Dois disparos UTC diários, mas somente a janela das 18h de Lisboa envia.
  // Cada disparo respeita a frequência diária permitida pelo plano Hobby.
  const hour = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Lisbon' }).format(new Date());
  if (hour !== '18') return NextResponse.json({ success: true, skipped: true, message: 'Fora da janela das 18h de Lisboa.' });
  const result = await publishScheduledPost('reel');
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
