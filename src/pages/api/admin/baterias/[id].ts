import type { APIRoute } from 'astro';
import { getBateriaById } from '../../../../lib/catalog';
import {
  normalizarBateria,
  mensajeDeErrorDeGuardado,
  type BateriaPayload,
} from '../../../../lib/baterias-admin';

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async (context) => {
  const id = Number(context.params.id);
  const bateria = await getBateriaById(context.locals.runtime.env.DB, id);
  if (!bateria) return json({ error: 'No existe esa batería.' }, 404);
  return json({ bateria });
};

export const PUT: APIRoute = async (context) => {
  const id = Number(context.params.id);
  const db = context.locals.runtime.env.DB;

  const existente = await getBateriaById(db, id);
  if (!existente) return json({ error: 'No existe esa batería.' }, 404);

  const payload = (await context.request.json()) as BateriaPayload;
  const normalizada = normalizarBateria(payload);
  if (typeof normalizada === 'string') return json({ error: normalizada }, 400);

  // Mismo criterio que en el POST: el SET se arma con las claves de la normalizada,
  // que son los nombres de columna. El id va como último marcador.
  const columnas = Object.keys(normalizada);
  const valores = Object.values(normalizada);
  const asignaciones = columnas.map((col, i) => `${col} = ?${i + 1}`).join(', ');

  try {
    await db
      .prepare(
        `UPDATE baterias SET ${asignaciones}, updated_at = datetime('now')
         WHERE id = ?${columnas.length + 1}`,
      )
      .bind(...valores, id)
      .run();
    return json({ ok: true });
  } catch (error) {
    return json({ error: mensajeDeErrorDeGuardado(error) }, 409);
  }
};

export const DELETE: APIRoute = async (context) => {
  const id = Number(context.params.id);
  const db = context.locals.runtime.env.DB;

  const existente = await getBateriaById(db, id);
  if (!existente) return json({ error: 'No existe esa batería.' }, 404);

  // Las fotos en R2 no se borran aca: es espacio sin uso, no un costo (R2 free tier
  // no cobra egress ni tiene limite bajo de storage a esta escala).
  await db.prepare('DELETE FROM baterias WHERE id = ?1').bind(id).run();
  return json({ ok: true });
};
