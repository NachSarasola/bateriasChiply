import type { APIRoute } from 'astro';
import { generarSesion } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const password = String(form.get('password') ?? '');
  const { ADMIN_PASSWORD, ADMIN_SECRET } = context.locals.runtime.env;

  if (password !== ADMIN_PASSWORD) {
    return context.redirect('/admin/login?error=1');
  }

  context.cookies.set('sesion', await generarSesion(ADMIN_SECRET), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return context.redirect('/admin/baterias');
};
