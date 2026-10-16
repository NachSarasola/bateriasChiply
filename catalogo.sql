-- Catalogo real de Chiply, generado desde
-- "Galeria de baterias/Catalogo-Baterias-Chiply - Baterias.csv" (41 baterias).
--
--   npm run catalogo:local     (desarrollo)
--   npm run catalogo:remote    (produccion, una vez)
--
-- INSERT OR IGNORE a proposito: si una bateria ya existe (mismo codigo o slug) se
-- deja como esta, asi no se pisan los precios ni las fotos que Chiply haya cargado
-- desde el panel. Para regenerar de cero en local, antes: DELETE FROM baterias.
--
-- Lo que el CSV NO trae y queda para el panel: precio (va en 0 = "consultar"),
-- aplicacion (que vehiculos la llevan), borne y descripcion.

INSERT OR IGNORE INTO baterias
  (codigo, slug, nombre, marca, tipo, tipo_nombre, aplicacion, precio, precio_tachado,
   tension, capacidad_ah, reserva_rc, cca, garantia_meses, largo_mm, ancho_mm, alto_mm,
   borne, libre_mantenimiento, imagenes, descripcion, destacado, stock)
VALUES
  ('EFB50AFD', 'maxfor-efb50afd', 'Maxfor EFB50AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 50, 80, 540, 24, 200, 170, 190, '', 1, '["/catalogo/maxfor-efb50afd-1.webp","/catalogo/maxfor-efb50afd-2.webp"]', '', 0, 1),
  ('EFB60AFD', 'maxfor-efb60afd', 'Maxfor EFB60AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 100, 600, 24, 240, 175, 190, '', 1, '["/catalogo/maxfor-efb60afd-1.webp","/catalogo/maxfor-efb60afd-2.webp"]', '', 0, 1),
  ('EFB72AFD', 'maxfor-efb72afd', 'Maxfor EFB72AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 72, 130, 890, 24, 280, 175, 190, '', 1, '["/catalogo/maxfor-efb72afd-1.webp","/catalogo/maxfor-efb72afd-2.webp"]', '', 0, 1),
  ('TF50AFD', 'maxfor-tf50afd', 'Maxfor TF50AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 50, 65, 390, 24, 200, 170, 190, '', 1, '["/catalogo/maxfor-tf50afd-1.webp","/catalogo/maxfor-tf50afd-2.webp"]', '', 0, 1),
  ('TF60AFD', 'maxfor-tf60afd', 'Maxfor TF60AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 90, 485, 24, 240, 175, 190, '', 1, '["/catalogo/maxfor-tf60afd-1.webp","/catalogo/maxfor-tf60afd-2.webp"]', '', 0, 1),
  ('TF60BFD', 'maxfor-tf60bfd', 'Maxfor TF60BFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 90, 485, 24, 240, 175, 175, '', 1, '["/catalogo/maxfor-tf60bfd-1.webp","/catalogo/maxfor-tf60bfd-2.webp"]', '', 0, 1),
  ('TF75AFD', 'maxfor-tf75afd', 'Maxfor TF75AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 75, 120, 580, 24, 275, 175, 190, '', 1, '["/catalogo/maxfor-tf75afd-1.webp","/catalogo/maxfor-tf75afd-2.webp"]', '', 0, 1),
  ('LP50AFD', 'maxfor-lp50afd', 'Maxfor LP50AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 50, 65, 390, 18, 200, 170, 190, '', 1, '["/catalogo/maxfor-lp50afd-1.webp","/catalogo/maxfor-lp50afd-2.webp"]', '', 0, 1),
  ('LP60BFD', 'maxfor-lp60bfd', 'Maxfor LP60BFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 90, 430, 18, 240, 175, 170, '', 1, '["/catalogo/maxfor-lp60bfd-1.webp","/catalogo/maxfor-lp60bfd-2.webp"]', '', 0, 1),
  ('LP60AFD', 'maxfor-lp60afd', 'Maxfor LP60AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 90, 600, 18, 240, 175, 190, '', 1, '["/catalogo/maxfor-lp60afd-1.webp","/catalogo/maxfor-lp60afd-2.webp"]', '', 0, 1),
  ('LP70BFD', 'maxfor-lp70bfd', 'Maxfor LP70BFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 70, 110, 640, 18, 275, 175, 175, '', 1, '["/catalogo/maxfor-lp70bfd-1.webp","/catalogo/maxfor-lp70bfd-2.webp"]', '', 0, 1),
  ('LP75AFD', 'maxfor-lp75afd', 'Maxfor LP75AFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 75, 120, 580, 18, 275, 175, 190, '', 1, '["/catalogo/maxfor-lp75afd-1.webp","/catalogo/maxfor-lp75afd-2.webp"]', '', 0, 1),
  ('LP80NFD', 'maxfor-lp80nfd', 'Maxfor LP80NFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 80, 130, 500, 18, 255, 175, 220, '', 1, '["/catalogo/maxfor-lp80nfd-1.webp","/catalogo/maxfor-lp80nfd-2.webp"]', '', 0, 1),
  ('LP50NFD', 'maxfor-lp50nfd', 'Maxfor LP50NFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 50, 70, 300, 18, 235, 130, 230, '', 1, '["/catalogo/maxfor-lp50nfd-1.webp","/catalogo/maxfor-lp50nfd-2.webp"]', '', 0, 1),
  ('LP40NFD', 'maxfor-lp40nfd', 'Maxfor LP40NFD', 'Maxfor', 'automoviles', 'Automóviles', '', 0, NULL, 12, 40, 50, 350, 18, 195, 130, 230, '', 1, '["/catalogo/maxfor-lp40nfd-1.webp","/catalogo/maxfor-lp40nfd-2.webp"]', '', 0, 1),
  ('BF100AFD', 'maxfor-bf100afd', 'Maxfor BF100AFD', 'Maxfor', 'pick-up-y-suv', 'Pick-up y SUV', '', 0, NULL, 12, 100, 175, 720, 15, 350, 175, 190, '', 1, '["/catalogo/maxfor-bf100afd-1.webp","/catalogo/maxfor-bf100afd-2.webp"]', '', 0, 1),
  ('BF150TFD', 'maxfor-bf150tfd', 'Maxfor BF150TFD', 'Maxfor', 'camiones-y-buses', 'Camiones y Buses', '', 0, NULL, 12, 150, 285, 1100, 15, 475, 210, 210, '', 1, '["/catalogo/maxfor-bf150tfd-1.webp","/catalogo/maxfor-bf150tfd-2.webp"]', '', 0, 1),
  ('B220OFD', 'maxfor-b220ofd', 'Maxfor B220OFD', 'Maxfor', 'camiones-y-buses', 'Camiones y Buses', '', 0, NULL, 12, 220, 450, 1200, 12, 495, 270, 230, '', 1, '["/catalogo/maxfor-b220ofd-1.webp","/catalogo/maxfor-b220ofd-2.webp"]', '', 0, 1),
  ('12060', 'chiply-12060', 'Chiply 12060', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 40, 50, 370, 12, 200, 175, 175, '', 1, '["/catalogo/chiply-12060-1.webp","/catalogo/chiply-12060-2.webp"]', '', 0, 1),
  ('12065', 'chiply-12065', 'Chiply 12065', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 40, 50, 370, 12, 200, 175, 180, '', 1, '["/catalogo/chiply-12065-1.webp","/catalogo/chiply-12065-2.webp"]', '', 0, 1),
  ('12067', 'chiply-12067', 'Chiply 12067', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 50, 65, 400, 12, 200, 175, 175, '', 1, '["/catalogo/chiply-12067-1.webp","/catalogo/chiply-12067-2.webp"]', '', 0, 1),
  ('12073', 'chiply-12073', 'Chiply 12073', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 85, 540, 12, 240, 175, 175, '', 1, '["/catalogo/chiply-12073-1.webp","/catalogo/chiply-12073-2.webp"]', '', 1, 1),
  ('12080', 'chiply-12080', 'Chiply 12080', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 70, 110, 560, 12, 275, 175, 175, '', 1, '["/catalogo/chiply-12080-1.webp","/catalogo/chiply-12080-2.webp"]', '', 0, 1),
  ('12095', 'chiply-12095', 'Chiply 12095', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 75, 115, 680, 12, 285, 175, 175, '', 1, '["/catalogo/chiply-12095-1.webp","/catalogo/chiply-12095-2.webp"]', '', 0, 1),
  ('12100', 'chiply-12100', 'Chiply 12100', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 90, 150, 780, 12, 300, 175, 225, '', 1, '["/catalogo/chiply-12100-1.webp","/catalogo/chiply-12100-2.webp"]', '', 0, 1),
  ('12110B', 'chiply-12110b', 'Chiply 12110B', 'Chiply', 'pick-up-y-suv', 'Pick-up y SUV', '', 0, NULL, 12, 90, 160, 780, 12, 350, 175, 190, '', 1, '["/catalogo/chiply-12110b-1.webp","/catalogo/chiply-12110b-2.webp"]', '', 0, 1),
  ('12115', 'chiply-12115', 'Chiply 12115', 'Chiply', 'maquinarias-y-tractores', 'Maquinarias y Tractores', '', 0, NULL, 12, 90, 155, 780, 12, 325, 170, 245, '', 1, '["/catalogo/chiply-12115-1.webp","/catalogo/chiply-12115-2.webp"]', '', 0, 1),
  ('12125', 'chiply-12125', 'Chiply 12125', 'Chiply', 'maquinarias-y-tractores', 'Maquinarias y Tractores', '', 0, NULL, 12, 100, 170, 700, 12, 330, 170, 250, '', 1, '["/catalogo/chiply-12125-1.webp","/catalogo/chiply-12125-2.webp"]', '', 0, 1),
  ('12180', 'chiply-12180', 'Chiply 12180', 'Chiply', 'camiones-y-buses', 'Camiones y Buses', '', 0, NULL, 12, 150, 280, 900, 12, 480, 210, 230, '', 1, '["/catalogo/chiply-12180-1.webp","/catalogo/chiply-12180-2.webp"]', '', 0, 1),
  ('12190', 'chiply-12190', 'Chiply 12190', 'Chiply', 'camiones-y-buses', 'Camiones y Buses', '', 0, NULL, 12, 180, 360, 1150, 12, 480, 210, 230, '', 1, '["/catalogo/chiply-12190-1.webp","/catalogo/chiply-12190-2.webp"]', '', 0, 1),
  ('65B', 'chiply-65b', 'Chiply 65B', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 40, 35, 440, 12, 235, 175, 175, '', 1, '["/catalogo/chiply-65b-1.webp","/catalogo/chiply-65b-2.webp"]', '', 0, 1),
  ('75B', 'chiply-75b', 'Chiply 75B', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 46, 58, 550, 12, 265, 175, 175, '', 1, '["/catalogo/chiply-75b-1.webp","/catalogo/chiply-75b-2.webp"]', '', 0, 1),
  ('75PLUS', 'chiply-75plus', 'Chiply 75PLUS', 'Chiply', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 78, 600, 13, 260, 175, 175, '', 1, '["/catalogo/chiply-75plus-1.webp","/catalogo/chiply-75plus-2.webp"]', '', 0, 1),
  ('115PLUS', 'chiply-115plus', 'Chiply 115PLUS', 'Chiply', 'maquinarias-y-tractores', 'Maquinarias y Tractores', '', 0, NULL, 12, 90, 170, 840, 12, 320, 160, 250, '', 1, '["/catalogo/chiply-115plus-1.webp","/catalogo/chiply-115plus-2.webp"]', '', 0, 1),
  ('180PLUS', 'chiply-180plus', 'Chiply 180PLUS', 'Chiply', 'camiones-y-buses', 'Camiones y Buses', '', 0, NULL, 12, 160, 260, 1350, 12, 500, 215, 230, '', 1, '["/catalogo/chiply-180plus-1.webp","/catalogo/chiply-180plus-2.webp"]', '', 0, 1),
  ('UB620', 'willard-ub620', 'Willard UB620', 'Willard', 'automoviles', 'Automóviles', '', 0, NULL, 12, 51, 85, 490, 18, 240, 175, 175, '', 1, '["/catalogo/willard-ub620-1.webp","/catalogo/willard-ub620-2.webp"]', '', 0, 1),
  ('UB740', 'willard-ub740', 'Willard UB740', 'Willard', 'automoviles', 'Automóviles', '', 0, NULL, 12, 62, 100, 500, 18, 275, 175, 175, '', 1, '["/catalogo/willard-ub740-1.webp","/catalogo/willard-ub740-2.webp"]', '', 0, 1),
  ('UB840', 'willard-ub840', 'Willard UB840', 'Willard', 'automoviles', 'Automóviles', '', 0, NULL, 12, 75, 140, 709, 18, 275, 175, 185, '', 1, '["/catalogo/willard-ub840-1.webp","/catalogo/willard-ub840-2.webp"]', '', 0, 1),
  ('ADR60DD', 'acdelco-adr60dd', 'ACDelco ADR60DD', 'ACDelco', 'automoviles', 'Automóviles', '', 0, NULL, 12, 60, 90, 440, 18, 240, 175, 175, '', 1, '["/catalogo/acdelco-adr60dd-1.webp","/catalogo/acdelco-adr60dd-2.webp"]', '', 0, 1),
  ('ADR90LD', 'acdelco-adr90ld', 'ACDelco ADR90LD', 'ACDelco', 'pick-up-y-suv', 'Pick-up y SUV', '', 0, NULL, 12, 90, 170, 710, 18, 300, 175, 235, '', 1, '["/catalogo/acdelco-adr90ld-1.webp","/catalogo/acdelco-adr90ld-2.webp"]', '', 0, 1),
  ('ADR95MD', 'acdelco-adr95md', 'ACDelco ADR95MD', 'ACDelco', 'pick-up-y-suv', 'Pick-up y SUV', '', 0, NULL, 12, 95, 180, 800, 18, 350, 175, 190, '', 1, '["/catalogo/acdelco-adr95md-1.webp","/catalogo/acdelco-adr95md-2.webp"]', '', 0, 1);
