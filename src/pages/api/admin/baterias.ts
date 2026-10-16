import type { APIRoute } from 'astro';
import { getAllBaterias } from '../../../lib/catalog';
import {
  normalizarBateria,
  mensajeDeErrorDeGuardado,
  type BateriaPayload,
} from '../../../lib/baterias-admin';

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async (context) => {
  const baterias = await getAllBaterias(context.locals.runtime.env.DB);
  return json({ baterias });
};

export const POST: APIRoute = async (context) => {
  const payload = (await context.request.json()) as BateriaPayload;
  const normalizada = normalizarBateria(payload);
  if (typeof normalizada === 'string') return json({ error: normalizada }, 400);

  // Las claves de BateriaNormalizada son exactamente los nombres de columna, así que
  // el INSERT se arma solo. Son 22 campos: escribirlos a mano en dos endpoints era
  // garantía de que algún día uno quede desalineado con el otro. Los nombres salen de
  // nuestro propio código, nunca del request, así que no hay inyección posible: los
  // valores siguen viajando por bind().
  const columnas = Object.keys(normalizada);
  const valores = Object.values(normalizada);
  const marcadores = columnas.map((_, i) => `?${i + 1}`).join(', ');

  const db = context.locals.runtime.env.DB;
  try {
    const resultado = await db
      .prepare(
        `INSERT INTO baterias (${columnas.join(', ')}, updated_at)
         VALUES (${marcadores}, datetime('now'))`,
      )
      .bind(...valores)
      .run();
    return json({ id: resultado.meta.last_row_id }, 201);
  } catch (error) {
    return json({ error: mensajeDeErrorDeGuardado(error) }, 409);
  }
};
