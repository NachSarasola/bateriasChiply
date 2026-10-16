/** @type {import('tailwindcss').Config} */

// Réplica exacta del mockup real de Chiply (Adobe XD). Los valores de esta paleta
// NO son a ojo: salen de capturar el prototipo con Chrome headless a resolución
// nativa 2-3x y leer los píxeles con Python/PIL -- ver el detalle en el plan
// aprobado de esta sesión. Antes de esto el sitio usaba una paleta inspirada en
// supermaxx.com.ar (rojo, fondo casi negro); ahora es la marca real de Chiply
// (amarillo sobre negro, página gris), la misma que ya llevan impresas las
// baterías físicas.
//
//   fondo de pagina      #BCBCBC     gris, no oscuro
//   banda negra          #030303     header y footer, ancho completo (con brillo diagonal)
//   tarjeta              #FFFFFF     radio 10px
//   fila de spec resaltada #BCBCBC   el MISMO gris que el fondo de pagina, no un gris propio
//   texto de specs        #000000    negro puro
//   badge de garantia      #444444   gris carbon, no negro puro
//   acento de marca        #FFF112   amarillo: SOLO sobre fondo oscuro (texto, iconos,
//                                    relleno de boton/pildora). Nunca directo sobre
//                                    blanco/gris claro -- ahi el acento se resuelve con
//                                    negro solido (boton, badge), nunca con texto amarillo.
//   titulos               Zalando Sans Expanded 700/800
//   texto                 Manrope 400/500/700, 16px con interlinea 24px
//   logotipo               imagen real (public/logo-chiply.png) -- es un logo custom
//                          con letras modificadas, no una fuente de sistema

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // El gris de pagina real del mockup. Reemplaza al fondo casi-negro que tenia
        // el sitio antes: header y footer siguen oscuros, pero el cuerpo de la pagina
        // es este gris, no negro.
        pagina: '#BCBCBC',
        // Banda negra de header/footer (valor medido, no #000 puro) y sus variantes.
        carbon: '#030303',
        pizarra: '#262626',
        // El circulo del badge de garantia usa este gris carbon especifico, distinto
        // del negro de las bandas.
        badge: '#444444',
        // Tarjeta blanca y sus grises internos.
        tarjeta: '#FFFFFF',
        fila: '#F0F0F0',
        // Fondo de las fotos de bateria (ficha y carrito) y de los campos de formulario.
        lienzo: '#F5F5F7',
        campo: '#FAFAFA',
        tinta: '#333333',
        tintaFuerte: '#262626',
        // Acento de marca real de Chiply: amarillo limon sobre negro. Es el color que
        // va en el sitio publico -- texto/iconos sobre fondo oscuro, o de fondo en
        // botones y pildoras. Nunca como texto directo sobre blanco (falla contraste).
        amarillo: '#FFF112',
        amarilloOscuro: '#D9CD00',
        // Rojo de "quitar"/error: el hover de Quitar en el carrito y el panel /admin.
        rojo: '#E23E41',
        // Verde de WhatsApp, solo en los botones que abren WhatsApp en "Dónde".
        wa: '#25D366',
        waOscuro: '#128C7E',
        // Grises sobre fondo oscuro.
        plata: '#D9D9D9',
        plomo: '#8A8A8A',
        // Paleta propia del panel /admin (oscuro, aparte del sitio publico).
        admin: {
          fondo: '#0d0d0d',
          panel: '#111111',
          campo: '#1a1a1a',
        },
      },
      fontFamily: {
        // Manrope para todo el texto corrido. Se sirve desde el propio sitio
        // (src/styles/fuentes.css): sin CDN de Google en la ruta critica.
        sans: ['Manrope', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // La expandida para titulos de seccion (no para el logo, que ahora es imagen).
        display: ['Zalando Sans Expanded', 'Manrope', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      fontSize: {
        seccion: ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        ficha: ['1.25rem', { lineHeight: '1.45rem', fontWeight: '800' }],
      },
      borderRadius: {
        // 10px en tarjetas, 6px en las filas de specs. Botones y pildoras van aparte
        // con rounded-full (capsula completa, como el mockup).
        DEFAULT: '10px',
        card: '10px',
        fila: '6px',
      },
      borderWidth: {
        // Los botones outline de la referencia usan 1.6px, no 1 ni 2.
        boton: '1.6px',
      },
      maxWidth: {
        shell: '72rem',
      },
      gridTemplateColumns: {
        // La grilla del catalogo del mockup: 3 columnas fijas, incluso a 1920px.
        catalogo: 'repeat(3, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
