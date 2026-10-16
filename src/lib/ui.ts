/**
 * Strings de clases de Tailwind que se repetían idénticos en varios componentes.
 * Tailwind los encuentra igual: `content` escanea todo `src/**\/*.ts`.
 */

/** Input/select de los formularios del sitio público (carrito). */
export const CAMPO =
  'mt-1 w-full rounded-card border border-black/15 bg-campo px-3.5 py-2.5 text-base sm:text-sm text-tintaFuerte placeholder:text-tinta/40 outline-none focus:border-amarilloOscuro focus:bg-white focus:ring-1 focus:ring-amarilloOscuro';

/**
 * Botón principal: pastilla negra con texto amarillo. Cada uso le suma su medida y
 * su disposición (ancho, alto, flex).
 *
 * El relleno amarillo que entra al pasar el mouse vive en `.btn-relleno`
 * (styles/global.css), pintado como fondo del propio botón. El botón
 * deshabilitado (sin stock) no se rellena.
 */
export const BTN_NEGRO =
  'btn-relleno rounded-full bg-carbon text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-amarillo disabled:cursor-not-allowed disabled:bg-plomo disabled:text-white';
