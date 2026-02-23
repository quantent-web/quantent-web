const BASE_ALLOWED_HOSTS = new Set([
  'quant-ent.com',
  'www.quant-ent.com',
  'quantent-web.vercel.app',
]);

const DEV_ALLOWED_HOSTS = new Set(['localhost:3000']);

const normalizeHost = (value: string) => {
  let host = value.trim().toLowerCase().replace(/\.+$/, '');

  if (host.endsWith(':443')) {
    host = host.slice(0, -4);
  } else if (host.endsWith(':80')) {
    host = host.slice(0, -3);
  }

  return host;
};

const getHostname = (urlString: string) => {
  try {
    return normalizeHost(new URL(urlString).host);
  } catch {
    return '';
  }
};

const isAllowedHost = (host: string, vercelEnv: string) => {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) {
    return false;
  }

  if (BASE_ALLOWED_HOSTS.has(normalizedHost)) {
    return true;
  }

  const isDevEnvironment = vercelEnv !== 'production';
  return isDevEnvironment && DEV_ALLOWED_HOSTS.has(normalizedHost);
};

export function assertAllowedOrigin(req: Request): Response | null {
  const urlHost = getHostname(req.url);
  const xfHost = normalizeHost(req.headers.get('x-forwarded-host') || '');
  const host = normalizeHost(req.headers.get('host') || '');
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';
  const secFetchSite = (req.headers.get('sec-fetch-site') || '').toLowerCase();
  const vercelEnv = (process.env.VERCEL_ENV || process.env.NODE_ENV || '').toLowerCase();
  const debugEnabled = process.env.DEBUG_ORIGIN_CHECK === 'true';

  if (isAllowedHost(urlHost, vercelEnv)) {
    return null;
  }

  if (isAllowedHost(xfHost, vercelEnv)) {
    return null;
  }

  if (isAllowedHost(host, vercelEnv)) {
    return null;
  }

  if (origin) {
    const originHost = getHostname(origin);
    if (isAllowedHost(originHost, vercelEnv)) {
      return null;
    }
  }

  if (referer) {
    const refererHost = getHostname(referer);
    if (isAllowedHost(refererHost, vercelEnv)) {
      return null;
    }
  }

  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return null;
  }

  const body = {
    error: 'Forbidden request origin.',
    ...(debugEnabled
      ? {
          debug: {
            urlHost,
            xfHost,
            host,
            origin,
            referer,
            secFetchSite,
          },
        }
      : {}),
  };

  return new Response(JSON.stringify(body), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}
