"""
Importa el catalogo real de Chiply: lee el CSV, procesa las fotos y genera el SQL.

Salidas (todas dentro de chiply-store):
  public/catalogo/<slug>-1.webp, -1-sm.webp, -2.webp, -2-sm.webp
  catalogo.sql   (INSERT OR IGNORE: no pisa lo que ya este cargado en el panel)

Las fotos vienen en 4128x6192 (celular, vertical) sobre telgopor claro, con la
bateria en el tercio central. Se recorta alrededor de la bateria (bbox de pixeles
oscuros) y se lleva a 5:4, que es el aspect de la tarjeta.
"""
from __future__ import annotations

import csv
import re
import unicodedata
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

GALERIA = Path(__file__).resolve().parents[2] / "Galeria de baterias"
CSV = GALERIA / "Catalogo-Baterias-Chiply - Baterias.csv"
STORE = Path(__file__).resolve().parents[1]
OUT_IMG = STORE / "public" / "catalogo"
OUT_SQL = STORE / "catalogo.sql"

ASPECT = 5 / 4
ANCHO_GRANDE = 1000
ANCHO_CHICO = 500
CALIDAD = 82

MARCAS_BONITAS = {"MAXFOR": "Maxfor", "CHIPLY": "Chiply", "WILLARD": "Willard", "ACDELCO": "ACDelco"}


def sin_acentos(value: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", value) if unicodedata.category(c) != "Mn")


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", sin_acentos(value.strip().lower())).strip("-")


def numero(value: str) -> int | None:
    """'25°C:50AH' -> 50, '540A' -> 540, '25°C:80MIN' -> 80, '' -> None."""
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*(AH|MIN|A|V)?\s*$", value.strip().upper())
    if not m:
        return None
    return int(round(float(m.group(1).replace(",", "."))))


def cm_a_mm(value: str) -> int | None:
    v = value.strip().replace(",", ".")
    return int(round(float(v) * 10)) if v else None


def garantia_meses(value: str) -> int:
    v = value.strip().upper()
    m = re.match(r"(\d+)\s*(AÑOS?|ANOS?|MESES?)", v)
    if not m:
        raise ValueError(f"garantia rara: {value!r}")
    n = int(m.group(1))
    return n * 12 if m.group(2).startswith("A") else n


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_num(value: int | None) -> str:
    return "NULL" if value is None else str(value)


def buscar_fotos(modelo: str) -> list[Path]:
    """Las fotos estan en tres carpetas por marca pero el nombre es MODELO (n).jpg."""
    encontradas = sorted(GALERIA.glob(f"*/{modelo} (*).jpg"))
    return encontradas


def recortar(im: Image.Image) -> Image.Image:
    """
    Bbox completo de la bateria sin recortar bornes, tapa ni bordes.
    Calcula un recuadro 5:4 con un margen generoso del 16% para que la bateria
    quede completamente visible y nunca recortada en las tarjetas.
    Si la foto es vertical o estrecha, rellena los margenes extendiendo los bordes
    de forma suave y continua con difuminado gaussiano para que no existan
    lineas duras ni bordes que difieran del fondo.
    """
    factor = 8
    gris = im.convert("L").resize((im.width // factor, im.height // factor))
    arr = np.array(gris)

    mask = arr < 135
    mask = ndimage.binary_closing(mask, iterations=8)
    mask = ndimage.binary_fill_holes(mask)

    lbl, num = ndimage.label(mask)
    if num > 0:
        alto, ancho = arr.shape
        ccy, ccx = alto / 2, ancho / 2
        diag = (alto**2 + ancho**2) ** 0.5 / 2

        best_idx, best_score = 1, -1.0
        for i in range(1, num + 1):
            comp = lbl == i
            area = comp.sum()
            if area < 0.005 * alto * ancho:
                continue
            ys, xs = np.where(comp)
            dist = ((ys.mean() - ccy) ** 2 + (xs.mean() - ccx) ** 2) ** 0.5
            score = area / (1 + (dist / diag) * 4)
            if score > best_score:
                best_score = score
                best_idx = i

        comp_main = lbl == best_idx
        ys_m, xs_m = np.where(comp_main)
        dilated = ndimage.binary_dilation(comp_main, iterations=6)
        comp_all = dilated & mask
        ys, xs = np.where(comp_all)
        if len(xs) == 0:
            ys, xs = ys_m, xs_m

        xmin, xmax = int(xs.min()) * factor, int(xs.max() + 1) * factor
        ymin, ymax = int(ys.min()) * factor, int(ys.max() + 1) * factor
    else:
        xmin, ymin, xmax, ymax = int(im.width * 0.1), int(im.height * 0.15), int(im.width * 0.9), int(im.height * 0.85)

    bw = xmax - xmin
    bh = ymax - ymin

    # Margen generoso (16%) para que ningun borne, tapa o detalle toque el borde
    pad_y = max(30, int(bh * 0.16))
    pad_x = max(30, int(bw * 0.16))

    by0 = max(0, ymin - pad_y)
    by1 = min(im.height, ymax + pad_y)
    bx0 = max(0, xmin - pad_x)
    bx1 = min(im.width, xmax + pad_x)

    bw_pad = bx1 - bx0
    bh_pad = by1 - by0

    ASPECT = 1.25
    if bw_pad / bh_pad < ASPECT:
        target_h = bh_pad
        target_w = int(bh_pad * ASPECT)
    else:
        target_w = bw_pad
        target_h = int(bw_pad / ASPECT)

    cx = (xmin + xmax) / 2
    cy = (by0 + by1) / 2

    rx0 = int(cx - target_w / 2)
    rx1 = rx0 + target_w
    ry0 = int(cy - target_h / 2)
    ry1 = ry0 + target_h

    if ry0 < 0 and ry1 - ry0 <= im.height:
        ry1 -= ry0
        ry0 = 0
    elif ry1 > im.height and ry1 - ry0 <= im.height:
        ry0 -= ry1 - im.height
        ry1 = im.height

    if rx0 < 0 and rx1 - rx0 <= im.width:
        rx1 -= rx0
        rx0 = 0
    elif rx1 > im.width and rx1 - rx0 <= im.width:
        rx0 -= rx1 - im.width
        rx1 = im.width

    iy0 = max(0, ry0)
    iy1 = min(im.height, ry1)
    ix0 = max(0, rx0)
    ix1 = min(im.width, rx1)
    piece = np.array(im.crop((ix0, iy0, ix1, iy1))).astype(np.float32)

    # Color de fondo limpio tomado de las esquinas del telgopor
    c_size = min(40, im.width // 10, im.height // 10)
    corners = np.vstack([
        np.array(im.crop((0, 0, c_size, c_size))).reshape(-1, 3),
        np.array(im.crop((im.width - c_size, 0, im.width, c_size))).reshape(-1, 3),
        np.array(im.crop((0, im.height - c_size, c_size, im.height))).reshape(-1, 3),
        np.array(im.crop((im.width - c_size, im.height - c_size, im.width, im.height))).reshape(-1, 3),
    ])
    bg_color = np.median(corners, axis=0)

    canvas = np.ones((target_h, target_w, 3), dtype=np.float32) * bg_color
    px0 = ix0 - rx0
    px1 = px0 + (ix1 - ix0)
    py0 = iy0 - ry0
    py1 = py0 + (iy1 - iy0)

    # Difuminado suave en los bordes que tocan el relleno para fusion perfecta
    ph, pw, _ = piece.shape
    alpha = np.ones((ph, pw), dtype=np.float32)
    feather = 60

    if px0 > 0:
        f = min(feather, pw // 2)
        ramp = np.linspace(0, 1, f)
        alpha[:, :f] = np.minimum(alpha[:, :f], ramp[np.newaxis, :])
    if px1 < target_w:
        f = min(feather, pw // 2)
        ramp = np.linspace(1, 0, f)
        alpha[:, -f:] = np.minimum(alpha[:, -f:], ramp[np.newaxis, :])
    if py0 > 0:
        f = min(feather, ph // 2)
        ramp = np.linspace(0, 1, f)
        alpha[:f, :] = np.minimum(alpha[:f, :], ramp[:, np.newaxis])
    if py1 < target_h:
        f = min(feather, ph // 2)
        ramp = np.linspace(1, 0, f)
        alpha[-f:, :] = np.minimum(alpha[-f:, :], ramp[:, np.newaxis])

    a3 = alpha[:, :, np.newaxis]
    canvas[py0:py1, px0:px1] = piece * a3 + canvas[py0:py1, px0:px1] * (1.0 - a3)

    return Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8))


def procesar_foto(args: tuple[Path, Path]) -> str:
    origen, destino_base = args
    im = ImageOps.exif_transpose(Image.open(origen)).convert("RGB")
    im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    im = recortar(im)
    for ancho, sufijo in ((ANCHO_GRANDE, ""), (ANCHO_CHICO, "-sm")):
        copia = im.copy()
        copia.thumbnail((ancho, ancho * 2), Image.Resampling.LANCZOS)
        copia.save(destino_base.with_name(destino_base.name + f"{sufijo}.webp"), "WEBP", quality=CALIDAD, method=6)
    return origen.name


def main() -> None:
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    filas: list[dict[str, str]] = []
    with CSV.open(encoding="utf-8-sig", newline="") as f:
        for fila in csv.DictReader(f):
            filas.append({k.strip(): (v or "").strip() for k, v in fila.items()})

    tareas: list[tuple[Path, Path]] = []
    inserts: list[str] = []
    codigos: set[str] = set()
    sin_fotos: list[str] = []

    for fila in filas:
        marca_cruda = fila["Baterias"].upper()
        marca = MARCAS_BONITAS.get(marca_cruda, marca_cruda.title())
        modelo = fila["Modelo"].strip().upper()
        if modelo in codigos:
            raise ValueError(f"codigo repetido: {modelo}")
        codigos.add(modelo)

        slug = slugify(f"{marca} {modelo}")
        tipo_nombre = fila["Vehiculo"].strip()
        fotos = buscar_fotos(modelo)
        if not fotos:
            sin_fotos.append(modelo)
        rutas: list[str] = []
        for i, foto in enumerate(fotos, start=1):
            base = OUT_IMG / f"{slug}-{i}"
            tareas.append((foto, base))
            rutas.append(f"/catalogo/{slug}-{i}.webp")

        imagenes = "[" + ",".join('"' + r + '"' for r in rutas) + "]"
        valores = [
            sql_str(modelo),
            sql_str(slug),
            sql_str(f"{marca} {modelo}"),
            sql_str(marca),
            sql_str(slugify(tipo_nombre)),
            sql_str(tipo_nombre),
            sql_str(""),  # aplicacion: el CSV no la trae
            "0",  # precio: el CSV no lo trae; 0 = "consultar" hasta que lo carguen
            "NULL",
            sql_num(numero(fila["Tensión"]) or 12),
            sql_num(numero(fila["Capacidad C20 (Ah)"])),
            sql_num(numero(fila["Reserva RC"])),
            sql_num(numero(fila["Choque de arranque CCA-18° (A)"])),
            str(garantia_meses(fila["Garantia"])),
            sql_num(cm_a_mm(fila["Largo"])),
            sql_num(cm_a_mm(fila["Ancho"])),
            sql_num(cm_a_mm(fila["Alto"])),
            sql_str(""),  # borne: no viene
            "1",
            sql_str(imagenes),
            sql_str(""),
            "1" if modelo == "12073" else "0",  # una destacada para el hero: la 12073 es la de auto mas comun
            "1",
        ]
        inserts.append("  (" + ", ".join(valores) + ")")

    cabecera = """-- Catalogo real de Chiply, generado desde
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
"""
    OUT_SQL.write_text(cabecera + ",\n".join(inserts) + ";\n", encoding="utf-8")
    print(f"SQL: {len(inserts)} baterias -> {OUT_SQL}")
    if sin_fotos:
        print("SIN FOTOS:", sin_fotos)

    print(f"Procesando {len(tareas)} fotos...")
    with ProcessPoolExecutor() as pool:
        for i, nombre in enumerate(pool.map(procesar_foto, tareas), start=1):
            if i % 10 == 0 or i == len(tareas):
                print(f"  {i}/{len(tareas)} {nombre}")
    print("Listo.")


if __name__ == "__main__":
    main()
