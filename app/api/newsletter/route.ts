import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
  'Content-Type': 'application/json; charset=utf-8',
} as const;

const allowedOrigins = new Set(['https://quant-ent.com', 'https://www.quant-ent.com', 'http://localhost:3000']);

const isAllowedRequestOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.has(origin)) {
    return true;
  }

  const host = request.headers.get('host');
  if (!host) {
    return false;
  }

  const protocol = host.includes('localhost') ? 'http' : 'https';
  return allowedOrigins.has(`${protocol}://${host}`);
};

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

  if (!isAllowedRequestOrigin(request)) {
    return jsonResponse({ error: 'Forbidden request origin.' }, { status: 403 });
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
