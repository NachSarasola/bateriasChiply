# chiply-store

Sitio de Baterías Chiply: una sola página pública con catálogo, buscador y carrito que
termina en WhatsApp, más un panel privado para que el cliente cargue sus productos.

Está derivado de `Clientes/Forja CHIMPA/forja-store`. Comparten la máquina (Astro SSR +
D1 + R2, carrito en localStorage, panel con cookie firmada); cambian el modelo de datos,
las rutas públicas y todo el diseño.

## Stack

| | |
|---|---|
| Framework | Astro 5, `output: 'server'` |
| Estilos | Tailwind 3, tokens en `tailwind.config.mjs` |
| Hosting | Cloudflare Pages |
| Base | D1 (`baterias`, `textos`) |
| Fotos | R2, servidas por `/fotos/*` |
| JS en el cliente | ~19 KB sin comprimir, sin contar el mapa (Leaflet, 150 KB, perezoso) |

## Comandos

```bash
npm install
npm run db:local      # crea el schema en la D1 local (Miniflare)
npm run catalogo:local   # carga las 41 baterías reales (catalogo.sql)
npm run dev           # http://localhost:4321
npm run check         # astro check (type-check de .astro y .ts)
npm run build
```

Para entrar al panel en local hace falta un `.dev.vars` (copiar de `.dev.vars.example`).

## Cómo está armado

### Una sola página

`src/pages/index.astro` es todo el sitio público: hace **una** consulta a D1
(`getAllBaterias`) y de ahí salen la franja de beneficios, el catálogo entero y el
mapa de sucursales. Las secciones son anclas (`#catalogo`, `#donde`), no rutas.

Consecuencia importante: **el filtrado es del lado del cliente**. Cada tarjeta lleva un
`data-buscar` precalculado en el servidor (`textoBuscable()` en `src/lib/catalog.ts`) y
el script de `Catalogo.astro` esconde y muestra tarjetas. No hay fetch, no hay router.

El buscador normaliza la consulta igual que el índice: saca acentos y pega
`12 x 65` → `12x65`, porque si no cada dígito suelto matcheaba media tabla. Todas las
palabras tienen que estar presentes (AND, no OR).

Del tope de 12 tarjetas visibles: se renderizan todas igual (el filtro necesita
encontrarlas) y las de más van con `hidden` hasta que se toca "Ver todas". Con filtro o
búsqueda activa no hay recorte.

### Datos

Una tabla, `baterias`. Casi todas las specs son `NULL`-ables a propósito: no todos los
proveedores publican CCA o reserva, y es preferible una ficha a medio llenar que no
poder cargar el producto. `src/lib/catalog.ts` traduce entre `snake_case` de SQLite y
`camelCase` de TypeScript.

`src/lib/baterias-admin.ts` normaliza lo que manda el formulario. Sus claves son
exactamente los nombres de columna, así que los endpoints arman el INSERT y el UPDATE
por reflexión sobre el objeto — son 22 campos y escribirlos a mano en dos lugares era
garantía de que algún día quedaran desalineados. Los nombres salen de nuestro código,
nunca del request; los valores siguen yendo por `bind()`.

### Carrito

`src/lib/cart.ts` (estado en localStorage + `CustomEvent`) y `CartDrawer.astro` (UI de
dos pasos). El alta al carrito la maneja **solo** el listener de `CartDrawer` sobre
`document`: si `Catalogo.astro` también escuchara, cada clic sumaría dos unidades.

El mensaje de WhatsApp lo arma `buildOrderMessage()` y se corta a 1800 caracteres —
arriba de eso el link `wa.me` no abre la app en iOS.

El formulario pide **vehículo**, no localidad. En baterías es el dato que permite
confirmar que la medida elegida es la correcta antes de facturar; equivocarse de borne
o de altura de caja es la devolución más común del rubro.

### Config

Los textos viven en la tabla `textos` (clave/valor) y `src/data/config.ts` les pone
valores de fábrica. El middleware los resuelve una vez por request y los deja en
`Astro.locals.config`.

**Patrón a respetar:** los `<script>` de Astro corren en el navegador y no pueden
importar `data/config` (depende de D1). El número de WhatsApp y cualquier otro valor de
config viajan por `data-*` — ver `CartDrawer.astro`.

### Diseño

Réplica exacta del mockup real de Chiply (Adobe XD, compartido por el cliente) — no
una inspiración. Los valores salen de capturar el prototipo con Chrome headless a
resolución nativa 2-3x y leer los píxeles con Python/PIL, no a ojo. Antes de esto el
sitio tomaba `supermaxx.com.ar` como referencia (fondo casi negro, acento rojo); eso
quedó completamente reemplazado. `rojo`/`rojoOscuro` siguen en `tailwind.config.mjs`
solo porque el panel `/admin` (fuera de este reskin) todavía los usa.

- **El ancho de página no sale del mockup.** El mockup era un diseño fijo a 1920 y
  no contesta qué pasa en cada pantalla. `shell` es **86rem** (1376px) con el root
  en **16px**; estuvo en 72rem con el root en 15px, o sea 1080px reales, y a 1920
  dejaba 420px de gris muerto por lado — el 44% de la pantalla vacía. El padding
  lateral escala (`px-4 sm:px-6 lg:px-10 xl:px-14`) en vez de quedarse en 16px a
  cualquier ancho. La grilla va de 1 a 2 (`sm`), 3 (`lg`) y **4 columnas (`2xl`)**.
- **El root es 16px y manda sobre toda la escala.** Cada rem de Tailwind —
  tipografía, spacing, anchos — se mide contra él: con 15px el sistema entero
  entraba un 6,7% encogido y `text-base` renderizaba 15px donde el token dice 16.
- **Fondo de página `#BCBCBC`** (gris, no oscuro) — header y footer son las únicas
  bandas negras (`#030303`, no `#000` puro), con un brillo diagonal superpuesto
  (`linear-gradient`), y **flotan** sobre el gris en vez de ir a ancho completo: el
  header tiene esquinas muy redondeadas (`rounded-banda`, 28px) y margen gris visible
  alrededor; el footer va a ancho completo, sin ese redondeo.
- Tarjetas **blancas** con radio 10px, foto inset con su propio margen (no a sangre).
- Specs en **itálica**, con las 5 filas y las etiquetas exactas del mockup ("Capacidad
  C20 (Ah)", "Choque de arranque CCA-18° (A)"...) — texto `#000` puro. La fila
  resaltada usa **el mismo gris que el fondo de página** (`bg-pagina`, `#BCBCBC`), no
  un gris propio de la tarjeta: con un 4% de negro la cebra no llegaba a dibujar la
  tabla. Debajo, una fila aparte de 3 columnas para Largo/Ancho/Alto.
- Badge de garantía: círculo `#444444` (no negro puro) con el número en amarillo.
- Botón "Agregar al carrito": ancho completo, píldora (`rounded-full`), negro con
  texto amarillo — **sin precio en la ficha**, el mockup no lo muestra nunca. Por
  dentro se mantiene la rama entre baterías con precio cargado (agrega de verdad al
  carrito) y sin precio (abre WhatsApp) — dos elementos (`<button>`/`<a>`) con las
  mismas clases, visualmente indistinguibles.
- Acento `#FFF112` (amarillo Chiply — más "limón" que un amarillo estándar).
  **Regla de contraste, no negociable:** el amarillo nunca es texto directo sobre
  blanco/gris claro. Sobre fondo oscuro (header, footer, badges, botones negros) va
  amarillo de texto o ícono; sobre superficie clara el acento se resuelve con un
  elemento **sólido negro**, nunca con amarillo suelto. Las píldoras de filtro son la
  excepción del mockup: siempre rellenas, nunca outline — inactivas en negro con
  texto amarillo, la activa invertida (amarillo con texto oscuro).
- **El logo es una imagen real** (`public/logo-chiply.png`), no texto con itálica
  sintética: el logotipo de Chiply tiene letras modificadas a mano (la H con la barra
  en diagonal, el punto de la i como rombo) — no es ninguna fuente de Google Fonts.
  El PNG salió de recortar el mockup a resolución nativa 3x y separar el fondo negro
  del logotipo (amarillo/blanco) por color. `LogoChiply.astro` queda como el único
  lugar a tocar si algún día llega un archivo de marca definitivo.
- Zalando Sans Expanded 700/800 en títulos de sección, Manrope en el texto. Se sirven
  desde `public/fuentes/` (96 KB, solo latin y latin-ext) — sin CDN de Google en la
  ruta crítica.
- **Las flechas del carrusel solo aparecen con el mouse encima** (`group-hover/foto`)
  y nunca en táctil, donde la foto se pasa con el dedo y están los puntos: fijas eran
  dos círculos blancos sobre cada una de las 41 fotos, el ruido más fuerte de la grilla.
- **Un solo lenguaje de píldora en todo el sitio**, catálogo y sucursales: siempre
  rellenas, la activa amarilla con texto oscuro y las inactivas negras con texto
  amarillo. Las de `Donde.astro` eran outline blancas.
- **Los tiles del mapa van en grayscale** (`.leaflet-tile-pane` en `global.css`).
  OpenStreetMap a todo color terminaba siendo lo más colorido de la página y le
  competía a los pines, que son lo único que hay que mirar ahí.
- **El header lleva el contacto, no el carrito.** Instagram y el WhatsApp de la casa
  central (con el número a la vista desde `lg`), y los dos links de navegación adentro
  de una cápsula donde la sección que se está mirando se pinta amarilla — un
  IntersectionObserver sobre `#catalogo` y `#donde` mueve esa pastilla. El carrito
  salió de ahí: estaba tres veces en pantalla, y quedan el botón flotante en
  escritorio y la barra de pedido en celular, que además muestra el total.
- **La franja de beneficios no se mueve.** Fue una cinta y el formato contradecía al
  contenido: una vuelta entera eran 5700px, o sea dos minutos de espera para leer las
  cinco frases que cierran la venta. Ahora están las cinco a la vez — en fila desde
  `lg`, pasándose con el dedo abajo de eso — y sobre el **mismo negro del header**, así
  header y beneficios se leen como un solo bloque y no como dos bandas oscuras de
  negros distintos apiladas.
- **El mapa está encerrado en la región de las sucursales** (`minZoom` tomado después
  de `fitBounds` + `maxBounds` con viscosidad 1, dos niveles de alejamiento). Es un
  mapa de nueve locales de Misiones, no un atlas. Y como los nombres vienen dibujados
  adentro del PNG del tile, alejándose aparecía "Falkland Islands" sin ninguna forma de
  cambiarlo desde el código; lo que sí se decide es hasta dónde llega el mapa.
- **Nada se levanta ni cambia de posición al hover** — eso es la marca de casa de las
  plantillas. Lo que se mueve es la luz y el color: los botones negros se llenan de
  amarillo desde la izquierda (es el **fondo del botón**, no un pseudo-elemento: el
  pseudo se recortaba contra el `overflow-hidden` y dejaba asomar el negro en el píxel
  antialiaseado de las esquinas), la pastilla del nav se desliza, y la grilla entra en
  cascada de a 55ms por tarjeta, cortada en la octava. Con `prefers-reduced-motion` no
  se mueve nada.
- **Sin Hero.** La página no tiene una sección de bienvenida con foto grande: arranca
  en header → beneficios → catálogo, igual que el mockup (que es solo la vista de
  catálogo). `Donde.astro` sí se mantiene — es contenido real que el mockup no
  cubre, restyleado para el mismo sistema de colores.

Ojo con los nombres de token: en Tailwind `text-*` sirve para color **y** para tamaño,
así que ningún `fontSize` puede repetir un nombre de la paleta (por eso `text-ficha` y
no `text-tarjeta`).

### Catálogo real

`catalogo.sql` y `public/catalogo/` salen de `scripts/importar-catalogo.py`, que lee
`../Galeria de baterias/Catalogo-Baterias-Chiply - Baterias.csv` y las 82 fotos
originales (JPG de 14 MB, verticales, sobre telgopor). El script:

- normaliza el CSV: `25°C:50AH` → 50, `2 AÑOS` → 24 meses, medidas de cm con coma a mm;
- recorta cada foto alrededor de la batería y la lleva a 5:4, que es el aspect de la
  tarjeta; guarda `<slug>-N.webp` (1000px) y `-sm.webp` (500px), la misma convención
  que usa el uploader del panel. 1,2 GB quedan en 8 MB;
- genera `INSERT OR IGNORE`: correrlo dos veces no pisa lo que Chiply haya editado.

El recorte no es un bbox ingenuo de píxeles oscuros: eso cortaba la batería en más de
la mitad de las fotos (una sombra sobre el telgopor se pegaba al cuerpo oscuro y corría
el centro del recorte, o una etiqueta clara partía la batería en dos componentes y el
de peor puntaje —a veces la base— quedaba afuera). El detector cierra esos huecos
internos (`binary_closing`), separa objeto de sombra por erosión + componentes conexos,
y desempata por cercanía al centro de la foto, no solo por tamaño. Necesita
`numpy`/`scipy` además de Pillow — ver `scripts/requirements.txt`
(`pip install -r scripts/requirements.txt`).

Las fotos van estáticas en `public/catalogo/` y no en R2 porque todavía no existe el
bucket en la cuenta de Chiply, y porque servidas desde el edge de Pages son más
rápidas que pasando por el proxy `/fotos/*`. Las que suban después desde el panel sí
van a R2; conviven sin problema porque la ficha guarda URLs.

**El CSV no trae precios.** Todas entran con `precio = 0`, que el sitio muestra como
"Consultar precio" con el botón mandando a WhatsApp en vez de al carrito. Apenas
Chiply cargue un precio desde el panel, esa batería pasa a tener botón "Agregar".
Tampoco trae aplicación (qué vehículos la llevan), borne ni descripción: el buscador
por modelo de auto no encuentra nada hasta que las completen.

## Pendientes antes de publicar

1. **Precios y aplicaciones.** Ver arriba: sin precio el carrito no aplica; sin
   aplicación el buscador por vehículo no sirve.
2. **Confirmar los datos de contacto.** Ya no son placeholders: `src/data/config.ts`
   trae el WhatsApp, la dirección y los horarios de la casa central, y
   `src/data/locales.ts` los nueve locales con sus teléfonos y coordenadas. Falta que
   Chiply los confirme uno por uno — un número mal cargado no da error en ningún lado,
   simplemente los pedidos no llegan.
3. **Logo.** `LogoChiply.astro` usa `public/logo-chiply.png`, recortado del mockup del
   cliente a resolución nativa 3x. Si llega el archivo de marca definitivo (vector o
   alta resolución), se reemplaza el PNG y no hay que tocar el componente ni sus usos.
4. **Cloudflare.** La cuenta y el dominio van a nombre de Chiply (la Opción A del
   presupuesto no incluye hosting). Falta crear D1 y R2 ahí y completar el
   `database_id` de `wrangler.toml`.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=baterias-chiply
```

Los dos secretos van por dashboard o CLI, nunca al repo:

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=baterias-chiply
npx wrangler pages secret put ADMIN_SECRET --project-name=baterias-chiply
```

Y el schema contra la base remota, una sola vez:

```bash
npx wrangler d1 execute baterias-chiply --remote --file=./seed.sql
```

Y el catálogo, también una sola vez: `npm run catalogo:remote`.

## Deuda conocida

- **SEO.** Sin una URL por producto se pierde la búsqueda long-tail ("batería 12x65
  Ushuaia"). El JSON-LD de `index.astro` habilita el rich result del listado pero no lo
  reemplaza. Si les importa, la salida es agregar `/b/[slug]`; no está en el presupuesto.
- **Escala del catálogo.** Con más de ~80 baterías el HTML de la página empieza a pesar,
  porque van todas en el mismo documento. Ahí hay que reabrir la decisión de "una sola
  página".
- El adaptador de Cloudflare avisa por un binding KV `SESSION` que no usamos (la sesión
  del panel es una cookie firmada, no la API de sessions de Astro). Es informativo;
  `forja-store` corre en producción con el mismo aviso.
