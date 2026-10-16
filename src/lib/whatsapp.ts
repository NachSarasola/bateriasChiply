import { formatPrice } from './money';
import type { CartItem } from './cart';

export interface CheckoutForm {
  nombre: string;
  /** El dato que más pregunta el vendedor: sin el vehículo no puede confirmar la medida. */
  vehiculo: string;
  entrega: string;
  nota?: string;
}

/**
 * Los links wa.me con querystrings muy largos fallan al abrir la app en iOS.
 * Por encima de este límite se recorta la lista y se aclara cuántos ítems faltan.
 */
const MAX_CHARS = 1800;

// Sin import de data/config a proposito: este archivo se usa tanto server-side (paginas
// .astro) como en el <script> client-side de CartDrawer, y data/config depende de D1
// (server-only). El numero entra siempre por parametro.
export function whatsappLink(mensaje: string, numero: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** "5493755631664" -> "3755 631664", solo para que se lea como telefono. */
export function formatearWhatsapp(numero: string): string {
  const sinPrefijo = numero.replace(/^549/, '');
  return sinPrefijo.length > 4 ? `${sinPrefijo.slice(0, 4)} ${sinPrefijo.slice(4)}` : sinPrefijo;
}

function lineaDe(item: CartItem): string {
  const borne = item.borne ? ` (borne ${item.borne})` : '';
  const precioStr = item.precio > 0 ? formatPrice(item.precio * item.qty) : '(A consultar precio)';
  // El nombre ya lleva el código del modelo ("Chiply 12073"): repetirlo era ruido.
  return `${item.qty}x ${item.nombre}${borne} - ${precioStr}`;
}

export function buildOrderMessage(items: CartItem[], form: CheckoutForm): string {
  const total = items.reduce((acc, i) => acc + i.precio * i.qty, 0);
  const unpriced = items.some((i) => i.precio <= 0);
  const totalStr = total > 0
    ? (unpriced ? `${formatPrice(total)} (más ítems a cotizar)` : formatPrice(total))
    : 'A confirmar precio';

  const armar = (lineas: string[], omitidos: number): string => {
    const bloques = [
      'Hola, quiero pedir esto:',
      '',
      ...lineas,
      omitidos > 0 ? `... y ${omitidos} ${omitidos === 1 ? 'batería más' : 'baterías más'}` : '',
      '',
      `Total: ${totalStr}`,
      '',
      `Nombre: ${form.nombre}`,
      `Vehículo: ${form.vehiculo}`,
      `Entrega: ${form.entrega}`,
      form.nota ? `Nota: ${form.nota}` : '',
    ];
    // Las líneas opcionales quedan como '' y se colapsan acá para no dejar huecos dobles.
    return bloques
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const lineas = items.map(lineaDe);
  let mensaje = armar(lineas, 0);
  let visibles = lineas.length;
  while (mensaje.length > MAX_CHARS && visibles > 1) {
    visibles -= 1;
    mensaje = armar(lineas.slice(0, visibles), lineas.length - visibles);
  }
  return mensaje;
}

/** CTA "Consultar" de una batería suelta, sin pasar por el carrito. */
export function buildInquiryMessage(codigo: string, nombre: string): string {
  return `Hola, quiero consultar por la ${codigo} (${nombre}).`;
}

/** El link del hero y del footer, sin producto asociado. */
export function buildGeneralMessage(): string {
  return 'Hola, necesito una batería. Mi vehículo es:';
}
