/**
 * Sesion del panel: una cookie firmada con HMAC, sin base de datos ni librerias.
 * `crypto.subtle` (Web Crypto) esta disponible tanto en el runtime de Workers como
 * en el navegador, asi que no hace falta ninguna dependencia de firma de JWT.
 */
const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

async function firmar(secret: string, datos: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(datos));
  return btoa(String.fromCharCode(...new Uint8Array(firma)));
}

export async function generarSesion(secret: string): Promise<string> {
  const payload = btoa(JSON.stringify({ exp: Date.now() + SIETE_DIAS_MS }));
  return `${payload}.${await firmar(secret, payload)}`;
}

export async function verificarSesion(
  cookie: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!cookie) return false;
  const [payload, firma] = cookie.split('.');
  if (!payload || !firma) return false;
  if ((await firmar(secret, payload)) !== firma) return false;

  try {
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function leerCookie(header: string | null, nombre: string): string | undefined {
  const crudo = header
    ?.split(';')
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nombre}=`))
    ?.slice(nombre.length + 1);
  // Astro.cookies.set() codifica el valor (el "=" de relleno del base64 queda como
  // %3D); sin decodificar aca, la firma nunca coincide y la sesion parece invalida
  // aunque la contraseña haya sido correcta.
  return crudo ? decodeURIComponent(crudo) : undefined;
}
