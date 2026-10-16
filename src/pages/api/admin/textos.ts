import type { APIRoute } from 'astro';
import { cargarTextos } from '../../../lib/textos';

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async (context) => {
  const textos = await cargarTextos(context.locals.runtime.env.DB);
  return json({ textos });
};

export const PUT: APIRoute = async (context) => {
  const body = (await context.request.json()) as {
    textos?: Record<string, string>;
  };
  const entradas = Object.entries(body.textos ?? {});
  const db = context.locals.runtime.env.DB;

  // Una fila vacia vuelve al valor de fabrica (borrarla), no queda guardada como "".
  const statements = entradas.map(([clave, valor]) =>
    valor?.trim()
      ? db
          .prepare(
            `INSERT INTO textos (clave, valor) VALUES (?1, ?2)
             ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`,
          )
          .bind(clave, valor.trim())
      : db.prepare('DELETE FROM textos WHERE clave = ?1').bind(clave),
  );

  if (statements.length > 0) await db.batch(statements);
  return json({ ok: true });
};
