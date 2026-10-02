"""
Avatar des élèves, façon Mii : une figurine de jeu de plateau à grosse tête, sans genre imposé, que
chaque élève compose (peau, coiffure, tenue ; le visage est dessiné par l'app sur la tête).

- un squelette simple (bassin, dos, poitrine, tête, bras, avant-bras, mains, cuisses, tibias, pieds) ;
- « corps » (torse, bras, mains, jambes, pieds d'un seul tenant) et « tete » (avec les oreilles) ;
- les coiffures « cheveux-<style> » ;
- la tenue par défaut : « haut-tshirt », « bas-short », « chaussures-baskets » ;
- quatre animations : attente, marche, saut (victoire), salut.

Toutes les pièces sont liées au même squelette ; l'app affiche celles que l'élève a choisies et les
colore d'après le nom de leurs matières (peau, cheveux, tissu, tissu-2, semelle). Pas de texture :
la lumière est calculée par l'app, la figurine bouge.

Usage : blender -b -P tools/avatar-3d/avatar.py
        AVATAR_PREVIEW=/chemin/apercu.png blender -b -P tools/avatar-3d/avatar.py   (aperçu, sans export)
Sortie : assets/avatar/avatar.glb
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "explorer-3d"))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402

FPS = 30
OUT = os.path.join(geo.ROOT, "assets", "avatar", "avatar.glb")

geo.reset()
scene = bpy.context.scene
scene.render.fps = FPS

# Repère de Blender : x vers la gauche du personnage, -y devant lui (vers la caméra), z en haut.
# Les pieds sont à z = 0 ; la figurine mesure 1 m (l'app la met à l'échelle).

# ---------------------------------------------------------------------------
# Squelette
# ---------------------------------------------------------------------------
CENTER_BONES = (
    ("root", (0, 0, 0), (0, 0, 0.12), None),
    ("hips", (0, 0, 0.295), (0, 0, 0.38), "root"),
    ("spine", (0, 0, 0.38), (0, 0, 0.46), "hips"),
    ("chest", (0, 0, 0.46), (0, 0, 0.56), "spine"),
    ("head", (0, 0, 0.56), (0, 0, 0.99), "chest"),
)
SIDE_BONES = (
    ("upperarm", (0.145, 0, 0.515), (0.2, 0, 0.405), "chest"),
    ("forearm", (0.2, 0, 0.405), (0.228, 0, 0.315), "upperarm"),
    ("hand", (0.228, 0, 0.315), (0.238, 0, 0.255), "forearm"),
    ("thigh", (0.068, 0, 0.295), (0.07, 0, 0.17), "hips"),
    ("shin", (0.07, 0, 0.17), (0.07, 0, 0.07), "thigh"),
    ("foot", (0.07, 0, 0.07), (0.07, -0.075, 0.03), "shin"),
)
SIDES = (("L", 1), ("R", -1))
BONE_NAMES = [b[0] for b in CENTER_BONES] + [f"{b[0]}.{s}" for s, _ in SIDES for b in SIDE_BONES]


def build_armature():
    data = bpy.data.armatures.new("squelette")
    rig = bpy.data.objects.new("avatar", data)
    scene.collection.objects.link(rig)
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    bones = data.edit_bones
    for name, head, tail, parent in CENTER_BONES:
        bone = bones.new(name)
        bone.head, bone.tail, bone.roll = head, tail, 0.0
        if parent:
            bone.parent = bones[parent]
    for side, sx in SIDES:
        for name, head, tail, parent in SIDE_BONES:
            bone = bones.new(f"{name}.{side}")
            bone.head = (head[0] * sx, head[1], head[2])
            bone.tail = (tail[0] * sx, tail[1], tail[2])
            bone.roll = 0.0
            bone.parent = bones[parent if parent in ("chest", "hips") else f"{parent}.{side}"]
    bpy.ops.object.mode_set(mode="OBJECT")
    for pose_bone in rig.pose.bones:
        pose_bone.rotation_mode = "QUATERNION"
    return rig


# ---------------------------------------------------------------------------
# Outils de maillage
# ---------------------------------------------------------------------------
def link(name, bm):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj


def apply(obj):
    """Applique les modificateurs de l'objet."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return obj


def ellipsoid(bm, center, radius, scale=(1, 1, 1), segments=20):
    matrix = Matrix.Translation(center) @ Matrix.Diagonal((radius * scale[0], radius * scale[1], radius * scale[2], 1))
    bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=segments // 2, radius=1.0, matrix=matrix)


def remeshed(name, build, voxel=0.006, smooth=8, triangles=4000):
    """Pièces fondues en une surface lisse (remaillage par voxels), puis allégées."""
    bm = bmesh.new()
    build(bm)
    obj = link(name, bm)
    mod = obj.modifiers.new("Fusion", "REMESH")
    mod.mode = "VOXEL"
    mod.voxel_size = voxel
    if smooth:
        soft = obj.modifiers.new("Douceur", "SMOOTH")
        soft.iterations = smooth
        soft.factor = 0.6
    apply(obj)
    count = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    if count > triangles:
        mod = obj.modifiers.new("Allegement", "DECIMATE")
        mod.ratio = triangles / count
        apply(obj)
    return geo.smooth(obj)


def material(name, color):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.8
    return mat


def srgb(hexa):
    h = hexa.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in c) + (1.0,)


MATERIALS = {
    "peau": material("peau", srgb("#e9b48f")),
    "cheveux": material("cheveux", srgb("#5a3a22")),
    "tissu": material("tissu", srgb("#3f7fd8")),
    "tissu-2": material("tissu-2", srgb("#f2f2ee")),
    "semelle": material("semelle", srgb("#f4f1ea")),
}


def assign(obj, name):
    obj.data.materials.clear()
    obj.data.materials.append(MATERIALS[name])
    return obj


# ---------------------------------------------------------------------------
# Corps : pièces, classement des points et poids des os
# ---------------------------------------------------------------------------
SHOULDER, WRIST = Vector((0.145, 0, 0.515)), Vector((0.228, 0, 0.315))
HAND = Vector((0.234, 0, 0.282))
HIP, ANKLE = Vector((0.068, 0, 0.30)), Vector((0.07, 0, 0.075))
HEEL, TOE = Vector((0.07, 0.0, 0.04)), Vector((0.07, -0.07, 0.04))
HEAD_C = Vector((0, 0, 0.78))
HEAD_R = Vector((0.205, 0.19, 0.215))


def mirrored(v, sx):
    return Vector((v.x * sx, v.y, v.z))


def segment_t(p, a, b):
    ab = b - a
    return max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))


def segment_distance(p, a, b):
    t = segment_t(p, a, b)
    return (p - (a + (b - a) * t)).length, t


def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


TORSO_C, TORSO_R = 0.405, Vector((0.135, 0.108, 0.172))


def torso_distance(p):
    """Distance approchée à la surface du torse (l'œuf de `torso`), négative dedans."""
    k = max(-1.0, min(1.0, (TORSO_C - p.z) / TORSO_R.z))
    rx, ry = TORSO_R.x * (1 + 0.1 * k), TORSO_R.y * (1 + 0.05 * k)
    q = math.sqrt((p.x / rx) ** 2 + (p.y / ry) ** 2 + ((p.z - TORSO_C) / TORSO_R.z) ** 2)
    return (q - 1) * min(rx, ry)


def classify(p):
    """Partie du corps la plus proche d'un point : (partie, côté, position le long du membre)."""
    best = ("torse", "", 0.0)
    best_d = torso_distance(p)
    for side, sx in SIDES:
        for part, a, b, r in (("bras", SHOULDER, WRIST, 0.04), ("jambe", HIP, ANKLE, 0.052),
                              ("pied", HEEL, TOE, 0.042), ("main", HAND, HAND + Vector((0, 0, 1e-4)), 0.046)):
            d, t = segment_distance(p, mirrored(a, sx), mirrored(b, sx))
            if d - r < best_d:
                best, best_d = (part, side, t), d - r
    return best


def weights(p, part=None):
    """Poids des os pour un point, d'après sa partie du corps (calculée si elle n'est pas donnée)."""
    if part == "tete":
        return {"head": 1.0}
    name, side, t = classify(p)
    if name == "torse":
        hips = 1 - smoothstep(0.33, 0.4, p.z)
        chest = smoothstep(0.42, 0.5, p.z)
        w = {"hips": hips, "spine": max(0.0, 1 - hips - chest), "chest": chest}
        # Le haut des flancs suit un peu le bras : l'épaule ne s'étire pas quand il se lève.
        arm = 0.3 * smoothstep(0.09, 0.15, abs(p.x)) * smoothstep(0.45, 0.52, p.z)
        if arm > 0:
            w = {k: v * (1 - arm) for k, v in w.items()}
            w["upperarm.L" if p.x > 0 else "upperarm.R"] = arm
        return w
    if name == "bras":
        # Coude net : le bras d'une figurine est rigide, il ne plie qu'à l'articulation.
        upper = 1 - smoothstep(0.45, 0.55, t)
        shoulder = 0.25 * smoothstep(0.1, 0.0, t)
        return {f"upperarm.{side}": upper * (1 - shoulder), f"forearm.{side}": (1 - upper) * (1 - shoulder),
                "chest": shoulder}
    if name == "main":
        return {f"hand.{side}": 1.0}
    if name == "jambe":
        thigh = 1 - smoothstep(0.38, 0.62, t)
        hip = 0.5 * smoothstep(0.12, 0.0, t)
        return {f"thigh.{side}": thigh * (1 - hip), f"shin.{side}": (1 - thigh) * (1 - hip), "hips": hip}
    ankle = 0.5 * smoothstep(0.03, 0.065, p.z)
    return {f"foot.{side}": 1 - ankle, f"shin.{side}": ankle}


def assign_weights(obj, part=None):
    """Groupes de sommets (un par os, toujours dans le même ordre) et poids d'après la position."""
    groups = {name: obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name) for name in BONE_NAMES}
    for v in obj.data.vertices:
        for bone, w in weights(v.co, part).items():
            if w > 1e-3:
                groups[bone].add([v.index], w, "REPLACE")
    return obj


def inherit_groups(obj):
    """Groupes d'une copie du corps : les poids sont déjà dans le maillage, dans l'ordre du corps."""
    for name in BONE_NAMES:
        if not obj.vertex_groups.get(name):
            obj.vertex_groups.new(name=name)
    return obj


def bind(obj, rig):
    mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = rig
    obj.parent = rig
    return obj


def skin(obj, rig, part=None):
    return bind(assign_weights(obj, part), rig)


def torso(bm):
    """Torse d'une seule pièce, en forme d'œuf un peu plus large en bas : pas de pli sous les vêtements."""
    geom = bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=1.0)
    for v in geom["verts"]:
        x, y, z = v.co
        k = -z  # 1 en bas, -1 en haut
        v.co = Vector((x * TORSO_R.x * (1 + 0.1 * k), y * TORSO_R.y * (1 + 0.05 * k), TORSO_C + z * TORSO_R.z))


def body_parts(bm):
    torso(bm)
    for side, sx in SIDES:
        ellipsoid(bm, (0.13 * sx, 0, 0.5), 0.058)
        for k in range(7):
            f = k / 6
            ellipsoid(bm, mirrored(SHOULDER.lerp(WRIST, f), sx), 0.042 + (0.035 - 0.042) * f, segments=14)
        ellipsoid(bm, mirrored(HAND, sx), 0.046, (0.85, 0.95, 1.05))
        for k in range(8):
            f = k / 7
            ellipsoid(bm, mirrored(HIP.lerp(ANKLE, f), sx), 0.056 + (0.045 - 0.056) * f, segments=14)
        for k in range(4):
            ellipsoid(bm, mirrored(HEEL.lerp(TOE, k / 3), sx), 0.042, (1.0, 1.0, 0.9), segments=14)


def head_parts(bm):
    ellipsoid(bm, HEAD_C, 1.0, tuple(HEAD_R), segments=40)
    for side, sx in SIDES:
        ellipsoid(bm, (0.2 * sx, 0.005, 0.765), 0.042, (0.55, 0.9, 1.15), segments=14)


# ---------------------------------------------------------------------------
# Vêtements : coques posées sur le corps
# ---------------------------------------------------------------------------
def arm_cut(t, sx):
    """Plan perpendiculaire au bras, à la fraction t de l'épaule au poignet."""
    a, b = mirrored(SHOULDER, sx), mirrored(WRIST, sx)
    return a.lerp(b, t), (b - a).normalized()


def leg_cut(t, sx):
    a, b = mirrored(HIP, sx), mirrored(ANKLE, sx)
    return a.lerp(b, t), (b - a).normalized()


def shell(name, body, keep, offset, thickness, mat, cuts=()):
    """Copie du corps poussée vers l'extérieur, réduite aux faces gardées, puis épaissie. Les plans
    `cuts` (point, normale) coupent d'abord le maillage là où passent les ourlets : bords nets.
    Le vêtement garde les poids du corps qu'il recouvre (calculés avant le décalage : l'intérieur
    d'une manche, poussé vers le torse, suit bien le bras)."""
    bm = bmesh.new()
    bm.from_mesh(body.data)
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * offset
    for _ in range(6):
        bmesh.ops.smooth_vert(bm, verts=bm.verts[:], factor=0.5, use_axis_x=True, use_axis_y=True,
                              use_axis_z=True)
    for point, normal in cuts:
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=point, plane_no=normal)
    bm.normal_update()
    drop = [f for f in bm.faces if not keep(f.calc_center_median(), *classify(f.calc_center_median()))]
    bmesh.ops.delete(bm, geom=drop, context="FACES")
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    obj = inherit_groups(link(name, bm))
    mod = obj.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = -1
    apply(obj)
    return geo.smooth(assign(obj, mat))


def tshirt(body):
    cuts = [((0, 0, 0.295), (0, 0, 1))] + [arm_cut(0.42, sx) for _, sx in SIDES]
    return shell("haut-tshirt", body, lambda p, part, side, t: (part == "torse" and p.z > 0.295) or
                 (part == "bras" and t < 0.42), 0.016, 0.006, "tissu", cuts)


def shorts(body):
    cuts = [((0, 0, 0.355), (0, 0, 1))] + [leg_cut(0.46, sx) for _, sx in SIDES]
    return shell("bas-short", body, lambda p, part, side, t: (part == "torse" and p.z < 0.355) or
                 (part == "jambe" and t < 0.46), 0.011, 0.006, "tissu", cuts)


def sneakers(body):
    cuts = [leg_cut(0.95, sx) for _, sx in SIDES]
    shoe = shell("chaussures-baskets", body, lambda p, part, side, t: part == "pied" or
                 (part == "jambe" and t > 0.95), 0.012, 0.006, "tissu", cuts)

    def sole_parts(bm):
        # Semelle arrondie qui suit le pied, un peu plus large que lui, à plat sur le sol.
        for _, sx in SIDES:
            for k in range(6):
                c = mirrored(HEEL.lerp(TOE + Vector((0, -0.012, 0)), k / 5), sx)
                ellipsoid(bm, (c.x, c.y, 0.014), 0.054, (1.0, 1.0, 0.32), segments=20)

    sole = assign(remeshed("semelle", sole_parts, voxel=0.004, smooth=4, triangles=900), "semelle")
    assign_weights(sole)
    # La jonction réunit les matières des deux pièces : tissu (dessus) et semelle.
    return geo.smooth(geo.join([shoe, sole], "chaussures-baskets"))


# ---------------------------------------------------------------------------
# Coiffures
# ---------------------------------------------------------------------------
def head_direction(p):
    """Direction d'un point vu du centre de la tête, dans l'ellipsoïde ramené à une sphère."""
    d = Vector(((p.x - HEAD_C.x) / HEAD_R.x, (p.y - HEAD_C.y) / HEAD_R.y, (p.z - HEAD_C.z) / HEAD_R.z))
    return d.normalized()


def hairline(d, front, side, back):
    """Vrai si la direction est au-dessus de la lisière des cheveux (devant, côtés, derrière)."""
    azimuth = abs(math.atan2(d.x, -d.y)) / math.pi
    if azimuth < 0.5:
        limit = front + (side - front) * smoothstep(0.0, 1.0, azimuth / 0.5)
    else:
        limit = side + (back - side) * smoothstep(0.0, 1.0, (azimuth - 0.5) / 0.5)
    return math.asin(max(-1.0, min(1.0, d.z))) > limit


def on_head(azimuth, elevation, lift=1.0):
    """Point de la tête : azimut depuis l'avant (radians, positif vers la gauche du personnage), hauteur."""
    d = Vector((math.sin(azimuth) * math.cos(elevation), -math.cos(azimuth) * math.cos(elevation),
                math.sin(elevation)))
    return Vector((HEAD_C.x + d.x * HEAD_R.x * lift, HEAD_C.y + d.y * HEAD_R.y * lift, HEAD_C.z + d.z * HEAD_R.z * lift))


def scalp(bm, front, side, back, offset, thickness=0.03):
    """Calotte de cheveux : l'ellipsoïde de la tête agrandi, au-dessus de la lisière, épaissi vers l'intérieur."""
    tmp = bmesh.new()
    ellipsoid(tmp, HEAD_C, 1.0, tuple(HEAD_R * (1 + offset / 0.2)), segments=48)
    drop = [f for f in tmp.faces if not hairline(head_direction(f.calc_center_median()), front, side, back)]
    bmesh.ops.delete(tmp, geom=drop, context="FACES")
    mesh = bpy.data.meshes.new("tmp")
    tmp.to_mesh(mesh)
    obj = bpy.data.objects.new("tmp", mesh)
    scene.collection.objects.link(obj)
    mod = obj.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = -1
    apply(obj)
    bm.from_mesh(obj.data)
    bpy.data.objects.remove(obj, do_unlink=True)
    tmp.free()


def tufts(bm, spots, lift=1.06):
    for azimuth, elevation, radius, scale in spots:
        ellipsoid(bm, on_head(azimuth, elevation, lift), radius, scale, segments=16)


def hair_court(bm):
    scalp(bm, 0.45, 0.06, -0.45, 0.022)
    tufts(bm, [(a, 0.52 - 0.12 * abs(a), 0.05, (1.2, 1.0, 0.8)) for a in (-0.55, -0.25, 0.05, 0.35)], 1.04)


def hair_epis(bm):
    scalp(bm, 0.45, 0.06, -0.45, 0.022)
    tufts(bm, [(a, 0.5, 0.045, (1.2, 1.0, 0.8)) for a in (-0.5, -0.15, 0.2, 0.5)], 1.04)
    rng = random.Random(4)
    for k in range(9):
        azimuth = -2.4 + k * 0.6 + rng.uniform(-0.15, 0.15)
        elevation = 0.95 + rng.uniform(-0.1, 0.25)
        base = on_head(azimuth, elevation, 1.0)
        tip = on_head(azimuth, min(elevation + 0.45, 1.5), 1.55)
        axis = (tip - base)
        rot = axis.to_track_quat("Z", "Y").to_matrix().to_4x4()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.05, radius2=0.004, depth=axis.length,
                              matrix=Matrix.Translation((base + tip) / 2) @ rot)


def hair_carre(bm):
    scalp(bm, 0.3, -0.62, -0.72, 0.03)
    tufts(bm, [(a, 0.36, 0.055, (1.3, 1.0, 0.75)) for a in (-0.6, -0.3, 0.0, 0.3, 0.6)], 1.04)
    tufts(bm, [(s * 1.45, -0.42, 0.075, (0.8, 1.1, 1.2)) for s in (-1, 1)] +
          [(s * 2.3, -0.5, 0.08, (1.0, 0.9, 1.1)) for s in (-1, 1)] + [(math.pi, -0.55, 0.09, (1.3, 0.8, 1.0))],
          1.02)


def hair_long(bm):
    hair_carre(bm)
    for k in range(5):
        f = k / 4
        ellipsoid(bm, (0, 0.16 + 0.02 * f, 0.66 - 0.2 * f), 0.1 - 0.015 * f, (1.55, 0.55, 1.0), segments=16)


def hair_queue(bm):
    scalp(bm, 0.42, 0.02, -0.4, 0.02)
    tufts(bm, [(a, 0.48, 0.045, (1.2, 1.0, 0.8)) for a in (-0.45, -0.1, 0.25)], 1.04)
    for k, (y, z, r) in enumerate(((0.2, 0.88, 0.05), (0.26, 0.84, 0.055), (0.3, 0.76, 0.05), (0.31, 0.67, 0.04),
                                   (0.3, 0.6, 0.03))):
        ellipsoid(bm, (0, y, z), r, (1.0, 1.0, 1.15), segments=16)


def hair_chignons(bm):
    scalp(bm, 0.4, 0.02, -0.45, 0.02)
    tufts(bm, [(a, 0.46, 0.045, (1.2, 1.0, 0.8)) for a in (-0.4, 0.0, 0.4)], 1.04)
    for sx in (-1, 1):
        ellipsoid(bm, (0.135 * sx, 0.03, 0.965), 0.075, segments=20)


def hair_boucles(bm):
    scalp(bm, 0.42, 0.0, -0.45, 0.025)
    rng = random.Random(9)
    spots = []
    for k in range(70):
        azimuth = rng.uniform(-math.pi, math.pi)
        elevation = math.asin(rng.uniform(-0.3, 1.0))
        d = Vector((math.sin(azimuth) * math.cos(elevation), -math.cos(azimuth) * math.cos(elevation),
                    math.sin(elevation)))
        if hairline(d, 0.5, 0.05, -0.4):
            spots.append((azimuth, elevation, rng.uniform(0.055, 0.075), (1, 1, 1)))
    tufts(bm, spots, 1.1)


def hair_rase(bm):
    scalp(bm, 0.5, 0.1, -0.4, 0.007, thickness=0.012)


HAIRS = {
    "court": (hair_court, 0.005, 6),
    "epis": (hair_epis, 0.005, 3),
    "carre": (hair_carre, 0.006, 7),
    "long": (hair_long, 0.006, 7),
    "queue": (hair_queue, 0.005, 6),
    "chignons": (hair_chignons, 0.005, 6),
    "boucles": (hair_boucles, 0.006, 2),
    "rase": (hair_rase, 0.004, 2),
}


def build_hair(style):
    build, voxel, smooth = HAIRS[style]
    obj = remeshed(f"cheveux-{style}", build, voxel=voxel, smooth=smooth, triangles=2600)
    return assign(obj, "cheveux")


# ---------------------------------------------------------------------------
# Animations : poses calculées pour un temps t (secondes)
# ---------------------------------------------------------------------------
def X(deg):
    return Quaternion((1, 0, 0), math.radians(deg))


def Y(deg):
    return Quaternion((0, 1, 0), math.radians(deg))


def Z(deg):
    return Quaternion((0, 0, 1), math.radians(deg))


# Conventions, dans le repère du squelette : X(-a) avance une jambe ou un bras, X(+a) plie un genou ;
# Y(-a) écarte le bras gauche, Y(+a) le bras droit ; X(+a) penche la tête en avant.
REST_ARMS = {"upperarm.L": Y(-6), "upperarm.R": Y(6), "forearm.L": X(-8), "forearm.R": X(-8)}


def attente(t):
    s = 2 * math.pi * t / 2.4
    pose = dict(REST_ARMS)
    pose.update({"spine": X(1.5 * math.sin(s)), "chest": X(1.2 * math.sin(s + 0.5)),
                 "head": Z(3 * math.sin(s)) @ X(2 * math.sin(2 * s)),
                 "upperarm.L": Y(-6 - 2 * math.sin(s)), "upperarm.R": Y(6 + 2 * math.sin(s))})
    return pose, Vector((0, 0, 0.003 * math.sin(2 * s)))


def marche(t):
    s = 2 * math.pi * t / 0.8
    swing = 28 * math.sin(s)
    knee_l = 8 + 42 * max(0.0, math.cos(s))
    knee_r = 8 + 42 * max(0.0, -math.cos(s))
    pose = {
        "thigh.L": X(-swing), "thigh.R": X(swing),
        "shin.L": X(knee_l), "shin.R": X(knee_r),
        "foot.L": X(-0.4 * knee_l), "foot.R": X(-0.4 * knee_r),
        "upperarm.L": Y(-8) @ X(22 * math.sin(s)), "upperarm.R": Y(8) @ X(-22 * math.sin(s)),
        "forearm.L": X(-18), "forearm.R": X(-18),
        "hips": Z(6 * math.sin(s)), "spine": X(4), "chest": Z(-8 * math.sin(s)),
        "head": Z(3 * math.sin(s)) @ X(-2),
    }
    return pose, Vector((0, 0, 0.035 * abs(math.cos(s))))


SAUT_KEYS = (
    # temps, hauteur, cuisses, genoux, pieds, dos, bras (écart), bras (avant/arrière)
    (0.0, 0.0, 0, 8, 0, 0, 6, 0),
    (0.25, -0.05, -38, 70, -30, 16, 10, 35),
    (0.45, 0.22, -8, 22, 10, -6, 140, -25),
    (0.62, 0.2, -12, 30, 6, -4, 145, -25),
    (0.8, 0.02, -20, 34, -10, 2, 120, 0),
    (0.9, -0.04, -30, 55, -24, 12, 40, 20),
    (1.2, 0.0, 0, 8, 0, 0, 6, 0),
)


def saut(t):
    keys = SAUT_KEYS
    k = max(i for i, key in enumerate(keys) if key[0] <= t) if t < keys[-1][0] else len(keys) - 2
    a, b = keys[k], keys[min(k + 1, len(keys) - 1)]
    f = smoothstep(0.0, 1.0, (t - a[0]) / max(b[0] - a[0], 1e-6))
    v = [x + (y - x) * f for x, y in zip(a, b)]
    _, height, thigh, knee, foot, back, spread, swing = v
    pose = {
        "thigh.L": X(thigh) @ Y(-4), "thigh.R": X(thigh) @ Y(4),
        "shin.L": X(knee), "shin.R": X(knee), "foot.L": X(foot), "foot.R": X(foot),
        "spine": X(back), "head": X(-back * 0.6),
        "upperarm.L": Y(-spread) @ X(swing), "upperarm.R": Y(spread) @ X(swing),
        "forearm.L": X(-15), "forearm.R": X(-15),
    }
    return pose, Vector((0, 0, height))


def salut(t):
    s = 2 * math.pi * t / 1.6
    pose, _ = attente(t * 1.5)
    # Salut classique : bras à l'horizontale sur le côté, avant-bras levé qui balance de gauche à droite.
    wave = math.sin(2 * s)
    # Le bras reste sous l'horizontale (au-delà, le t-shirt s'étire sous l'aisselle) : c'est
    # l'avant-bras qui se lève, presque droit, et qui balance.
    pose.update({"upperarm.R": Y(50) @ X(-20), "forearm.R": Y(95 + 18 * wave),
                 "hand.R": Y(10 * math.sin(2 * s + 0.6)), "head": Z(-5 + 2 * wave) @ X(-3), "chest": Z(-3)})
    return pose, Vector((0, 0, 0.004 * math.sin(2 * s)))


ANIMATIONS = {"attente": (attente, 2.4, True), "marche": (marche, 0.8, True), "saut": (saut, 1.2, False),
              "salut": (salut, 1.6, True)}


def set_pose(rig, fn, t):
    pose, lift = fn(t)
    for pb in rig.pose.bones:
        rest = pb.bone.matrix_local.to_3x3().to_quaternion()
        q = pose.get(pb.name, Quaternion())
        pb.rotation_quaternion = rest.inverted() @ q @ rest
        pb.location = (0, 0, 0)
    root = rig.pose.bones["root"]
    root.location = root.bone.matrix_local.to_3x3().inverted() @ lift


def bake_actions(rig):
    rig.animation_data_create()
    for name, (fn, duration, loop) in ANIMATIONS.items():
        action = bpy.data.actions.new(name)
        action.use_fake_user = True
        rig.animation_data.action = action
        frames = round(duration * FPS)
        for frame in range(frames + 1):
            # Une boucle se referme sur sa première pose.
            set_pose(rig, fn, (frame % frames if loop else frame) / FPS)
            for pb in rig.pose.bones:
                pb.keyframe_insert("rotation_quaternion", frame=frame)
            rig.pose.bones["root"].keyframe_insert("location", frame=frame)
        print("ANIMATION", name, frames + 1, "images", flush=True)
    rig.animation_data.action = None
    for pb in rig.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = (0, 0, 0)


# ---------------------------------------------------------------------------
# Construction
# ---------------------------------------------------------------------------
rig = build_armature()
body = assign_weights(assign(remeshed("corps", body_parts, voxel=0.006, smooth=8, triangles=5200), "peau"))
head = assign_weights(assign(remeshed("tete", head_parts, voxel=0.006, smooth=4, triangles=2400), "peau"), "tete")
pieces = [body, head, tshirt(body), shorts(body), sneakers(body)]
hairs = [assign_weights(build_hair(style), "tete") for style in HAIRS]
for obj in pieces + hairs:
    bind(obj, rig)
for obj in pieces + hairs:
    print("TRIANGLES", obj.name, sum(len(p.vertices) - 2 for p in obj.data.polygons), flush=True)


# ---------------------------------------------------------------------------
# Aperçu : huit figurines, chacune sa peau, sa coiffure, ses couleurs et sa pose
# ---------------------------------------------------------------------------
def placeholder_face(name, rig_obj):
    """Visage provisoire de l'aperçu (dans l'app, il est dessiné et choisi par l'élève)."""
    bm = bmesh.new()
    for sx in (-1, 1):
        x, z = 0.072 * sx, 0.79
        y = -HEAD_R.y * math.sqrt(max(0.0, 1 - (x / HEAD_R.x) ** 2 - ((z - HEAD_C.z) / HEAD_R.z) ** 2)) - 0.004
        ellipsoid(bm, (x, y, z), 0.026, (0.8, 0.35, 1.15), segments=16)
    eyes = assign(link(f"{name}-yeux", bm), "cheveux")
    eyes.data.materials[0] = material("oeil", srgb("#2a2420"))
    bm = bmesh.new()
    smile = [(x, -0.188 + 0.02 * abs(x) / 0.05, 0.705 + 0.02 * (x / 0.04) ** 2) for x in
             [-0.04 + 0.08 * k / 8 for k in range(9)]]
    for a, b in zip(smile, smile[1:]):
        ellipsoid(bm, a, 0.007, segments=8)
    mouth = link(f"{name}-bouche", bm)
    mouth.data.materials.append(material("oeil", srgb("#2a2420")))
    bm = bmesh.new()
    for sx in (-1, 1):
        ellipsoid(bm, (0.12 * sx, -0.165, 0.735), 0.03, (1.0, 0.3, 0.7), segments=14)
    cheeks = link(f"{name}-joues", bm)
    cheeks.data.materials.append(material("joue", srgb("#f19a8e")))
    for part in (eyes, mouth, cheeks):
        skin(part, rig_obj, "tete")
    return [eyes, mouth, cheeks]


LOOKS = (
    # coiffure, peau, cheveux, haut, short, pose (animation, temps)
    ("court", "#f1c6a3", "#5a3a22", "#3f7fd8", "#2f3b55", ("attente", 0.3)),
    ("queue", "#c98b62", "#1f1a17", "#e2574c", "#3a4a6b", ("marche", 0.2)),
    ("boucles", "#7a4a2e", "#191412", "#f2b631", "#2f6b4f", ("saut", 0.55)),
    ("carre", "#f4d2b8", "#d9a04a", "#7a5cc8", "#2b2f45", ("salut", 0.35)),
    ("epis", "#e2a87e", "#b8452c", "#2fa36b", "#38425c", ("marche", 0.6)),
    ("chignons", "#a86a45", "#2d1d14", "#f08bb0", "#41507a", ("attente", 1.4)),
    ("long", "#f6dcc6", "#6e4a2c", "#4cb5c8", "#5b3c2c", ("salut", 0.9)),
    ("rase", "#5c3a26", "#151110", "#ef8a3a", "#26313f", ("saut", 0.28)),
)


def clone(src_rig, objs, location, colors):
    new_rig = src_rig.copy()
    scene.collection.objects.link(new_rig)
    new_rig.location = location
    out = []
    for obj in objs:
        c = obj.copy()
        c.data = obj.data.copy()
        scene.collection.objects.link(c)
        c.parent = new_rig
        c.modifiers["Armature"].object = new_rig
        for i, mat in enumerate(c.data.materials):
            if mat and mat.name.split(".")[0] in colors:
                copy = mat.copy()
                copy.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = srgb(
                    colors[mat.name.split(".")[0]])
                c.data.materials[i] = copy
        out.append(c)
    return new_rig, out


if os.environ.get("AVATAR_PREVIEW"):
    spacing = 0.56
    for k, (style, skin_c, hair_c, top_c, bottom_c, (anim, t)) in enumerate(LOOKS):
        chosen = [body, head, pieces[2], pieces[3], pieces[4], hairs[list(HAIRS).index(style)]]
        colors = {"peau": skin_c, "cheveux": hair_c}
        new_rig, objs = clone(rig, chosen, ((k - (len(LOOKS) - 1) / 2) * spacing, 0, 0), colors)
        for obj in objs:
            if obj.name.startswith("haut"):
                obj.data.materials[0] = material(f"haut-{k}", srgb(top_c))
            if obj.name.startswith("bas"):
                obj.data.materials[0] = material(f"bas-{k}", srgb(bottom_c))
        face = placeholder_face(f"f{k}", new_rig)
        for part in face:
            part.parent = new_rig
        set_pose(new_rig, ANIMATIONS[anim][0], t)
        new_rig.rotation_euler.z = math.radians(float(os.environ.get("AVATAR_TURN", "0")))
    for obj in [rig] + pieces + hairs:
        obj.hide_render = True
    ground = geo.box((0, 0, -0.05), (spacing * len(LOOKS) + 1.5, 3.0, 0.1), M.grass(), bevel_width=0)
    bake.lights()
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = int(os.environ.get("AVATAR_SAMPLES", "24"))
    scene.cycles.use_denoising = True
    scene.cycles.glossy_bounces = 0
    scene.render.resolution_x, scene.render.resolution_y = 2400, 820
    scene.view_settings.view_transform = "Standard"
    data = bpy.data.cameras.new("Camera")
    data.angle = math.radians(30)
    camera = bpy.data.objects.new("Camera", data)
    scene.collection.objects.link(camera)
    camera.location = (0, -9.4, 2.2)
    target = bpy.data.objects.new("Visee", None)
    target.location = (0, 0, 0.5)
    if os.environ.get("AVATAR_CLOSE"):
        # Gros plan sur une figurine (son rang dans LOOKS), pour vérifier les détails.
        k = int(os.environ["AVATAR_CLOSE"])
        cx = (k - (len(LOOKS) - 1) / 2) * spacing
        camera.location = (cx + 0.5, -2.2, 0.75)
        target.location = (cx, 0, 0.32)
        scene.render.resolution_x, scene.render.resolution_y = 1000, 1000
    scene.collection.objects.link(target)
    camera.constraints.new("TRACK_TO").target = target
    scene.camera = camera
    scene.render.filepath = os.environ["AVATAR_PREVIEW"]
    bpy.ops.render.render(write_still=True)
    raise SystemExit(0)

# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------
bake_actions(rig)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
for obj in [rig] + pieces + hairs:
    obj.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=False,
    export_skins=True,
    export_animations=True,
    export_animation_mode="ACTIONS",
    export_materials="EXPORT",
    export_morph=False,
)
print("GLB", OUT, os.path.getsize(OUT), "octets")
