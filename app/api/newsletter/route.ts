import { NextResponse } from 'next/server';
import { assertAllowedOrigin } from '../_utils/origin';

export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
  'Content-Type': 'application/json; charset=utf-8',
} as const;

type NewsletterPayload = {
  email: string;
  hp?: string;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  const jsonResponse = (body: { ok: true } | { error: string }, init?: { status?: number }) =>
    NextResponse.json(body, {
      ...init,
      headers: noCacheHeaders,
    });

  const forbidden = assertAllowedOrigin(request);
  if (forbidden) {
    return forbidden;
  }

  let payload: Partial<NewsletterPayload>;

  try {
    payload = (await request.json()) as Partial<NewsletterPayload>;
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (typeof payload.hp === 'string' && payload.hp.trim().length > 0) {
    return jsonResponse({ ok: true });
  }

  if (typeof payload.email !== 'string' || !isValidEmail(payload.email.trim())) {
    return jsonResponse({ error: 'Invalid email address.' }, { status: 400 });
  }

  return jsonResponse({ ok: true });
}
