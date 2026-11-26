"""
Sprites des points de niveau de la carte d'une région (X2b), communs à toutes les régions : un disque à
la couleur du type (leçon, exercices, évaluation), cerclé d'un rebord doré bombé (argenté si le niveau est
fermé) et d'un fin liseré bleu nuit (contraste d'au moins 3:1 sur toutes les herbes), avec son ombre de
contact. Même caméra que la carte pré-rendue (orthographique, 52°), même soleil ; l'app pose l'icône du
type (ou le cadenas) par-dessus, et le halo des niveaux ouverts sous le disque.

Usage : EXPLORER_SPRITES_COLORS=couleurs.json EXPLORER_SPRITES_OUT=dossier \\
        blender -b -P tools/explorer-3d/node_sprites.py
        (couleurs.json : explorerArt.map.node, nodeRim, nodeRimLocked et hud.ink, exportés par l'app)
Sortie : <dossier>/<nom>.png (RGBA, alpha droit) et sprites.json (taille, point d'ancrage au sol).
"""
import sys

sys.dont_write_bytecode = True  # pas de __pycache__ dans tools/

import json  # noqa: E402
import math  # noqa: E402
import os  # noqa: E402

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import bake, geo  # noqa: E402

if os.environ.get("EXPLORER_TILES_LOG"):
    _log = os.open(os.environ["EXPLORER_TILES_LOG"], os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(_log, 1)
    os.dup2(_log, 2)
    sys.stdout = os.fdopen(1, "w", buffering=1, encoding="utf-8", closefd=False)
    sys.stderr = os.fdopen(2, "w", buffering=1, encoding="utf-8", closefd=False)

COLORS = json.load(open(os.environ["EXPLORER_SPRITES_COLORS"]))
OUT = os.path.realpath(os.environ["EXPLORER_SPRITES_OUT"])
os.makedirs(OUT, exist_ok=True)
PPM = float(os.environ.get("EXPLORER_SPRITES_PPM", "336"))  # 3x : l'app les réduit sur les écrans moins denses
ELEVATION = math.radians(52)
SIN, COS = math.sin(ELEVATION), math.cos(ELEVATION)

# Profil du rebord, tourné autour de l'axe (rayon relatif au rayon du point, hauteur en mètres) : le disque
# coloré occupe 78 % du rayon (levelNodes.ts), puis le rebord bombé, puis le liseré, au pied du rebord.
RIM = [(0.78, 0.090), (0.83, 0.099), (0.89, 0.104), (0.95, 0.099), (0.985, 0.088)]
# Fin liseré bleu nuit sur la lèvre extérieure du rebord (environ 2,5 px en 2x), puis la tranche du rebord.
KEYLINE = [(0.985, 0.088), (1.008, 0.084), (1.024, 0.074), (1.03, 0.062)]
SIDE = [(1.03, 0.062), (1.03, 0.0)]


def srgb_to_linear(hex_color):
    c = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1.0)


def painted(name, hex_color, roughness=0.5, specular=0.25):
    """Peinture de jouet : teinte unie, satinée pour le rebord, mate pour le disque."""
    mat = bpy.data.materials.new(name)
    bsdf = next(n for n in mat.node_tree.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = srgb_to_linear(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Specular IOR Level"].default_value = specular
    return mat


def lathe(profile, radius, material, name, segments=96):
    bm = bmesh.new()
    rings = []
    for k in range(segments):
        a = k / segments * math.tau
        rings.append([bm.verts.new((math.cos(a) * r * radius, math.sin(a) * r * radius, h)) for r, h in profile])
    for k in range(segments):
        a, b = rings[k], rings[(k + 1) % segments]
        for i in range(len(profile) - 1):
            bm.faces.new((a[i], b[i], b[i + 1], a[i + 1]))
    obj = geo.link(name, bm)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.data.materials.append(material)
    return obj


def disc(radius, fill, rim, keyline, side):
    """Le point de niveau, centré sur l'origine, posé au sol : dessus plat, rebord bombé, liseré, tranche."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=radius * 0.79, depth=0.09, location=(0, 0, 0.045))
    face = bpy.context.active_object
    face.data.materials.append(fill)
    lathe(RIM, radius, rim, "rebord")
    lathe(KEYLINE, radius, keyline, "liseré")
    lathe(SIDE, radius, side, "tranche")


def clear_scene():
    for obj in list(bpy.data.objects):
        if obj.type in {"MESH"} and obj.name != "sol":
            bpy.data.objects.remove(obj, do_unlink=True)


def setup():
    geo.reset()
    bake.lights()
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    ground = bpy.data.objects.new("sol", bpy.data.meshes.new("sol"))
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=2.0)
    bm.to_mesh(ground.data)
    bm.free()
    scene.collection.objects.link(ground)
    ground.is_shadow_catcher = True
    camera = bpy.data.objects.new("camera", bpy.data.cameras.new("camera"))
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.type = "ORTHO"
    camera.data.sensor_fit = "HORIZONTAL"
    tilt = math.radians(90) - ELEVATION
    camera.rotation_euler = (tilt, 0.0, 0.0)
    camera.location = Vector((0.0, 0.0, 0.0)) - Vector((0.0, math.sin(tilt), -math.cos(tilt))) * 20.0
    return scene, camera


def render(scene, camera, name, half_width):
    """Sprite carré de 2·half_width mètres de large, centré sur le pied du point (ancrage = centre)."""
    size = round(2 * half_width * PPM)
    camera.data.ortho_scale = size / PPM
    scene.render.resolution_x = scene.render.resolution_y = size
    scene.render.filepath = os.path.join(OUT, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    return {"file": f"{name}.png", "width": size, "height": size, "anchor": [size / 2, size / 2]}


def ground_ring(name, radius, hex_color, inner, outer, alpha, falloff):
    """Anneau posé au sol autour d'un point (rayon 1 = bord du point), vu à 52°, alpha droit, bord
    anticrénelé. `falloff` : True = lueur qui s'éteint vers l'extérieur, False = anneau net."""
    import numpy as np

    reach = radius * (outer + 0.1)
    width, height = round(2 * reach * PPM), round(2 * reach * SIN * PPM)
    xs = (np.arange(width) + 0.5 - width / 2) / PPM
    vs = (np.arange(height) + 0.5 - height / 2) / PPM
    x, v = np.meshgrid(xs, vs)
    d = np.hypot(x, v / SIN) / radius
    pixel = 1.0 / (radius * PPM)
    if falloff:
        t = np.clip((d - inner) / (outer - inner), 0, 1)
        a = alpha * (1 - t) ** 2 * np.clip((d - inner) / (2 * pixel) + 0.5, 0, 1)
    else:
        a = alpha * np.clip((d - inner) / pixel + 0.5, 0, 1) * np.clip((outer - d) / pixel + 0.5, 0, 1)
    color = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    pixels = np.zeros((height, width, 4), dtype=np.float32)
    pixels[..., :3] = color
    pixels[..., 3] = a
    image = bpy.data.images.new(name, width, height, alpha=True, float_buffer=False)
    image.pixels.foreach_set(np.ascontiguousarray(pixels[::-1]).ravel())
    image.filepath_raw = os.path.join(OUT, f"{name}.png")
    image.file_format = "PNG"
    image.save()
    return {"file": f"{name}.png", "width": width, "height": height, "anchor": [width / 2, height / 2],
            "radius": radius}


def main():
    scene, camera = setup()
    node, rim, locked, ink = COLORS["node"], COLORS["nodeRim"], COLORS["nodeRimLocked"], COLORS["ink"]
    gold = painted("or", rim["face"], 0.3, 0.6)
    silver = painted("argent", locked["face"], 0.3, 0.6)
    gold_side = painted("or-tranche", rim["dark"], 0.4, 0.4)
    silver_side = painted("argent-tranche", locked["dark"], 0.4, 0.4)
    keyline = painted("liseré", ink, 0.6)
    variants = {
        "lecon": (node["lecon"], gold, gold_side, COLORS["radius"]["normal"]),
        "exercices": (node["exercices"], gold, gold_side, COLORS["radius"]["normal"]),
        "evaluation": (node["evaluation"], gold, gold_side, COLORS["radius"]["evaluation"]),
        "verrou": (node["locked"], silver, silver_side, COLORS["radius"]["normal"]),
        "verrou-grand": (node["locked"], silver, silver_side, COLORS["radius"]["evaluation"]),
    }
    sprites = {}
    for name, (fill_hex, rim_material, side_material, radius) in variants.items():
        clear_scene()
        disc(radius, painted(f"disque-{name}", fill_hex, 0.6, 0.15), rim_material, keyline, side_material)
        sprites[name] = {**render(scene, camera, f"niveau-{name}", radius * 1.6), "radius": radius}
        print("SPRITE", name, flush=True)
    # Halo des niveaux ouverts : un anneau net (fusion normale) et une lueur (posée en mode « écran »).
    for suffix, radius in (("", COLORS["radius"]["normal"]), ("-grand", COLORS["radius"]["evaluation"])):
        sprites[f"anneau{suffix}"] = ground_ring(f"anneau{suffix}", radius, rim["light"], 1.06, 1.14, 0.9, False)
        sprites[f"lueur{suffix}"] = ground_ring(f"lueur{suffix}", radius, rim["glow"], 0.95, 1.7, 0.45, True)
    with open(os.path.join(OUT, "sprites.json"), "w") as f:
        json.dump({"ppm": PPM, "elevation": 52, "sprites": sprites}, f, indent=1)


main()
