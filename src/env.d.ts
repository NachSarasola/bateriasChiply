/// <reference path="../.astro/types.d.ts" />
import type { Runtime } from '@astrojs/cloudflare';
import type { SiteConfig } from './data/config';
// Import puntual, no la referencia global del paquete: esa trae su propio Element /
// HTMLSelectElement (pensados para el runtime de Workers, sin DOM real) y pisan los
// tipos DOM de verdad que necesitan los <script> client-side (CartDrawer, Catalogo).
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

type ChiplyEnv = {
  DB: D1Database;
  FOTOS: R2Bucket;
  ADMIN_PASSWORD: string;
  ADMIN_SECRET: string;
};

declare global {
  namespace App {
    interface Locals extends Runtime<ChiplyEnv> {
      /** Resuelto una vez por request en src/middleware.ts; ningun componente vuelve a tocar D1 por esto. */
      config: SiteConfig;
      /** Sesion del panel, la pone src/middleware.ts si la cookie es valida. */
      admin?: boolean;
    }
  }
}

export {};
