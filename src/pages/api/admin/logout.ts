import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  context.cookies.delete('sesion', { path: '/' });
  return context.redirect('/admin/login');
};
