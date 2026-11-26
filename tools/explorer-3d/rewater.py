"""
Refait l'eau d'une carte pré-rendue sur les images déjà rendues par region_tiles.py, sans relancer Cycles :
partout où l'eau est pleine (plus loin du bord que lib/mapwater.EDGE), le pixel est recalculé avec la
formule actuelle de lib/mapwater.py, étalonné et réécrit. Le liseré du bord (≈ 2,4 cm), mélangé à la rive,
reste tel quel. Il suffit ensuite de relancer tile_map.py.

Usage (le Python de Blender, pour numpy) :
    EXPLORER_TILES_OUT=<dossier de region_tiles.py> EXPLORER_LAYOUT=<disposition> EXPLORER_REGION_SCALE=6 \\
    blender -b --factory-startup -P tools/explorer-3d/rewater.py
"""
import sys

sys.dont_write_bytecode = True  # pas de __pycache__ dans tools/

import json  # noqa: E402
import math  # noqa: E402
import os  # noqa: E402

import bpy  # noqa: E402
import numpy as np  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from lib import geo, mapwater  # noqa: E402

if os.environ.get("EXPLORER_TILES_LOG"):
    _log = os.open(os.environ["EXPLORER_TILES_LOG"], os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(_log, 1)
    os.dup2(_log, 2)
    sys.stdout = os.fdopen(1, "w", buffering=1, encoding="utf-8", closefd=False)
    sys.stderr = os.fdopen(2, "w", buffering=1, encoding="utf-8", closefd=False)

OUT = os.path.realpath(os.environ["EXPLORER_TILES_OUT"])
LAYOUT = json.load(open(os.environ["EXPLORER_LAYOUT"]))
SCALE = float(os.environ.get("EXPLORER_REGION_SCALE", "6"))
INFO = json.load(open(os.path.join(OUT, "crops.json")))
ELEVATION = math.radians(INFO["elevation"])
SIN, COS = math.sin(ELEVATION), math.cos(ELEVATION)
WATER_JSON = json.load(open(os.path.join(geo.ROOT, "src", "features", "explorer", "stylized3d", "water.json")))
GEOMETRY = mapwater.outlines(WATER_JSON, geo.catmull_rom)
SUN = np.array(LAYOUT["sun"], dtype=np.float64)
SUN = SUN / np.linalg.norm(SUN)
VIEW = np.array([0.0, SIN, COS])
COLORS = {k: np.array(mapwater.srgb_to_linear(v)) for k, v in LAYOUT["water"].items()}
SHADOW_TINT = np.array(mapwater.srgb_to_linear(LAYOUT["gradeColors"]["shadows"]), dtype=np.float32)
LIGHT_TINT = np.array(mapwater.srgb_to_linear(LAYOUT["gradeColors"]["highlights"]), dtype=np.float32)
DITHER = np.random.default_rng(11)


def rewater(crop):
    path = os.path.join(OUT, crop["file"])
    image = bpy.data.images.load(path)
    w, h = image.size
    pixels = np.empty(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    rgba = pixels.reshape(h, w, 4)[::-1].copy()  # lignes de haut en bas
    xs = INFO["x0"] + (crop["x"] + np.arange(w) + 0.5) / INFO["ppm"]
    vs = INFO["v0"] + (crop["y"] + np.arange(h) + 0.5) / INFO["ppm"]
    x, v = np.meshgrid(xs, vs)
    z = (v + mapwater.SURFACE * SCALE * COS) / SIN
    color, _, inside = mapwater.water(x, z, SCALE, GEOMETRY, COLORS, SUN, VIEW)
    full = inside >= mapwater.EDGE
    if not full.any():
        bpy.data.images.remove(image)
        return 0
    fresh = mapwater.graded(np.concatenate([color, np.ones_like(color[..., :1])], axis=-1).astype(np.float32),
                            LAYOUT["grade"], SHADOW_TINT, LIGHT_TINT, DITHER, np.zeros_like(inside))
    rgba[full] = fresh[full]
    image.pixels.foreach_set(np.ascontiguousarray(rgba[::-1]).ravel())
    image.filepath_raw = path
    image.file_format = "PNG"
    image.save()
    bpy.data.images.remove(image)
    return int(full.sum())


total = sum(rewater(crop) for crop in INFO["crops"])
print("EAU REFAITE", total, "pixels", flush=True)
