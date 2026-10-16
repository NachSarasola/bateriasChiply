/**
 * Textos y datos del sitio.
 *
 * `buildConfig()` arma esto a partir del diccionario que devuelve `cargarTextos()`
 * (tabla `textos` en D1). Lo que está hardcodeado acá abajo son los valores de
 * fábrica: si el panel tiene una fila con la misma clave, gana el panel.
 *
 * Se resuelve una sola vez por request, en `src/middleware.ts`, y queda en
 * `Astro.locals.config` — ningún componente vuelve a tocar D1 para leer esto.
 *
 * PENDIENTE: los valores de fábrica son placeholders hasta que Chiply pase los
 * datos reales (WhatsApp, dirección, horarios, redes). Buscar PLACEHOLDER.
 */

const txt = (T: Record<string, string>, clave: string, porDefecto: string): string =>
  T[clave]?.trim() || porDefecto;

/** Varios valores en una sola celda, separados por |. */
const lista = (T: Record<string, string>, clave: string, porDefecto: string[]): string[] => {
  const crudo = T[clave];
  if (!crudo) return porDefecto;
  const partes = crudo
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes : porDefecto;
};

function normalizarWhatsapp(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '5493755631664';
  if (digits.startsWith('54') && !digits.startsWith('549') && digits.length === 12) {
    return `549${digits.slice(2)}`;
  }
  if (digits.length === 10) {
    return `549${digits}`;
  }
  return digits;
}

export function buildConfig(T: Record<string, string>) {
  const SITE = {
    nombre: txt(T, 'nombre', 'Baterías Chiply'),
    tagline: txt(T, 'tagline', 'Baterías para auto, camioneta, moto y camión'),
    descripcion: txt(
      T,
      'descripcion',
      'Catálogo con precios y stock. Elegís la medida, mandás el pedido por WhatsApp y coordinamos instalación.',
    ),
    // 54 (Argentina) + 9 (celular) + característica sin el 0 + número sin el 15.
    whatsapp: normalizarWhatsapp(txt(T, 'whatsapp', '5493755631664')),
    telefono: txt(T, 'telefono', '3755-631664'),
    email: txt(T, 'email', ''),
    instagramHandle: txt(T, 'instagram', '@bateriaschiply'),
    get instagram(): string {
      return `https://www.instagram.com/${this.instagramHandle.replace('@', '')}/`;
    },
    ciudad: txt(T, 'ciudad', 'Oberá, Misiones'),
    direccion: txt(T, 'direccion', 'Apóstoles Sur 712'),
    horarios: lista(T, 'horarios', [
      'Lunes a viernes de 8:00 a 12:30 y de 15:30 a 19:30 hs',
      'Sábados de 8:00 a 12:30 hs',
    ]).map((h) => {
      const limpio = h.trim();
      return limpio.endsWith('hs') ? limpio : (/\d$/.test(limpio) ? `${limpio} hs` : limpio);
    }),
    /** Query para el mapa de Google */
    get mapa(): string {
      return txt(T, 'mapa', `${this.direccion}, ${this.ciudad}`);
    },
  };

  /**
   * La cinta de beneficios debajo del header. Cada ítem es "titulo :: bajada" en una
   * sola celda del panel, y los ítems se separan con |.
   */
  const BENEFICIOS = lista(T, 'beneficios', [
    'Garantía escrita :: Todas las baterías salen con garantía del fabricante y comprobante.',
    'Instalación en el local :: Te la instalamos y chequeamos el alternador sin cargo.',
    'Envío en el día :: Dentro de la ciudad, si hacés el pedido antes de las 17.',
    'Libres de mantenimiento :: No hay que rellenarlas con agua ni revisar el nivel.',
    'Nos llevamos la vieja :: Te la recibimos como parte de pago.',
  ]).map((linea) => {
    const [titulo, bajada = ''] = linea.split('::').map((p) => p.trim());
    return { titulo: titulo ?? '', bajada };
  });

  const CATALOGO = {
    titulo: txt(T, 'titulo_catalogo', 'Catálogo'),
    bajada: txt(
      T,
      'bajada_catalogo',
      '',
    ),
  };

  const MEDIOS_DE_PAGO = lista(T, 'medios_de_pago', [
    'Efectivo',
    'Transferencia',
    'Débito',
    'Crédito en cuotas',
  ]);

  /** Las opciones del segundo paso del carrito. */
  const ENTREGAS = [
    { valor: 'local', label: 'Paso por el local' },
    { valor: 'instalacion', label: 'Quiero que me la instalen' },
    { valor: 'envio', label: 'Envío a domicilio' },
  ] as const;

  return { SITE, BENEFICIOS, CATALOGO, MEDIOS_DE_PAGO, ENTREGAS };
}

export type SiteConfig = ReturnType<typeof buildConfig>;
