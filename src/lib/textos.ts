import type { D1Database } from '@cloudflare/workers-types';

/** Reemplaza el import estático de textos.json: ahora es una tabla clave/valor en D1. */
export async function cargarTextos(db: D1Database): Promise<Record<string, string>> {
  const { results } = await db
    .prepare('SELECT clave, valor FROM textos')
    .all<{ clave: string; valor: string }>();

  const textos: Record<string, string> = {};
  for (const fila of results) textos[fila.clave] = fila.valor;
  return textos;
}
