import type { APIRoute } from 'astro';

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Recibe dos blobs ya redimensionados por el navegador (FotoUploader.astro hace el
 * trabajo que antes hacia sharp: no hay libreria de imagenes en el servidor porque
 * el runtime de Workers no soporta bindings nativos como los que usa sharp).
 */
export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const principal = form.get('principal');
  const chica = form.get('chica');

  if (!(principal instanceof File) || !(chica instanceof File)) {
    return json({ error: 'Faltan los archivos.' }, 400);
  }

  const bucket = context.locals.runtime.env.FOTOS;
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rutaPrincipal = `productos/${nombre}.webp`;
  const rutaChica = `productos/${nombre}-sm.webp`;

  await Promise.all([
    bucket.put(rutaPrincipal, await principal.arrayBuffer(), {
      httpMetadata: { contentType: 'image/webp' },
    }),
    bucket.put(rutaChica, await chica.arrayBuffer(), {
      httpMetadata: { contentType: 'image/webp' },
    }),
  ]);

  // Rutas propias del sitio, no un dominio custom de R2: asi no depende de configurar
  // DNS para el bucket, y las fotos ya andan aunque R2 todavia no tenga dominio publico.
  return json({ url: `/fotos/${rutaPrincipal}`, urlChica: `/fotos/${rutaChica}` }, 201);
};
