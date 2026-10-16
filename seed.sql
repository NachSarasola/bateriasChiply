-- Schema de la base D1. Se aplica con:
--   npx wrangler d1 execute baterias-chiply --local --file=./seed.sql   (desarrollo)
--   npx wrangler d1 execute baterias-chiply --remote --file=./seed.sql  (produccion)
--
-- Sin datos de ejemplo: para tener con que maquetar esta demo.sql, que se corre
-- aparte y solo en local.

-- Una fila por bateria. Las medidas y specs son opcionales (NULL) porque no todos
-- los proveedores publican el CCA o la reserva, y una ficha a medio llenar es mejor
-- que no poder cargar el producto.
CREATE TABLE IF NOT EXISTS baterias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Codigo comercial: "12X65", "PRO90". Es lo que pide el cliente por telefono.
  codigo TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  marca TEXT NOT NULL DEFAULT '',
  -- Segmento, para los filtros: auto | camioneta | moto | camion | solar.
  tipo TEXT NOT NULL,
  tipo_nombre TEXT NOT NULL,
  -- "T/Corolla - Ecosport - Gol Trend". Es el campo por el que mas se busca.
  aplicacion TEXT NOT NULL DEFAULT '',
  precio INTEGER NOT NULL,
  precio_tachado INTEGER,
  tension INTEGER NOT NULL DEFAULT 12,
  capacidad_ah INTEGER,
  reserva_rc INTEGER,
  cca INTEGER,
  garantia_meses INTEGER NOT NULL DEFAULT 12,
  largo_mm INTEGER,
  ancho_mm INTEGER,
  alto_mm INTEGER,
  -- Polaridad: 'derecha' | 'izquierda' | ''. En baterias equivocarse de borne es
  -- devolucion segura, por eso va en la ficha y en el mensaje de WhatsApp.
  borne TEXT NOT NULL DEFAULT '',
  libre_mantenimiento INTEGER NOT NULL DEFAULT 1,
  imagenes TEXT NOT NULL DEFAULT '[]',
  descripcion TEXT NOT NULL DEFAULT '',
  destacado INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS textos (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_baterias_tipo ON baterias(tipo);
CREATE INDEX IF NOT EXISTS idx_baterias_stock ON baterias(stock);
