export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    try {
      url.hostname = 'campus-wellness-1bsj.onrender.com';
      url.port = '';

      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.delete('cf-connecting-ip');
      headers.delete('x-forwarded-for');

      const proxyRequest = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.arrayBuffer()
          : undefined,
      });

      const res = await fetch(proxyRequest);
      const newHeaders = new Headers(res.headers);
      newHeaders.set('x-proxy', 'cf-middleware');

      return new Response(res.body, {
        status: res.status,
        headers: newHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'proxy error', detail: String(err) }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return next();
}
