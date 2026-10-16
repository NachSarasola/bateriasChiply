import { slugify } from './slug';

/**
 * Normalización de lo que manda el formulario del panel antes de tocar D1.
 *
 * Obligatorios: nombre, código, tipo y precio. Todo el resto de las specs es
 * opcional a propósito — no todos los proveedores publican el CCA o la reserva, y
 * es preferible una ficha a medio llenar que no poder cargar la batería.
 */

export interface BateriaPayload {
  codigo?: string;
  slug?: string;
  nombre?: string;
  marca?: string;
  tipoNombre?: string;
  aplicacion?: string;
  precio?: number | string;
  precioTachado?: number | string | null;
  tension?: number | string;
  capacidadAh?: number | string | null;
  reservaRc?: number | string | null;
  cca?: number | string | null;
  garantiaMeses?: number | string;
  largoMm?: number | string | null;
  anchoMm?: number | string | null;
  altoMm?: number | string | null;
  borne?: string;
  libreMantenimiento?: boolean;
  imagenes?: string[];
  descripcion?: string;
  destacado?: boolean;
  stock?: boolean;
}

export interface BateriaNormalizada {
  codigo: string;
  slug: string;
  nombre: string;
  marca: string;
  tipo: string;
  tipo_nombre: string;
  aplicacion: string;
  precio: number;
  precio_tachado: number | null;
  tension: number;
  capacidad_ah: number | null;
  reserva_rc: number | null;
  cca: number | null;
  garantia_meses: number;
  largo_mm: number | null;
  ancho_mm: number | null;
  alto_mm: number | null;
  borne: string;
  libre_mantenimiento: number;
  imagenes: string;
  descripcion: string;
  destacado: number;
  stock: number;
}

/** Devuelve el número si es un entero positivo, o null. Los campos vacíos del form llegan como ''. */
function opcional(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

const BORNES = ['derecha', 'izquierda'];

/** Devuelve un string con el error, o la batería lista para el INSERT/UPDATE. */
export function normalizarBateria(payload: BateriaPayload): BateriaNormalizada | string {
  const nombre = (payload.nombre ?? '').trim();
  if (!nombre) return 'Falta el nombre.';

  const codigo = (payload.codigo ?? '').trim().toUpperCase();
  if (!codigo) return 'Falta el código (ej: 12X65).';

  // 0 es un valor valido: la ficha muestra "Consultar" y el boton lleva a WhatsApp en
  // vez de al carrito. Es el estado en que llega el catalogo importado del CSV, que
  // trae specs pero no precios.
  const precio = Number(payload.precio);
  if (!Number.isFinite(precio) || precio < 0) return 'El precio no puede ser negativo.';

  const tipoNombre = (payload.tipoNombre ?? '').trim();
  if (!tipoNombre) return 'Falta el tipo (Automóviles, Motos, etc.).';

  const slug = slugify(payload.slug || nombre);
  if (!slug) return 'No se pudo generar el link a partir del nombre.';

  const precioTachado = opcional(payload.precioTachado);
  const borne = (payload.borne ?? '').trim().toLowerCase();

  return {
    codigo: codigo.slice(0, 20),
    slug,
    nombre,
    marca: (payload.marca ?? '').trim(),
    tipo: slugify(tipoNombre),
    tipo_nombre: tipoNombre,
    aplicacion: (payload.aplicacion ?? '').trim(),
    precio: Math.round(precio),
    // Solo tiene sentido si es mayor al precio actual; si no, no hay descuento que mostrar.
    precio_tachado: precioTachado && precioTachado > precio ? precioTachado : null,
    tension: opcional(payload.tension) ?? 12,
    capacidad_ah: opcional(payload.capacidadAh),
    reserva_rc: opcional(payload.reservaRc),
    cca: opcional(payload.cca),
    garantia_meses: opcional(payload.garantiaMeses) ?? 12,
    largo_mm: opcional(payload.largoMm),
    ancho_mm: opcional(payload.anchoMm),
    alto_mm: opcional(payload.altoMm),
    borne: BORNES.includes(borne) ? borne : '',
    libre_mantenimiento: payload.libreMantenimiento === false ? 0 : 1,
    imagenes: JSON.stringify((payload.imagenes ?? []).filter(Boolean)),
    descripcion: (payload.descripcion ?? '').trim(),
    destacado: payload.destacado ? 1 : 0,
    stock: payload.stock === false ? 0 : 1,
  };
}

/** D1 tira el mensaje crudo de SQLite en error.message; esto lo hace legible. */
export function mensajeDeErrorDeGuardado(error: unknown): string {
  const texto = error instanceof Error ? error.message : String(error);
  if (texto.includes('UNIQUE') && texto.includes('slug')) {
    return 'Ya existe una batería con ese nombre (el link quedaría repetido). Cambiá el nombre.';
  }
  if (texto.includes('UNIQUE') && texto.includes('codigo')) {
    return 'Ya existe una batería con ese código.';
  }
  return 'No se pudo guardar la batería.';
}
