export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    url.hostname = 'campus-wellness-1bsj.onrender.com';
    url.port = '';

    const proxyRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.arrayBuffer()
        : undefined,
    });

    return fetch(proxyRequest);
  }

  return next();
}
