/**
 * Carrito del lado del cliente. Sin framework: el estado vive en localStorage y
 * cada cambio dispara un CustomEvent en window para que el badge del nav, la barra
 * de celular y el drawer se vuelvan a dibujar. Solo debe importarse desde bloques
 * <script>.
 */

export interface CartItem {
  /** Código comercial de la batería: "12X65". Identifica la línea. */
  codigo: string;
  slug: string;
  nombre: string;
  precio: number;
  imagen: string;
  /** 'derecha' | 'izquierda' | ''. Viaja hasta el mensaje de WhatsApp: pedir el borne al revés es devolución segura. */
  borne: string;
  qty: number;
}

const KEY = 'chiply.cart.v1';
export const CART_EVENT = 'cart:change';

/** Una línea del carrito es única por código: la misma batería no tiene variantes. */
export function lineId(item: Pick<CartItem, 'codigo'>): string {
  return item.codigo;
}

export function readCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.codigo === 'string' && typeof i?.precio === 'number' && typeof i?.qty === 'number',
    );
  } catch (error) {
    // localStorage corrupto o bloqueado (modo privado): se arranca vacío en vez de romper la página.
    console.warn('No se pudo leer el carrito:', error);
    return [];
  }
}

function persist(items: CartItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('No se pudo guardar el carrito:', error);
  }
  window.dispatchEvent(new CustomEvent<CartItem[]>(CART_EVENT, { detail: items }));
}

export function addItem(item: Omit<CartItem, 'qty'>, qty = 1): CartItem[] {
  const items = readCart();
  const existing = items.find((i) => lineId(i) === lineId(item));
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ ...item, qty });
  }
  persist(items);
  return items;
}

export function setQty(id: string, qty: number): CartItem[] {
  const items = readCart()
    .map((i) => (lineId(i) === id ? { ...i, qty } : i))
    .filter((i) => i.qty > 0);
  persist(items);
  return items;
}

export function removeItem(id: string): CartItem[] {
  const items = readCart().filter((i) => lineId(i) !== id);
  persist(items);
  return items;
}

export function clearCart(): void {
  persist([]);
}

export function cartCount(items: CartItem[] = readCart()): number {
  return items.reduce((acc, i) => acc + i.qty, 0);
}

export function cartTotal(items: CartItem[] = readCart()): number {
  return items.reduce((acc, i) => acc + i.precio * i.qty, 0);
}
