/**
 * Formato de precios en pesos. Se evita Intl.NumberFormat con style: 'currency'
 * porque inserta un espacio duro entre el signo y el número, y ese carácter
 * ensucia el mensaje de WhatsApp al pasar por encodeURIComponent.
 */
export function formatPrice(value: number): string {
  return `$${Math.round(value).toLocaleString('es-AR')}`;
}
