import { defineMiddleware, sequence } from 'astro:middleware';
import { cargarTextos } from './lib/textos';
import { buildConfig } from './data/config';
import { leerCookie, verificarSesion } from './lib/auth';

/**
 * Resuelve los textos del sitio UNA vez por request y los deja en Astro.locals.config.
 * Sin esto, cada componente que hoy hace `import { SITE } from '../data/config'` tendria
 * que consultar D1 por su cuenta -- una tabla de 20 filas no justifica esa cantidad de queries.
 */
const cargarConfig = defineMiddleware(async (context, next) => {
  const db = context.locals.runtime.env.DB;
  const textos = await cargarTextos(db);
  context.locals.config = buildConfig(textos);
  return next();
});

const RUTAS_SIN_LOGIN = ['/admin/login', '/api/admin/login'];

/** Protege /admin/* y /api/admin/*. Paginas sin sesion van a /admin/login; endpoints, 401 JSON. */
const protegerAdmin = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const esAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!esAdmin || RUTAS_SIN_LOGIN.includes(pathname)) return next();

  const cookie = leerCookie(context.request.headers.get('cookie'), 'sesion');
  const valida = await verificarSesion(cookie, context.locals.runtime.env.ADMIN_SECRET);

  if (!valida) {
    if (pathname.startsWith('/api/admin')) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  context.locals.admin = true;
  return next();
});

export const onRequest = sequence(cargarConfig, protegerAdmin);
