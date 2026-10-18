"""
Pré-rendu de la carte d'une région (X2b) : la région de l'île agrandie (region_map.py), ses repères,
l'eau immobile, les monuments des villes, les décors du kit, les brins d'herbe et les touffes des
clairières, rendus directement par Cycles (sans cuisson) avec une caméra orthographique qui reprend
la vue de l'app : 52° d'élévation, azimut nul, PPM pixels par mètre du plan image.

La disposition (villes, niveaux, chemin, décors posés, touffes) vient de l'app : elle est exportée en
JSON (EXPLORER_LAYOUT), et Blender la reproduit telle quelle. Le chemin et les points de niveau ne
sont pas rendus ici : l'app les pose par-dessus.

Sortie (EXPLORER_TILES_OUT) : un PNG 8 bits sRGB par morceau, étalonné comme l'île (post.natural),
alpha droit (le ciel reste transparent), et crops.json. tile_map.py les découpe ensuite en tuiles WebP.

Usage :
    EXPLORER_LAYOUT=… EXPLORER_TILES_OUT=… [EXPLORER_TILES_ZONE=x0,x1,v0,v1] \\
    blender -b -P tools/explorer-3d/region_tiles.py > rendu.log 2>&1
Plan image : x = x de la carte, v = z·sin52 − y·cos52 (mètres), origine du pixel en haut à gauche.
"""
import sys

sys.dont_write_bytecode = True  # pas de __pycache__ dans tools/

import json  # noqa: E402
import math  # noqa: E402
import os  # noqa: E402
import time  # noqa: E402

import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
import mathutils.noise  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# Journal dans un fichier : selon la façon dont Blender est lancé (snap, tâche de fond), sa sortie
# standard peut être fermée, et le moindre print() ferait échouer le script sans un mot.
if os.environ.get("EXPLORER_TILES_LOG"):
    _log = os.open(os.environ["EXPLORER_TILES_LOG"], os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(_log, 1)
    os.dup2(_log, 2)
    sys.stdout = os.fdopen(1, "w", buffering=1, encoding="utf-8", closefd=False)
    sys.stderr = os.fdopen(2, "w", buffering=1, encoding="utf-8", closefd=False)

T0 = time.time()
LAYOUT = json.load(open(os.environ["EXPLORER_LAYOUT"]))
OUT = os.path.realpath(os.environ["EXPLORER_TILES_OUT"])
os.makedirs(OUT, exist_ok=True)
PPM = float(os.environ.get("EXPLORER_TILES_PPM", "224"))
SAMPLES = int(os.environ.get("EXPLORER_TILES_SAMPLES", "64"))
THREADS = int(os.environ.get("EXPLORER_TILES_THREADS", "4"))
CROP = int(os.environ.get("EXPLORER_TILES_CROP", "1600"))  # côté d'un morceau, en pixels
PAD = 32  # marge rendue autour de chaque morceau puis retirée (bords du débruitage)
ELEVATION = math.radians(52)
SIN, COS = math.sin(ELEVATION), math.cos(ELEVATION)

# --- La scène de la carte, reprise de region_map.py ---------------------------------------------
# Les modes qui écrivent dans le dépôt (plan, décors, aperçu) sont coupés : seule la scène est reprise.
for var in ("EXPLORER_PLAN", "EXPLORER_DECOR", "EXPLORER_PREVIEW", "EXPLORER_FALLBACK", "EXPLORER_STATS",
            "EXPLORER_PREVIEW_CROP", "EXPLORER_PREVIEW_SCALE", "EXPLORER_CITIES"):
    os.environ.pop(var, None)
os.environ["EXPLORER_REGION"] = LAYOUT["regionId"]
REGION_MAP = os.path.join(HERE, "region_map.py")
MARKER = "# --- fin de la construction de la carte"
source = open(REGION_MAP, encoding="utf-8").read()
assert source.count(MARKER) == 1, "ligne repère absente ou en double dans region_map.py"
ns = {"__file__": REGION_MAP, "__name__": "region_map"}
exec(compile(source.split(MARKER)[0], REGION_MAP, "exec"), ns)
bake, geo, M, app = ns["bake"], ns["geo"], ns["M"], ns["app"]
from lib.palette import calibrated  # noqa: E402
from lib import mapwater  # noqa: E402
SCALE = ns["SCALE"]
print("SCENE", round(time.time() - T0, 1), "s", flush=True)

# Les repères de l'île (cubes, pyramides, arbres-signes…) agrandis 6 fois deviennent des géants qui
# écrasent les villes : sur la carte, chacun est réduit autour de son pied (LANDMARK_SCALE), sans bouger.
LANDMARK_SCALE = float(os.environ.get("EXPLORER_TILES_LANDMARK_SCALE", "0.45"))
for obj in ns["kept"]:
    if obj.name not in bpy.data.objects:
        continue
    cx, cz = obj.location.x, -obj.location.y
    near = min(ns["LANDMARKS"], key=lambda l: math.hypot(l[0] - cx, l[1] - cz), default=None)
    if near is None:
        continue
    base = Vector(app(near[0], near[1], 0.0))
    obj.location = base + (obj.location - base) * LANDMARK_SCALE
    obj.scale = obj.scale * LANDMARK_SCALE


def map_tuft(bm, uv, x, z, r, tall=False):
    """Touffe de la carte : brins plus courts et plus larges que sur l'île, lisibles à 224 px/m."""
    for _ in range(r.randint(5, 9) if tall else r.randint(4, 8)):
        bx, bz = x + r.uniform(-0.03, 0.03), z + r.uniform(-0.03, 0.03)
        yaw, lean = r.uniform(0, math.tau), r.uniform(0.1, 0.4) if tall else r.uniform(0.15, 0.55)
        h, w = r.uniform(0.09, 0.12) if tall else r.uniform(0.06, 0.1), r.uniform(0.012, 0.02)
        dx, dz = math.cos(yaw), math.sin(yaw)
        root = [bm.verts.new(app(bx - dz * w * s, bz + dx * w * s, -0.005)) for s in (1, -1)]
        tip = bm.verts.new(app(bx + dx * math.sin(lean) * h, bz + dz * math.sin(lean) * h, math.cos(lean) * h))
        face = bm.faces.new((*root, tip))
        for loop, co in zip(face.loops, ((0, 0), (1, 0), (0.5, 1))):
            loop[uv].uv = co


ns["tuft"] = map_tuft
# Les brins, aux mêmes places que la cuisson : plan_decor() d'abord, pour le tirage au hasard partagé.
ns["plan_decor"]()
blades = ns["build_blades"]()
terrain = [o for o in bpy.context.scene.objects if o.type in {"MESH", "CURVE", "FONT"}]

# --- Monuments et décors, construits dans la même scène ------------------------------------------
import strip_kit  # noqa: E402
import strip_monuments  # noqa: E402

for city in LAYOUT["cities"]:
    build = strip_monuments.MONUMENTS.get(city["monument"])
    if build is None:
        raise SystemExit(f"monument « {city['monument']} » inconnu de strip_monuments.py")
    obj = build()
    obj.location = app(city["x"], city["z"], 0.0)

templates = {}
for kind, build in strip_kit.DECOR.items():
    obj = build()
    obj.location = (0.0, 0.0, -1000.0)  # modèle, jamais rendu : les décors en sont des copies liées
    templates[kind] = obj

bake.apply_all()
# Terrain et repères : sommets à leur place dans la carte, comme pour la cuisson (coordonnées « Object »).
bpy.ops.object.select_all(action="DESELECT")
for obj in terrain:
    if obj.name in bpy.data.objects and obj.type == "MESH":
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

for kind, x, z, yaw, scale in LAYOUT["decor"]:
    copy = templates[kind].copy()
    copy.location = app(x, z, 0.0)
    copy.rotation_euler = (0.0, 0.0, yaw)
    copy.scale = (scale, scale, scale)
    bpy.context.scene.collection.objects.link(copy)
for obj in templates.values():
    obj.hide_render = True


# --- Herbe : les brins de la carte, moins ceux du chemin, et les touffes des clairières ---------------
def path_distance():
    """Distance au chemin lissé (échantillons de l'app), par une grille de 1,5 m comme terrainLayout.ts."""
    cells = {}
    for x, z, _u in LAYOUT["path"]:
        cells.setdefault((math.floor(x / 1.5), math.floor(z / 1.5)), []).append((x, z))

    def near(x, z):
        cx, cz = math.floor(x / 1.5), math.floor(z / 1.5)
        best = math.inf
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for px, pz in cells.get((cx + dx, cz + dz), ()):
                    best = min(best, math.hypot(px - x, pz - z))
        return best
    return near


def ramp(value, start, end):
    t = max(0.0, min(1.0, (value - start) / (end - start)))
    return t * t * (3 - 2 * t)


def blade_chance():
    """Probabilité de garder un brin : nulle sur le chemin et sous les niveaux, rare au bord du chemin,
    et des touffes groupées en plaques de 1,5 à 3 m, avec des pelouses calmes entre elles."""
    near = path_distance()
    nodes, cities = LAYOUT["nodes"], LAYOUT["cities"]

    def chance(x, z):
        d = near(x, z)
        edge = 0.0 if d < 0.30 else 0.2 + 0.8 * ramp(d, 0.6, 0.9)
        for n in nodes:
            edge *= ramp(math.hypot(n["x"] - x, n["z"] - z), n["radius"] + 0.12, n["radius"] + 0.4)
        for c in cities:
            edge *= ramp(math.hypot(c["x"] - x, c["z"] - z), 0.95, 1.45)
        patch = (mathutils.noise.noise(Vector((x * 0.45, z * 0.45, 0.0))) + 1) / 2
        return edge * (0.25 + 0.75 * ramp(patch, 0.42, 0.62))
    return chance


def stable_random(i, k=0.0):
    value = math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return value - math.floor(value)


def filter_blades(obj):
    chance = blade_chance()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    world = obj.matrix_world
    doomed = []
    for i, face in enumerate(bm.faces):
        p = world @ face.verts[0].co
        if stable_random(i) >= chance(p.x, -p.y):
            doomed.append(face)
    bmesh.ops.delete(bm, geom=doomed, context="FACES")
    bm.to_mesh(obj.data)
    bm.free()
    return len(doomed)


def clearing_tufts():
    """Touffes des clairières calculées par l'app (triangles en coordonnées de la carte, v = hauteur)."""
    position, uv = LAYOUT["tufts"]["position"], LAYOUT["tufts"]["uv"]
    bm = bmesh.new()
    layer = bm.loops.layers.uv.new("UVMap")
    for t in range(0, len(position) // 9):
        corners = [bm.verts.new(app(position[t * 9 + k * 3], position[t * 9 + k * 3 + 2], position[t * 9 + k * 3 + 1]))
                   for k in range(3)]
        face = bm.faces.new(corners)
        for k, loop in enumerate(face.loops):
            loop[layer].uv = (uv[t * 6 + k * 2], uv[t * 6 + k * 2 + 1])
    return geo.link("touffes", bm)


def srgb_to_linear(hex_color):
    c = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]


def blade_material():
    """Brins éclairés par Cycles : pied mousse, pointe d'herbe claire, pointe sèche seulement là où le sol
    a ses zones sèches (le même bruit que meadow_map), un peu désaturés ; aucune ombre portée."""
    colors = LAYOUT["grassBlades"]
    mat = bpy.data.materials.new("brins-carte")
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = next(n for n in nodes if n.bl_idname == "ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Specular IOR Level"].default_value = 0.0
    uv = nodes.new("ShaderNodeUVMap")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    height = nodes.new("ShaderNodeMath")
    height.operation = "POWER"
    height.inputs[1].default_value = 0.8
    geometry = nodes.new("ShaderNodeNewGeometry")
    dry_noise = nodes.new("ShaderNodeTexNoise")
    dry_noise.inputs["Scale"].default_value = 0.45
    dry_noise.inputs["Detail"].default_value = 3.0
    dry = nodes.new("ShaderNodeMath")
    dry.operation = "GREATER_THAN"
    dry.inputs[1].default_value = 0.62
    tip = nodes.new("ShaderNodeMix")
    tip.data_type = "RGBA"
    tip.inputs["A"].default_value = M.rgba("grass-tip")
    tip.inputs["B"].default_value = (*srgb_to_linear(colors["dry"]), 1)
    color = nodes.new("ShaderNodeMix")
    color.data_type = "RGBA"
    color.inputs["A"].default_value = M.rgba("moss")
    soft = nodes.new("ShaderNodeHueSaturation")
    soft.inputs["Saturation"].default_value = 0.85
    links.new(uv.outputs["UV"], sep.inputs[0])
    links.new(sep.outputs["Y"], height.inputs[0])
    links.new(geometry.outputs["Position"], dry_noise.inputs["Vector"])
    links.new(dry_noise.outputs["Fac"], dry.inputs[0])
    links.new(dry.outputs["Value"], tip.inputs["Factor"])
    links.new(height.outputs["Value"], color.inputs["Factor"])
    links.new(tip.outputs["Result"], color.inputs["B"])
    links.new(color.outputs["Result"], soft.inputs["Color"])
    links.new(soft.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


removed = filter_blades(blades)
tufts = clearing_tufts()
grass = blade_material()
for obj in (blades, tufts):
    obj.data.materials.clear()
    obj.data.materials.append(grass)
    obj.visible_shadow = False  # l'occlusion ambiante les pose au sol, sans traits d'ombre dure
print("BRINS", len(blades.data.polygons), "gardés,", removed, "retirés ; TOUFFES", len(tufts.data.polygons), flush=True)


# --- Le sol : herbe propre aux cartes, calme et foulée sous le chemin, autour des niveaux et des villes ---
def quiet_mask(ppm=20):
    """Image vue de dessus (mètres de Blender) : rouge = proche du chemin, vert = autour d'un point de
    niveau, bleu = dans une clairière. meadow_map y calme l'herbe et use le milieu du chemin."""
    import mathutils.kdtree

    xs = [x for x, _, _ in LAYOUT["path"]] + [c["x"] for c in LAYOUT["cities"]]
    zs = [z for _, z, _ in LAYOUT["path"]] + [c["z"] for c in LAYOUT["cities"]]
    x0, x1 = min(xs) - 3.0, max(xs) + 3.0
    z0, z1 = min(zs) - 3.0, max(zs) + 3.0
    width, height = int((x1 - x0) * ppm), int((z1 - z0) * ppm)
    path = mathutils.kdtree.KDTree(len(LAYOUT["path"]))
    for i, (x, z, _) in enumerate(LAYOUT["path"]):
        path.insert((x, z, 0.0), i)
    path.balance()
    def soft(d, start, end):
        t = np.clip((d - start) / (end - start), 0.0, 1.0)
        return 1.0 - t * t * (3 - 2 * t)

    xs = x0 + (np.arange(width) + 0.5) / ppm
    nodes = np.array([(n["x"], n["z"], n["radius"]) for n in LAYOUT["nodes"]])
    cities = np.array([(c["x"], c["z"]) for c in LAYOUT["cities"]])
    pixels = np.zeros((height, width, 4), dtype=np.float32)
    pixels[..., 3] = 1.0
    for row in range(height):
        z = z1 - (row + 0.5) / ppm  # ligne 0 de l'image Blender = bas = y de Blender le plus petit = z le plus grand
        d = np.array([path.find((x, z, 0.0))[2] for x in xs])
        dn = np.hypot(nodes[:, 0:1] - xs, nodes[:, 1:2] - z)
        node = soft(dn, nodes[:, 2:3] + 0.05, nodes[:, 2:3] + 0.35).max(axis=0)
        city = soft(np.hypot(cities[:, 0:1] - xs, cities[:, 1:2] - z), 1.4, 2.2).max(axis=0)
        pixels[row, :, 0] = soft(d, 0.18, 0.55)
        pixels[row, :, 1] = node
        pixels[row, :, 2] = city
    image = bpy.data.images.new("calme", width, height, alpha=True, float_buffer=True)
    image.colorspace_settings.name = "Non-Color"
    image.pixels.foreach_set(pixels.ravel())
    image.pack()
    # Coin bas-gauche de l'image en coordonnées de Blender (x, y = −z de l'app), taille en mètres.
    return image, x0, -z1, x1 - x0, z1 - z0


meadow = M.meadow_map(ns["mask"], 3.6 * SCALE, quiet=quiet_mask())
for obj in terrain:
    if obj.name in bpy.data.objects and obj.name.split(".")[0] in {"Plateau", "Bordure"}:
        obj.data.materials.clear()
        obj.data.materials.append(meadow)
print("SOL", round(time.time() - T0, 1), "s", flush=True)


# --- Le chemin : des planches posées en travers (mapPath.ts), une pièce par tronçon entre deux niveaux ---
PLANK_WIDTH, PLANK_PITCH, PLANK_THICK = 0.4, 0.15, 0.022


def ground_height(x, z):
    """Bosses du plateau (region_map.top_surface), sans leur part tirée au hasard (±6 mm)."""
    u, v = x / SCALE, z / SCALE
    return 0.036 * math.sin(u * 2.3 + 1) * math.sin(v * 1.9)


def plank_hash(n, k):
    """hash1(vec2(n, k)) du shader des planches (mapPath.ts) : même longueur et même teinte par planche."""
    value = math.sin(n * 127.1 + k * 311.7) * 43758.5453
    return value - math.floor(value)


def along_path(path):
    """Fonction s ↦ (x, z, direction x, direction z, u) le long des échantillons du chemin."""
    lengths = [0.0]
    for (ax, az, _), (bx, bz, _) in zip(path, path[1:]):
        lengths.append(lengths[-1] + math.hypot(bx - ax, bz - az))

    def at(s):
        i = max(0, min(len(path) - 2, next((k for k, d in enumerate(lengths) if d > s), len(path) - 1) - 1))
        (ax, az, au), (bx, bz, bu) = path[i], path[i + 1]
        span = (lengths[i + 1] - lengths[i]) or 1.0
        t = max(0.0, min(1.0, (s - lengths[i]) / span))
        return ax + (bx - ax) * t, az + (bz - az) * t, (bx - ax) / span, (bz - az) / span, au + (bu - au) * t
    return at, lengths[-1]


PLANK_GAIN = 1.15  # éclairées, les planches gardent l'éclat de la version d'avant (miel lumineux, gris clair)
TODO = {"color": "#9b948a", "grain": "#6b6359", "thick": 0.016, "lift": -0.004, "grow": 0.0, "roughness": 0.85,
        "coat": 0.0, "lichen": True}
DONE = {"color": LAYOUT["planks"]["done"], "grain": LAYOUT["planks"]["grain"], "thick": 0.026, "lift": 0.006,
        "grow": 0.003, "roughness": 0.55, "coat": 0.25, "lichen": False}


def plank_material(name, style):
    """Planche de bois : fil du bois le long de la planche, bout de planche plus sombre, teinte propre à
    chaque planche ; vieillie et grisée (avec un peu de mousse) ou miel et vernie."""
    mat = bpy.data.materials.new(name)
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = next(n for n in nodes if n.bl_idname == "ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = style["roughness"]
    bsdf.inputs["Specular IOR Level"].default_value = 0.3
    bsdf.inputs["Coat Weight"].default_value = style["coat"]
    uv = nodes.new("ShaderNodeUVMap")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    grain = nodes.new("ShaderNodeTexWave")
    grain.wave_type = "BANDS"
    grain.bands_direction = "Y"
    grain.inputs["Scale"].default_value = 4.5
    grain.inputs["Distortion"].default_value = 2.5
    grain.inputs["Detail"].default_value = 2.0
    ramp_node = nodes.new("ShaderNodeValToRGB")
    ramp_node.color_ramp.elements[0].color = calibrated(style["grain"], PLANK_GAIN)
    ramp_node.color_ramp.elements[1].position = 0.35
    ramp_node.color_ramp.elements[1].color = calibrated(style["color"], PLANK_GAIN)
    tone_noise = nodes.new("ShaderNodeTexNoise")
    tone_noise.inputs["Scale"].default_value = 3.0
    tone_noise.inputs["Detail"].default_value = 2.0
    tone = nodes.new("ShaderNodeMapRange")
    tone.inputs["To Min"].default_value = 0.94
    tone.inputs["To Max"].default_value = 1.06
    variety = nodes.new("ShaderNodeAttribute")
    variety.attribute_name = "variete"
    shade = nodes.new("ShaderNodeMath")
    shade.operation = "MULTIPLY"
    ends = nodes.new("ShaderNodeMapRange")  # bout de planche : 0,8 près des extrémités (u < 0,05 ou > 0,95)
    ends.interpolation_type = "SMOOTHSTEP"
    ends.inputs["From Min"].default_value = 0.0
    ends.inputs["From Max"].default_value = 0.05
    ends.inputs["To Min"].default_value = 0.8
    centred = nodes.new("ShaderNodeMath")
    centred.operation = "PINGPONG"
    centred.inputs[1].default_value = 0.5
    wood = nodes.new("ShaderNodeMix")
    wood.data_type = "RGBA"
    wood.blend_type = "MULTIPLY"
    wood.inputs["Factor"].default_value = 1.0
    end_mix = nodes.new("ShaderNodeMath")
    end_mix.operation = "MULTIPLY"
    links.new(uv.outputs["UV"], sep.inputs[0])
    links.new(uv.outputs["UV"], grain.inputs["Vector"])
    links.new(grain.outputs["Fac"], ramp_node.inputs["Fac"])
    links.new(uv.outputs["UV"], tone_noise.inputs["Vector"])
    links.new(tone_noise.outputs["Fac"], tone.inputs["Value"])
    links.new(tone.outputs["Result"], shade.inputs[0])
    links.new(variety.outputs["Fac"], shade.inputs[1])
    links.new(sep.outputs["X"], centred.inputs[0])
    links.new(centred.outputs["Value"], ends.inputs["Value"])
    links.new(shade.outputs["Value"], end_mix.inputs[0])
    links.new(ends.outputs["Result"], end_mix.inputs[1])
    links.new(ramp_node.outputs["Color"], wood.inputs["A"])
    links.new(end_mix.outputs["Value"], wood.inputs["B"])
    color = wood.outputs["Result"]
    if style["lichen"]:
        lichen_noise = nodes.new("ShaderNodeTexNoise")
        lichen_noise.inputs["Scale"].default_value = 6.0
        lichen_noise.inputs["Detail"].default_value = 2.0
        lichen_mask = nodes.new("ShaderNodeMapRange")
        lichen_mask.inputs["From Min"].default_value = 0.62
        lichen_mask.inputs["From Max"].default_value = 0.70
        mossy = nodes.new("ShaderNodeAttribute")
        mossy.attribute_name = "mousse"
        amount = nodes.new("ShaderNodeMath")
        amount.operation = "MULTIPLY"
        amount2 = nodes.new("ShaderNodeMath")
        amount2.operation = "MULTIPLY"
        amount2.inputs[1].default_value = 0.3
        lichen = nodes.new("ShaderNodeMix")
        lichen.data_type = "RGBA"
        lichen.inputs["B"].default_value = calibrated("#4c6a2c", PLANK_GAIN)
        links.new(uv.outputs["UV"], lichen_noise.inputs["Vector"])
        links.new(lichen_noise.outputs["Fac"], lichen_mask.inputs["Value"])
        links.new(lichen_mask.outputs["Result"], amount.inputs[0])
        links.new(mossy.outputs["Fac"], amount.inputs[1])
        links.new(amount.outputs["Value"], amount2.inputs[0])
        links.new(amount2.outputs["Value"], lichen.inputs["Factor"])
        links.new(color, lichen.inputs["A"])
        color = lichen.outputs["Result"]
    links.new(color, bsdf.inputs["Base Color"])
    return mat


def one_plank(k, x, z, dx, dz, style):
    """La planche k, en coordonnées de Blender : biseautée, un peu de travers, UV propres à la planche,
    teinte de la planche, et de la mousse sur une planche vieillie sur quatre."""
    reach = 0.86 + plank_hash(k, 2.0) * 0.12
    length = PLANK_WIDTH * reach + 2 * style["grow"]
    depth = PLANK_PITCH * 0.82 + 2 * style["grow"]
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(length, depth, style["thick"]), verts=bm.verts)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.004, segments=2, affect="EDGES")
    uv = bm.loops.layers.uv.new("UVMap")
    variety = bm.faces.layers.float.new("variete")
    mossy = bm.faces.layers.float.new("mousse")
    brightness = 0.86 + 0.26 * plank_hash(k, 9.0)
    moss = 1.0 if plank_hash(k, 5.0) < 0.25 else 0.0
    for face in bm.faces:
        face[variety] = brightness
        face[mossy] = moss
        for loop in face.loops:
            loop[uv].uv = (loop.vert.co.x / length + 0.5, loop.vert.co.y / depth + 0.5)
    roll = (plank_hash(k, 4.0) - 0.5) * 0.06
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(roll, 3, "Y"))
    yaw = math.atan2(-dz, dx) + math.pi / 2 + (plank_hash(k, 3.0) - 0.5) * 0.12  # en travers du chemin
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(yaw, 3, "Z"))
    side = (plank_hash(k, 6.0) - 0.5) * 0.03
    x, z = x - dz * side, z + dx * side
    lift = ground_height(x, z) + style["thick"] / 2 + 0.006 + style["lift"]
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(app(x, z, lift)))
    mesh = bpy.data.meshes.new("planche")
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def build_planks(style, material):
    """Une planche tous les PLANK_PITCH mètres, de longueur inégale, avec le jour d'herbe entre deux ;
    une pièce par tronçon du chemin (entre le niveau i et le niveau i + 1), numérotée pour la passe miel."""
    at, total = along_path(LAYOUT["path"])
    last_gap = len(LAYOUT["nodes"]) - 2
    gaps = {}
    for k in range(int(total / PLANK_PITCH)):
        x, z, dx, dz, u = at((k + 0.41) * PLANK_PITCH)
        gap = max(0, min(last_gap, math.floor(u)))
        mesh = one_plank(k, x, z, dx, dz, style)
        gaps.setdefault(gap, bmesh.new()).from_mesh(mesh)
        bpy.data.meshes.remove(mesh)
    objects = {}
    for gap, bm in gaps.items():
        obj = geo.link(f"planches-{gap:02d}", bm)
        obj.data.materials.append(material)
        obj.pass_index = gap + 1
        objects[gap] = obj
    return objects


PLANKS = build_planks(TODO, plank_material("planches-a-faire", TODO))
print("PLANCHES", sum(len(o.data.polygons) for o in PLANKS.values()), "faces en", len(PLANKS), "tronçons",
      flush=True)


# --- Le centre du plateau : un éventail régulier plutôt qu'un polygone de centaines de côtés -------------
def poke_large_faces(min_sides=64):
    poked = 0
    for obj in terrain:
        if obj.name not in bpy.data.objects or obj.type != "MESH":
            continue
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        big = [f for f in bm.faces if len(f.verts) >= min_sides]
        if big:
            bmesh.ops.poke(bm, faces=big)
            bm.to_mesh(obj.data)
            poked += len(big)
        bm.free()
    return poked


print("POLYGONES AU CENTRE", poke_large_faces(), flush=True)

# --- Lumière : pas de reflets sur la terre, les jouets et l'herbe (comme la cuisson) -----------------------
bake.lights()
KEEP_SHEEN = ("planches-",)
for mat in bpy.data.materials:
    if mat.name.startswith(KEEP_SHEEN):
        continue
    for node in mat.node_tree.nodes if mat.node_tree else []:
        if node.bl_idname == "ShaderNodeBsdfPrincipled":
            node.inputs["Specular IOR Level"].default_value = 0.0

for mat in bpy.data.materials:
    if not mat.name.startswith(("peinture-", "c1-")) or not mat.node_tree:
        continue
    for node in mat.node_tree.nodes:
        if node.bl_idname == "ShaderNodeBsdfPrincipled":
            node.inputs["Specular IOR Level"].default_value = 0.25
            node.inputs["Roughness"].default_value = 0.45
            node.inputs["Coat Weight"].default_value = 0.0


scene = bpy.context.scene
scene.render.engine = "CYCLES"
cycles = scene.cycles
cycles.device = "CPU"
cycles.samples = SAMPLES
cycles.use_adaptive_sampling = True
cycles.use_denoising = True
cycles.denoiser = "OPENIMAGEDENOISE"
cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
cycles.denoising_prefilter = "ACCURATE"
cycles.max_bounces = 4
cycles.diffuse_bounces = 3
cycles.glossy_bounces = 0
scene.render.threads_mode = "FIXED"
scene.render.threads = THREADS
scene.render.film_transparent = True
scene.render.use_persistent_data = True
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.view_settings.exposure = 0.0
scene.view_settings.gamma = 1.0
settings = scene.render.image_settings
settings.file_format = "OPEN_EXR"
settings.color_mode = "RGBA"
settings.color_depth = "32"
settings.exr_codec = "ZIP"


def zone():
    """Zone rendue (plan image, mètres) : celle demandée, sinon tout ce que la caméra de l'app peut voir."""
    if os.environ.get("EXPLORER_TILES_ZONE"):
        return [float(v) for v in os.environ["EXPLORER_TILES_ZONE"].split(",")]
    return LAYOUT["renderedRect"]


X0, X1, V0, V1 = zone()
WIDTH, HEIGHT = round((X1 - X0) * PPM), round((V1 - V0) * PPM)
xc, vc = (X0 + X1) / 2, (V0 + V1) / 2
camera = bpy.data.objects.new("CarteCamera", bpy.data.cameras.new("CarteCamera"))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = "ORTHO"
camera.data.sensor_fit = "HORIZONTAL"
camera.data.ortho_scale = WIDTH / PPM
camera.data.clip_start, camera.data.clip_end = 1.0, 400.0
tilt = math.radians(90) - ELEVATION
view = Vector((0.0, math.sin(tilt), -math.cos(tilt)))
camera.location = Vector((xc, -vc / SIN, 0.0)) - view * 150.0
camera.rotation_euler = (tilt, 0.0, 0.0)
scene.render.resolution_x, scene.render.resolution_y = WIDTH, HEIGHT
scene.render.resolution_percentage = 100
X0, V0 = xc - WIDTH / 2 / PPM, vc - HEIGHT / 2 / PPM  # coin du pixel (0, 0), exact au pixel près
print("ZONE", WIDTH, "x", HEIGHT, "px", round(WIDTH * HEIGHT / 1e6, 2), "Mpx", flush=True)

GRADE = LAYOUT["grade"]
DITHER = np.random.default_rng(7)
SHADOW_TINT = np.array(srgb_to_linear(LAYOUT["gradeColors"]["shadows"]), dtype=np.float32)
LIGHT_TINT = np.array(srgb_to_linear(LAYOUT["gradeColors"]["highlights"]), dtype=np.float32)

# --- L'eau : calculée pour chaque pixel (lib/mapwater.py), d'après le shader de l'app -----------------------
# La carte rend le fond (vase, rive mouillée) ; l'eau est posée par-dessus. rewater.py peut la refaire sur
# des images déjà rendues.
WATER_GEOMETRY = (np.array(ns["ns"]["pi_outline"], dtype=np.float64), np.array(ns["ns"]["river"], dtype=np.float64),
                  float(ns["ns"]["half"]))
SUN = np.array(LAYOUT["sun"], dtype=np.float64)
SUN = SUN / np.linalg.norm(SUN)
VIEW = np.array([0.0, SIN, COS])  # vers la caméra orthographique (repère de l'app : x, y, z)
WATER_COLORS = {k: np.array(srgb_to_linear(v)) for k, v in LAYOUT["water"].items()}


def with_water(rgba, px0, py0):
    """Pose l'eau sur le morceau [px0…, py0…] du rendu (couleur linéaire prémultipliée)."""
    h, w = rgba.shape[:2]
    xs = X0 + (px0 + np.arange(w) + 0.5) / PPM
    vs = V0 + (py0 + np.arange(h) + 0.5) / PPM
    x, v = np.meshgrid(xs, vs)
    z = (v + mapwater.SURFACE * SCALE * COS) / SIN
    color, alpha, inside = mapwater.water(x, z, SCALE, WATER_GEOMETRY, WATER_COLORS, SUN, VIEW)
    if not (inside > -0.01).any():
        return rgba
    out = rgba.astype(np.float64)
    out[..., :3] = out[..., :3] * (1.0 - alpha) + color * alpha
    out[..., 3:4] = out[..., 3:4] + (1.0 - out[..., 3:4]) * alpha
    return out.astype(np.float32)


def graded(rgba):
    return mapwater.graded(rgba, GRADE, SHADOW_TINT, LIGHT_TINT, DITHER)


def render_crop(px0, py0, px1, py1, name, water=True, save=True, raw=False):
    """Rend [px0, px1) × [py0, py1) (lignes comptées du haut) avec une marge, l'étalonne et l'enregistre en
    PNG. `raw` rend la couleur linéaire telle quelle (passe des numéros de tronçon)."""
    bx0, by0 = max(px0 - PAD, 0), max(py0 - PAD, 0)
    bx1, by1 = min(px1 + PAD, WIDTH), min(py1 + PAD, HEIGHT)
    scene.render.use_border = True
    scene.render.use_crop_to_border = True
    scene.render.border_min_x, scene.render.border_max_x = bx0 / WIDTH, bx1 / WIDTH
    scene.render.border_min_y, scene.render.border_max_y = 1 - by1 / HEIGHT, 1 - by0 / HEIGHT
    exr = os.path.join(OUT, f"{name}.exr")
    scene.render.filepath = exr
    started = time.time()
    bpy.ops.render.render(write_still=True)
    image = bpy.data.images.load(exr)
    w, h = image.size
    pixels = np.empty(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    bpy.data.images.remove(image)
    os.remove(exr)
    rgba = pixels.reshape(h, w, 4)[::-1]  # Blender range les lignes de bas en haut
    # La bordure de Blender tombe au pixel près à quelques arrondis : on retire la marge à partir des bords réels.
    ox, oy = px0 - bx0, py0 - by0
    rgba = rgba[oy:oy + (py1 - py0), ox:ox + (px1 - px0)]
    if raw:
        return rgba
    rgba = graded(with_water(rgba, px0, py0) if water else rgba)
    if not save:
        return rgba
    out = bpy.data.images.new(name, px1 - px0, py1 - py0, alpha=True, float_buffer=False)
    out.colorspace_settings.name = "sRGB"
    out.pixels.foreach_set(np.ascontiguousarray(rgba[::-1]).ravel())
    out.filepath_raw = os.path.join(OUT, f"{name}.png")
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(out)
    seconds = round(time.time() - started, 1)
    print("MORCEAU", name, px1 - px0, "x", py1 - py0, seconds, "s", flush=True)
    return {"file": f"{name}.png", "x": px0, "y": py0, "width": px1 - px0, "height": py1 - py0, "seconds": seconds}


def crop_boxes():
    for row, py0 in enumerate(range(0, HEIGHT, CROP)):
        for col, px0 in enumerate(range(0, WIDTH, CROP)):
            yield row, col, px0, py0, min(px0 + CROP, WIDTH), min(py0 + CROP, HEIGHT)


def header():
    return {"regionId": LAYOUT["regionId"], "ppm": PPM, "elevation": 52, "x0": X0, "v0": V0, "width": WIDTH,
            "height": HEIGHT, "samples": SAMPLES, "layoutHash": LAYOUT.get("layoutHash")}


def ground_pass():
    """Le sol : terrain, eau, monuments, décors, herbe et planches grisées (le chemin encore à faire)."""
    crops = [render_crop(px0, py0, px1, py1, f"morceau-{row}-{col}") for row, col, px0, py0, px1, py1 in crop_boxes()]
    with open(os.path.join(OUT, "crops.json"), "w") as f:
        json.dump({**header(), "crops": crops, "seconds": round(time.time() - T0, 1)}, f, indent=1)


def index_material():
    """Couleur = numéro de la pièce (pass_index) : l'alpha prémultiplié s'annule en divisant par l'alpha."""
    mat = bpy.data.materials.new("numero-troncon")
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    out = next(n for n in nodes if n.bl_idname == "ShaderNodeOutputMaterial")
    for node in [n for n in nodes if n.bl_idname != "ShaderNodeOutputMaterial"]:
        nodes.remove(node)
    info = nodes.new("ShaderNodeObjectInfo")
    scale = nodes.new("ShaderNodeMath")
    scale.operation = "DIVIDE"
    scale.inputs[1].default_value = 255.0
    emission = nodes.new("ShaderNodeEmission")
    links.new(info.outputs["Object Index"], scale.inputs[0])
    links.new(scale.outputs["Value"], emission.inputs["Color"])
    links.new(emission.outputs["Emission"], out.inputs["Surface"])
    return mat


def done_planks_pass():
    """Les planches miel, tronçon par tronçon : l'app pose le tronçon i quand l'élève a dépassé le niveau i.
    Le reste de la scène est en découpe : il cache les planches et leur fait de l'ombre, mais reste transparent."""
    for obj in scene.objects:
        if obj.type == "MESH" and not obj.name.startswith("planches-"):
            obj.is_holdout = True
    for obj in PLANKS.values():
        bpy.data.objects.remove(obj, do_unlink=True)
    PLANKS.clear()
    PLANKS.update(build_planks(DONE, plank_material("planches-faites", DONE)))
    layer = np.zeros((HEIGHT, WIDTH, 4), dtype=np.float32)
    for row, col, px0, py0, px1, py1 in crop_boxes():
        layer[py0:py1, px0:px1] = render_crop(px0, py0, px1, py1, f"planches-{row}-{col}", water=False, save=False)
    numbers = index_material()
    for obj in PLANKS.values():
        obj.data.materials[0] = numbers
    cycles.samples = 4
    cycles.use_denoising = False
    index = np.full((HEIGHT, WIDTH), -1, dtype=np.int32)
    for row, col, px0, py0, px1, py1 in crop_boxes():
        raw = render_crop(px0, py0, px1, py1, f"numeros-{row}-{col}", raw=True)
        alpha = raw[..., 3]
        value = np.where(alpha > 0.01, raw[..., 0] / np.maximum(alpha, 1e-4) * 255.0, 0.0)
        index[py0:py1, px0:px1] = np.rint(value).astype(np.int32) - 1
    segments = []
    for gap in sorted(PLANKS):
        rows, cols = np.nonzero((index == gap) & (layer[..., 3] > 0.0))
        if rows.size == 0:
            continue
        y0, y1, x0, x1 = rows.min(), rows.max() + 1, cols.min(), cols.max() + 1
        sprite = layer[y0:y1, x0:x1].copy()
        sprite[..., 3] *= (index[y0:y1, x0:x1] == gap)
        name = f"troncon-{gap:02d}"
        image = bpy.data.images.new(name, int(x1 - x0), int(y1 - y0), alpha=True, float_buffer=False)
        image.pixels.foreach_set(np.ascontiguousarray(sprite[::-1]).ravel())
        image.filepath_raw = os.path.join(OUT, f"{name}.png")
        image.file_format = "PNG"
        image.save()
        bpy.data.images.remove(image)
        segments.append({"gap": gap, "file": f"{name}.png", "x": int(x0), "y": int(y0),
                         "width": int(x1 - x0), "height": int(y1 - y0)})
    with open(os.path.join(OUT, "segments.json"), "w") as f:
        json.dump({**header(), "segments": segments, "seconds": round(time.time() - T0, 1)}, f, indent=1)
    print("TRONÇONS", len(segments), flush=True)


PASS = os.environ.get("EXPLORER_TILES_PASS", "sol")
if PASS == "sol":
    ground_pass()
elif PASS == "planches":
    done_planks_pass()
else:
    raise SystemExit(f"EXPLORER_TILES_PASS inconnu : {PASS} (sol ou planches)")
print("FINI", PASS, round(time.time() - T0, 1), "s", flush=True)
