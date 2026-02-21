const allowed = new Set([
  'quant-ent.com',
  'www.quant-ent.com',
  'quantent-web.vercel.app',
  'localhost:3000',
]);

const getHostname = (urlString: string) => {
  try {
    return new URL(urlString).host;
  } catch {
    return '';
  }
};

export function assertAllowedOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin') || '';
  const host = req.headers.get('host') || '';
  const referer = req.headers.get('referer') || '';
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || '';

  let isAllowed = false;

  if (origin) {
    const oHost = getHostname(origin);
    isAllowed = allowed.has(oHost);
  } else {
    isAllowed = allowed.has(host);
    if (!isAllowed && referer) {
      const rHost = getHostname(referer);
      isAllowed = allowed.has(rHost);
    }
  }

  if (isAllowed) {
    return null;
  }

  const body = {
    error: 'Forbidden request origin.',
    ...(vercelEnv !== 'production' ? { debug: { origin, host, referer, vercelEnv } } : {}),
  };

  return new Response(JSON.stringify(body), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}
