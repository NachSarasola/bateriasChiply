/**
 * Lectura del catálogo desde D1.
 *
 * El sitio público es una sola página: `getAllBaterias()` se llama una vez por
 * visita y de ahí sale todo (la grilla, los filtros y el buscador trabajan sobre
 * ese mismo array, en el navegador). No hay queries por categoría ni por slug en
 * el front — esas quedan para el panel.
 */
import type { D1Database } from '@cloudflare/workers-types';

export interface Bateria {
  id: number;
  /** Código comercial: "12X65". Es lo que el cliente pregunta por teléfono. */
  codigo: string;
  slug: string;
  nombre: string;
  marca: string;
  /** Para los filtros: auto | camioneta | moto | camion | solar. */
  tipo: string;
  /** Como lo escribió Chiply en el panel: "Pick-up y SUV". */
  tipoNombre: string;
  /** "T/Corolla - Ecosport - Gol Trend". */
  aplicacion: string;
  precio: number;
  precioTachado: number | null;
  tension: number;
  capacidadAh: number | null;
  reservaRc: number | null;
  cca: number | null;
  garantiaMeses: number;
  largoMm: number | null;
  anchoMm: number | null;
  altoMm: number | null;
  /** 'derecha' | 'izquierda' | ''. */
  borne: string;
  libreMantenimiento: boolean;
  imagenes: string[];
  descripcion: string;
  destacado: boolean;
  stock: boolean;
}

export interface Tipo {
  slug: string;
  nombre: string;
  cantidad: number;
}

interface FilaBateria {
  id: number;
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

function parseFila(fila: FilaBateria): Bateria {
  return {
    id: fila.id,
    codigo: fila.codigo,
    slug: fila.slug,
    nombre: fila.nombre,
    marca: fila.marca,
    tipo: fila.tipo,
    tipoNombre: fila.tipo_nombre === 'Maquinarias y tractores' ? 'Maquinarias y Tractores' : fila.tipo_nombre,
    aplicacion: fila.aplicacion,
    precio: fila.precio,
    precioTachado: fila.precio_tachado,
    tension: fila.tension,
    capacidadAh: fila.capacidad_ah,
    reservaRc: fila.reserva_rc,
    cca: fila.cca,
    garantiaMeses: fila.garantia_meses,
    largoMm: fila.largo_mm,
    anchoMm: fila.ancho_mm,
    altoMm: fila.alto_mm,
    borne: fila.borne,
    libreMantenimiento: fila.libre_mantenimiento === 1,
    imagenes: JSON.parse(fila.imagenes || '[]'),
    descripcion: fila.descripcion,
    destacado: fila.destacado === 1,
    stock: fila.stock === 1,
  };
}

/**
 * Todo el catálogo, con y sin stock. El orden es el de la página: primero las
 * destacadas con stock, después el resto por capacidad, y las agotadas al final
 * (siguen visibles porque sirven para que el cliente confirme la medida y pregunte
 * cuándo entra).
 */
export async function getAllBaterias(db: D1Database): Promise<Bateria[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM baterias
       ORDER BY stock DESC, destacado DESC, capacidad_ah ASC, codigo ASC`,
    )
    .all<FilaBateria>();
  return results.map(parseFila);
}

export async function getBateria(db: D1Database, slug: string): Promise<Bateria | undefined> {
  const fila = await db
    .prepare('SELECT * FROM baterias WHERE slug = ?1')
    .bind(slug)
    .first<FilaBateria>();
  return fila ? parseFila(fila) : undefined;
}

export async function getBateriaById(db: D1Database, id: number): Promise<Bateria | undefined> {
  const fila = await db
    .prepare('SELECT * FROM baterias WHERE id = ?1')
    .bind(id)
    .first<FilaBateria>();
  return fila ? parseFila(fila) : undefined;
}

/** Para el estado "todavía no hay nada cargado" de la página y del panel. */
export async function hayBaterias(db: D1Database): Promise<boolean> {
  const fila = await db.prepare('SELECT 1 FROM baterias LIMIT 1').first();
  return fila !== null;
}

/**
 * Los tipos salen del propio catálogo: la columna `tipo` de cada batería crea el
 * filtro, no hay una tabla aparte que mantener sincronizada. Se calcula sobre el
 * array que ya trajo la página, sin volver a D1.
 */
export function getTipos(baterias: Bateria[]): Tipo[] {
  const mapa = new Map<string, Tipo>();
  for (const b of baterias) {
    const actual = mapa.get(b.tipo) ?? { slug: b.tipo, nombre: b.tipoNombre, cantidad: 0 };
    actual.cantidad += 1;
    mapa.set(b.tipo, actual);
  }
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
}

export function descuento(bateria: Bateria): number | null {
  if (!bateria.precioTachado || bateria.precioTachado <= bateria.precio) return null;
  return Math.round((1 - bateria.precio / bateria.precioTachado) * 100);
}

/** "207 x 175 x 175 mm", o null si falta alguna medida. */
export function medidas(bateria: Bateria): string | null {
  const { largoMm, anchoMm, altoMm } = bateria;
  if (!largoMm || !anchoMm || !altoMm) return null;
  return `${largoMm} x ${anchoMm} x ${altoMm} mm`;
}

function sinAcentos(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * El texto contra el que busca el filtro del catálogo. Se calcula en el servidor y
 * viaja en un `data-buscar` por tarjeta, así el script del navegador solo compara
 * strings.
 *
 * Incluye la medida escrita de las dos formas que la tipea la gente ("12x65" y
 * "12 x 65") y la capacidad con y sin unidad ("65", "65ah"), porque el que busca
 * una batería llega con el dato que le dijo el mecánico, no con el código exacto.
 */
export function textoBuscable(b: Bateria): string {
  const partes = [
    b.codigo,
    b.codigo.replace(/x/gi, ' x '),
    b.nombre,
    b.marca,
    b.tipoNombre,
    b.descripcion,
    b.capacidadAh ? `${b.capacidadAh} ${b.capacidadAh}ah` : '',
    b.cca ? `${b.cca}cca` : '',
    b.borne ? `borne ${b.borne}` : '',
    medidas(b) ?? '',
  ];
  return sinAcentos(partes.join(' ').toLowerCase()).replace(/\s+/g, ' ').trim();
}

/** Se muestra cuando una batería se cargó en el panel sin foto. */
export const SIN_FOTO = '/sin-foto.svg';

export function fotoPrincipal(bateria: Bateria | undefined): string {
  return bateria?.imagenes[0] ?? SIN_FOTO;
}

/**
 * Las fotos subidas desde el panel se guardan en dos tamaños (ver FotoUploader.astro):
 * `foo.webp` de 1000px y `foo-sm.webp` de 500px. En la grilla entran doce juntas, así
 * que conviene que el celular baje la chica.
 */
export function srcSet(foto: string): string | undefined {
  if (!foto.endsWith('.webp')) return undefined;
  const chica = foto.replace(/\.webp$/, '-sm.webp');
  return `${chica} 500w, ${foto} 1000w`;
}
