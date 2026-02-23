import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!rawPayload || typeof rawPayload !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const payload = rawPayload as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) {
    return NextResponse.json(
      { error: 'Newsletter service is not configured.' },
      { status: 500 }
    );
  }

  const memberHash = createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${memberHash}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailchimp subscription failed', {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Mailchimp subscription failed', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
