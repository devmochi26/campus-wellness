export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  url.hostname = 'campus-wellness-api.onrender.com';
  url.port = '';

  const proxyRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
  });

  return fetch(proxyRequest);
}
