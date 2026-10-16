import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Dominio definitivo pendiente: lo compra Chiply (la Opcion A del presupuesto no
  // incluye dominio ni hosting). Hasta entonces el sitio vive en el .pages.dev.
  site: 'https://baterias-chiply.pages.dev',
  integrations: [tailwind()],

  // El sitio publico es una sola pagina, asi que no hay nada que prefetchear entre
  // secciones. Queda activo solo para el panel, que si tiene navegacion real.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  server: { port: Number(process.env.PORT) || 4321 },

  // El catalogo vive en D1 y cambia desde /admin en cualquier momento: se renderiza
  // en cada visita, no hay build estatico que quede desactualizado.
  output: 'server',
  // El optimizador de imagenes por defecto de Astro usa sharp, que no corre en el
  // runtime de Workers. Las fotos ya llegan optimizadas (resize hecho en el navegador
  // antes de subir a R2, ver FotoUploader), asi que no hace falta ningun image service.
  adapter: cloudflare({ imageService: 'passthrough' }),
});
