import type { APIRoute } from 'astro';

/**
 * Sirve las fotos de R2 a traves del propio sitio, en vez de depender de un dominio
 * custom del bucket (eso pide configurar DNS aparte en el dashboard de Cloudflare).
 * Publica a proposito: el middleware solo protege /admin y /api/admin.
 */
export const GET: APIRoute = async (context) => {
  const ruta = context.params.ruta;
  if (!ruta) return new Response('No encontrada', { status: 404 });

  const objeto = await context.locals.runtime.env.FOTOS.get(ruta);
  if (!objeto) return new Response('No encontrada', { status: 404 });

  // El ReadableStream de R2 (tipos de Workers) y el que espera Response (tipos DOM,
  // los unicos referenciados globalmente aca para no chocar con el codigo client-side)
  // son estructuralmente el mismo objeto en el runtime real; solo difieren en el
  // paquete de tipos que los describe.
  return new Response(objeto.body as unknown as BodyInit, {
    headers: {
      'Content-Type': objeto.httpMetadata?.contentType ?? 'application/octet-stream',
      // El nombre de archivo incluye timestamp + random y nunca se reescribe:
      // cachear "para siempre" es seguro.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
