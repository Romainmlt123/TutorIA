"""Figurine vernie aux proportions A1, composée par chaque élève dans l'app.

Le visage est dessiné par l'app sur « tete ». Le modèle comprend « corps », les coiffures
« cheveux-<style> », la tenue par défaut (« haut-tshirt », « bas-short », « chaussures-baskets »)
et six animations : attente, marche, saut, salut, bravo et encouragement. La forme « fort » module
la carrure de -1 (fine) à 1 (large). Toutes les pièces sont liées au même squelette.

Usage : blender -b -P tools/avatar-3d/avatar.py
Sortie : assets/avatar/avatar.glb

Aperçus et contrôles :
- AVATAR_PREVIEW : chemin du rendu d'aperçu ; sans AVATAR_EXPORT_OUT, termine sans exporter.
- AVATAR_TURN : rotation horizontale en degrés.
- AVATAR_BUILD : carrure (-1 fine, 0 normale, 1 large).
- AVATAR_CLOSE : active le gros plan ; « shoulder » centre l'image sur les épaules.
- AVATAR_WEAR : pièces à porter, séparées par des virgules.
- AVATAR_FOCUS_Z : hauteur ciblée par la caméra en gros plan.
- AVATAR_ORTHO : échelle de la caméra orthographique.
- AVATAR_ANIM : attente, marche, saut, salut, bravo ou encouragement.
- AVATAR_ANIM_T : instant de l'animation, en secondes.
- AVATAR_HAIR_STYLE : coiffure affichée dans le gros plan.
- AVATAR_COVERAGE=1 : lance le contrôle en aperçu ; il s'exécute toujours à l'export.
- AVATAR_TOP=sweat : remplace le t-shirt par le sweat dans l'aperçu.
- AVATAR_HAIR_PREVIEW=1 : planche de toutes les coiffures.
- AVATAR_CAMERA_HEIGHT_OFFSET : décalage vertical de caméra pour l'aperçu.
- AVATAR_EXPORT_OUT : chemin facultatif du GLB exporté après l'aperçu.
- AVATAR_SAMPLES : nombre d'échantillons Cycles du rendu d'aperçu (24 par défaut).
"""
import math
import json
import os
import random
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from itertools import product
from typing import Callable

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree

TORSO_COLLISION = None

HEAD_C, HEAD_R = Vector((0, 0, 0.775)), Vector((0.225, 0.225, 0.225))
TORSO_C, TORSO_R = 0.405, Vector((0.145, 0.116, 0.172))
SHOULDER, ELBOW, WRIST = Vector((0.156, 0, 0.515)), Vector((0.223, 0, 0.408)), Vector((0.278, 0, 0.32))
HAND, HIP, KNEE, ANKLE = Vector((0.298, 0, 0.288)), Vector((0.068, 0, 0.30)), Vector((0.07, 0, 0.17)), Vector((0.07, 0, 0.075))
HEEL, TOE = Vector((0.07, 0, 0.04)), Vector((0.07, -0.085, 0.03))
ARM_RADII, LEG_RADII, HAND_RADIUS, THUMB_RADIUS, FOOT_RADIUS = (0.042, 0.035), (0.056, 0.045), 0.046, 0.019, 0.042
NECK_SEGMENTS = 9
NECK_TRIANGLE_LIMIT = 64
NECK_HEAD_OVERLAP = 0.0125
NECK_BLEND_HEIGHT = 0.015
NECK_ZONE_MARGIN = 0.0035
NECK_VERTEX_WEIGHTS = {}
NECK_BASE_Z = TORSO_C + TORSO_R.z * 0.61

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "explorer-3d"))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402

FPS = 30
OUT = os.environ.get("AVATAR_OUT", os.path.join(geo.ROOT, "assets", "avatar", "avatar.glb"))

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
    ("upperarm", tuple(SHOULDER), tuple(ELBOW), "chest"),
    ("forearm", tuple(ELBOW), tuple(WRIST), "upperarm"),
    ("hand", tuple(WRIST), tuple(HAND), "forearm"),
    ("thigh", tuple(HIP), tuple(KNEE), "hips"),
    ("shin", tuple(KNEE), tuple(ANKLE), "thigh"),
    ("foot", tuple(ANKLE), tuple(TOE), "shin"),
)
SIDES = (("L", 1), ("R", -1))
BONE_NAMES = (
    [b[0] for b in CENTER_BONES]
    + [f"{b[0]}.{s}" for s, _ in SIDES for b in SIDE_BONES]
)
MAX_EXPORT_BONES = 30
MAX_SKIN_INFLUENCES = 4
SKINNING_WEIGHT_SMOOTH_FACTOR = 0.5
SKINNING_WEIGHT_SMOOTH_PASSES = 5
SKINNING_BORDER_WEIGHT_SMOOTH_PASSES = 1
OPEN_EDGE_ATTRIBUTE = "avatar_open_edge"
VISIBLE_DEFECT_GRID_STEP = 0.004
VISIBLE_DEFECT_OPEN_EDGE_DISTANCE = 0.025
VISIBLE_DEFECT_EDGE_SAMPLE_STEP = 0.002
VISIBLE_DEFECT_MAX_REPORTS = 10
VISIBLE_DEFECT_CLUSTER_STEP = 0.02
VISIBLE_DEFECT_CLUSTER_LIMIT = 20
BODY_ZONE_MASK_RAY_TOLERANCE = 0.003
BODY_ZONE_MASK_RAY_START_SCALE = 4.0


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


def validate_export_rig(rig):
    bone_count = len(rig.data.bones)
    if bone_count > MAX_EXPORT_BONES:
        raise RuntimeError(f"Export avatar bloqué : {bone_count} os dépasse le maximum {MAX_EXPORT_BONES}")
    if bone_count != len(BONE_NAMES) or {bone.name for bone in rig.data.bones} != set(BONE_NAMES):
        raise RuntimeError(f"Armature inattendue : {bone_count} os, attendu {len(BONE_NAMES)}")
    if any(pose_bone.constraints for pose_bone in rig.pose.bones):
        raise RuntimeError("Export avatar bloqué : les contraintes doivent être cuites puis retirées")
    action_names = {action.name for action in bpy.data.actions}
    missing_actions = set(ANIMATIONS) - action_names
    if missing_actions:
        raise RuntimeError(f"Actions manquantes à l’export : {sorted(missing_actions)}")
    print("RIG_EXPORT_CHECK", "bones", bone_count, "actions", len(ANIMATIONS), "constraints", 0, flush=True)


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


def smooth_by_angle(obj, angle=math.radians(50)):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    if hasattr(obj.data, "set_sharp_from_angle"):
        obj.data.set_sharp_from_angle(angle=angle)
    return obj


def ellipsoid(bm, center, radius, scale=(1, 1, 1), segments=20, rotation=None):
    orient = rotation.to_matrix().to_4x4() if rotation else Matrix.Identity(4)
    matrix = Matrix.Translation(center) @ orient @ Matrix.Diagonal(
        (radius * scale[0], radius * scale[1], radius * scale[2], 1)
    )
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
    bsdf.inputs["Roughness"].default_value = 0.34
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.38
    return mat


def srgb(hexa):
    h = hexa.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in c) + (1.0,)


BASE_SKIN = "#e9b48f"
MATERIALS = {
    "peau": material("peau", srgb(BASE_SKIN)),
    "cheveux": material("cheveux", srgb("#5a3a22")),
    "tissu": material("tissu", srgb("#3f7fd8")),
    "tissu-2": material("tissu-2", srgb("#f2f2ee")),
    "semelle": material("semelle", srgb("#f4f1ea")),
    # Détails fixes de la garde-robe (bandeau du chapeau, sangles, cordons) : brun sombre.
    "detail": material("detail", srgb("#3b3128")),
    # Verres des lunettes de soleil et pierres de la couronne : couleurs fixes.
    "verre": material("verre", srgb("#1d2433")),
    "bijou": material("bijou", srgb("#d23a4a")),
}
VALID_MATERIALS = {"peau", "cheveux", "tissu", "tissu-2", "semelle", "detail", "verre", "bijou"}


def assign(obj, name):
    obj.data.materials.clear()
    obj.data.materials.append(MATERIALS[name])
    return obj


def validate_materials(objects):
    for obj in objects:
        if not obj.data.materials:
            raise RuntimeError(f"{obj.name}: aucun matériau")
        for polygon in obj.data.polygons:
            index = polygon.material_index
            if index >= len(obj.data.materials) or obj.data.materials[index] is None:
                raise RuntimeError(f"{obj.name}: face {polygon.index} sans matériau")
            name = obj.data.materials[index].name.split(".")[0]
            if name not in VALID_MATERIALS:
                raise RuntimeError(f"{obj.name}: matériau inconnu {name}")


# ---------------------------------------------------------------------------
# Corps : pièces, classement des points et poids des os
# ---------------------------------------------------------------------------
# Les bras pendent un peu écartés du torse : collés, ils s'y fondaient sous l'aisselle, et le
# t-shirt y gardait un bout de tissu quand le bras bougeait.
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


def torso_profile(s):
    """Rayons du torse selon la hauteur réduite s (-1 bassin, 1 haut des épaules) : poitrine
    pleine, taille légèrement marquée, bassin à peine plus large que la taille."""
    hips = np.maximum(-s, 0.0) ** 1.5
    rx = TORSO_R.x * (1.0 + 0.06 * np.exp(-((s - 0.42) / 0.35) ** 2) - 0.05 * np.exp(-((s + 0.3) / 0.32) ** 2)
                      + 0.1 * hips)
    ry = TORSO_R.y * (1.0 + 0.03 * np.exp(-((s - 0.3) / 0.4) ** 2) - 0.03 * np.exp(-((s + 0.3) / 0.32) ** 2)
                      + 0.05 * hips)
    return rx, ry


def torso_sdf(x, y, z):
    """Distance approchée au torse : section en super-ellipse (devant moins bombé qu'un œuf),
    haut plus carré que le bas pour asseoir les épaules. Négative dedans. Marche sur des tableaux."""
    s = np.clip((z - TORSO_C) / TORSO_R.z, -1.0, 1.0)
    rx, ry = torso_profile(s)
    q = ((np.abs(x) / rx) ** 2.5 + (np.abs(y) / ry) ** 2.5) ** (1 / 2.5)
    m = np.where(z > TORSO_C, 2.3, 2.0)
    v = np.abs(z - TORSO_C) / TORSO_R.z
    total = (q ** m + v ** m) ** (1 / m)
    return (total - 1) * np.minimum(np.minimum(rx, ry), TORSO_R.z)


def torso_distance(p):
    """Distance approchée à la surface du torse, négative dedans."""
    return float(torso_sdf(p[0], p[1], p[2]))


def classify(p):
    """Partie du corps la plus proche d'un point : (partie, côté, position le long du membre)."""
    best = ("torse", "", 0.0)
    best_d = torso_distance(p)
    for side, sx in SIDES:
        for part, a, b, r in (("bras", SHOULDER, WRIST, sum(ARM_RADII) / 2),
                              ("jambe", HIP, ANKLE, sum(LEG_RADII) / 2),
                              ("pied", HEEL, TOE, FOOT_RADIUS), ("main", HAND, HAND + Vector((0, 0, 1e-4)),
                                                                  HAND_RADIUS + 0.008)):
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
    return {f"foot.{side}": 1.0}


def assign_weights(obj, part=None):
    """Groupes de sommets (un par os, toujours dans le même ordre) et poids d'après la position."""
    groups = {name: obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name) for name in BONE_NAMES}
    for v in obj.data.vertices:
        for bone, w in weights(v.co, part).items():
            if w > 1e-3:
                groups[bone].add([v.index], w, "REPLACE")
    return obj


def neck_parameters():
    global NECK_BASE_Z

    head_bottom = HEAD_C.z - HEAD_R.z
    top = head_bottom + NECK_HEAD_OVERLAP
    section = max(0.0, 1.0 - ((top - HEAD_C.z) / HEAD_R.z) ** 2)
    radius = 0.75 * HEAD_R.x * math.sqrt(section)
    return NECK_BASE_Z, top, radius


def is_neck_region(point):
    bottom, top, radius = neck_parameters()
    radial_distance = math.hypot(point.x, point.y)
    return (
        bottom - NECK_ZONE_MARGIN <= point.z <= top + NECK_ZONE_MARGIN
        and abs(radial_distance - radius) <= NECK_ZONE_MARGIN
    )


def add_neck_geometry(body):
    bottom, top, radius = neck_parameters()
    blend_top = min(bottom + NECK_BLEND_HEIGHT, top)
    ring_heights = (bottom, blend_top, top)
    bm = bmesh.new()
    bm.from_mesh(body.data)
    ring_vertices = []
    neck_vertices = []
    neck_heights = []
    for height in ring_heights:
        ring = [
            bm.verts.new(
                (
                    radius * math.cos(2 * math.pi * index / NECK_SEGMENTS),
                    radius * math.sin(2 * math.pi * index / NECK_SEGMENTS),
                    height,
                )
            )
            for index in range(NECK_SEGMENTS)
        ]
        ring_vertices.append(ring)
        neck_vertices.extend(ring)
        neck_heights.extend([height] * NECK_SEGMENTS)

    neck_faces = []
    for lower, upper in zip(ring_vertices, ring_vertices[1:]):
        for index in range(NECK_SEGMENTS):
            following = (index + 1) % NECK_SEGMENTS
            neck_faces.append(
                bm.faces.new(
                    (lower[index], lower[following], upper[following], upper[index])
                )
            )
    neck_faces.append(bm.faces.new(tuple(reversed(ring_vertices[0]))))
    neck_faces.append(bm.faces.new(tuple(ring_vertices[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=neck_faces)
    triangle_count = sum(len(face.verts) - 2 for face in neck_faces)
    if triangle_count > NECK_TRIANGLE_LIMIT:
        bm.free()
        raise RuntimeError(f"Cou trop détaillé : {triangle_count} triangles")

    bm.verts.ensure_lookup_table()
    bm.verts.index_update()
    neck_vertices_data = [
        (vertex.index, vertex.co.copy(), height)
        for vertex, height in zip(neck_vertices, neck_heights)
    ]
    bm.to_mesh(body.data)
    bm.free()
    body.data.update()

    chest = body.vertex_groups.get("chest")
    head = body.vertex_groups.get("head")
    if chest is None or head is None:
        raise RuntimeError("Groupes d'os manquants pour le cou")
    for index, expected, height in neck_vertices_data:
        if (body.data.vertices[index].co - expected).length > 1e-6:
            raise RuntimeError("Index de sommet du cou incohérent après fusion")
        head_weight = min(1.0, max(0.0, (height - bottom) / NECK_BLEND_HEIGHT))
        NECK_VERTEX_WEIGHTS[index] = (1.0 - head_weight, head_weight)
        if head_weight < 1.0:
            chest.add([index], 1.0 - head_weight, "REPLACE")
        if head_weight > 0.0:
            head.add([index], head_weight, "REPLACE")

    print(
        "NECK_GEOMETRY",
        f"triangles={triangle_count}",
        f"radius={radius:.4f}",
        f"height={top - bottom:.4f}",
        f"head_weight=100%",
        flush=True,
    )
    return body


def restore_neck_weights(body):
    groups = {group.index: group.name for group in body.vertex_groups}
    by_name = {group.name: group for group in body.vertex_groups}
    for index, weights_by_bone in NECK_VERTEX_WEIGHTS.items():
        for membership in list(body.data.vertices[index].groups):
            if groups[membership.group] in BONE_NAMES:
                body.vertex_groups[membership.group].remove([index])
        for bone, weight in zip(("chest", "head"), weights_by_bone):
            if weight > 0:
                by_name[bone].add([index], weight, "REPLACE")
        actual = {
            groups[membership.group]: membership.weight
            for membership in body.data.vertices[index].groups
            if groups[membership.group] in BONE_NAMES
        }
        expected = {
            bone: weight
            for bone, weight in zip(("chest", "head"), weights_by_bone)
            if weight > 0
        }
        if actual.keys() != expected.keys() or any(
            abs(actual[bone] - weight) > 1e-5 for bone, weight in expected.items()
        ):
            raise RuntimeError(f"Poids du cou invalides au sommet {index}: {actual}")


def restore_neck_geometry(body):
    shape_keys = body.data.shape_keys.key_blocks if body.data.shape_keys else None
    basis = shape_keys.get("Basis") if shape_keys else None
    if basis is None:
        raise RuntimeError("Base de géométrie du cou absente")
    for index in NECK_VERTEX_WEIGHTS:
        body.data.vertices[index].co = basis.data[index].co.copy()
    body.data.update()


def rigid_body_groups(body):
    assignments = {}
    for vertex in body.data.vertices:
        part, side, _ = classify(vertex.co)
        if part == "main":
            assignments[vertex.index] = f"hand.{side}"
        elif part == "pied":
            assignments[vertex.index] = f"foot.{side}"
    return assignments


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
    """Torse arrondi, légèrement élargi vers le bas."""
    geom = bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1.0)
    for v in geom["verts"]:
        x, y, z = v.co
        k = -z
        v.co = Vector((x * TORSO_R.x * (1 + 0.1 * k), y * TORSO_R.y * (1 + 0.05 * k),
                       TORSO_C + z * TORSO_R.z))


def smin(a, b, k):
    """Union douce de deux distances : la jonction s'arrondit sur une largeur k."""
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b + (a - b) * h - k * h * (1 - h)


def capsule_sdf(px, py, pz, a, b, ra, rb):
    ab = b - a
    t = np.clip(((px - a.x) * ab.x + (py - a.y) * ab.y + (pz - a.z) * ab.z) / ab.length_squared, 0.0, 1.0)
    dx, dy, dz = px - (a.x + ab.x * t), py - (a.y + ab.y * t), pz - (a.z + ab.z * t)
    return np.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t)


TRUNK_VOXEL = 0.003


def trunk_field(return_parts=False):
    """Torse, épaules, bras et jambes en un seul champ de distance : l'épaule naît du torse
    (union douce) au lieu d'un bras collé sur un œuf."""
    xs = np.arange(-0.34, 0.34, TRUNK_VOXEL)
    ys = np.arange(-0.18, 0.18, TRUNK_VOXEL)
    zs = np.arange(0.0, 0.63, TRUNK_VOXEL)
    px, py, pz = np.meshgrid(xs, ys, zs, indexing="ij")
    torso = torso_sdf(px, py, pz)
    field = torso
    parts = {"torso": torso, "yoke": {}, "deltoid": {}, "arm": {}, "grid": (px, py, pz)}
    for side, sx in SIDES:
        shoulder, wrist = mirrored(SHOULDER, sx), mirrored(WRIST, sx)
        yoke = capsule_sdf(px, py, pz, Vector((0.055 * sx, 0.0, SHOULDER.z + 0.022)),
                           shoulder + Vector((0.0, 0.0, -0.002)), 0.045, 0.043)
        parts["yoke"][side] = yoke
        field = smin(field, yoke, 0.055)
        deltoid = capsule_sdf(px, py, pz, shoulder, shoulder.lerp(wrist, 0.3), ARM_RADII[0] * 1.14, ARM_RADII[0] * 1.02)
        parts["deltoid"][side] = deltoid
        field = smin(field, deltoid, 0.03)
        arm = capsule_sdf(px, py, pz, shoulder, wrist, ARM_RADII[0], ARM_RADII[1])
        parts["arm"][side] = arm
        field = smin(field, arm, 0.016)
        # Aisselle : sous l'épaule, on retire ce qui est à la fois près du torse et près du bras,
        # pour un vrai creux qui détache le bras du flanc.
        pit = np.maximum(np.maximum(torso, arm) - 0.013, pz - (SHOULDER.z - 0.028))
        field = -smin(-field, pit, PIT_ROUND)
        leg = capsule_sdf(px, py, pz, mirrored(HIP, sx), mirrored(ANKLE, sx), LEG_RADII[0], LEG_RADII[1])
        field = smin(field, leg, 0.02)
    origin = (xs[0], ys[0], zs[0])
    return (field, origin, parts) if return_parts else (field, origin)


def extract_field_mesh(bm, field, origin, name):
    import openvdb
    grid = openvdb.FloatGrid(-1.0)
    grid.copyFromArray((0.01 - field).astype(np.float32))
    grid.name = "density"
    grid.transform = openvdb.createLinearTransform(voxelSize=TRUNK_VOXEL)
    path = os.path.join(os.environ.get("TMPDIR", "/tmp"), f"avatar-{name}-{os.getpid()}.vdb")
    openvdb.write(path, grids=[grid])
    volume = bpy.data.volumes.new("tronc-champ")
    volume.filepath = path
    holder = bpy.data.objects.new("tronc-champ", volume)
    holder.location = origin
    bpy.context.collection.objects.link(holder)
    carrier = bpy.data.objects.new("tronc-surface", bpy.data.meshes.new("tronc-surface"))
    bpy.context.collection.objects.link(carrier)
    mod = carrier.modifiers.new("Surface", "VOLUME_TO_MESH")
    mod.object = holder
    mod.grid_name = "density"
    mod.threshold = 0.01
    mod.resolution_mode = "GRID"
    depsgraph = bpy.context.evaluated_depsgraph_get()
    surface = bmesh.new()
    surface.from_object(carrier, depsgraph)
    mesh = bpy.data.meshes.new("tronc-temp")
    surface.to_mesh(mesh)
    surface.free()
    bm.from_mesh(mesh)
    for obj in (carrier, holder):
        bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(mesh)
    os.remove(path)


def trunk_mesh(bm):
    field, origin = trunk_field()
    extract_field_mesh(bm, field, origin, "tronc")


def body_parts(bm):
    trunk_mesh(bm)
    for side, sx in SIDES:
        ellipsoid(bm, mirrored(HAND, sx), HAND_RADIUS, (0.9, 0.95, 1.08), segments=24)
        thumb = HAND + Vector((THUMB_RADIUS * 0.9, -0.02, THUMB_RADIUS * 0.42))
        ellipsoid(bm, mirrored(thumb, sx), THUMB_RADIUS * 1.08, (0.86, 0.78, 1.2), segments=20)
        for k in range(7):
            f = k / 6
            ellipsoid(bm, mirrored(HEEL.lerp(TOE, f), sx), FOOT_RADIUS * (1 - 0.06 * f),
                      (1.0, 1.0, 0.92 - 0.27 * f), segments=18)


def head_parts(bm):
    ellipsoid(bm, HEAD_C, 1.0, tuple(HEAD_R), segments=56)
    for side, sx in SIDES:
        ellipsoid(bm, (HEAD_R.x * 0.94 * sx, 0.0, HEAD_C.z - 0.015), 0.036,
                  (0.68, 0.82, 1.0), segments=22)


# ---------------------------------------------------------------------------
# Vêtements : coques posées sur le corps
# ---------------------------------------------------------------------------
HEM_BUILD_GAIN = 1.0
PIT_ROUND = 0.01
SHELL_SMOOTH_ITERATIONS = 4
SLEEVE_TILT = 0.35
HEM_MARGIN = 0.012


@dataclass(frozen=True)
class CutPlane:
    point: Vector
    normal: Vector
    kept_side: int
    parts: tuple[str, ...]
    side: int | None = None


def cut_plane(point, normal, kept_side, parts, side=None):
    if kept_side not in (-1, 1):
        raise ValueError("Le côté gardé d'une coupe doit valoir -1 ou 1")
    return CutPlane(Vector(point), Vector(normal).normalized(), kept_side, tuple(parts), side)


def sleeve_cut(t, sx, tilt):
    """Ourlet de manche : plan du bras penché vers l'horizontale, pour un dessous de manche court."""
    point, axis = arm_cut(t, sx)
    return point, (axis * (1 - tilt) + Vector((0, 0, -tilt))).normalized()


def arm_cut(t, sx):
    """Plan perpendiculaire au bras, à la fraction t de l'épaule au poignet."""
    a, b = mirrored(SHOULDER, sx), mirrored(WRIST, sx)
    return a.lerp(b, t), (b - a).normalized()


def leg_cut(t, sx):
    a, b = mirrored(HIP, sx), mirrored(ANKLE, sx)
    return a.lerp(b, t), (b - a).normalized()


def tshirt_cuts():
    cuts = [cut_plane((0, 0, 0.28), (0, 0, 1), 1, ("torse", "jambe"))]
    for _, sx in SIDES:
        point, normal = sleeve_cut(0.46, sx, SLEEVE_TILT)
        cuts.append(cut_plane(point, normal, -1, ("bras",), sx))
    return cuts


def short_cuts():
    cuts = [cut_plane((0, 0, 0.355), (0, 0, 1), -1, ("torse",))]
    for _, sx in SIDES:
        point, normal = leg_cut(0.46, sx)
        cuts.append(cut_plane(point, normal, -1, ("jambe",), sx))
    return cuts


def sweat_cuts():
    cuts = [cut_plane((0, 0, 0.285), (0, 0, 1), 1, ("torse",))]
    for _, sx in SIDES:
        point, normal = arm_cut(0.9, sx)
        cuts.append(cut_plane(point, normal, -1, ("bras",), sx))
    return cuts


def trousers_cuts():
    cuts = [cut_plane((0, 0, 0.355), (0, 0, 1), -1, ("torse",))]
    for _, sx in SIDES:
        point, normal = leg_cut(0.965, sx)
        cuts.append(cut_plane(point, normal, -1, ("jambe",), sx))
    return cuts


def overalls_cuts():
    cuts = [cut_plane((0, 0, 0.37), (0, 0, 1), -1, ("torse",))]
    for _, sx in SIDES:
        point, normal = leg_cut(0.965, sx)
        cuts.append(cut_plane(point, normal, -1, ("jambe",), sx))
    return cuts


def overall_bib_cuts():
    return [
        cut_plane((0, 0, 0.5), (0, 0, 1), -1, ("torse",)),
        cut_plane((0, 0, 0.355), (0, 0, 1), 1, ("torse",)),
        cut_plane((0.085, 0, 0), (1, 0, 0), -1, ("torse",)),
        cut_plane((-0.085, 0, 0), (1, 0, 0), 1, ("torse",)),
    ]


def clean_shell_geometry(bm, name, stage, remove_spikes=True):
    removed_faces = 0
    passes = 0
    for pass_index in range(6 if remove_spikes else 0):
        passes += 1
        boundary_edges = {edge for edge in bm.edges if len(edge.link_faces) == 1}
        spikes = [
            face for face in bm.faces
            if SHOULDER.z - 0.11 <= face.calc_center_median().z <= SHOULDER.z + 0.02
            and abs(face.calc_center_median().x) > 0.08
            and sum(edge in boundary_edges for edge in face.edges) >= 2
        ]
        if not spikes:
            break
        removed_faces += len(spikes)
        bmesh.ops.delete(bm, geom=spikes, context="FACES")
        loose_edges = [edge for edge in bm.edges if not edge.link_faces]
        if loose_edges:
            bmesh.ops.delete(bm, geom=loose_edges, context="EDGES")
        loose_verts = [vert for vert in bm.verts if not vert.link_edges]
        if loose_verts:
            bmesh.ops.delete(bm, geom=loose_verts, context="VERTS")
    print("SHELL_SPIKES", name, stage, "passes", passes,
          "removed_faces", removed_faces, flush=True)

    boundary_edges = {edge for edge in bm.edges if len(edge.link_faces) == 1}
    while boundary_edges:
        edge = boundary_edges.pop()
        start = edge.verts[0]
        current = edge.verts[1]
        verts = [start, current]
        loop_edges = [edge]
        closed = False
        while current is not start:
            candidates = [candidate for candidate in current.link_edges
                          if candidate in boundary_edges]
            if len(candidates) != 1:
                break
            next_edge = candidates[0]
            boundary_edges.remove(next_edge)
            loop_edges.append(next_edge)
            current = next_edge.other_vert(current)
            if current is start:
                closed = True
            else:
                verts.append(current)
        perimeter = sum((edge.verts[0].co - edge.verts[1].co).length for edge in loop_edges)
        centroid = sum((vert.co for vert in verts), Vector()) / len(verts)
        fill = closed and len(loop_edges) <= 12 and perimeter < 0.08
        print("SHELL_LOOPS", name, stage, "edges", len(loop_edges),
              "centroid", tuple(round(value, 4) for value in centroid),
              "perimeter", round(perimeter, 6), "closed", closed, "filled", fill, flush=True)
        if fill:
            result = bmesh.ops.holes_fill(bm, edges=loop_edges, sides=0)
            faces = result.get("faces", [])
            if faces:
                bmesh.ops.triangulate(bm, faces=faces)

    boundary_edges = {edge for edge in bm.edges if len(edge.link_faces) == 1}
    remaining_spikes = [
        face for face in bm.faces
        if SHOULDER.z - 0.11 <= face.calc_center_median().z <= SHOULDER.z + 0.02
        and abs(face.calc_center_median().x) > 0.08
        and sum(edge in boundary_edges for edge in face.edges) >= 2
    ]
    print("SHELL_SPIKES", name, stage, "remaining_faces", len(remaining_spikes), flush=True)

    loose_edges = [edge for edge in bm.edges if not edge.link_faces]
    if loose_edges:
        bmesh.ops.delete(bm, geom=loose_edges, context="EDGES")
    loose_verts = [vert for vert in bm.verts if not vert.link_edges]
    if loose_verts:
        bmesh.ops.delete(bm, geom=loose_verts, context="VERTS")
    bm.normal_update()


def shell_cut_boundary_components(bm, sleeve_cuts):
    boundary_edges = {edge for edge in bm.edges if len(edge.link_faces) == 1}
    unvisited = set(boundary_edges)
    selected_edges = set()
    selected_verts = set()
    low_z, high_z = SHOULDER.z - 0.11, SHOULDER.z + 0.02
    while unvisited:
        first = unvisited.pop()
        component_edges = {first}
        component_verts = set(first.verts)
        stack = [first]
        while stack:
            edge = stack.pop()
            for vert in edge.verts:
                for linked in vert.link_edges:
                    if linked in unvisited:
                        unvisited.remove(linked)
                        component_edges.add(linked)
                        component_verts.update(linked.verts)
                        stack.append(linked)

        targeted = False
        for edge in component_edges:
            midpoint = (edge.verts[0].co + edge.verts[1].co) * 0.5
            on_sleeve_cut = any(
                all(abs((vert.co - point).dot(normal)) < 0.002 for vert in edge.verts)
                for point, normal in sleeve_cuts
            )
            in_slit = low_z <= midpoint.z <= high_z and abs(midpoint.x) > 0.08
            if on_sleeve_cut or in_slit:
                targeted = True
                break
        if targeted:
            selected_edges.update(component_edges)
            selected_verts.update(component_verts)
    return selected_edges, selected_verts


def smooth_shell_cut_boundaries(bm, name, sleeve_cuts):
    cut_edges, cut_verts = shell_cut_boundary_components(bm, sleeve_cuts)
    if cut_verts:
        for _ in range(2):
            bmesh.ops.smooth_vert(
                bm, verts=list(cut_verts), factor=0.5,
                use_axis_x=True, use_axis_y=True, use_axis_z=True,
            )
    print("SHELL_CUT_BOUNDARY", name, "edges", len(cut_edges),
          "verts", len(cut_verts), "smooth_iterations", 2 if cut_verts else 0, flush=True)

    for pass_index in range(3):
        cut_edges, cut_verts = shell_cut_boundary_components(bm, sleeve_cuts)
        sharp_faces = set()
        sharp_corners = 0
        for vert in cut_verts:
            boundary_edges = [
                edge for edge in vert.link_edges
                if edge in cut_edges and len(edge.link_faces) == 1
            ]
            if len(boundary_edges) != 2:
                continue
            first = boundary_edges[0].other_vert(vert).co - vert.co
            second = boundary_edges[1].other_vert(vert).co - vert.co
            if first.length_squared < 1e-12 or second.length_squared < 1e-12:
                continue
            if math.degrees(first.angle(second)) >= 40:
                continue
            sharp_corners += 1
            adjacent_faces = {
                face for edge in boundary_edges for face in edge.link_faces
            }
            face_angles = []
            for face in adjacent_faces:
                loop = next((loop for loop in face.loops if loop.vert is vert), None)
                if loop is None:
                    continue
                face_first = loop.link_loop_prev.vert.co - vert.co
                face_second = loop.link_loop_next.vert.co - vert.co
                if face_first.length_squared < 1e-12 or face_second.length_squared < 1e-12:
                    continue
                face_angles.append((math.degrees(face_first.angle(face_second)), face))
            if face_angles:
                sharp_faces.add(min(face_angles, key=lambda item: item[0])[1])
        if not sharp_faces:
            print("SHELL_SHARP_FACES", name, "pass", pass_index + 1,
                  "sharp_corners", sharp_corners, "removed_faces", 0, flush=True)
            break
        bmesh.ops.delete(bm, geom=list(sharp_faces), context="FACES")
        loose_edges = [edge for edge in bm.edges if not edge.link_faces]
        if loose_edges:
            bmesh.ops.delete(bm, geom=loose_edges, context="EDGES")
        loose_verts = [vert for vert in bm.verts if not vert.link_edges]
        if loose_verts:
            bmesh.ops.delete(bm, geom=loose_verts, context="VERTS")
        print("SHELL_SHARP_FACES", name, "pass", pass_index + 1,
              "sharp_corners", sharp_corners, "removed_faces", len(sharp_faces), flush=True)
    bm.normal_update()


SHELL_PARAMETERS = {}
SHELL_INNER_LAYER_OPEN_EDGES = defaultdict(list)
SHELL_INNER_LAYER_THICKNESS = {}


SLEEVE_RECUT_SHIFT = 0.008
INNER_SHELL_EDGE_PROTECTION = 0.02
INNER_SHELL_TRANSITION_DISTANCE = 0.01
INNER_SHELL_SKIN_GAP = 0.002


def point_segment_distance(point, start, end):
    direction = end - start
    if direction.length_squared < 1e-12:
        return (point - start).length
    amount = max(0.0, min(1.0, (point - start).dot(direction) / direction.length_squared))
    return (point - (start + direction * amount)).length


def flatten_shell_inner_layer(obj, skin, open_edge_segments, piece_name):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.normal_update()
    moved = 0
    candidates = 0
    protected = 0
    unmasked_zone = 0
    for vertex in bm.verts:
        hit, skin_normal, _, _ = skin.find_nearest(vertex.co)
        if hit is None or vertex.normal.dot(hit - vertex.co) <= 0:
            continue
        skin_normal = skin_normal.normalized()
        candidates += 1
        zone = body_zone(hit)
        if piece_name not in BODY_ZONE_MASKS.get(zone, ()):
            unmasked_zone += 1
            continue
        edge_distance = min(
            (point_segment_distance(vertex.co, start, end) for start, end in open_edge_segments),
            default=math.inf,
        )
        if edge_distance <= INNER_SHELL_EDGE_PROTECTION:
            protected += 1
            continue
        amount = min(
            1.0,
            (edge_distance - INNER_SHELL_EDGE_PROTECTION) / INNER_SHELL_TRANSITION_DISTANCE,
        )
        target = hit - skin_normal * INNER_SHELL_SKIN_GAP
        destination = vertex.co.lerp(target, amount)
        if (destination - vertex.co).length > 1e-6:
            vertex.co = destination
            moved += 1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.normal_update()
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    print(
        "SHELL_INNER_LAYER",
        obj.name,
        f"candidates={candidates}",
        f"moved={moved}",
        f"edge_protected={protected}",
        f"unmasked_zone={unmasked_zone}",
        flush=True,
    )


def preserve_shell_build_layers(obj, body, piece_name):
    blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
    body_blocks = body.data.shape_keys.key_blocks if body.data.shape_keys else None
    build_key = blocks.get("fort") if blocks else None
    basis = blocks.get("Basis") if blocks else None
    body_build_key = body_blocks.get("fort") if body_blocks else None
    if build_key is None or basis is None or body_build_key is None:
        return

    saved_values = (build_key.value, body_build_key.value)
    corrected_shapes = {}
    try:
        thickness = SHELL_INNER_LAYER_THICKNESS[piece_name]
        for build_value in (-1.0, 1.0):
            build_key.value = build_value
            body_build_key.value = build_value
            bpy.context.view_layer.update()
            depsgraph = bpy.context.evaluated_depsgraph_get()
            skin = BVHTree.FromObject(body, depsgraph)
            evaluated = obj.evaluated_get(depsgraph)
            mesh = evaluated.to_mesh()
            masked_moved = 0
            unmasked_moved = 0
            protected = 0
            updates = {}
            try:
                mesh.calc_loop_triangles()
                matrix = evaluated.matrix_world
                normal_matrix = matrix.to_3x3().inverted().transposed()
                coordinates = [matrix @ vertex.co for vertex in mesh.vertices]
                outer_triangles = []
                for triangle in mesh.loop_triangles:
                    indices = tuple(triangle.vertices)
                    points = [coordinates[index] for index in indices]
                    center = sum(points, Vector()) / 3
                    normal = (
                        (points[1] - points[0])
                        .cross(points[2] - points[0])
                        .normalized()
                    )
                    hit, _, _, _ = skin.find_nearest(center)
                    if hit is not None and normal.dot(hit - center) <= 0:
                        outer_triangles.append(indices)
                outer_tree = (
                    BVHTree.FromPolygons(coordinates, outer_triangles)
                    if outer_triangles
                    else None
                )
                edge_attribute = mesh.attributes.get(OPEN_EDGE_ATTRIBUTE)
                tagged_vertices = (
                    {
                        index
                        for index, value in enumerate(edge_attribute.data)
                        if value.value > 0.5
                    }
                    if edge_attribute is not None
                    and edge_attribute.domain == "POINT"
                    else set()
                )
                edge_segments = [
                    (coordinates[edge.vertices[0]], coordinates[edge.vertices[1]])
                    for edge in mesh.edges
                    if all(vertex in tagged_vertices for vertex in edge.vertices)
                ]
                inverse_matrix = matrix.inverted_safe()
                for index, vertex in enumerate(mesh.vertices):
                    point = coordinates[index]
                    vertex_normal = normal_matrix @ vertex.normal
                    hit, skin_normal, _, _ = skin.find_nearest(point)
                    if (
                        hit is None
                        or skin_normal is None
                        or vertex_normal.dot(hit - point) <= 0
                    ):
                        continue
                    edge_distance = min(
                        (
                            point_segment_distance(point, start, end)
                            for start, end in edge_segments
                        ),
                        default=math.inf,
                    )
                    if edge_distance <= INNER_SHELL_EDGE_PROTECTION:
                        protected += 1
                        continue
                    amount = min(
                        1.0,
                        (edge_distance - INNER_SHELL_EDGE_PROTECTION)
                        / INNER_SHELL_TRANSITION_DISTANCE,
                    )
                    if amount <= 0:
                        protected += 1
                        continue
                    zone = body_zone(hit)
                    if piece_name in BODY_ZONE_MASKS.get(zone, ()):
                        target = (
                            hit
                            - skin_normal.normalized() * INNER_SHELL_SKIN_GAP
                        )
                        masked_moved += 1
                    elif outer_tree is not None:
                        outer_point, outer_normal, _, distance = (
                            outer_tree.find_nearest(point)
                        )
                        if (
                            outer_point is None
                            or outer_normal is None
                            or distance > thickness * 2
                        ):
                            continue
                        outer_normal.normalize()
                        interior_depth = (point - outer_point).dot(outer_normal)
                        if interior_depth <= -thickness * 0.5:
                            continue
                        target = outer_point - outer_normal * thickness
                        unmasked_moved += 1
                    else:
                        continue
                    destination = point.lerp(target, amount)
                    if (destination - point).length > 1e-6:
                        updates[index] = inverse_matrix @ destination
                corrected_coordinates = [
                    vertex.co.copy() for vertex in mesh.vertices
                ]
                for index, coordinate in updates.items():
                    corrected_coordinates[index] = coordinate
                corrected_shapes[build_value] = corrected_coordinates
            finally:
                evaluated.to_mesh_clear()
            print(
                "SHELL_BUILD_LAYER",
                obj.name,
                f"fort={build_value:+.0f}",
                f"masked={masked_moved}",
                f"unmasked={unmasked_moved}",
                f"edge_protected={protected}",
                f"moved={len(updates)}",
                flush=True,
            )
    finally:
        build_key.value, body_build_key.value = saved_values
        bpy.context.view_layer.update()

    if len(corrected_shapes[-1.0]) != len(basis.data) or len(
        corrected_shapes[1.0]
    ) != len(basis.data):
        raise RuntimeError(f"Topologie de carrure modifiée: {obj.name}")
    for index, (fine, large) in enumerate(
        zip(corrected_shapes[-1.0], corrected_shapes[1.0])
    ):
        basis.data[index].co = (fine + large) * 0.5
        build_key.data[index].co = large
    obj.data.update()


def shell(name, body, keep, offset, thickness, mat, cuts=()):
    """Copie du corps poussée vers l'extérieur, réduite aux faces gardées, puis épaissie. Les plans
    `cuts` (point, normale) coupent d'abord le maillage là où passent les ourlets : bords nets.
    Le vêtement garde les poids du corps qu'il recouvre (calculés avant le décalage : l'intérieur
    d'une manche, poussé vers le torse, suit bien le bras)."""
    upper_shell = name in ("haut-tshirt", "sweat")
    shell_piece_name = {
        "sweat": "haut-sweat",
        "salopette": "bas-salopette",
        "bavette": "bas-salopette",
    }.get(name, name)
    piece = PIECES.get(shell_piece_name)
    masks_body_zones = bool(piece and piece.masks_zones)
    if masks_body_zones:
        SHELL_INNER_LAYER_THICKNESS[shell_piece_name] = max(
            SHELL_INNER_LAYER_THICKNESS.get(shell_piece_name, 0.0),
            thickness,
        )
    cut_specs = tuple(cut for cut in cuts if isinstance(cut, CutPlane))
    cuts = (
        [(cut.point, cut.normal) for cut in cut_specs]
        if cut_specs
        else list(cuts)
    )
    if upper_shell:
        SHELL_PARAMETERS[name] = (offset, thickness)
    hem_z = next((point[2] for point, normal in cuts if abs(Vector(normal).z) > 0.99), None)

    def torso_protected(point):
        cavity_side = (SHOULDER.z - 0.12 < point.z < SHOULDER.z - 0.01
                       and abs(point.x) < 0.26)
        distance_limit = offset + (0.04 if cavity_side else 0.014)
        return (upper_shell and hem_z is not None and point.z > hem_z
                and torso_distance(point) <= distance_limit)

    bm = bmesh.new()
    bm.from_mesh(body.data)
    bm.normal_update()
    # Coupes et tri des faces sur la peau, avant tout décalage : sur le corps, le flanc et l'avant-bras
    # sont sans ambiguïté, alors qu'une fois poussées leurs coques se rejoignent dans l'aisselle.
    for point, normal in cuts:
        normal = Vector(normal)
        if abs(normal.z) > 0.99:
            geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        else:
            # Ourlet d'un membre : le plan ne coupe que ce membre, jamais le flanc du torse voisin.
            if abs(normal.x) > abs(normal.z) * 0.3 and point[2] > 0.3:
                # Emmanchure : tout le côté du bras, aisselle comprise, pour un ourlet continu.
                faces = [f for f in bm.faces if f.calc_center_median().x * point[0] > 0
                         and f.calc_center_median().z > 0.3]
            else:
                faces = [f for f in bm.faces if classify(f.calc_center_median())[0] in ("jambe", "pied")]
            edges = {e for f in faces for e in f.edges}
            verts = {v for f in faces for v in f.verts}
            geom = list(verts) + list(edges) + faces
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=point, plane_no=normal)
    bm.normal_update()
    sleeve_origin = bm.faces.layers.int.new("sleeve_origin")
    drop = []
    for face in bm.faces:
        center = face.calc_center_median()
        part, side, arm_t = classify(center)
        face[sleeve_origin] = int(part == "bras")
        if not keep(center, part, side, arm_t):
            drop.append(face)

    def near_cut(c, point, normal):
        return abs((c - point).dot(normal)) < 0.05 and (abs(normal.z) > 0.99 or abs(normal.x) > 0.99 or
                                                        c.x * point.x > 0)

    # Côté gardé de chaque plan, lu sur la peau (avant décalage) : il sert à recouper la coque.
    kept_side = []
    dropped = set(drop)
    for point, normal in cuts:
        point, normal = Vector(point), Vector(normal)
        total = sum((f.calc_center_median() - point).dot(normal) for f in bm.faces
                    if f not in dropped and near_cut(f.calc_center_median(), point, normal)
                    and abs((f.calc_center_median() - point).dot(normal)) < 0.05)
        kept_side.append(1.0 if total >= 0 else -1.0)
    for index, (cut, side) in enumerate(zip(cut_specs, kept_side)):
        if side != cut.kept_side:
            print("SHELL_CUT_SIDE_MISMATCH", name, index, "geometry", int(side),
                  "contract", cut.kept_side, flush=True)
    for v in bm.verts:
        v.co += v.normal * offset
    for _ in range(SHELL_SMOOTH_ITERATIONS):
        bmesh.ops.smooth_vert(bm, verts=bm.verts[:], factor=0.5, use_axis_x=True, use_axis_y=True,
                              use_axis_z=True)
    # Le lissage rentre la coque dans les creux (aisselles) : on la ressort au-dessus de la peau.
    skin = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())
    for v in bm.verts:
        hit, hit_normal, _, _ = skin.find_nearest(v.co)
        if hit is None or (v.co.z < 0.37 and not upper_shell):
            continue
        lift = (v.co - hit).dot(hit_normal)
        if lift < offset * 0.75:
            v.co += hit_normal * (offset * 0.75 - lift)
        # Au creux de l'aisselle, la peau la plus proche peut être le bras : on vérifie aussi le torse.
        depth = torso_distance(v.co)
        if depth < offset * 0.75:
            eps = 1e-4
            grad = Vector([(torso_distance(v.co + axis * eps) - depth) / eps
                           for axis in (Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)))])
            if grad.length > 1e-6:
                v.co += grad.normalized() * (offset * 0.75 - depth)
    sleeve_cuts = [(Vector(point), Vector(normal)) for point, normal in cuts
                   if abs(Vector(normal).z) <= 0.99 and point[2] > 0.3]
    bmesh.ops.delete(bm, geom=drop, context="FACES")
    # Le décalage et le lissage ondulent les bords coupés sur la peau : on recoupe la coque aux mêmes
    # plans pour des ourlets nets.
    for point, normal in cuts:
        normal = Vector(normal)
        if abs(normal.z) > 0.99:
            geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        else:
            # Ourlet d'un membre : le plan ne coupe que ce membre, jamais le flanc du torse voisin.
            if abs(normal.x) > abs(normal.z) * 0.3 and point[2] > 0.3:
                # Emmanchure : tout le côté du bras, aisselle comprise, pour un ourlet continu.
                faces = [f for f in bm.faces if f.calc_center_median().x * point[0] > 0
                         and f.calc_center_median().z > 0.3]
            else:
                faces = [f for f in bm.faces if classify(f.calc_center_median())[0] in ("jambe", "pied")]
            edges = {e for f in faces for e in f.edges}
            verts = {v for f in faces for v in f.verts}
            geom = list(verts) + list(edges) + faces
        shift = 0.0 if abs(normal.z) > 0.99 or not upper_shell else SLEEVE_RECUT_SHIFT
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=Vector(point) + normal * shift, plane_no=normal)
    bm.normal_update()
    drop = []
    for f in (bm.faces if not upper_shell else ()):
        c = f.calc_center_median()
        if any(near_cut(c, Vector(point), Vector(normal))
               and (c - Vector(point)).dot(Vector(normal)) * sign < -1e-5
               for (point, normal), sign in zip(cuts, kept_side)):
            drop.append(f)
    for f in (bm.faces if upper_shell else ()):
        c = f.calc_center_median()
        if hem_z is not None and c.z < hem_z:
            drop.append(f)
        elif f[sleeve_origin] and any((c - point).dot(normal) > SLEEVE_RECUT_SHIFT and c.x * point.x > 0
                                      for point, normal in sleeve_cuts):
            drop.append(f)
    bmesh.ops.delete(bm, geom=drop, context="FACES")
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context="VERTS")
    smooth_shell_cut_boundaries(bm, name, sleeve_cuts)
    clean_shell_geometry(bm, name, "pre-decimate", remove_spikes=not upper_shell)
    obj = inherit_groups(link(name, bm))
    # Un vêtement n'a pas besoin de toute la finesse du corps : on l'allège avant de l'épaissir
    # (les poids des os suivent la simplification). Le fichier de la figurine reste léger.
    light = obj.modifiers.new("Allegement", "DECIMATE")
    light.ratio = 0.65
    light.use_symmetry = True
    light.symmetry_axis = "X"
    apply(obj)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.normal_update()
    clean_shell_geometry(bm, name, "post-decimate", remove_spikes=not upper_shell)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.normal_update()
    open_edge_layer = bm.verts.layers.float.get(OPEN_EDGE_ATTRIBUTE)
    if open_edge_layer is None:
        open_edge_layer = bm.verts.layers.float.new(OPEN_EDGE_ATTRIBUTE)
    boundary_vertices = {
        vertex
        for edge in bm.edges
        if len(edge.link_faces) == 1
        for vertex in edge.verts
    }
    open_edge_segments = [
        (edge.verts[0].co.copy(), edge.verts[1].co.copy())
        for edge in bm.edges
        if len(edge.link_faces) == 1
    ]
    for vertex in bm.verts:
        vertex[open_edge_layer] = 1.0 if vertex in boundary_vertices else 0.0
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    mod = obj.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = -1
    apply(obj)
    if masks_body_zones:
        SHELL_INNER_LAYER_OPEN_EDGES[shell_piece_name].extend(open_edge_segments)
    obj = geo.smooth(assign(obj, mat))
    return obj


def trim_ring(name, center, axis, radius_x, radius_y, thickness, mat):
    axis = axis.normalized()
    u = axis.cross(Vector((0, 1, 0)))
    if u.length < 1e-5:
        u = axis.cross(Vector((1, 0, 0)))
    u.normalize()
    v = axis.cross(u).normalized()
    points = [tuple(center + u * radius_x * math.cos(a) + v * radius_y * math.sin(a))
              for a in (2 * math.pi * k / 48 for k in range(48))]
    obj = geo.tube(points, thickness, MATERIALS[mat], name, cyclic=True)
    assign_weights(obj)
    return obj


def tshirt(body):
    cuts = tshirt_cuts()
    shirt = shell("haut-tshirt", body, lambda p, part, side, t: (part in ("torse", "jambe") and p.z > 0.28) or
                  (part == "bras" and t < 0.46), 0.016, 0.006, "tissu", cuts)
    collar_z = HEAD_C.z - HEAD_R.z + 0.006
    collar = trim_ring("col", Vector((0, 0, collar_z)), Vector((0, 0, 1)),
                       TORSO_R.x * 0.43, TORSO_R.y * 0.43, 0.005, "tissu")
    hem_z = 0.31
    profile = math.sqrt(max(0.1, 1 - ((hem_z - TORSO_C) / TORSO_R.z) ** 2))
    hem = trim_ring("ourlet", Vector((0, 0, hem_z)), Vector((0, 0, 1)),
                    TORSO_R.x * profile * 1.08, TORSO_R.y * profile * 1.08, 0.004, "tissu")
    return geo.smooth(geo.join([shirt, collar, hem], "haut-tshirt"))


def shorts(body):
    cuts = short_cuts()
    lower = shell("bas-short", body, lambda p, part, side, t: (part == "torse" and p.z < 0.355) or
                  (part == "jambe" and t < 0.46), 0.011, 0.006, "tissu", cuts)
    return geo.smooth(lower)


# Bord du bout blanc de la basket : un plan incliné, plus bas vers la pointe.
TOE_CAP = (Vector((0, TOE.y - 0.006, 0.05)), Vector((0, -0.8, -0.6)).normalized())


def toe_cap(shoe):
    """Bout de la basket en blanc, comme la semelle (deuxième matière du dessus). Le maillage est
    d'abord coupé le long du bord : la limite des deux matières est nette."""
    shoe.data.materials.append(MATERIALS["semelle"])
    point, normal = TOE_CAP
    bm = bmesh.new()
    bm.from_mesh(shoe.data)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=point, plane_no=normal)
    for face in bm.faces:
        face.material_index = 1 if (face.calc_center_median() - point).dot(normal) > 0 else 0
    bm.to_mesh(shoe.data)
    bm.free()


def laces(shoe):
    """Trois lacets en travers du cou-de-pied, posés sur le dessus de la basket."""
    from mathutils.bvhtree import BVHTree

    depsgraph = bpy.context.evaluated_depsgraph_get()
    tree = BVHTree.FromObject(shoe, depsgraph)
    bm = bmesh.new()
    for _, sx in SIDES:
        # Devant l'ouverture de la cheville (un lacet dans l'ouverture tomberait dans la chaussure).
        for y in (-0.052, -0.064, -0.076):
            hit, normal, _, _ = tree.ray_cast(Vector((0.07 * sx, y, 0.2)), Vector((0, 0, -1)))
            if hit is None:
                continue
            tilt = Vector((0, 0, 1)).rotation_difference(normal).to_matrix().to_4x4()
            matrix = Matrix.Translation(hit + normal * 0.002) @ tilt @ Matrix.Diagonal((0.017, 0.0045, 0.004, 1))
            bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=6, radius=1.0, matrix=matrix)
    return assign_weights(assign(geo.smooth(link("lacets", bm)), "semelle"))


def sneakers(body):
    # Le col s'arrête à la cheville : plus haut, la basket ressemblait à une bottine.
    cuts = [leg_cut(0.985, sx) for _, sx in SIDES]
    shoe = shell("chaussures-baskets", body, lambda p, part, side, t: part == "pied" or
                 (part == "jambe" and t > 0.985), 0.013, 0.006, "tissu", cuts)
    toe_cap(shoe)

    def sole_parts(bm):
        # Semelle arrondie qui suit le pied, un peu plus large que lui, à plat sur le sol, la pointe
        # légèrement relevée.
        for _, sx in SIDES:
            for k in range(7):
                f = k / 6
                c = mirrored(HEEL.lerp(TOE + Vector((0, -0.014, 0)), f), sx)
                ellipsoid(bm, (c.x, c.y, 0.013 + 0.005 * f * f), 0.052, (1.0, 1.0, 0.3), segments=20)

    sole = assign(remeshed("semelle", sole_parts, voxel=0.004, smooth=4, triangles=900), "semelle")
    assign_weights(sole)
    # La jonction réunit les matières des pièces : tissu (dessus), semelle (semelle, bout, lacets).
    return geo.smooth(geo.join([shoe, sole, laces(shoe)], "chaussures-baskets"))


# ---------------------------------------------------------------------------
# Carrure : la forme « fort »
# ---------------------------------------------------------------------------
def girth(p):
    """Déplacement d'un point pour la forme « fort » : le torse s'élargit (moins vers le cou), bras
    et jambes s'épaississent autour de leur axe ; mains, pieds et chaussures ne changent pas. Les
    parties se fondent l'une dans l'autre (moyenne pondérée par leur proximité), comme dans le
    corps : pas de déchirure à l'aisselle ni à l'aine. Le même champ déforme les vêtements."""
    zero = Vector((0, 0, 0))
    neck = smoothstep(0.58, 0.47, p.z)
    parts = [(torso_distance(p), Vector((p.x, p.y, 0)) * (0.18 * neck))]
    for _, sx in SIDES:
        for a, b, r in ((SHOULDER, WRIST, 0.04), (HIP, ANKLE, 0.052)):
            start, end = mirrored(a, sx), mirrored(b, sx)
            d, t = segment_distance(p, start, end)
            axis = start + (end - start) * t
            parts.append((d - r, (p - axis) * (0.24 * smoothstep(1.0, 0.8, t))))
        parts.append((segment_distance(p, mirrored(HAND, sx), mirrored(HAND, sx) + Vector((0, 0, 1e-4)))[0]
                      - 0.046, zero))
        parts.append((segment_distance(p, mirrored(HEEL, sx), mirrored(TOE, sx))[0] - 0.042, zero))
    nearest = min(d for d, _ in parts)
    weights = [math.exp(-(d - nearest) / 0.02) for d, _ in parts]
    return sum((move * w for (_, move), w in zip(parts, weights)), Vector()) / sum(weights)


def add_build_key(obj, skin=None):
    """Un vêtement suit la carrure de la peau qu'il recouvre (champ pris au point de peau le plus
    proche) : à l'aisselle, la coque ne glisse pas vers le bras quand le torse s'affine."""
    obj.shape_key_add(name="Basis")
    key = obj.shape_key_add(name="fort")
    key.slider_min = -1.0
    shell_name = "sweat" if obj.name == "haut-sweat" else obj.name
    for vertex, target in zip(obj.data.vertices, key.data):
        anchor = vertex.co
        if skin is not None and vertex.co.z > 0.37:
            hit = skin.find_nearest(vertex.co)[0]
            anchor = hit if hit is not None else vertex.co
        displacement = girth(anchor)
        if (shell_name in SHELL_PARAMETERS and 0.37 < anchor.z < 0.49
                and abs(anchor.x) > 0.12 and torso_distance(anchor) < 0.035):
            displacement *= 1.25
        if shell_name in SHELL_PARAMETERS and anchor.z < 0.33:
            # L'ourlet du haut s'élargit un peu plus vite que la taille : en carrure large, la peau
            # ne remonte pas sous le bord.
            displacement *= HEM_BUILD_GAIN
        target.co = vertex.co + displacement
    return obj


def normalize_weights(obj, max_influences=MAX_SKIN_INFLUENCES):
    groups = {group.index: group for group in obj.vertex_groups if group.name in BONE_NAMES}
    maximum = 0
    for vertex in obj.data.vertices:
        assigned = sorted(((groups[item.group], item.weight) for item in vertex.groups if item.group in groups),
                          key=lambda entry: entry[1], reverse=True)
        if not assigned:
            continue
        kept = assigned[:max_influences]
        total = sum(weight for _, weight in kept)
        for group, _ in assigned:
            group.remove([vertex.index])
        for group, weight in kept:
            group.add([vertex.index], weight / total, "REPLACE")
        maximum = max(maximum, len(kept))
    return maximum


def smooth_skinning_weights(obj, rigid_assignments=None):
    piece = PIECES.get(obj.name)
    groups_by_slot = {
        "haut": ("spine", "chest", "upperarm.L", "upperarm.R", "forearm.L", "forearm.R"),
        "bas": ("hips", "spine", "thigh.L", "thigh.R", "shin.L", "shin.R"),
        "chaussures": ("shin.L", "shin.R", "foot.L", "foot.R"),
    }
    if obj.name == "corps":
        group_names = BONE_NAMES
        rigid_vertices = set(rigid_assignments or ())
    elif piece and piece.slot in groups_by_slot:
        group_names = groups_by_slot[piece.slot]
        rigid_vertices = set()
    else:
        return
    groups = {
        group.index: group
        for group in obj.vertex_groups
        if group.name in group_names
    }
    if not groups:
        return

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    deform_layer = bm.verts.layers.deform.verify()
    neighbors = [
        tuple(edge.other_vert(vertex).index for edge in vertex.link_edges)
        for vertex in bm.verts
    ]
    boundary_attribute = obj.data.attributes.get(OPEN_EDGE_ATTRIBUTE)
    boundary_vertices = {
        index
        for index, value in enumerate(boundary_attribute.data)
        if value.value > 0.5
    } if boundary_attribute else set()
    if not boundary_vertices:
        boundary_vertices = {
            vertex.index
            for edge in bm.edges
            if len(edge.link_faces) == 1
            for vertex in edge.verts
        }

    values = {
        group_index: [
            vertex[deform_layer].get(group_index, 0.0)
            for vertex in bm.verts
        ]
        for group_index in groups
    }

    def smooth(indices, passes):
        nonlocal values
        for _ in range(passes):
            updated = {group_index: weights.copy() for group_index, weights in values.items()}
            for index in indices:
                adjacent = neighbors[index]
                if index in rigid_vertices or not adjacent:
                    continue
                for group_index, weights in values.items():
                    mean = sum(weights[neighbor] for neighbor in adjacent) / len(adjacent)
                    updated[group_index][index] = (
                        weights[index] * (1 - SKINNING_WEIGHT_SMOOTH_FACTOR)
                        + mean * SKINNING_WEIGHT_SMOOTH_FACTOR
                    )
            values = updated

    smooth(range(len(bm.verts)), SKINNING_WEIGHT_SMOOTH_PASSES)
    smooth(boundary_vertices, SKINNING_BORDER_WEIGHT_SMOOTH_PASSES)
    for vertex in bm.verts:
        deform = vertex[deform_layer]
        for group_index, weights in values.items():
            if weights[vertex.index] > 1e-8:
                deform[group_index] = weights[vertex.index]
            elif group_index in deform:
                del deform[group_index]
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def transfer_over_piece_weights(objects):
    for obj in objects:
        piece = PIECES.get(obj.name)
        if not piece or not piece.over:
            continue

        donors = []
        for donor in objects:
            donor_piece = PIECES.get(donor.name)
            if donor is obj or not donor_piece or donor_piece.slot not in piece.over:
                continue
            shape_keys = donor.data.shape_keys.key_blocks if donor.data.shape_keys else ()
            basis = shape_keys.get("Basis") if shape_keys else None
            if basis is None or not len(basis.data):
                continue
            group_names = {group.index: group.name for group in donor.vertex_groups}
            weights = [
                {
                    group_names[membership.group]: membership.weight
                    for membership in vertex.groups
                    if membership.group in group_names
                    and group_names[membership.group] in BONE_NAMES
                }
                for vertex in donor.data.vertices
            ]
            tree = KDTree(len(basis.data))
            for index, point in enumerate(basis.data):
                tree.insert(donor.matrix_world @ point.co, index)
            tree.balance()
            donors.append((donor, tree, weights))

        if not donors:
            raise RuntimeError(f"Aucune pièce recouverte trouvée pour {obj.name}")

        shape_keys = obj.data.shape_keys.key_blocks if obj.data.shape_keys else ()
        basis = shape_keys.get("Basis") if shape_keys else None
        if basis is None:
            raise RuntimeError(f"Géométrie de base absente pour {obj.name}")
        target_groups = {
            name: obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name)
            for name in BONE_NAMES
        }
        transferred = defaultdict(int)
        for vertex in obj.data.vertices:
            point = basis.data[vertex.index].co
            world_point = obj.matrix_world @ point
            if piece.over_region and not piece.over_region(world_point):
                continue

            candidates = []
            for donor, tree, weights in donors:
                _, index, distance = tree.find(world_point)
                candidates.append((distance, donor.name, weights[index]))
            candidates.sort(key=lambda candidate: (candidate[0], candidate[1]))
            preferred = next(
                (candidate for candidate in candidates if candidate[1] == piece.over_weight_source),
                None,
            )
            selected = preferred or candidates[0]
            selected_weights = selected[2]
            equivalent = [
                weights for _, _, weights in candidates
                if all(
                    abs(weights.get(name, 0.0) - selected_weights.get(name, 0.0)) <= 1e-4
                    for name in BONE_NAMES
                )
            ]
            if len(equivalent) > 1:
                transferred_weights = {
                    name: sum(weights.get(name, 0.0) for weights in equivalent) / len(equivalent)
                    for name in BONE_NAMES
                }
            else:
                transferred_weights = selected_weights

            total = sum(transferred_weights.values())
            if total <= 1e-8:
                raise RuntimeError(f"Poids de pièce recouverte vides pour {obj.name}")
            memberships = {membership.group for membership in vertex.groups}
            for group in target_groups.values():
                if group.index in memberships:
                    group.remove([vertex.index])
            for name, weight in transferred_weights.items():
                if weight > 1e-8:
                    target_groups[name].add([vertex.index], weight / total, "REPLACE")
            transferred[selected[1]] += 1

        print(
            "OVERLAP_WEIGHT_TRANSFER",
            obj.name,
            f"donors={','.join(donor.name for donor, _, _ in donors)}",
            f"vertices={sum(transferred.values())}",
            f"selected={dict(sorted(transferred.items()))}",
            flush=True,
        )


def restore_rigid_weights(body, assignments):
    groups = {
        group.index: group
        for group in body.vertex_groups
        if group.name in BONE_NAMES
    }
    names = {group.index: group.name for group in body.vertex_groups}
    for vertex_index, bone_name in assignments.items():
        vertex = body.data.vertices[vertex_index]
        for membership in list(vertex.groups):
            if membership.group in groups:
                groups[membership.group].remove([vertex_index])
        target = next(index for index, name in names.items() if name == bone_name)
        groups[target].add([vertex_index], 1.0, "REPLACE")
    print("RIGID_WEIGHTS_FROZEN", len(assignments), flush=True)


def validate_rigid_weights(body, head, rigid_assignments=None):
    body_groups = {group.index: group.name for group in body.vertex_groups}
    rigid_counts = defaultdict(int)
    if rigid_assignments is None:
        rigid_assignments = {}
        for vertex in body.data.vertices:
            part, side, _ = classify(vertex.co)
            if part == "main":
                rigid_assignments[vertex.index] = f"hand.{side}"
            elif part == "pied":
                rigid_assignments[vertex.index] = f"foot.{side}"
    for vertex_index, expected in rigid_assignments.items():
        vertex = body.data.vertices[vertex_index]
        assigned = [
            (body_groups[membership.group], membership.weight)
            for membership in vertex.groups
            if membership.group in body_groups and membership.weight > 1e-6
        ]
        if len(assigned) != 1 or assigned[0][0] != expected or abs(assigned[0][1] - 1.0) > 1e-6:
            raise RuntimeError(f"Poids non rigide pour {expected}, sommet {vertex.index}: {assigned}")
        rigid_counts[expected] += 1
    head_group = head.vertex_groups.get("head")
    if head_group is None:
        raise RuntimeError("Groupe de poids head absent")
    for vertex in head.data.vertices:
        assigned = [
            membership
            for membership in vertex.groups
            if membership.weight > 1e-6
        ]
        if len(assigned) != 1 or assigned[0].group != head_group.index or abs(assigned[0].weight - 1.0) > 1e-6:
            raise RuntimeError(f"Poids non rigide pour head, sommet {vertex.index}")
    print(
        "RIGID_WEIGHTS",
        f"hand={rigid_counts['hand.L'] + rigid_counts['hand.R']}",
        f"foot={rigid_counts['foot.L'] + rigid_counts['foot.R']}",
        f"head={len(head.data.vertices)}",
        flush=True,
    )


def shape_coordinates(obj, build):
    blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
    # Après `reshape_avatar`, seules les formes sont à jour (pas `vertex.co`) : la base fait foi.
    if blocks is not None and "Basis" in blocks:
        basis = [point.co.copy() for point in blocks["Basis"].data]
    else:
        basis = [vertex.co.copy() for vertex in obj.data.vertices]
    key = blocks.get("fort") if blocks is not None else None
    if key is None:
        return basis
    return [point + (key.data[index].co - point) * build for index, point in enumerate(basis)]


def covers_tshirt(point, part, t):
    return (part == "torse" and point.z > 0.295) or (part == "bras" and t < 0.46)


def covers_sweat(point, part, t):
    return (part == "torse" and point.z > 0.285) or (part == "bras" and t < 0.9)


def covers_short(point, part, t):
    return (part == "torse" and point.z < 0.355) or (part == "jambe" and t < 0.46)


def covers_trousers(point, part, t):
    return (part == "torse" and point.z < 0.355) or (part == "jambe" and t < 0.93)


def covers_overalls(point, part, t):
    return (part == "torse" and point.z < 0.37) or (part == "jambe" and t < 0.93)


def covers_skirt(point, part, t):
    return part == "torse" and 0.245 <= point.z <= 0.362


def with_hem_contract(zone, cuts):
    def covers(point, part, t):
        if not zone(point, part, t):
            return False
        for cut in cuts():
            if part not in cut.parts or cut.side is not None and point.x * cut.side <= 0:
                continue
            if (point - cut.point).dot(cut.normal) * cut.kept_side < HEM_MARGIN:
                return False
        return True

    return covers


def body_crossings(tree, point):
    """Nombre de traversées de la peau dans six directions : impair partout = point enfoui."""
    counts = []
    for direction in (Vector((1, 0, 0)), Vector((-1, 0, 0)), Vector((0, 1, 0)), Vector((0, -1, 0)),
                      Vector((0, 0, 1)), Vector((0, 0, -1))):
        origin, count = point.copy(), 0
        for _ in range(40):
            hit = tree.ray_cast(origin, direction, 2.0)
            if hit[0] is None:
                break
            count += 1
            origin = hit[0] + direction * 1e-5
        counts.append(count)
    return counts


POCKET_DIRECTIONS = [
    Vector((math.cos(2.399963 * i) * math.sqrt(1 - (1 - (i + 0.5) / 64) ** 2),
            math.sin(2.399963 * i) * math.sqrt(1 - (1 - (i + 0.5) / 64) ** 2),
            1 - (i + 0.5) / 64))
    for i in range(64)
]


def enclosed_pocket(origin, normal, body_tree, garment_trees, reach=0.12):
    """Peau au fond d'une poche fermée : chaque rayon de l'hémisphère extérieur bute sur le corps ou un
    vêtement avant `reach`. Aucune direction de vue ne l'atteint."""
    axis = normal.normalized()
    helper = Vector((1, 0, 0)) if abs(axis.x) < 0.9 else Vector((0, 1, 0))
    u = axis.cross(helper).normalized()
    v = axis.cross(u)
    for d in POCKET_DIRECTIONS:
        direction = (u * d.x + v * d.y + axis * d.z).normalized()
        if body_tree.ray_cast(origin, direction, reach)[0] is not None:
            continue
        if any(tree.ray_cast(origin, direction, reach)[0] is not None for tree in garment_trees):
            continue
        return False
    return True


def validate_wardrobe_coverage(body, garments):
    validate_piece_registry()
    tops = [obj for obj in garments if PIECES.get(obj.name) and PIECES[obj.name].slot == "haut"]
    bottoms = [obj for obj in garments if PIECES.get(obj.name) and PIECES[obj.name].slot == "bas"]
    if not tops or not bottoms:
        raise RuntimeError("La garde-robe doit déclarer au moins un haut et un bas")

    samples = [
        (vertex.co.copy(), vertex.normal.copy(), (vertex.index,))
        for vertex in body.data.vertices
        if vertex.index not in NECK_VERTEX_WEIGHTS
    ]
    for polygon in body.data.polygons:
        if all(index in NECK_VERTEX_WEIGHTS for index in polygon.vertices):
            continue
        center = sum((body.data.vertices[index].co for index in polygon.vertices), Vector()) / len(polygon.vertices)
        samples.append((center, polygon.normal.copy(), tuple(polygon.vertices)))

    trees = {}
    for garment in tops + bottoms:
        polygons = [tuple(polygon.vertices) for polygon in garment.data.polygons]
        for build in (-1.0, 0.0, 1.0):
            trees[(garment.name, build)] = BVHTree.FromPolygons(
                shape_coordinates(garment, build), polygons)

    checks = 0
    coverage_errors = []
    self_occluded = {(garment.name, build): set() for garment in tops + bottoms
                     for build in (-1.0, 0.0, 1.0)}
    cavity_accepted = {(garment.name, build): set() for garment in tops + bottoms
                       for build in (-1.0, 0.0, 1.0)}
    enclosed_accepted = {(garment.name, build): set() for garment in tops + bottoms
                         for build in (-1.0, 0.0, 1.0)}
    buried_accepted = {(garment.name, build): set() for garment in tops + bottoms
                       for build in (-1.0, 0.0, 1.0)}
    for top in tops:
        for bottom in bottoms:
            for build in (-1.0, 0.0, 1.0):
                body_coords = shape_coordinates(body, build)
                body_tree = BVHTree.FromPolygons(
                    body_coords, [tuple(polygon.vertices) for polygon in body.data.polygons])
                normal_sums = [Vector() for _ in body_coords]
                for polygon in body.data.polygons:
                    indices = polygon.vertices
                    face_normal = (body_coords[indices[1]] - body_coords[indices[0]]).cross(
                        body_coords[indices[2]] - body_coords[indices[0]])
                    if face_normal.length_squared == 0:
                        continue
                    for index in indices:
                        normal_sums[index] += face_normal
                garment_samples = uncovered = 0
                examples = []
                for sample_index, (_, _, vertex_indices) in enumerate(samples):
                    point = sum((body_coords[index] for index in vertex_indices), Vector()) / len(vertex_indices)
                    part, _, t = classify(point)
                    covering = [garment for garment in (top, bottom)
                                if PIECES[garment.name].covers(point, part, t)]
                    if not covering:
                        continue
                    if len(vertex_indices) == 1:
                        normal = normal_sums[vertex_indices[0]].normalized()
                    else:
                        a, b, c = (body_coords[index] for index in vertex_indices[:3])
                        normal = (b - a).cross(c - a).normalized()
                    # Le dessous du bassin, tourné vers le sol, n'est visible que par l'ouverture
                    # d'une jupe : aucune jupe ne le cache.
                    covering = [g for g in covering if not (g.name == "bas-jupe" and normal.z < -0.25)]
                    if not covering:
                        continue
                    origin = point + normal * 0.001
                    cavity_band = SHOULDER.z - 0.09 < point.z < SHOULDER.z - 0.02
                    torso_gap = torso_distance(point)
                    cavity = cavity_band and torso_gap < 0.03
                    arm_clearance = float("inf")
                    if cavity:
                        for _, sx in SIDES:
                            distance, arm_t = segment_distance(
                                point, mirrored(SHOULDER, sx), mirrored(WRIST, sx))
                            arm_radius = ARM_RADII[0] + (ARM_RADII[1] - ARM_RADII[0]) * arm_t
                            arm_clearance = min(arm_clearance, distance - arm_radius)
                        cavity = arm_clearance < 0.03
                    if cavity:
                        body_hit = body_tree.ray_cast(origin, normal, 0.06)[0] is not None
                        garment_hits = {
                            garment.name: trees[(garment.name, build)].ray_cast(origin, normal, 0.06)[0] is not None
                            for garment in covering
                        }
                        if body_hit or any(garment_hits.values()):
                            for garment in covering:
                                if body_hit or garment_hits[garment.name]:
                                    cavity_accepted[(garment.name, build)].add(sample_index)
                            continue
                    if cavity and enclosed_pocket(origin, normal, body_tree,
                                                  [trees[(g.name, build)] for g in (top, bottom)]):
                        for garment in covering:
                            enclosed_accepted[(garment.name, build)].add(sample_index)
                        continue
                    if cavity and all(count % 2 for count in body_crossings(body_tree, point + normal * 0.002)):
                        # Dans la carrure large, le bras recouvre le fond de l'aisselle : ce point est
                        # enfoui dans le volume du corps, invisible sous tout angle.
                        for garment in covering:
                            buried_accepted[(garment.name, build)].add(sample_index)
                        continue
                    self_hit = body_tree.ray_cast(point + normal * 0.001, normal, 0.03)
                    if self_hit[0] is not None and self_hit[3] <= 0.03:
                        for garment in covering:
                            self_occluded[(garment.name, build)].add(sample_index)
                        continue
                    garment_samples += 1
                    origin = point + normal * 0.001
                    covered = False
                    nearest_details = []
                    for garment in covering:
                        tree = trees[(garment.name, build)]
                        # Une jupe évasée cache la peau dès qu'elle est sur le rayon, même loin.
                        reach = 0.12 if garment.name == "bas-jupe" else 0.032
                        hit = tree.ray_cast(origin, normal, reach)
                        nearest = tree.find_nearest(origin)
                        distance = nearest[3] if nearest[0] is not None else float("inf")
                        outward = (nearest[0] - point).dot(normal) if nearest[0] is not None else -float("inf")
                        covered = covered or hit[0] is not None or (
                            nearest[0] is not None and distance <= 0.023 and outward >= -0.001
                        )
                        nearest_details.append((garment.name, round(distance, 6), round(outward, 6)))
                    if not covered:
                        uncovered += 1
                        print(
                            "COVERAGE_MISS", top.name, bottom.name, f"fort={build:g}",
                            "point", tuple(round(value, 4) for value in point),
                            "part", part, "arm_t", round(t, 4),
                            "nearest", nearest_details,
                            "armpit_band", cavity_band,
                            "cavity", cavity,
                            "normal", tuple(round(value, 3) for value in normal),
                            "far", [(garment.name, round(hit[3], 4) if hit[0] is not None else None)
                                    for garment in covering
                                    for hit in [trees[(garment.name, build)].ray_cast(origin, normal, 0.3)]],
                            "body_far", (lambda hit: round(hit[3], 4) if hit[0] is not None else None)(
                                body_tree.ray_cast(origin, normal, 0.3)),
                            "inside_body", body_crossings(body_tree, point + normal * 0.002),
                            "garment_near", [sorted((round(c.z, 4), round(c.x, 4), round(c.y, 4))
                                                    for c in shape_coordinates(garment, build)
                                                    if (c.xy - point.xy).length < 0.025)[:3]
                                             for garment in covering],
                            flush=True,
                        )
                        if len(examples) < 8:
                            examples.append((tuple(round(value, 3) for value in point),
                                             part, round(t, 3), nearest_details,
                                             "cavity", cavity, "band", cavity_band,
                                             "torso_gap", round(torso_gap, 5),
                                             "arm_clearance", round(arm_clearance, 5)))
                if garment_samples == 0 or uncovered:
                    coverage_errors.append(
                        f"Couverture {top.name}+{bottom.name}, fort={build:g}: "
                        f"{uncovered}/{garment_samples} points non couverts, exemples={examples}"
                    )
                else:
                    checks += 1
                print("COVERAGE_CHECK", top.name, bottom.name, build,
                      garment_samples, uncovered, flush=True)
            print("COVERAGE_PAIR", top.name, bottom.name, "fort=-1,0,1", flush=True)
    print("COVERAGE_CHECKS", checks, flush=True)
    for garment in tops + bottoms:
        for build in (-1.0, 0.0, 1.0):
            print("COVERAGE_OCCLUDED", garment.name, build,
                  len(self_occluded[(garment.name, build)]), flush=True)
            print("COVERAGE_CAVITY_ACCEPTED", garment.name, build,
                  len(cavity_accepted[(garment.name, build)]), flush=True)
            print("COVERAGE_POCKET_ACCEPTED", garment.name, build,
                  len(enclosed_accepted[(garment.name, build)]), flush=True)
            print("COVERAGE_BURIED_ACCEPTED", garment.name, build,
                  len(buried_accepted[(garment.name, build)]), flush=True)
    if coverage_errors:
        raise RuntimeError("; ".join(coverage_errors[:8]))


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
    scale = HEAD_R * (1 + offset / 0.2)
    columns, rows = 96, 14

    def limit(azimuth):
        a = abs(azimuth) / math.pi
        if a < 0.5:
            return front + (side - front) * smoothstep(0.0, 1.0, a / 0.5)
        return side + (back - side) * smoothstep(0.0, 1.0, (a - 0.5) / 0.5)

    # Rangées posées sur la lisière elle-même : le bord des cheveux est une courbe, pas un escalier.
    grid = []
    for k in range(columns):
        azimuth = -math.pi + 2 * math.pi * k / columns
        low = limit(azimuth)
        column = []
        for j in range(rows):
            el = low + (math.pi / 2 - low) * j / rows
            d = Vector((math.sin(azimuth) * math.cos(el), -math.cos(azimuth) * math.cos(el), math.sin(el)))
            column.append(tmp.verts.new(HEAD_C + Vector((d.x * scale.x, d.y * scale.y, d.z * scale.z))))
        grid.append(column)
    pole = tmp.verts.new(HEAD_C + Vector((0, 0, scale.z)))
    for k in range(columns):
        n = (k + 1) % columns
        for j in range(rows - 1):
            tmp.faces.new((grid[k][j], grid[n][j], grid[n][j + 1], grid[k][j + 1]))
        tmp.faces.new((grid[k][rows - 1], grid[n][rows - 1], pole))
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
        ellipsoid(bm, on_head(azimuth, elevation, lift), radius, scale, segments=24)


def rounded_lock(bm, azimuth, start, end, radius=0.05, lift=1.04):
    base = on_head(azimuth, start, lift)
    tip = on_head(azimuth * 0.82, end, lift)
    axis = tip - base
    rotation = axis.to_track_quat("Z", "Y")
    center = (base + tip) * 0.5
    length = max(0.85, axis.length / (2 * radius))
    ellipsoid(bm, center, radius, (1.25, 0.9, length), segments=24, rotation=rotation)


def soft_fringe(bm, radius=0.054):
    for azimuth in (-0.68, -0.34, 0.0, 0.34, 0.68):
        elevation = 0.37 + 0.04 * abs(azimuth)
        ellipsoid(
            bm,
            on_head(azimuth, elevation, 1.045),
            radius,
            (1.28, 0.88, 0.72),
            segments=24,
        )


def hair_court(bm):
    scalp(bm, 0.43, 0.06, -0.45, 0.024)
    tufts(bm, [(a, 0.55 - 0.1 * abs(a), 0.058, (1.25, 1.0, 0.82))
               for a in (-0.55, -0.25, 0.05, 0.35)], 1.045)
    soft_fringe(bm, 0.052)


def hair_epis(bm):
    scalp(bm, 0.43, 0.06, -0.45, 0.024)
    tufts(bm, [(a, 0.55, 0.053, (1.25, 1.0, 0.82)) for a in (-0.55, -0.2, 0.2, 0.55)], 1.045)
    soft_fringe(bm, 0.05)
    for azimuth, rise in ((-0.78, 1.08), (-0.4, 1.2), (0.0, 1.26), (0.4, 1.2), (0.78, 1.08)):
        rounded_lock(bm, azimuth, 0.62, rise, radius=0.047)


def hair_carre(bm):
    scalp(bm, 0.34, -0.62, -0.72, 0.03)
    tufts(bm, [(a, 0.4, 0.06, (1.3, 1.0, 0.78)) for a in (-0.6, -0.3, 0.0, 0.3, 0.6)], 1.04)
    soft_fringe(bm, 0.052)
    tufts(bm, [(s * 1.45, -0.42, 0.075, (0.8, 1.1, 1.2)) for s in (-1, 1)] +
          [(s * 2.3, -0.5, 0.08, (1.0, 0.9, 1.1)) for s in (-1, 1)] + [(math.pi, -0.55, 0.09, (1.3, 0.8, 1.0))],
          1.02)


def hair_long(bm):
    hair_carre(bm)
    for azimuth in (-2.5, -1.9, math.pi, 1.9, 2.5):
        rounded_lock(bm, azimuth, 0.05, -0.8, radius=0.055, lift=1.015)


def hair_queue(bm):
    scalp(bm, 0.43, 0.02, -0.4, 0.024)
    tufts(bm, [(a, 0.53, 0.05, (1.2, 1.0, 0.8)) for a in (-0.45, -0.1, 0.25)], 1.04)
    soft_fringe(bm, 0.05)
    for y, z, r in ((0.2, 0.88, 0.058), (0.25, 0.82, 0.062), (0.29, 0.75, 0.056),
                    (0.31, 0.68, 0.046), (0.3, 0.62, 0.035)):
        ellipsoid(bm, (0, y, z), r, (1.0, 1.0, 1.15), segments=24)


def hair_chignons(bm):
    scalp(bm, 0.42, 0.02, -0.45, 0.024)
    tufts(bm, [(a, 0.5, 0.05, (1.2, 1.0, 0.8)) for a in (-0.4, 0.0, 0.4)], 1.04)
    soft_fringe(bm, 0.05)
    for sx in (-1, 1):
        ellipsoid(bm, (0.14 * sx, 0.025, 0.965), 0.078, (1.0, 0.95, 1.05), segments=32)


def hair_boucles(bm):
    scalp(bm, 0.43, 0.0, -0.45, 0.025)
    soft_fringe(bm, 0.05)
    rng = random.Random(9)
    spots = []
    for k in range(16):
        azimuth = rng.uniform(-math.pi, math.pi)
        elevation = math.asin(rng.uniform(-0.3, 1.0))
        d = Vector((math.sin(azimuth) * math.cos(elevation), -math.cos(azimuth) * math.cos(elevation),
                    math.sin(elevation)))
        if hairline(d, 0.5, 0.05, -0.4):
            spots.append((azimuth, elevation, rng.uniform(0.055, 0.068), (1.05, 1.0, 0.9)))
    tufts(bm, spots, 1.07)


def hair_rase(bm):
    scalp(bm, 0.5, 0.1, -0.4, 0.007, thickness=0.012)


HAIRS = {
    "court": (hair_court, 0.005, 6),
    "epis": (hair_epis, 0.005, 3),
    "carre": (hair_carre, 0.006, 7),
    "long": (hair_long, 0.006, 7),
    "queue": (hair_queue, 0.005, 6),
    "chignons": (hair_chignons, 0.0045, 11),
    "boucles": (hair_boucles, 0.0045, 11),
    "rase": (hair_rase, 0.004, 2),
}


def build_hair(style):
    build, voxel, smooth = HAIRS[style]
    obj = remeshed(f"cheveux-{style}", build, voxel=voxel, smooth=smooth, triangles=2600)
    return assign(obj, "cheveux")



# ---------------------------------------------------------------------------
# Garde-robe : objets gagnés en progressant (« tete-… », « visage-… », « cou-… », « dos-… »,
# « haut-sweat »). Sous un couvre-chef, l'app applique aux cheveux leur forme « chapeau », qui les
# tasse sous la calotte : la coiffure reste visible sous le bord.
# ---------------------------------------------------------------------------
def standing_mesh(obj):
    """Applique les transformations : les sommets sont à leur place, l'origine au pied du personnage."""
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def merged(objects, name, material):
    obj = standing_mesh(geo.join(objects, name)) if len(objects) > 1 else standing_mesh(objects[0])
    obj.name = name
    if material:
        assign(obj, material)
    return geo.smooth(obj)


def spline(points, divisions=6):
    """Courbe de Catmull-Rom passant par les points (3D), pour des sangles et des cordons souples."""
    pts = [Vector(p) for p in points]
    out = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, len(pts) - 1)]
        for k in range(divisions):
            t = k / divisions
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t))
    out.append(pts[-1])
    return [tuple(v) for v in out]


def hat_offset(elevation):
    """Épaisseur sous un couvre-chef : serré au bord (juste au-dessus des cheveux plaqués), plus ample
    sur le dessus. Les coiffures sont tassées sous ce volume (forme « chapeau » des cheveux)."""
    return 0.026 + 0.034 * smoothstep(0.3, 1.0, elevation)


def head_at(d, offset):
    """Point à `offset` mètres au-dessus de la tête, dans la direction d (tête ramenée à une sphère)."""
    return Vector((HEAD_C.x + d.x * (HEAD_R.x + offset), HEAD_C.y + d.y * (HEAD_R.y + offset),
                   HEAD_C.z + d.z * (HEAD_R.z + offset)))


def hat_shell(bm, front, side, back, extra, thickness, stretch=1.0):
    """Calotte d'un couvre-chef, posée sur le volume `hat_offset` (+ `extra`) et coupée à la lisière."""
    tmp = bmesh.new()
    geom = bmesh.ops.create_uvsphere(tmp, u_segments=36, v_segments=18, radius=1.0)
    for v in geom["verts"]:
        d = v.co.normalized()
        v.co = head_at(d, hat_offset(math.asin(max(-1.0, min(1.0, d.z)))) + extra)
        if stretch != 1.0 and v.co.z > HEAD_C.z:
            v.co.z = HEAD_C.z + (v.co.z - HEAD_C.z) * stretch
    drop = [f for f in tmp.faces if not hairline(head_direction(f.calc_center_median()), front, side, back)]
    bmesh.ops.delete(tmp, geom=drop, context="FACES")
    mesh = bpy.data.meshes.new("tmp")
    tmp.to_mesh(mesh)
    tmp.free()
    obj = bpy.data.objects.new("tmp", mesh)
    scene.collection.objects.link(obj)
    mod = obj.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = 1
    apply(obj)
    bm.from_mesh(obj.data)
    bpy.data.objects.remove(obj, do_unlink=True)


def add_hat_key(hair):
    """Forme « chapeau » d'une coiffure : ce qui dépasserait du volume sous un couvre-chef y est
    ramené (l'app l'applique quand l'élève porte un chapeau). Les mèches sous le bord restent."""
    if not hair.data.shape_keys:
        hair.shape_key_add(name="Basis")
    key = hair.shape_key_add(name="chapeau")
    for vertex, target in zip(hair.data.vertices, key.data):
        p = vertex.co
        d = head_direction(p)
        elevation = math.asin(max(-1.0, min(1.0, d.z)))
        if elevation < 0.1:
            continue
        limit = head_at(d, hat_offset(elevation) - 0.006)
        reach = (limit - HEAD_C).length
        here = (p - HEAD_C).length
        # Au-dessus de la lisière d'un chapeau, tout ce qui dépasse est plaqué sous la calotte ; plus
        # bas, la contrainte s'efface (les mèches des côtés et de la nuque tombent librement).
        weight = smoothstep(0.1, 0.3, elevation)
        if here > reach:
            target.co = p.lerp(HEAD_C + (p - HEAD_C) * (reach / here), weight)
    return hair


def cap():
    """Casquette : calotte, bouton sur le dessus et visière légèrement inclinée vers l'avant."""
    bm = bmesh.new()
    hat_shell(bm, 0.36, 0.26, 0.1, 0.0, 0.014)
    crown = link("calotte", bm)
    top = head_at(Vector((0, 0, 1)), hat_offset(math.pi / 2) + 0.014)
    button = geo.sphere((top.x, top.y, top.z + 0.004), 0.018, MATERIALS["tissu"], segments=12)
    d = Vector((0, -math.cos(0.36), math.sin(0.36)))
    edge = head_at(d, hat_offset(0.36) + 0.007)
    bm = bmesh.new()
    arc = [bm.verts.new((0.17 * math.cos(a), edge.y - 0.13 * math.sin(a), 0))
           for a in [math.pi * k / 16 for k in range(17)]]
    back_edge = [bm.verts.new((x, edge.y + 0.03, 0)) for x in (-0.17, 0.17)]
    bm.faces.new(arc + back_edge)
    for v in bm.verts:
        v.co.z = edge.z - 0.012 - (edge.y - v.co.y) * 0.22
    visor = link("visiere", bm)
    mod = visor.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = 0.012
    geo.bevel(visor, 0.004, 2)
    return merged([crown, button, visor], "tete-casquette", "tissu")


def explorer_hat():
    """Chapeau d'explorateur : calotte bombée, large bord qui retombe un peu, bandeau sombre."""
    bm = bmesh.new()
    hat_shell(bm, 0.3, 0.3, 0.3, 0.01, 0.016, stretch=1.05)
    crown = link("calotte", bm)
    base = 0.3
    ring = 48

    def around(a, elevation, extra):
        d = Vector((math.sin(a) * math.cos(elevation), -math.cos(a) * math.cos(elevation), math.sin(elevation)))
        return head_at(d, hat_offset(elevation) + extra)

    bm = bmesh.new()
    rows = []
    for j, (extra, droop) in enumerate(((0.0, 0.0), (0.06, -0.012), (0.115, -0.03))):
        row = []
        for k in range(ring):
            a = 2 * math.pi * k / ring
            p = around(a, base, 0.02)
            out = Vector((p.x - HEAD_C.x, p.y - HEAD_C.y, 0)).normalized()
            row.append(bm.verts.new((p.x + out.x * extra, p.y + out.y * extra, p.z - 0.01 + droop)))
        rows.append(row)
    for j in range(len(rows) - 1):
        for k in range(ring):
            bm.faces.new((rows[j][k], rows[j][(k + 1) % ring], rows[j + 1][(k + 1) % ring], rows[j + 1][k]))
    brim = link("bord", bm)
    mod = brim.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = 0.012
    band_points = []
    for k in range(ring):
        a = 2 * math.pi * k / ring
        p = around(a, base + 0.07, 0.03)
        band_points.append((p.x, p.y, p.z))
    band = geo.tube(band_points, 0.016, MATERIALS["detail"], "bandeau", cyclic=True)
    hat = merged([crown, brim], "chapeau", "tissu")
    return merged([hat, standing_mesh(band)], "tete-chapeau-explorateur", None)


# Écart et hauteur des yeux aux deux bouts des curseurs (src/features/avatar/logic/face.ts).
EYE_SPACING = (0.27, 0.41)
EYE_HEIGHT = (-0.08, 0.14)


def face_point(s, h, lift=1.0):
    """Point du visage pour une direction (s vers la gauche du personnage, h vers le haut), dans le
    repère du shader du visage (la tête ramenée à une sphère)."""
    front = math.sqrt(max(0.0, 1 - s * s - h * h))
    return Vector((s * HEAD_R.x * lift, -front * HEAD_R.y * lift, HEAD_C.z + h * HEAD_R.z * lift))


def glasses_points(spacing, height):
    """Montures rondes, pont et branches, pour un écart et une hauteur des yeux donnés."""
    rings, bridge, temples = [], [], []
    for sx in (1, -1):
        c = face_point(spacing * sx, height, 1.0)
        n = Vector((c.x / HEAD_R.x ** 2, c.y / HEAD_R.y ** 2, (c.z - HEAD_C.z) / HEAD_R.z ** 2)).normalized()
        c = c + n * 0.016
        u = Vector((0, 0, 1)).cross(n).normalized()
        v = n.cross(u).normalized()
        r = 0.036
        rings.append([tuple(c + (math.cos(a) * u + math.sin(a) * v) * r)
                      for a in [2 * math.pi * k / 8 for k in range(8)]])
        inner = c - u * r * sx
        outer = c + u * r * sx
        bridge.append(inner)
        ear = Vector((0.208 * sx, 0.02, 0.785 + (height - 0.03) * 0.15))
        mid = face_point(0.86 * sx, height * 0.6, 1.07)
        temples.append([tuple(outer), tuple(mid), tuple(ear)])
    top = (bridge[0] + bridge[1]) / 2 + Vector((0, -0.004, 0.008))
    return rings, [tuple(bridge[0]), tuple(top), tuple(bridge[1])], temples


def glasses_tube(points, radius, name, cyclic=False):
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    curve.resolution_u = 1
    curve.use_fill_caps = True
    spline_data = curve.splines.new("POLY")
    spline_data.use_cyclic_u = cyclic
    spline_data.points.add(len(points) - 1)
    for point, coordinate in zip(spline_data.points, points):
        point.co = (*coordinate, 1)
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return geo.smooth(M.assign(bpy.context.active_object, MATERIALS["tissu"]))


def glasses_mesh(spacing, height, name, sun=False):
    rings, bridge, temples = glasses_points(spacing, height)
    frame = 0.0068 if sun else 0.0055
    parts = [glasses_tube(ring, frame, f"{name}-cercle", cyclic=True) for ring in rings]
    parts.append(glasses_tube(bridge, frame - 0.0005, f"{name}-pont"))
    parts += [glasses_tube(t, 0.0045, f"{name}-branche") for t in temples]
    frames = merged([standing_mesh(p) for p in parts], f"{name}-montures", "tissu")
    if not sun:
        frames.name = name
        return frames
    # Verres teintés : un disque dans chaque monture, juste derrière elle.
    bm = bmesh.new()
    for ring in rings:
        center = sum((Vector(p) for p in ring), Vector()) / len(ring)
        verts = [bm.verts.new(center + (Vector(p) - center) * 0.97) for p in ring]
        bm.faces.new(verts)
    lenses = assign(link(f"{name}-verres", bm), "verre")
    obj = geo.smooth(standing_mesh(geo.join([frames, lenses], name)))
    obj.name = name
    return obj


def glasses_piece(name, sun=False):
    """Lunettes, et deux formes qui suivent les yeux de l'élève : « ecart » et « hauteur »."""
    base = glasses_mesh(EYE_SPACING[0], EYE_HEIGHT[0], name, sun)
    wide = glasses_mesh(EYE_SPACING[1], EYE_HEIGHT[0], "lunettes-ecart", sun)
    high = glasses_mesh(EYE_SPACING[0], EYE_HEIGHT[1], "lunettes-hauteur", sun)
    base.shape_key_add(name="Basis")
    for key_name, other in (("ecart", wide), ("hauteur", high)):
        key = base.shape_key_add(name=key_name)
        assert len(other.data.vertices) == len(base.data.vertices), "lunettes : topologies différentes"
        for target, vertex in zip(key.data, other.data.vertices):
            target.co = vertex.co
        bpy.data.objects.remove(other, do_unlink=True)
    return base


def scarf():
    """Écharpe : un tour autour du cou, un nœud et un pan qui tombe devant."""
    ring = []
    for k in range(32):
        a = 2 * math.pi * k / 32
        wobble = 0.004 * math.sin(5 * a)
        ring.append((0.094 * math.cos(a), 0.086 * math.sin(a), 0.566 + wobble + 0.006 * math.cos(2 * a)))
    loop = geo.tube(ring, 0.03, MATERIALS["tissu"], "tour", cyclic=True)
    tail = geo.tube(spline([(0.05, -0.088, 0.556), (0.066, -0.118, 0.5), (0.074, -0.128, 0.43)], 4), 0.026,
                    MATERIALS["tissu"], "pan", taper=None)
    knot = geo.sphere((0.05, -0.092, 0.56), 0.034, MATERIALS["tissu"], segments=16)
    obj = merged([standing_mesh(loop), standing_mesh(tail), standing_mesh(knot)], "cou-echarpe", "tissu")
    for v in obj.data.vertices:
        if v.co.y < -0.09 and v.co.z < 0.54:
            v.co.y -= 0.004 * (0.54 - v.co.z) / 0.1
    return obj


def backpack():
    """Sac à dos : poche principale bombée, petite poche, poignée et bretelles sur les épaules."""
    bag = geo.box((0, 0.18, 0.44), (0.21, 0.085, 0.21), MATERIALS["tissu"], bevel_width=0.03)
    pocket = geo.box((0, 0.228, 0.405), (0.13, 0.026, 0.085), MATERIALS["tissu"], bevel_width=0.012)
    handle = geo.tube(spline([(-0.035, 0.16, 0.548), (0, 0.165, 0.572), (0.035, 0.16, 0.548)], 4), 0.008,
                      MATERIALS["detail"], "poignee")
    straps = []
    for sx in (1, -1):
        # Par-dessus l'épaule, le long de la poitrine, puis sous le bras jusqu'au bas du sac.
        path = [(0.07 * sx, 0.14, 0.515), (0.08 * sx, 0.075, 0.57), (0.086 * sx, 0.0, 0.585),
                (0.09 * sx, -0.075, 0.553), (0.098 * sx, -0.118, 0.49), (0.128 * sx, -0.09, 0.445),
                (0.15 * sx, 0.0, 0.43), (0.13 * sx, 0.1, 0.39), (0.08 * sx, 0.15, 0.37)]
        straps.append(standing_mesh(geo.tube(spline(path, 5), 0.012, MATERIALS["detail"], "bretelle")))
    body_part = merged([standing_mesh(bag), standing_mesh(pocket)], "sac", "tissu")
    return merged([body_part, standing_mesh(handle)] + straps, "dos-sac-a-dos", None)


def hoodie(body):
    """Sweat à capuche : plus long que le t-shirt, manches longues, capuche posée dans le dos et
    deux cordons clairs."""
    cuts = sweat_cuts()
    shirt = shell("sweat", body, lambda p, part, side, t: (part == "torse" and p.z > 0.285) or
                  (part == "bras" and t < 0.9), 0.019, 0.007, "tissu", cuts)

    def hood_parts(bm):
        ellipsoid(bm, (0, 0.092, 0.565), 0.07, (1.75, 0.85, 0.8), segments=24)
        ellipsoid(bm, (0, 0.118, 0.525), 0.06, (1.55, 0.75, 0.95), segments=24)

    hood = assign(remeshed("capuche", hood_parts, voxel=0.005, smooth=6, triangles=1400), "tissu")
    assign_weights(hood)
    cords = []
    for sx in (1, -1):
        cords.append(geo.tube(spline([(0.026 * sx, -0.098, 0.552), (0.03 * sx, -0.118, 0.5),
                                      (0.032 * sx, -0.124, 0.465)], 4), 0.0045, MATERIALS["semelle"], "cordon"))
    for cord in cords:
        standing_mesh(cord)
        assign(cord, "semelle")
        assign_weights(cord)
    return geo.smooth(geo.join([shirt, hood] + cords, "haut-sweat"))



def head_dir(azimuth, elevation):
    """Direction depuis le centre de la tête (tête ramenée à une sphère) ; azimut 0 devant."""
    return Vector((math.sin(azimuth) * math.cos(elevation), -math.cos(azimuth) * math.cos(elevation),
                   math.sin(elevation)))


def rim_elevation(azimuth, front, side, back):
    """Hauteur de la lisière d'un couvre-chef autour de la tête (comme `hairline`)."""
    a = abs(math.atan2(math.sin(azimuth), math.cos(azimuth))) / math.pi
    if a < 0.5:
        return front + (side - front) * smoothstep(0.0, 1.0, a / 0.5)
    return side + (back - side) * smoothstep(0.0, 1.0, (a - 0.5) / 0.5)


def ring_points(elevation_of, extra, count=48):
    return [tuple(head_at(head_dir(a, elevation_of(a)), hat_offset(elevation_of(a)) + extra))
            for a in [2 * math.pi * k / count for k in range(count)]]


def bandana():
    """Bandana noué derrière la tête : une bande sur le front et deux pans dans la nuque."""
    count, rows = 64, 4
    bm = bmesh.new()
    grid = []
    for j in range(rows):
        el_of = lambda a, j=j: 0.3 + 0.24 * j / (rows - 1) - 0.06 * (abs(math.cos(a / 2)) < 0.5)
        grid.append([bm.verts.new(p) for p in ring_points(el_of, 0.006, count)])
    for j in range(rows - 1):
        for k in range(count):
            bm.faces.new((grid[j][k], grid[j][(k + 1) % count], grid[j + 1][(k + 1) % count], grid[j + 1][k]))
    band = link("bande", bm)
    mod = band.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = 0.008
    knot_at = head_at(head_dir(math.pi, 0.4), hat_offset(0.4) + 0.03)
    knot = geo.sphere(tuple(knot_at), 0.026, MATERIALS["tissu"], segments=14)
    tails = [geo.tube(spline([tuple(knot_at), tuple(knot_at + Vector((0.03 * sx, 0.05, -0.06))),
                               tuple(knot_at + Vector((0.05 * sx, 0.07, -0.13)))], 4), 0.015,
                      MATERIALS["tissu"], "pan") for sx in (1, -1)]
    return merged([standing_mesh(band), standing_mesh(knot)] + [standing_mesh(t) for t in tails],
                  "tete-bandana", "tissu")


def beanie():
    """Bonnet : calotte un peu haute, revers épais et pompon."""
    front, side, back = 0.36, 0.26, 0.08
    bm = bmesh.new()
    hat_shell(bm, front, side, back, 0.006, 0.014, stretch=1.1)
    crown = link("calotte", bm)
    cuff = geo.tube(ring_points(lambda a: rim_elevation(a, front, side, back) + 0.06, 0.018), 0.026,
                    MATERIALS["tissu"], "revers", cyclic=True)
    top = head_at(Vector((0, 0, 1)), hat_offset(math.pi / 2) + 0.006)
    pompon = geo.sphere((top.x, top.y, HEAD_C.z + (top.z - HEAD_C.z) * 1.1 + 0.03), 0.042, MATERIALS["tissu"], segments=16)
    return merged([crown, standing_mesh(cuff), standing_mesh(pompon)], "tete-bonnet", "tissu")


def octahedron(bm, center, radii):
    """Pierre taillée à huit faces."""
    rx, ry, rz = radii
    ends = [bm.verts.new(center + Vector((0, 0, rz))), bm.verts.new(center - Vector((0, 0, rz)))]
    ring = [bm.verts.new(center + Vector((rx * math.cos(a), ry * math.sin(a), 0)))
            for a in (k * math.pi / 2 for k in range(4))]
    for k in range(4):
        a, b = ring[k], ring[(k + 1) % 4]
        bm.faces.new((a, b, ends[0]))
        bm.faces.new((b, a, ends[1]))


def crown():
    """Couronne de figurine : bandeau à cinq pointes, une pierre rouge sertie au bout de chaque pointe.
    Assez peu de faces pour ne jamais être simplifiée (une simplification raboterait les pointes
    et laisserait les pierres en l'air)."""
    count, base = 10, 0.95
    bm = bmesh.new()
    rings, tips = [], []
    for k in range(count):
        a = 2 * math.pi * k / count
        p = head_at(head_dir(a, base), hat_offset(base) - 0.03)
        radial = Vector((p.x - HEAD_C.x, p.y - HEAD_C.y, 0)).normalized()
        rise = 0.075 if k % 2 == 0 else 0.032
        outer, inner = p + radial * 0.005, p - radial * 0.006
        rings.append([bm.verts.new(outer), bm.verts.new(outer + Vector((0, 0, rise))),
                      bm.verts.new(inner + Vector((0, 0, rise))), bm.verts.new(inner)])
        if k % 2 == 0:
            tips.append((outer + inner) * 0.5 + Vector((0, 0, rise)))
    for k in range(count):
        a, b = rings[k], rings[(k + 1) % count]
        for s in range(3):
            bm.faces.new((a[s], b[s], b[s + 1], a[s + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    band = clean_mesh_normals(assign(link("bandeau", bm), "tissu"))
    stones = bmesh.new()
    for tip in tips:
        # Octaèdre enfoncé d'un tiers dans la pointe : la pierre est sertie, pas posée.
        octahedron(stones, tip + Vector((0, 0, 0.006)), (0.011, 0.011, 0.013))
    front = head_at(head_dir(0, base), hat_offset(base) - 0.03 + 0.007) + Vector((0, 0, 0.02))
    octahedron(stones, front, (0.012, 0.006, 0.012))
    stones_obj = assign(link("pierres", stones), "bijou")
    result = clean_mesh_normals(merged([band, stones_obj], "tete-couronne", None))
    if result.data.validate(verbose=True):
        raise RuntimeError("Maillage invalide après reconstruction de tete-couronne")
    print("CROWN_MESH_VALID", result.name, len(result.data.vertices), len(result.data.polygons), flush=True)
    return result


def trousers(body):
    """Pantalon : comme le short, mais jusqu'au-dessus des chaussures."""
    cuts = trousers_cuts()
    return shell("bas-pantalon", body, lambda p, part, side, t: (part == "torse" and p.z < 0.355) or
                 (part == "jambe" and t < 1.0), 0.014, 0.006, "tissu", cuts)


def weigh_to_trunk(obj):
    """Poids d'une pièce qui tombe du tronc (jupe, cape) : bassin, dos et poitrine selon la hauteur,
    sans suivre les jambes ni les bras."""
    groups = {name: obj.vertex_groups.get(name) or obj.vertex_groups.new(name=name) for name in BONE_NAMES}
    for v in obj.data.vertices:
        hips = 1 - smoothstep(0.33, 0.4, v.co.z)
        chest = smoothstep(0.42, 0.5, v.co.z)
        for bone, w in (("hips", hips), ("spine", max(0.0, 1 - hips - chest)), ("chest", chest)):
            if w > 1e-3:
                groups[bone].add([v.index], w, "REPLACE")
    return obj


def skirt():
    """Jupe évasée, un peu plissée, portée à la taille."""
    count = 64
    rings = [(0.362, 0.136, 0.108, 0.0), (0.33, 0.145, 0.118, 0.2), (0.27, 0.165, 0.14, 0.6),
             (0.19, 0.195, 0.17, 1.0)]
    bm = bmesh.new()
    loops = []
    for z, rx, ry, pleat in rings:
        loop = []
        for k in range(count):
            a = 2 * math.pi * k / count
            f = 1 + 0.035 * pleat * math.cos(12 * a)
            loop.append(bm.verts.new((rx * f * math.cos(a), ry * f * math.sin(a), z)))
        loops.append(loop)
    for j in range(len(loops) - 1):
        for k in range(count):
            bm.faces.new((loops[j][k], loops[j][(k + 1) % count], loops[j + 1][(k + 1) % count], loops[j + 1][k]))
    obj = link("bas-jupe", bm)
    mod = obj.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = 0.007
    apply(obj)
    return weigh_to_trunk(geo.smooth(assign(obj, "tissu")))


def overall_bib_region(point, part=None, side=None, t=None):
    if part is None:
        part = classify(point)[0]
    return part == "torse" and 0.34 < point.z < 0.515 and point.y < -0.03 and abs(point.x) < 0.1


def body_reference_point(point, face_index, faces, coordinates, reference_coordinates):
    indices = faces[face_index]
    a, b, c = (coordinates[index] for index in indices)
    edge_a, edge_b, point_offset = b - a, c - a, point - a
    dot_aa = edge_a.dot(edge_a)
    dot_ab = edge_a.dot(edge_b)
    dot_bb = edge_b.dot(edge_b)
    dot_pa = point_offset.dot(edge_a)
    dot_pb = point_offset.dot(edge_b)
    denominator = dot_aa * dot_bb - dot_ab * dot_ab
    if abs(denominator) < 1e-12:
        weights = (1 / 3, 1 / 3, 1 / 3)
    else:
        weight_b = (dot_bb * dot_pa - dot_ab * dot_pb) / denominator
        weight_c = (dot_aa * dot_pb - dot_ab * dot_pa) / denominator
        weight_a = 1 - weight_b - weight_c
        weights = tuple(max(0.0, weight) for weight in (weight_a, weight_b, weight_c))
        total = sum(weights)
        weights = tuple(weight / total for weight in weights) if total > 0 else (1 / 3, 1 / 3, 1 / 3)
    return sum(
        (reference_coordinates[index] * weight for index, weight in zip(indices, weights)),
        Vector(),
    )


def overalls(body):
    """Salopette : un pantalon, une bavette sur la poitrine, deux bretelles et leurs boutons."""
    cuts = overalls_cuts()
    # Une salopette se porte par-dessus le haut : sa coque passe au-dessus de celle du t-shirt.
    legs = shell("salopette", body, lambda p, part, side, t: (part == "torse" and p.z < 0.385) or
                 (part == "jambe" and t < 1.0), 0.026, 0.006, "tissu", cuts)
    bib_cuts = overall_bib_cuts()
    bib = shell("bavette", body, overall_bib_region, 0.031, 0.006, "tissu", bib_cuts)
    parts = [legs, bib]
    for sx in (1, -1):
        path = [(0.07 * sx, -0.118, 0.495), (0.08 * sx, -0.078, 0.553), (0.085 * sx, 0.0, 0.587),
                (0.08 * sx, 0.075, 0.566), (0.06 * sx, 0.13, 0.48), (0.05 * sx, 0.135, 0.39)]
        strap = assign(standing_mesh(geo.tube(spline(path, 5), 0.011, MATERIALS["tissu"], "bretelle")), "tissu")
        button = assign(standing_mesh(geo.sphere((0.07 * sx, -0.128, 0.488), 0.012, MATERIALS["semelle"], segments=10)),
                        "semelle")
        for piece in (strap, button):
            assign_weights(piece)
        parts += [strap, button]
    return geo.smooth(geo.join(parts, "bas-salopette"))


def sole(name, material):
    """Semelle arrondie qui suit le pied, un peu plus large que lui, à plat sur le sol."""
    def parts(bm):
        for _, sx in SIDES:
            for k in range(7):
                f = k / 6
                c = mirrored(HEEL.lerp(TOE + Vector((0, -0.014, 0)), f), sx)
                ellipsoid(bm, (c.x, c.y, 0.013 + 0.005 * f * f), 0.054, (1.0, 1.0, 0.32), segments=20)

    return assign_weights(assign(remeshed(name, parts, voxel=0.004, smooth=4, triangles=900), material))


def rain_boots(body):
    """Bottes de pluie : tige jusqu'à mi-mollet, revers et semelle sombre."""
    cuts = []
    for _, sx in SIDES:
        point, normal = leg_cut(0.72, sx)
        cuts.append(cut_plane(point, normal, 1, ("jambe", "pied"), sx))
    boot = shell("bottes", body, lambda p, part, side, t: part == "pied" or (part == "jambe" and t > 0.67),
                 0.016, 0.006, "tissu", cuts)
    rims = []
    for _, sx in SIDES:
        axis = mirrored(HIP.lerp(ANKLE, 0.72), sx)
        r = 0.056 + (0.045 - 0.056) * 0.72 + 0.02
        rims.append(geo.tube([(axis.x + r * math.cos(a), axis.y + r * math.sin(a), axis.z)
                              for a in [2 * math.pi * k / 32 for k in range(32)]], 0.009,
                             MATERIALS["tissu"], "revers", cyclic=True))
    rims = [assign_weights(assign(standing_mesh(r), "tissu")) for r in rims]
    return geo.smooth(geo.join([boot] + rims + [sole("semelle-bottes", "detail")], "chaussures-bottes"))


def cape():
    """Cape nouée autour du cou, qui tombe dans le dos jusqu'aux mollets."""
    rows, cols = 12, 17
    bm = bmesh.new()
    grid = []
    for j in range(rows):
        v = j / (rows - 1)
        z = 0.555 - v * 0.37
        half = 0.12 + 0.07 * v ** 1.2
        row = []
        for i in range(cols):
            u = -1 + 2 * i / (cols - 1)
            x = u * half
            # En haut, la cape enveloppe les épaules ; plus bas, elle s'éloigne du dos et ondule.
            y = 0.125 + 0.06 * v - 0.085 * (1 - v) ** 2 * u * u + 0.012 * v * math.sin(6 * u)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for j in range(rows - 1):
        for i in range(cols - 1):
            bm.faces.new((grid[j][i], grid[j + 1][i], grid[j + 1][i + 1], grid[j][i + 1]))
    sheet = link("cape", bm)
    mod = sheet.modifiers.new("Epaisseur", "SOLIDIFY")
    mod.thickness = 0.008
    cloth = weigh_to_trunk(merged([sheet], "drap", "tissu"))
    cord = geo.tube(spline([(0.12, 0.04, 0.555), (0.08, -0.06, 0.565), (0, -0.092, 0.566),
                            (-0.08, -0.06, 0.565), (-0.12, 0.04, 0.555)], 5), 0.008, MATERIALS["detail"], "cordon")
    clasp = geo.sphere((0, -0.097, 0.565), 0.016, MATERIALS["detail"], segments=10)
    tie = merged([standing_mesh(cord), standing_mesh(clasp)], "attache", "detail")
    assign_weights(tie)
    return geo.smooth(geo.join([cloth, tie], "dos-cape"))


@dataclass(frozen=True)
class Piece:
    slot: str
    build: Callable
    covers: Callable | None = None
    follows_build: bool = False
    cuts: Callable | None = None
    masks_zones: bool = False
    over: tuple[str, ...] = ()
    over_region: Callable | None = None
    over_weight_source: str | None = None


PIECE_SLOT_PREFIXES = {
    "haut": "haut-",
    "bas": "bas-",
    "chaussures": "chaussures-",
    "tete": "tete-",
    "visage": "visage-",
    "cou": "cou-",
    "dos": "dos-",
}
PIECE_TRIANGLE_CAPS = {
    "haut": 750,
    "bas": 430,
    "chaussures": 580,
    "tete": 130,
    "visage": 100,
    "cou": 60,
    "dos": 68,
}
BASE_TRIANGLE_CAPS = {"corps": 1380, "tete": 780, "cheveux": 520}
SOFT_HAIR_TRIANGLE_CAP = 500
DEFAULT_PIECES = ("haut-tshirt", "bas-short", "chaussures-baskets")

PIECES = {
    "haut-tshirt": Piece(
        "haut", tshirt, with_hem_contract(covers_tshirt, tshirt_cuts),
        follows_build=True, cuts=tshirt_cuts, masks_zones=True,
    ),
    "bas-short": Piece(
        "bas", shorts, with_hem_contract(covers_short, short_cuts),
        follows_build=True, cuts=short_cuts, masks_zones=True,
    ),
    "chaussures-baskets": Piece("chaussures", sneakers),
    "tete-casquette": Piece("tete", lambda body: assign_weights(cap(), "tete")),
    "tete-chapeau-explorateur": Piece("tete", lambda body: assign_weights(explorer_hat(), "tete")),
    "tete-bandana": Piece("tete", lambda body: assign_weights(bandana(), "tete")),
    "tete-bonnet": Piece("tete", lambda body: assign_weights(beanie(), "tete")),
    "tete-couronne": Piece("tete", lambda body: assign_weights(crown(), "tete")),
    "visage-lunettes-rondes": Piece(
        "visage", lambda body: assign_weights(glasses_piece("visage-lunettes-rondes"), "tete")
    ),
    "visage-lunettes-soleil": Piece(
        "visage", lambda body: assign_weights(glasses_piece("visage-lunettes-soleil", sun=True), "tete")
    ),
    "cou-echarpe": Piece("cou", lambda body: assign_weights(scarf()), follows_build=True),
    "dos-sac-a-dos": Piece("dos", lambda body: assign_weights(backpack()), follows_build=True),
    "haut-sweat": Piece(
        "haut", hoodie, with_hem_contract(covers_sweat, sweat_cuts),
        follows_build=True, cuts=sweat_cuts, masks_zones=True,
    ),
    "bas-pantalon": Piece(
        "bas", trousers, with_hem_contract(covers_trousers, trousers_cuts),
        follows_build=True, cuts=trousers_cuts, masks_zones=True,
    ),
    "bas-jupe": Piece("bas", lambda body: skirt(), covers_skirt, follows_build=True),
    "bas-salopette": Piece(
        "bas", overalls, with_hem_contract(covers_overalls, overalls_cuts),
        follows_build=True, cuts=overalls_cuts, masks_zones=True, over=("haut",),
        over_region=overall_bib_region, over_weight_source="haut-sweat",
    ),
    "chaussures-bottes": Piece("chaussures", rain_boots, follows_build=True),
    "dos-cape": Piece("dos", lambda body: cape(), follows_build=True),
}


def validate_piece_registry():
    for name, piece in PIECES.items():
        prefix = PIECE_SLOT_PREFIXES.get(piece.slot)
        if prefix is None or not name.startswith(prefix):
            raise RuntimeError(f"Emplacement invalide pour {name}: {piece.slot}")
        if piece.slot in ("haut", "bas") and piece.covers is None:
            raise RuntimeError(f"Contrat de couverture manquant pour {name}")


BODY_ZONE_NAMES = (
    "corps",
    "corps-torse-haut",
    "corps-torse-bas",
    "corps-bras-haut",
    "corps-avant-bras",
    "corps-cuisse",
    "corps-mollet",
)
EXPECTED_BODY_ZONE_COVERAGE = {
    # La manche courte ne couvre pas toute la zone haute du bras en liaison.
    "haut-tshirt": {"corps-torse-haut"},
    "haut-sweat": {"corps-torse-haut", "corps-bras-haut", "corps-avant-bras"},
    "bas-short": {"corps-torse-bas", "corps-cuisse"},
    "bas-pantalon": {"corps-torse-bas", "corps-cuisse", "corps-mollet"},
    "bas-salopette": {"corps-torse-bas", "corps-cuisse", "corps-mollet"},
    "bas-jupe": set(),
}
EXPECTED_BODY_ZONE_MASKERS = {
    zone: {
        piece_name
        for piece_name, zones in EXPECTED_BODY_ZONE_COVERAGE.items()
        if zone in zones
    }
    for zone in BODY_ZONE_NAMES
}
ZONE_MARGIN = 0.02
_ZONE_CUT_CACHE = {}


def member_zone_cut(piece_name, part, side):
    key = (piece_name, part, side)
    if key not in _ZONE_CUT_CACHE:
        side_sign = dict(SIDES)[side]
        cuts = PIECES[piece_name].cuts()
        _ZONE_CUT_CACHE[key] = next(
            (cut for cut in cuts if part in cut.parts and cut.side == side_sign),
            None,
        )
    cut = _ZONE_CUT_CACHE[key]
    if cut is None:
        raise RuntimeError(f"Plan de coupe introuvable pour {piece_name}, {part}, {side}")
    return cut


def kept_cut_distance(point, cut):
    return (point - cut.point).dot(cut.normal) * cut.kept_side


def body_zone(point):
    if is_neck_region(point):
        return "corps"
    part, side, t = classify(point)
    if part == "torse":
        if point.z < 0.325:
            return "corps-torse-bas"
        if covers_tshirt(point, part, t):
            return "corps-torse-haut"
    elif part == "bras":
        sleeve = member_zone_cut("haut-tshirt", "bras", side)
        sweat_wrist = member_zone_cut("haut-sweat", "bras", side)
        if kept_cut_distance(point, sleeve) >= ZONE_MARGIN:
            return "corps-bras-haut"
        if kept_cut_distance(point, sweat_wrist) >= ZONE_MARGIN:
            return "corps-avant-bras"
    elif part == "jambe":
        short_hem = member_zone_cut("bas-short", "jambe", side)
        trouser_hem = member_zone_cut("bas-pantalon", "jambe", side)
        if kept_cut_distance(point, short_hem) >= ZONE_MARGIN:
            return "corps-cuisse"
        if kept_cut_distance(point, trouser_hem) >= ZONE_MARGIN:
            return "corps-mollet"
    return "corps"


def write_body_zone_masks(masks):
    zones_path = os.path.normpath(os.path.join(
        HERE, "..", "..", "src", "features", "avatar", "avatar3d", "bodyZones.json"
    ))
    with open(zones_path, "w", encoding="utf-8") as zones_file:
        json.dump(masks, zones_file, ensure_ascii=False, indent=2, sort_keys=True)
        zones_file.write("\n")


def body_face_neighbors(body):
    edge_faces = defaultdict(list)
    for polygon in body.data.polygons:
        vertices = polygon.vertices
        for index, first in enumerate(vertices):
            edge_faces[tuple(sorted((first, vertices[(index + 1) % len(vertices)])))].append(
                polygon.index
            )

    neighbors = [set() for _ in body.data.polygons]
    for linked_faces in edge_faces.values():
        for index, first in enumerate(linked_faces):
            for second in linked_faces[index + 1:]:
                neighbors[first].add(second)
                neighbors[second].add(first)
    return neighbors


def connected_face_components(face_indices, neighbors):
    unvisited = set(face_indices)
    components = []
    while unvisited:
        first = min(unvisited)
        unvisited.remove(first)
        component = {first}
        pending = [first]
        while pending:
            face_index = pending.pop()
            for neighbor in neighbors[face_index] & unvisited:
                unvisited.remove(neighbor)
                component.add(neighbor)
                pending.append(neighbor)
        components.append(sorted(component))
    return components


def body_face_center(body, coordinates, face_index):
    polygon = body.data.polygons[face_index]
    return sum((coordinates[index] for index in polygon.vertices), Vector()) / len(polygon.vertices)


def body_zone_transfer_allowed(zone, face_indices, body, body_reference, coverage_cache):
    for face_index in face_indices:
        cache_key = (zone, face_index)
        if cache_key not in coverage_cache:
            coverage_cache[cache_key] = True
            for build in (-1.0, 0.0, 1.0):
                center = body_face_center(body, body_reference[build], face_index)
                part, _, t = classify(center)
                if any(
                    not PIECES[piece_name].covers(center, part, t)
                    for piece_name in EXPECTED_BODY_ZONE_MASKERS[zone]
                ):
                    coverage_cache[cache_key] = False
                    break
        if not coverage_cache[cache_key]:
            return False
    return True


def body_zone_side(zone, center):
    if zone.startswith("corps-torse-"):
        return "centre"
    return classify(center)[1] or "centre"


def clean_body_zone_partition(body, body_reference):
    coordinates = body_reference[0.0]
    labels = []
    for polygon in body.data.polygons:
        center = sum((coordinates[index] for index in polygon.vertices), Vector()) / len(polygon.vertices)
        labels.append(body_zone(center))

    neighbors = body_face_neighbors(body)
    zone_rank = {zone: index for index, zone in enumerate(BODY_ZONE_NAMES)}
    small_island_faces_moved = 0
    majority_faces_moved = 0
    disconnected_band_faces_moved = 0
    coverage_cache = {}
    iterations = 0
    maximum_iterations = max(100, len(labels) * len(BODY_ZONE_NAMES))

    def replacement_zone(component, current_zone):
        component_set = set(component)
        adjacent_counts = defaultdict(int)
        for face_index in component:
            for neighbor in neighbors[face_index]:
                if neighbor not in component_set and labels[neighbor] != current_zone:
                    adjacent_counts[labels[neighbor]] += 1
        if not adjacent_counts:
            return None
        preferred = min(
            adjacent_counts,
            key=lambda candidate: (-adjacent_counts[candidate], zone_rank[candidate]),
        )
        if body_zone_transfer_allowed(
            preferred, component, body, body_reference, coverage_cache
        ):
            return preferred

        candidates = [
            candidate
            for candidate in adjacent_counts
            if body_zone_transfer_allowed(
                candidate, component, body, body_reference, coverage_cache
            )
        ]
        non_body_candidates = [candidate for candidate in candidates if candidate != "corps"]
        if non_body_candidates:
            candidates = non_body_candidates
        if not candidates:
            return None
        return min(
            candidates,
            key=lambda candidate: (
                len(EXPECTED_BODY_ZONE_MASKERS[candidate]),
                -adjacent_counts[candidate],
                zone_rank[candidate],
            ),
        )

    while True:
        iterations += 1
        labels_before_iteration = labels.copy()

        for zone in BODY_ZONE_NAMES:
            components = connected_face_components(
                (index for index, label in enumerate(labels) if label == zone),
                neighbors,
            )
            for component in components:
                if len(component) >= 6:
                    continue
                replacement = replacement_zone(component, zone)
                if replacement is not None:
                    for face_index in component:
                        labels[face_index] = replacement
                    small_island_faces_moved += len(component)

        for face_index, face_neighbors in enumerate(neighbors):
            adjacent_counts = defaultdict(int)
            for neighbor in face_neighbors:
                adjacent_counts[labels[neighbor]] += 1
            if not adjacent_counts:
                continue
            required_majority = len(face_neighbors) // 2 + 1
            candidates = [
                candidate
                for candidate, count in adjacent_counts.items()
                if candidate != labels[face_index] and count >= required_majority
            ]
            if candidates:
                replacement = min(
                    candidates,
                    key=lambda candidate: (-adjacent_counts[candidate], zone_rank[candidate]),
                )
                if body_zone_transfer_allowed(
                    replacement, (face_index,), body, body_reference, coverage_cache
                ):
                    labels[face_index] = replacement
                    majority_faces_moved += 1

        for zone in BODY_ZONE_NAMES:
            if zone == "corps":
                continue
            faces_by_side = defaultdict(list)
            for face_index, label in enumerate(labels):
                if label != zone:
                    continue
                polygon = body.data.polygons[face_index]
                center = sum(
                    (coordinates[index] for index in polygon.vertices),
                    Vector(),
                ) / len(polygon.vertices)
                faces_by_side[body_zone_side(zone, center)].append(face_index)

            for face_indices in faces_by_side.values():
                components = connected_face_components(face_indices, neighbors)
                if len(components) <= 1:
                    continue
                components.sort(key=lambda component: (-len(component), component[0]))
                for component in components[1:]:
                    replacement = replacement_zone(component, zone)
                    if replacement is None:
                        continue
                    for face_index in component:
                        labels[face_index] = replacement
                    disconnected_band_faces_moved += len(component)

        if labels == labels_before_iteration:
            break
        if iterations >= maximum_iterations:
            raise RuntimeError("Propagation des zones de corps non convergente")

    face_count_by_zone = defaultdict(int)
    for label in labels:
        face_count_by_zone[label] += 1
    print(
        "BODY_ZONE_PARTITION",
        f"iterations={iterations}",
        f"small_island_faces_moved={small_island_faces_moved}",
        f"majority_faces_moved={majority_faces_moved}",
        f"disconnected_band_faces_moved={disconnected_band_faces_moved}",
        f"faces={dict(sorted(face_count_by_zone.items()))}",
        flush=True,
    )
    return labels, neighbors


def validate_body_zone_bands(body, labels, neighbors, coordinates):
    for zone in BODY_ZONE_NAMES:
        if zone == "corps":
            continue
        faces_by_side = defaultdict(list)
        for face_index, label in enumerate(labels):
            if label != zone:
                continue
            polygon = body.data.polygons[face_index]
            center = sum(
                (coordinates[index] for index in polygon.vertices),
                Vector(),
            ) / len(polygon.vertices)
            faces_by_side[body_zone_side(zone, center)].append(face_index)

        for side, face_indices in sorted(faces_by_side.items()):
            component_count = len(connected_face_components(face_indices, neighbors))
            print(
                "BODY_ZONE_COMPONENTS",
                zone,
                f"side={side}",
                f"count={component_count}",
                flush=True,
            )
            if component_count != 1:
                raise RuntimeError(
                    f"Zone non connexe pour {zone}, côté {side}: {component_count} composantes"
                )


def classify_body_zones(body, body_reference, write_masks=True):
    labels, neighbors = clean_body_zone_partition(body, body_reference)
    validate_body_zone_bands(body, labels, neighbors, body_reference[0.0])
    face_indices = {name: [] for name in BODY_ZONE_NAMES}
    for face_index, zone in enumerate(labels):
        face_indices[zone].append(face_index)
    if any(not indices for indices in face_indices.values()):
        empty = [name for name, indices in face_indices.items() if not indices]
        raise RuntimeError(f"Zones de corps vides : {', '.join(empty)}")

    masks = {name: [] for name in BODY_ZONE_NAMES}
    coverage_samples = {}
    tops_and_bottoms = [
        (name, piece) for name, piece in PIECES.items() if piece.slot in ("haut", "bas")
    ]
    for zone, polygons in face_indices.items():
        if zone == "corps":
            continue
        for name, piece in tops_and_bottoms:
            if zone not in EXPECTED_BODY_ZONE_COVERAGE[name]:
                continue
            covered = True
            for build in (-1.0, 0.0, 1.0):
                coordinates = body_reference[build]
                samples = {"covered": [], "uncovered": []}
                for polygon_index in polygons:
                    polygon = body.data.polygons[polygon_index]
                    center = sum((coordinates[index] for index in polygon.vertices), Vector()) / len(polygon.vertices)
                    part, side, t = classify(center)
                    is_covered = piece.covers(center, part, t)
                    side_sign = dict(SIDES).get(side)
                    applicable = [
                        cut for cut in (piece.cuts() if piece.cuts else ())
                        if part in cut.parts and (cut.side is None or cut.side == side_sign)
                    ]
                    bucket = "covered" if is_covered else "uncovered"
                    if len(samples[bucket]) < 5:
                        samples[bucket].append((
                            tuple(round(value, 4) for value in center),
                            part,
                            side,
                            round(t, 4),
                            [
                                round(kept_cut_distance(center, cut), 4)
                                for cut in applicable
                            ],
                        ))
                    if not is_covered:
                        covered = False
                coverage_samples[(zone, name, build)] = samples
            if covered:
                masks[zone].append(name)
        masks[zone].sort()

    actual = {
        name: {zone for zone, pieces_for_zone in masks.items() if name in pieces_for_zone}
        for name, piece in tops_and_bottoms
    }
    for name, expected_zones in EXPECTED_BODY_ZONE_COVERAGE.items():
        if actual.get(name) != expected_zones:
            for zone, sample_kind in [
                *((zone, "uncovered") for zone in sorted(expected_zones - actual.get(name, set()))),
                *((zone, "covered") for zone in sorted(actual.get(name, set()) - expected_zones)),
            ]:
                for build in (-1.0, 0.0, 1.0):
                    samples = coverage_samples.get((zone, name, build), {}).get(sample_kind, [])
                    for center, part, side, t, distances in samples:
                        print(
                            "ZONE_MASK_FAULT",
                            zone,
                            name,
                            f"fort={build:g}",
                            f"status={sample_kind}",
                            f"center={center}",
                            f"part={part}",
                            f"side={side}",
                            f"t={t}",
                            f"distances={distances}",
                            flush=True,
                        )
            raise RuntimeError(
                f"Masquage inattendu pour {name}: obtenu={sorted(actual.get(name, set()))}, "
                f"attendu={sorted(expected_zones)}"
            )
        if PIECES[name].masks_zones != bool(expected_zones):
            raise RuntimeError(f"Contrat de masquage incohérent pour {name}")

    if write_masks:
        write_body_zone_masks(masks)

    return face_indices, masks


def surface_area_centroid(faces, coordinates):
    weighted_center = Vector()
    total_area = 0.0
    for face in faces:
        if len(face) < 3:
            continue
        first = coordinates[face[0]]
        for index in range(1, len(face) - 1):
            second = coordinates[face[index]]
            third = coordinates[face[index + 1]]
            area = (second - first).cross(third - first).length / 2
            weighted_center += (first + second + third) * (area / 3)
            total_area += area
    if total_area <= 0:
        raise RuntimeError("Centroide de surface sans aire")
    return weighted_center / total_area


def split_body_zones(body, face_indices):
    full_normals = [loop.normal.copy() for loop in body.data.loops]
    objects = {}
    source_to_local_indices = {}
    cap_centers_by_loop = defaultdict(dict)
    cap_component_faces = defaultdict(dict)

    for zone in BODY_ZONE_NAMES:
        polygons = [body.data.polygons[index] for index in face_indices[zone]]
        vertex_indices = sorted({index for polygon in polygons for index in polygon.vertices})
        local_index = {source_index: index for index, source_index in enumerate(vertex_indices)}
        source_to_local_indices[zone] = local_index
        source_coordinates = [body.data.vertices[index].co for index in vertex_indices]
        local_faces = [[local_index[index] for index in polygon.vertices] for polygon in polygons]
        edge_faces = defaultdict(list)
        for face_index, vertices in enumerate(local_faces):
            for index, first in enumerate(vertices):
                edge_faces[tuple(sorted((first, vertices[(index + 1) % len(vertices)])))].append(face_index)
        face_neighbors = [set() for _ in local_faces]
        for linked_faces in edge_faces.values():
            for face_index in linked_faces:
                face_neighbors[face_index].update(
                    neighbor for neighbor in linked_faces if neighbor != face_index
                )
        zone_components = connected_face_components(range(len(local_faces)), face_neighbors)
        component_by_face = {}
        component_centroids = {}
        for component_index, component in enumerate(zone_components):
            component_faces = [local_faces[face_index] for face_index in component]
            component_centroids[component_index] = surface_area_centroid(
                component_faces, source_coordinates
            )
            for face_index in component:
                component_by_face[face_index] = component_index
        boundary_edges = {edge for edge, linked in edge_faces.items() if len(linked) == 1}
        boundary_graph = defaultdict(set)
        for first, second in boundary_edges:
            boundary_graph[first].add(second)
            boundary_graph[second].add(first)
        invalid_boundary_vertices = {
            vertex: len(neighbors)
            for vertex, neighbors in boundary_graph.items()
            if len(neighbors) != 2
        }
        if invalid_boundary_vertices:
            raise RuntimeError(
                f"Bordures de zone non simples pour {zone}: "
                f"{list(sorted(invalid_boundary_vertices.items()))[:8]}"
            )
        cap_faces = []
        cap_sources = {}
        existing_face_loops = 0
        unvisited = set(boundary_edges)
        while unvisited:
            first_edge = min(unvisited)
            loop = [first_edge[0], first_edge[1]]
            unvisited.remove(first_edge)
            previous, current = loop
            while current != loop[0]:
                candidates = sorted(boundary_graph[current] - {previous})
                if len(candidates) != 1:
                    raise RuntimeError(f"Boucle de bord interrompue pour {zone}")
                following = candidates[0]
                next_edge = tuple(sorted((current, following)))
                if next_edge not in unvisited and following != loop[0]:
                    raise RuntimeError(f"Boucle de bord répétée pour {zone}")
                unvisited.discard(next_edge)
                if following == loop[0]:
                    break
                if following in loop:
                    raise RuntimeError(f"Boucle de bord croisée pour {zone}")
                loop.append(following)
                previous, current = current, following
            if len(loop) < 3:
                raise RuntimeError(f"Boucle de bord dégénérée pour {zone}")

            boundary_edge = tuple(sorted((loop[0], loop[1])))
            boundary_face = local_faces[edge_faces[boundary_edge][0]]
            boundary_direction = next(
                (first, boundary_face[(index + 1) % len(boundary_face)])
                for index, first in enumerate(boundary_face)
                if tuple(sorted((first, boundary_face[(index + 1) % len(boundary_face)])))
                == boundary_edge
            )
            if boundary_direction == (loop[0], loop[1]):
                loop = [loop[0], *reversed(loop[1:])]

            ring_coordinates = [body.data.vertices[vertex_indices[index]].co.copy() for index in loop]
            center = sum(ring_coordinates, Vector()) / len(ring_coordinates)
            adjacent_faces = {
                edge_faces[tuple(sorted((loop[index], loop[(index + 1) % len(loop)])))][0]
                for index in range(len(loop))
            }
            if any(
                len(local_faces[face_index]) == len(loop)
                and set(local_faces[face_index]) == set(loop)
                for face_index in adjacent_faces
            ):
                ring_sources = [vertex_indices[index] for index in loop]
                cap_centers_by_loop[frozenset(ring_sources)][zone] = None
                existing_face_loops += 1
                continue
            center_index = len(vertex_indices) + len(cap_sources)
            ring_sources = [vertex_indices[index] for index in loop]
            cap_sources[center_index] = ring_sources
            cap_centers_by_loop[frozenset(ring_sources)][zone] = center_index
            loop_faces = [
                (center_index, loop[index], loop[(index + 1) % len(loop)])
                for index in range(len(loop))
            ]
            adjacent_component = component_by_face[next(iter(adjacent_faces))]
            component_faces = tuple(
                tuple(local_faces[face_index])
                for face_index in zone_components[adjacent_component]
            )
            cap_component_faces[zone][center_index] = component_faces
            component_centroid = component_centroids[adjacent_component]
            weighted_normal = Vector()
            for face in loop_faces:
                first, second, third = (
                    center if index == center_index
                    else source_coordinates[index]
                    for index in face
                )
                weighted_normal += (second - first).cross(third - first)
            orientation_dot = weighted_normal.dot(center - component_centroid)
            if weighted_normal.length_squared < 1e-12 or abs(orientation_dot) < 1e-12:
                raise RuntimeError(f"Orientation de capuchon dégénérée pour {zone}")
            if orientation_dot < 0:
                loop_faces = [
                    (center_index, face[2], face[1])
                    for face in loop_faces
                ]
            cap_faces.extend(loop_faces)

        coordinates = [body.data.vertices[index].co.copy() for index in vertex_indices]
        coordinates.extend(
            sum((body.data.vertices[index].co for index in sources), Vector()) / len(sources)
            for sources in cap_sources.values()
        )
        all_faces = local_faces + cap_faces
        mesh = bpy.data.meshes.new(zone)
        mesh.from_pydata(
            coordinates,
            [],
            all_faces,
        )
        mesh.materials.clear()
        for material_slot in body.data.materials:
            mesh.materials.append(material_slot)
        mesh.update()
        obj = bpy.data.objects.new(zone, mesh)
        scene.collection.objects.link(obj)
        obj.matrix_world = body.matrix_world.copy()
        for polygon, source_polygon in zip(mesh.polygons, polygons):
            polygon.material_index = source_polygon.material_index
            polygon.use_smooth = source_polygon.use_smooth
        for polygon in mesh.polygons[len(polygons):]:
            polygon.material_index = polygons[0].material_index
            polygon.use_smooth = False

        source_keys = body.data.shape_keys.key_blocks if body.data.shape_keys else ()
        new_keys = []
        for key_index, source_key in enumerate(source_keys):
            key = obj.shape_key_add(name=source_key.name, from_mix=False)
            for local_vertex, source_vertex in enumerate(vertex_indices):
                key.data[local_vertex].co = source_key.data[source_vertex].co
            for center_index, sources in cap_sources.items():
                key.data[center_index].co = sum(
                    (source_key.data[index].co for index in sources), Vector()
                ) / len(sources)
            key.slider_min = source_key.slider_min
            key.slider_max = source_key.slider_max
            key.value = source_key.value
            key.interpolation = source_key.interpolation
            new_keys.append((key, source_key))
        for key, source_key in new_keys:
            key.relative_key = obj.data.shape_keys.key_blocks[source_key.relative_key.name]

        groups = [obj.vertex_groups.new(name=group.name) for group in body.vertex_groups]
        for local_vertex, source_vertex in enumerate(vertex_indices):
            for membership in body.data.vertices[source_vertex].groups:
                groups[membership.group].add([local_vertex], membership.weight, "REPLACE")
        for center_index, sources in cap_sources.items():
            averaged = defaultdict(float)
            for source_index in sources:
                for membership in body.data.vertices[source_index].groups:
                    averaged[membership.group] += membership.weight / len(sources)
            for group_index, weight in averaged.items():
                if weight > 1e-8:
                    groups[group_index].add([center_index], weight, "REPLACE")

        source_normals = {}
        for source_polygon in polygons:
            source_normals[tuple(sorted(source_polygon.vertices))] = {
                source_vertex: full_normals[source_polygon.loop_start + loop_index]
                for loop_index, source_vertex in enumerate(source_polygon.vertices)
            }
        loop_normals = []
        for polygon in mesh.polygons:
            source_vertices = [
                vertex_indices[vertex]
                for vertex in polygon.vertices
                if vertex < len(vertex_indices)
            ]
            face_source_normals = source_normals.get(tuple(sorted(source_vertices)))
            if face_source_normals and len(source_vertices) == len(polygon.vertices):
                loop_normals.extend(face_source_normals[vertex] for vertex in source_vertices)
            else:
                loop_normals.extend([polygon.normal.copy()] * len(polygon.vertices))
        mesh.normals_split_custom_set(loop_normals)
        objects[zone] = obj
        print(
            "ZONE_CAPS",
            zone,
            f"loops={len(cap_sources)}",
            f"triangles={len(cap_faces)}",
            f"existing_faces={existing_face_loops}",
            flush=True,
        )
    body.hide_render = True

    face_zone = {
        face_index: zone
        for zone, indices in face_indices.items()
        for face_index in indices
    }
    edge_zones = {}
    for polygon in body.data.polygons:
        vertices = polygon.vertices
        zone = face_zone[polygon.index]
        for first, second in zip(vertices, (*vertices[1:], vertices[0])):
            edge = tuple(sorted((first, second)))
            edge_zones.setdefault(edge, set()).add(zone)

    boundary_vertices = {}
    for edge, zones in edge_zones.items():
        ordered_zones = sorted(zones)
        for first_index, first in enumerate(ordered_zones):
            for second in ordered_zones[first_index + 1:]:
                boundary_vertices.setdefault((first, second), set()).update(edge)
    boundary_caps = []
    for ring, centers in cap_centers_by_loop.items():
        zones = sorted(centers)
        for first_index, first in enumerate(zones):
            for second in zones[first_index + 1:]:
                boundary_caps.append(
                    (first, second, centers[first], centers[second], tuple(sorted(ring)))
                )
    return objects, source_to_local_indices, boundary_vertices, boundary_caps, cap_component_faces


def mesh_edge_integrity(faces):
    edge_directions = defaultdict(list)
    for face in faces:
        for index, first in enumerate(face):
            second = face[(index + 1) % len(face)]
            edge_directions[tuple(sorted((first, second)))].append((first, second))
    boundary_edges = sum(len(directions) == 1 for directions in edge_directions.values())
    nonmanifold_edges = sum(len(directions) > 2 for directions in edge_directions.values())
    same_direction_edges = sum(
        len(directions) == 2 and directions[0] == directions[1]
        for directions in edge_directions.values()
    )
    return boundary_edges, nonmanifold_edges, same_direction_edges


def validate_zone_seams(
    zone_objects,
    source_to_local_indices,
    boundary_vertices,
    boundary_caps,
    cap_component_faces,
    rig,
    source_body,
):
    tolerance = 1e-6
    saved_values = {}
    objects_to_validate = [source_body, *zone_objects.values()]
    for obj in objects_to_validate:
        fort_key = obj.data.shape_keys.key_blocks.get("fort") if obj.data.shape_keys else None
        if fort_key is not None:
            saved_values[obj.name] = fort_key.value

    def identity_pose(_time):
        return {}, Vector((0, 0, 0))

    errors = []
    try:
        set_pose(rig, identity_pose, 0.0)
        for build in (-1.0, 0.0, 1.0):
            for obj in objects_to_validate:
                if obj.data.shape_keys and "fort" in obj.data.shape_keys.key_blocks:
                    obj.data.shape_keys.key_blocks["fort"].value = build
            bpy.context.view_layer.update()
            depsgraph = bpy.context.evaluated_depsgraph_get()
            evaluated_coordinates = {}
            evaluated_faces = {}
            source_evaluated = source_body.evaluated_get(depsgraph)
            source_mesh = source_evaluated.to_mesh()
            try:
                source_faces = [
                    tuple(polygon.vertices) for polygon in source_mesh.polygons
                ]
            finally:
                source_evaluated.to_mesh_clear()
            for name, obj in zone_objects.items():
                evaluated = obj.evaluated_get(depsgraph)
                mesh = evaluated.to_mesh()
                try:
                    evaluated_coordinates[name] = [
                        evaluated.matrix_world @ vertex.co for vertex in mesh.vertices
                    ]
                    evaluated_faces[name] = [
                        tuple(polygon.vertices) for polygon in mesh.polygons
                    ]
                finally:
                    evaluated.to_mesh_clear()

            mismatches = []
            maximum_distance = 0.0
            checked = 0
            cap_mismatches = []
            maximum_cap_distance = 0.0
            for (first, second), source_vertices in boundary_vertices.items():
                first_lookup = source_to_local_indices[first]
                second_lookup = source_to_local_indices[second]
                for source_index in source_vertices:
                    first_index = first_lookup.get(source_index)
                    second_index = second_lookup.get(source_index)
                    if first_index is None or second_index is None:
                        mismatches.append((first, second, source_index, float("inf")))
                        continue
                    distance = (
                        evaluated_coordinates[first][first_index]
                        - evaluated_coordinates[second][second_index]
                    ).length
                    checked += 1
                    maximum_distance = max(maximum_distance, distance)
                    if distance > tolerance:
                        mismatches.append((first, second, source_index, distance))
            for first, second, first_center, second_center, ring in boundary_caps:
                first_point = (
                    evaluated_coordinates[first][first_center]
                    if first_center is not None
                    else sum(
                        (evaluated_coordinates[first][source_to_local_indices[first][source]]
                         for source in ring),
                        Vector(),
                    ) / len(ring)
                )
                second_point = (
                    evaluated_coordinates[second][second_center]
                    if second_center is not None
                    else sum(
                        (evaluated_coordinates[second][source_to_local_indices[second][source]]
                         for source in ring),
                        Vector(),
                    ) / len(ring)
                )
                distance = (first_point - second_point).length
                maximum_cap_distance = max(maximum_cap_distance, distance)
                if distance > tolerance:
                    cap_mismatches.append((first, second, distance))

            topology_checks = {"corps-complet": mesh_edge_integrity(source_faces)}
            topology_checks.update({
                name: mesh_edge_integrity(faces)
                for name, faces in evaluated_faces.items()
            })
            topology_mismatches = []
            for name, (boundary_edges, nonmanifold_edges, same_direction_edges) in topology_checks.items():
                print(
                    "ZONE_MANIFOLD_CHECK",
                    name,
                    f"fort={build:g}",
                    f"boundary_edges={boundary_edges}",
                    f"nonmanifold_edges={nonmanifold_edges}",
                    f"same_direction_edges={same_direction_edges}",
                    flush=True,
                )
                if boundary_edges or nonmanifold_edges or same_direction_edges:
                    topology_mismatches.append((
                        name,
                        boundary_edges,
                        nonmanifold_edges,
                        same_direction_edges,
                    ))

            cap_orientation_mismatches = []
            cap_orientation_checks = 0
            minimum_cap_orientation_dot = math.inf
            for zone, faces in evaluated_faces.items():
                zone_coordinates = evaluated_coordinates[zone]
                source_vertex_count = len(source_to_local_indices[zone])
                faces_by_cap_center = defaultdict(list)
                for face in faces:
                    cap_centers = [
                        index for index in face if index >= source_vertex_count
                    ]
                    if not cap_centers:
                        continue
                    if len(cap_centers) != 1:
                        raise RuntimeError(f"Capuchon ambigu pour {zone}: {face}")
                    faces_by_cap_center[cap_centers[0]].append(face)

                for center_index, cap_faces in faces_by_cap_center.items():
                    weighted_normal = Vector()
                    for face in cap_faces:
                        first, second, third = (
                            zone_coordinates[index] for index in face
                        )
                        weighted_normal += (second - first).cross(third - first)
                    component_centroid = surface_area_centroid(
                        cap_component_faces[zone][center_index], zone_coordinates
                    )
                    direction = zone_coordinates[center_index] - component_centroid
                    dot = weighted_normal.dot(direction)
                    cap_orientation_checks += 1
                    minimum_cap_orientation_dot = min(minimum_cap_orientation_dot, dot)
                    if dot <= 0:
                        cap_orientation_mismatches.append((zone, center_index, dot))

            print(
                "ZONE_SEAM_CHECK",
                f"fort={build:g}",
                f"vertices={checked}",
                f"mismatches={len(mismatches)}",
                f"max={maximum_distance:.9f}",
                f"caps={len(boundary_caps)}",
                f"cap_mismatches={len(cap_mismatches)}",
                f"cap_max={maximum_cap_distance:.9f}",
                f"cap_orientation_checks={cap_orientation_checks}",
                f"cap_orientation_mismatches={len(cap_orientation_mismatches)}",
                f"cap_orientation_min_weighted_dot={minimum_cap_orientation_dot:.9g}",
                f"topology_mismatches={len(topology_mismatches)}",
                flush=True,
            )
            if (
                mismatches
                or cap_mismatches
                or cap_orientation_mismatches
                or topology_mismatches
            ):
                errors.append((
                    build,
                    mismatches[:5],
                    cap_mismatches[:5],
                    cap_orientation_mismatches[:5],
                    topology_mismatches[:10],
                ))
    finally:
        for obj in objects_to_validate:
            if obj.data.shape_keys and "fort" in obj.data.shape_keys.key_blocks:
                obj.data.shape_keys.key_blocks["fort"].value = saved_values.get(obj.name, 0.0)
        bpy.context.view_layer.update()

    if errors:
        details = "; ".join(
            f"fort={build:g} {first}/{second} vertex={source_index} delta={distance:.9g}"
            for build, mismatches, _, _, _ in errors
            for first, second, source_index, distance in mismatches
        )
        details += "; " + "; ".join(
            f"fort={build:g} cap {first}/{second} delta={distance:.9g}"
            for build, _, mismatches, _, _ in errors
            for first, second, distance in mismatches
        )
        details += "; " + "; ".join(
            f"fort={build:g} cap_orientation {zone} center={center} weighted_dot={dot:.9g}"
            for build, _, _, mismatches, _ in errors
            for zone, center, dot in mismatches
        )
        details += "; " + "; ".join(
            f"fort={build:g} topology {name} boundary={boundary} "
            f"nonmanifold={nonmanifold} same_direction={same_direction}"
            for build, _, _, _, mismatches in errors
            for name, boundary, nonmanifold, same_direction in mismatches
        )
        raise RuntimeError("Coutures, orientations ou topologies de zones incohérentes: " + details)


def normal_inconsistency_count(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.normal_update()
    inconsistent = 0
    mismatch_details = []
    for edge in bm.edges:
        if len(edge.link_loops) == 2:
            first, second = edge.link_loops
            if (
                first.vert is second.vert
                and first.link_loop_next.vert is second.link_loop_next.vert
            ):
                inconsistent += 1
                mismatch_details.append(edge)
        elif len(edge.link_loops) > 2:
            inconsistent += len(edge.link_loops) - 2
            mismatch_details.append(edge)

    if mismatch_details:
        print(
            "NORMALS_EDGE_MISMATCH",
            obj.name,
            [
                {
                    "edge": [
                        tuple(round(value, 6) for value in vertex.co)
                        for vertex in edge.verts
                    ],
                    "faces": [
                        [tuple(round(value, 6) for value in vertex.co) for vertex in face.verts]
                        for face in edge.link_faces
                    ],
                }
                for edge in mismatch_details
            ],
            flush=True,
        )

    def signed_volume(faces):
        volume = 0.0
        for face in faces:
            vertices = [loop.vert.co for loop in face.loops]
            for index in range(1, len(vertices) - 1):
                volume += vertices[0].dot(vertices[index].cross(vertices[index + 1])) / 6
        return volume

    unseen = set(bm.faces)
    negative_components = []
    while unseen:
        component = {unseen.pop()}
        stack = list(component)
        while stack:
            face = stack.pop()
            for edge in face.edges:
                for neighbor in edge.link_faces:
                    if neighbor in unseen:
                        unseen.remove(neighbor)
                        component.add(neighbor)
                        stack.append(neighbor)
        closed = all(
            len(edge.link_faces) == 2
            for face in component
            for edge in face.edges
        )
        if closed:
            volume = signed_volume(component)
            if volume <= 0:
                inconsistent += 1
                source_vertex_count = (
                    len(BODY_ZONE_VERTEX_INDICES[obj.name])
                    if obj.name in BODY_ZONE_VERTEX_INDICES
                    else len(obj.data.vertices)
                )
                points = [vertex.co for face in component for vertex in face.verts]
                negative_components.append({
                    "volume": round(volume, 9),
                    "faces": len(component),
                    "cap_faces": sum(
                        any(vertex.index >= source_vertex_count for vertex in face.verts)
                        for face in component
                    ),
                    "bounds": [
                        tuple(round(min(point[axis] for point in points), 6) for axis in range(3)),
                        tuple(round(max(point[axis] for point in points), 6) for axis in range(3)),
                    ],
                })
    if negative_components:
        print("NORMALS_NEGATIVE_COMPONENT", obj.name, negative_components, flush=True)
    bm.free()
    return inconsistent


def recalculate_face_normals(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.normal_update()
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def validate_avatar_object_names(objects):
    suffixes = [
        obj.name for obj in objects
        if len(obj.name.rsplit(".", 1)) == 2
        and len(obj.name.rsplit(".", 1)[1]) == 3
        and obj.name.rsplit(".", 1)[1].isdigit()
    ]
    zone_objects = {obj.name for obj in objects if obj.name.startswith("corps-") or obj.name == "corps"}
    if suffixes or zone_objects != set(BODY_ZONE_NAMES):
        raise RuntimeError(
            f"Noms d'objets avatar invalides: suffixes={suffixes}, zones={sorted(zone_objects)}"
        )
    if any(BODY_ZONE_OBJECTS[name].name != name for name in BODY_ZONE_NAMES):
        raise RuntimeError("Un objet de zone porte un nom Blender dupliqué")


def validate_avatar_normals(objects):
    errors = []
    for obj in objects:
        inconsistent = normal_inconsistency_count(obj)
        print("NORMALS_CHECK", obj.name, f"inconsistent={inconsistent}", flush=True)
        if inconsistent:
            errors.append(f"{obj.name}={inconsistent}")
    if errors:
        raise RuntimeError("Normales incohérentes : " + ", ".join(errors[:8]))


def visible_body_zone_names(worn_pieces):
    worn = set(worn_pieces)
    return [
        zone for zone in BODY_ZONE_NAMES
        if not any(piece in worn for piece in BODY_ZONE_MASKS[zone])
    ]


def build_piece(name, body):
    validate_piece_registry()
    piece = PIECES[name]
    obj = piece.build(body)
    if obj.name != name:
        raise RuntimeError(f"Le constructeur de {name} a produit {obj.name}")
    return obj


def wardrobe(body):
    validate_piece_registry()
    return [build_piece(name, body) for name in PIECES if name not in DEFAULT_PIECES]


FOLLOW_BUILD = tuple(name for name, piece in PIECES.items() if piece.follows_build)


def triangle_count(obj):
    return sum(len(poly.vertices) - 2 for poly in obj.data.polygons)


def triangle_cap(name):
    if name in BASE_TRIANGLE_CAPS:
        return BASE_TRIANGLE_CAPS[name]
    if name in BODY_ZONE_NAMES:
        return BASE_TRIANGLE_CAPS["corps"]
    if name in ("cheveux-boucles", "cheveux-chignons"):
        return SOFT_HAIR_TRIANGLE_CAP
    if name.startswith("cheveux-"):
        return BASE_TRIANGLE_CAPS["cheveux"]
    piece = PIECES.get(name)
    return PIECE_TRIANGLE_CAPS[piece.slot] if piece else None


def clean_mesh_normals(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.00001)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(obj.data)
    bm.free()
    return geo.smooth(obj)


def simplify_pieces(objects):
    for obj in objects:
        cap = triangle_cap(obj.name)
        count = triangle_count(obj)
        if cap is None or count <= cap or obj.data.shape_keys:
            continue
        # Un bas n'est pas subdivisé : la subdivision rentre la coque dans la cuisse et ronge l'ourlet.
        if not obj.name.startswith("bas-"):
            subdivision = obj.modifiers.new("Lissage de silhouette", "SUBSURF")
            subdivision.subdivision_type = "CATMULL_CLARK"
            subdivision.levels = 1
            subdivision.render_levels = 1
            apply(obj)
        count = triangle_count(obj)
        modifier = obj.modifiers.new("Décimation maîtrisée", "DECIMATE")
        modifier.ratio = cap / count
        if obj.name in ("corps", "tete", "cheveux-court", "haut-tshirt", "bas-short", "chaussures-baskets"):
            modifier.use_symmetry = True
            modifier.symmetry_axis = "X"
        apply(obj)
        clean_mesh_normals(obj)


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
    pose.update({"hips": Y(3.5 + 1.5 * math.sin(s)) @ Z(2.5 * math.sin(s)),
                 "spine": Y(-1.5 - 0.8 * math.sin(s)), "chest": X(1.2 * math.sin(s + 0.5)),
                 "head": Z(3 * math.sin(s)) @ X(2 * math.sin(2 * s)),
                 "upperarm.L": Y(-6 - 2 * math.sin(s)), "upperarm.R": Y(6 + 2 * math.sin(s))})
    return pose, Vector((0.004 * math.sin(s), 0, max(0.004, 0.003 * math.sin(2 * s))))


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
    return pose, Vector((0, 0, 0.016 + 0.035 * abs(math.cos(s))))


SAUT_KEYS = (
    # temps, hauteur, cuisses, genoux, pieds, dos, bras (écart), bras (avant/arrière)
    (0.0, 0.0, 0, 8, 0, 0, 6, 0),
    (0.25, 0.0, -38, 70, -30, 16, 10, 35),
    (0.45, 0.22, -8, 22, 10, -6, 36.5, -25),
    (0.62, 0.2, -12, 30, 6, -4, 36.5, -25),
    (0.8, 0.02, -20, 34, -10, 2, 36.5, 0),
    (0.9, 0.0, -30, 55, -24, 12, 36.5, 20),
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
    return pose, Vector((0, 0, height + 0.005))


def salut(t):
    s = 2 * math.pi * t / 1.6
    pose, _ = attente(t * 1.5)
    wave = math.sin(2 * s)
    pose.update({"upperarm.R": Y(37.5) @ X(-20), "forearm.R": Y(90),
                 "hand.R": Y(20 * wave), "head": Y(-22) @ Z(-5 + 2 * wave) @ X(-3),
                 "chest": Z(-3)})
    return pose, Vector((0, 0, max(0.004, 0.004 * math.sin(2 * s))))


def bravo(t):
    s = 2 * math.pi * t / 1.0
    pose, _ = attente(t * 1.5)
    hand_wave = 10 * math.sin(2 * s)
    pose.update({
        "upperarm.L": Y(-36.5) @ X(-25), "upperarm.R": Y(36.5) @ X(-25),
        "forearm.L": X(-15), "forearm.R": X(-15),
        "hand.L": X(hand_wave), "hand.R": X(-hand_wave),
        "head": X(-8),
        "chest": X(-2),
    })
    return pose, Vector((0, 0, 0.002 + 0.03 * abs(math.sin(s))))


def encouragement(t):
    s = 2 * math.pi * t / 1.4
    pose, _ = attente(t * 1.2)
    push = math.sin(2 * s)
    pump = 0.5 + 0.5 * push
    pose.update({"upperarm.R": Y(35) @ X(-30),
                 "forearm.R": X(-109 - 10 * push),
                 "hand.R": X(-10), "head": Y(-22) @ X(6 * pump - 2) @ Z(-4),
                 "chest": X(2 * pump) @ Z(-3)})
    return pose, Vector((0, 0, 0.004 + 0.006 * pump))


ANIMATIONS = {"attente": (attente, 2.4, True), "marche": (marche, 0.8, True), "saut": (saut, 1.2, False),
              "salut": (salut, 1.6, True), "bravo": (bravo, 1.0, True),
              "encouragement": (encouragement, 1.4, True)}


def set_pose(rig, fn, t):
    pose, lift = fn(t)
    for pb in rig.pose.bones:
        rest = pb.bone.matrix_local.to_3x3().to_quaternion()
        q = pose.get(pb.name, Quaternion())
        pb.rotation_quaternion = rest.inverted() @ q @ rest
        pb.location = (0, 0, 0)
    root = rig.pose.bones["root"]
    root.location = root.bone.matrix_local.to_3x3().inverted() @ lift


# Les seuils communs gardent les poses contrôlables sans dépendre de valeurs dispersées.
MOTION_SAMPLE_INTERVALS = 24
MAX_RAISED_ARM_ELBOW_FLEXION = 100.0
MAX_SALUT_ABDUCTION = 70.0
MAX_ENCOURAGEMENT_ABDUCTION = 70.0
MAX_JUMP_ABDUCTION = 70.0
BRAVO_ARM_ABDUCTION = (65.0, 70.0)
ARM_BELOW_HORIZONTAL_EPSILON = 1e-5
ARM_TORSO_CLEARANCE_MARGIN = 0.005
ARM_TORSO_ARMPIT_EXCLUSION = 0.04
ARM_TORSO_CLEARANCE_CLIPS = ("marche", "saut", "salut", "bravo", "encouragement")
HAND_HEAD_CLEARANCE_MINIMUM = 0.02
HAND_HEAD_CLEARANCE_CLIPS = tuple(ANIMATIONS)


def arm_torso_sample_times(duration):
    samples = defaultdict(list)
    keyframes = round(duration * FPS)
    for frame in range(keyframes + 1):
        time = frame / FPS
        samples[round(time, 8)].append(f"cle{frame}")
    for image in range(8):
        time = duration * image / 8
        samples[round(time, 8)].append(f"image{image}")
    return [(labels, time) for time, labels in sorted(samples.items())]


def arm_torso_vertex_indices(body):
    arm_faces = set()
    for zone in ("corps-bras-haut", "corps-avant-bras"):
        arm_faces.update(BODY_ZONE_FACES[zone])
    torso_faces = set(BODY_ZONE_FACES["corps-torse-haut"])
    torso_faces.update(BODY_ZONE_FACES["corps-torse-bas"])
    arm_vertices = {
        vertex_index
        for face_index in arm_faces
        for vertex_index in body.data.polygons[face_index].vertices
    }
    torso_vertices = {
        vertex_index
        for face_index in torso_faces
        for vertex_index in body.data.polygons[face_index].vertices
    }
    # La frontière partagée entre les zones délimite l'aisselle naturelle.
    armpit_boundary = arm_vertices & torso_vertices
    arm_vertices.update(
        vertex_index
        for vertex_index, bone_name in RIGID_BODY_ASSIGNMENTS.items()
        if bone_name.startswith("hand.")
    )
    if not armpit_boundary:
        raise RuntimeError("Raccord peau bras/torse introuvable pour l'aisselle")
    return sorted(arm_vertices), sorted(armpit_boundary)


def evaluated_mesh_surface(obj, depsgraph, face_indices):
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        if len(mesh.polygons) != len(obj.data.polygons):
            raise RuntimeError(f"Topologie évaluée incompatible pour {obj.name}")
        coordinates = [
            evaluated.matrix_world @ vertex.co for vertex in mesh.vertices
        ]
        faces = [tuple(mesh.polygons[index].vertices) for index in face_indices]
        if not faces:
            raise RuntimeError(f"Aucune face évaluée disponible pour {obj.name}")
        return coordinates, BVHTree.FromPolygons(coordinates, faces)
    finally:
        evaluated.to_mesh_clear()


def evaluated_vertex_coordinates(obj, depsgraph):
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        if len(mesh.vertices) != len(obj.data.vertices):
            raise RuntimeError(f"Topologie évaluée incompatible pour {obj.name}")
        return [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
    finally:
        evaluated.to_mesh_clear()


def measure_arm_torso_clearance(
    body, vertex_indices, armpit_boundary_indices, torso_face_indices
):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    coordinates, torso_tree = evaluated_mesh_surface(
        body, depsgraph, torso_face_indices
    )
    armpit_points = [coordinates[index] for index in armpit_boundary_indices]
    minimum = None
    for vertex_index in vertex_indices:
        point = coordinates[vertex_index]
        armpit_gap = min((point - boundary).length for boundary in armpit_points)
        if armpit_gap <= ARM_TORSO_ARMPIT_EXCLUSION:
            continue
        torso_point, _, _, distance = torso_tree.find_nearest(point)
        if torso_point is None:
            raise RuntimeError("Le BVH évalué du torse ne contient aucune surface")
        if minimum is None or distance < minimum[0]:
            minimum = (distance, point.copy(), torso_point.copy(), armpit_gap)
    if minimum is None:
        raise RuntimeError("Aucun sommet de bras hors de la bande d'aisselle")
    return minimum


def measure_hand_head_clearance(body, head, hand_vertex_indices):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    hand_coordinates = evaluated_vertex_coordinates(body, depsgraph)
    _, head_tree = evaluated_mesh_surface(
        head, depsgraph, range(len(head.data.polygons))
    )
    minimum = None
    for vertex_index in hand_vertex_indices:
        point = hand_coordinates[vertex_index]
        head_point, _, _, distance = head_tree.find_nearest(point)
        if head_point is None:
            raise RuntimeError("Le BVH évalué de la tête ne contient aucune surface")
        if minimum is None or distance < minimum[0]:
            minimum = (distance, point.copy(), head_point.copy())
    if minimum is None:
        raise RuntimeError("Aucun sommet de main disponible pour le contrôle tête-main")
    return minimum


def validate_arm_torso_clearance(rig, body):
    torso_face_indices = sorted(
        set(BODY_ZONE_FACES["corps-torse-haut"])
        | set(BODY_ZONE_FACES["corps-torse-bas"])
    )
    arm_vertices, armpit_boundary = arm_torso_vertex_indices(body)
    build_key = body.data.shape_keys.key_blocks["fort"]
    saved_build = build_key.value
    errors = []
    try:
        linkage_clearance = {}
        for build in (-1.0, 0.0, 1.0):
            build_key.value = build
            set_pose(rig, attente, 0.0)
            bpy.context.view_layer.update()
            linkage_clearance[build] = measure_arm_torso_clearance(
                body, arm_vertices, armpit_boundary, torso_face_indices
            )[0]
        for clip in ARM_TORSO_CLEARANCE_CLIPS:
            pose_fn, duration, loop = ANIMATIONS[clip]
            samples = []
            for build in (-1.0, 0.0, 1.0):
                build_key.value = build
                required = linkage_clearance[build] - ARM_TORSO_CLEARANCE_MARGIN
                for labels, time in arm_torso_sample_times(duration):
                    pose_time = 0.0 if loop and time >= duration else time
                    set_pose(rig, pose_fn, pose_time)
                    bpy.context.view_layer.update()
                    distance, point, torso_point, armpit_gap = measure_arm_torso_clearance(
                        body, arm_vertices, armpit_boundary, torso_face_indices
                    )
                    samples.append((
                        distance, required, linkage_clearance[build], labels,
                        build, point, torso_point, armpit_gap,
                    ))
            minimum_sample = min(samples, key=lambda sample: sample[0])
            limiting_sample = min(samples, key=lambda sample: sample[0] - sample[1])
            minimum, required, linkage, labels, build, point, torso_point, armpit_gap = (
                minimum_sample
            )
            worst_margin = limiting_sample[0] - limiting_sample[1]
            print(
                "ARM_TORSO_CLEARANCE",
                clip,
                f"minimum={minimum:.6f}",
                f"linkage={linkage:.6f}",
                f"required={required:.6f}",
                f"image={','.join(labels)}",
                f"fort={build:+.0f}",
                f"worst_margin={worst_margin:.6f}",
                f"limiting_image={','.join(limiting_sample[3])}",
                f"limiting_fort={limiting_sample[4]:+.0f}",
                flush=True,
            )
            if worst_margin < 0:
                distance, required, linkage, labels, build, point, torso_point, armpit_gap = (
                    limiting_sample
                )
                errors.append(
                    f"ARM_TORSO_CLEARANCE {clip} minimum={distance:.6f} "
                    f"linkage={linkage:.6f} required={required:.6f} "
                    f"image={','.join(labels)} fort={build:+.0f} "
                    f"point={tuple(round(value, 5) for value in point)} "
                    f"torse={tuple(round(value, 5) for value in torso_point)} "
                    f"distance_aisselle={armpit_gap:.5f}"
                )
    finally:
        build_key.value = saved_build
        set_pose(rig, attente, 0.0)
        bpy.context.view_layer.update()
    return errors


def validate_hand_head_clearance(rig, body, head):
    hand_vertices = sorted(
        index
        for index, bone_name in RIGID_BODY_ASSIGNMENTS.items()
        if bone_name.startswith("hand.")
    )
    body_build_key = body.data.shape_keys.key_blocks["fort"]
    saved_body_build = body_build_key.value
    head_blocks = head.data.shape_keys.key_blocks if head.data.shape_keys else None
    head_build_key = head_blocks.get("fort") if head_blocks else None
    saved_head_build = head_build_key.value if head_build_key else None
    errors = []
    try:
        for clip in HAND_HEAD_CLEARANCE_CLIPS:
            pose_fn, duration, loop = ANIMATIONS[clip]
            samples = []
            for build in (-1.0, 0.0, 1.0):
                body_build_key.value = build
                if head_build_key:
                    head_build_key.value = build
                for labels, time in arm_torso_sample_times(duration):
                    pose_time = 0.0 if loop and time >= duration else time
                    set_pose(rig, pose_fn, pose_time)
                    bpy.context.view_layer.update()
                    distance, point, head_point = measure_hand_head_clearance(
                        body, head, hand_vertices
                    )
                    samples.append((distance, labels, build, point, head_point))
            distance, labels, build, point, head_point = min(
                samples, key=lambda sample: sample[0]
            )
            margin = distance - HAND_HEAD_CLEARANCE_MINIMUM
            print(
                "HAND_HEAD_CLEARANCE",
                clip,
                f"minimum={distance:.6f}",
                f"required={HAND_HEAD_CLEARANCE_MINIMUM:.6f}",
                f"image={','.join(labels)}",
                f"fort={build:+.0f}",
                f"margin={margin:.6f}",
                flush=True,
            )
            if margin < 0:
                errors.append(
                    f"HAND_HEAD_CLEARANCE {clip} minimum={distance:.6f} "
                    f"required={HAND_HEAD_CLEARANCE_MINIMUM:.6f} "
                    f"image={','.join(labels)} fort={build:+.0f} "
                    f"main={tuple(round(value, 5) for value in point)} "
                    f"tete={tuple(round(value, 5) for value in head_point)}"
                )
    finally:
        body_build_key.value = saved_body_build
        if head_build_key:
            head_build_key.value = saved_head_build
        set_pose(rig, attente, 0.0)
        bpy.context.view_layer.update()
    return errors


def validate_motion(rig, objects):
    center_z, radius_x, radius_y, radius_z = TORSO_COLLISION
    for name, (pose_fn, duration, loop) in ANIMATIONS.items():
        frames = round(duration * FPS)
        step = max(1, frames // MOTION_SAMPLE_INTERVALS)
        min_z = float("inf")
        min_hand_distance = float("inf")
        hand_inside_samples = 0
        max_elbow_flexion = 0.0
        min_raised_arm_flexion = float("inf")
        min_arm_abduction = float("inf")
        max_arm_abduction = 0.0
        arms_below_horizontal = True
        for frame in range(0, frames + 1, step):
            time = 0.0 if loop and frame >= frames else frame / FPS
            set_pose(rig, pose_fn, time)
            bpy.context.view_layer.update()
            for side, _ in SIDES:
                upperarm = rig.pose.bones[f"upperarm.{side}"]
                forearm = rig.pose.bones[f"forearm.{side}"]
                upper_direction = (upperarm.tail - upperarm.head).normalized()
                forearm_direction = (forearm.tail - forearm.head).normalized()
                elbow_angle = math.degrees(math.acos(max(
                    -1.0, min(1.0, upper_direction.dot(forearm_direction))
                )))
                max_elbow_flexion = max(max_elbow_flexion, elbow_angle)
                if side == "R" and name in ("salut", "encouragement"):
                    min_raised_arm_flexion = min(
                        min_raised_arm_flexion, elbow_angle
                    )
                arm_abduction = math.degrees(
                    math.atan2(abs(upper_direction.x), -upper_direction.z)
                )
                min_arm_abduction = min(min_arm_abduction, arm_abduction)
                max_arm_abduction = max(max_arm_abduction, arm_abduction)
                arms_below_horizontal &= upper_direction.z < -ARM_BELOW_HORIZONTAL_EPSILON
            depsgraph = bpy.context.evaluated_depsgraph_get()
            for obj in objects:
                evaluated = obj.evaluated_get(depsgraph)
                mesh = evaluated.to_mesh()
                matrix = evaluated.matrix_world
                for vertex in mesh.vertices:
                    min_z = min(min_z, (matrix @ vertex.co).z)
                evaluated.to_mesh_clear()
            for side in ("L", "R"):
                hand = rig.matrix_world @ rig.pose.bones[f"hand.{side}"].matrix.translation
                distance = math.sqrt(
                    (hand.x / radius_x) ** 2
                    + (hand.y / radius_y) ** 2
                    + ((hand.z - center_z) / radius_z) ** 2
                )
                min_hand_distance = min(min_hand_distance, distance)
                hand_inside_samples += distance < 1.0
        print(
            "MOTION_CHECK",
            name,
            "min_foot_z", round(min_z, 4),
            "min_hand_torso_distance", round(min_hand_distance, 3),
            "hand_inside_samples", hand_inside_samples,
            "max_elbow_flexion", round(max_elbow_flexion, 1),
            "min_raised_arm_flexion",
            round(min_raised_arm_flexion, 1)
            if math.isfinite(min_raised_arm_flexion)
            else "n/a",
            "max_arm_abduction", round(max_arm_abduction, 1),
            "min_arm_abduction", round(min_arm_abduction, 1),
            "arms_below_horizontal", int(arms_below_horizontal),
            flush=True,
        )
        if name in ("salut", "bravo", "encouragement") and max_elbow_flexion > MAX_RAISED_ARM_ELBOW_FLEXION:
            raise RuntimeError(f"Flexion de coude excessive dans {name}: {max_elbow_flexion:.1f}°")
        if name in ("salut", "encouragement") and min_raised_arm_flexion < 80.0:
            raise RuntimeError(
                f"Flexion de coude insuffisante dans {name}: "
                f"{min_raised_arm_flexion:.1f}°"
            )
        if name == "bravo":
            minimum, maximum = BRAVO_ARM_ABDUCTION
            if min_arm_abduction < minimum or max_arm_abduction > maximum:
                raise RuntimeError(
                    f"Abduction de bras hors limites dans bravo: "
                    f"{min_arm_abduction:.1f}–{max_arm_abduction:.1f}°"
                )
            if min_z < 0:
                raise RuntimeError(f"Pieds sous le sol dans bravo: {min_z:.4f} m")
        if name == "salut" and max_arm_abduction > MAX_SALUT_ABDUCTION:
            raise RuntimeError(f"Abduction d’épaule excessive dans salut: {max_arm_abduction:.1f}°")
        if name == "encouragement" and max_arm_abduction > MAX_ENCOURAGEMENT_ABDUCTION:
            raise RuntimeError(f"Abduction d’épaule excessive dans encouragement: {max_arm_abduction:.1f}°")
        if name == "saut" and max_arm_abduction > MAX_JUMP_ABDUCTION:
            raise RuntimeError(f"Abduction d’épaule excessive dans saut: {max_arm_abduction:.1f}°")
        if name in ("marche", "saut") and not arms_below_horizontal:
            raise RuntimeError(f"Bras au-dessus de l’horizontale dans {name}")


def evaluated_geometry(obj, depsgraph):
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        coordinates = [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
        polygons = [tuple(poly.vertices) for poly in mesh.polygons]
        mesh.calc_loop_triangles()
        triangles = [tuple(triangle.vertices) for triangle in mesh.loop_triangles]
        edge_counts = {}
        for polygon in polygons:
            for index, start in enumerate(polygon):
                edge = tuple(sorted((start, polygon[(index + 1) % len(polygon)])))
                edge_counts[edge] = edge_counts.get(edge, 0) + 1
        open_edges = {edge for edge, count in edge_counts.items() if count == 1}
        open_edge_attribute = mesh.attributes.get(OPEN_EDGE_ATTRIBUTE)
        if open_edge_attribute is not None and open_edge_attribute.domain == "POINT":
            tagged_vertices = {
                index for index, value in enumerate(open_edge_attribute.data) if value.value > 0.5
            }
            open_edges.update(
                tuple(sorted(edge.vertices))
                for edge in mesh.edges
                if all(vertex in tagged_vertices for vertex in edge.vertices)
            )
        return coordinates, triangles, sorted(open_edges)
    finally:
        evaluated.to_mesh_clear()


def visible_defect_directions():
    directions = []
    for elevation in (0, 25):
        for index in range(8):
            azimuth = math.radians(index * 45)
            camera = Vector((
                math.cos(math.radians(elevation)) * math.sin(azimuth),
                -math.cos(math.radians(elevation)) * math.cos(azimuth),
                math.sin(math.radians(elevation)),
            ))
            directions.append((f"az{index * 45:03d}_el{elevation:02d}", -camera))
    for index in range(8):
        azimuth = math.radians(index * 45)
        camera = Vector((
            math.cos(math.radians(50)) * math.sin(azimuth),
            -math.cos(math.radians(50)) * math.cos(azimuth),
            math.sin(math.radians(50)),
        ))
        directions.append((f"az{index * 45:03d}_el50", -camera))
    return directions


def open_edge_tree(segments):
    samples = []
    for start, end in segments:
        length = (end - start).length
        steps = max(1, math.ceil(length / VISIBLE_DEFECT_EDGE_SAMPLE_STEP))
        samples.extend(start.lerp(end, step / steps) for step in range(steps + 1))
    if not samples:
        return None
    tree = KDTree(len(samples))
    for index, point in enumerate(samples):
        tree.insert(point, index)
    tree.balance()
    return tree


def nearest_open_edge_distance(point, trees):
    return min(
        (tree.find(point)[2] for tree in trees if tree is not None),
        default=math.inf,
    )


def visible_defect_scene(objects, depsgraph):
    coordinates = []
    polygons = []
    face_owners = []
    edge_trees = {}
    overlap_trees = {}
    garment_names = set()
    for obj in objects:
        points, faces, open_edges = evaluated_geometry(obj, depsgraph)
        if not faces:
            continue
        offset = len(coordinates)
        coordinates.extend(points)
        polygons.extend(tuple(index + offset for index in face) for face in faces)
        face_owners.extend([obj.name] * len(faces))
        if PIECES.get(obj.name) and PIECES[obj.name].over:
            overlap_trees[obj.name] = BVHTree.FromPolygons(points, faces)
        if PIECES.get(obj.name) and PIECES[obj.name].slot in ("haut", "bas", "chaussures"):
            garment_names.add(obj.name)
            edge_trees[obj.name] = open_edge_tree(
                [(points[start], points[end]) for start, end in open_edges]
            )
    if not polygons:
        raise RuntimeError("Aucun maillage visible pour le contrôle caméra")
    bounds_min = Vector(tuple(min(point[axis] for point in coordinates) for axis in range(3)))
    bounds_max = Vector(tuple(max(point[axis] for point in coordinates) for axis in range(3)))
    center = (bounds_min + bounds_max) * 0.5
    radius = max((point - center).length for point in coordinates) + 0.05
    return (
        BVHTree.FromPolygons(coordinates, polygons),
        coordinates,
        face_owners,
        edge_trees,
        overlap_trees,
        garment_names,
        center,
        radius,
    )


def visible_scene_hit(scene_data, origin, direction, maximum_distance):
    tree, _, owners, *_ = scene_data
    location, _, face_index, distance = tree.ray_cast(
        origin, direction, maximum_distance
    )
    if location is None:
        return None
    return owners[face_index], location, distance


def validate_body_zone_masking(rig, body, head):
    outfit = ("haut-tshirt", "bas-short", "chaussures-baskets")
    worn = set(outfit)
    skin_objects = [*BODY_ZONE_OBJECTS.values(), head]
    outfit_objects = [PIECE_OBJECTS[name] for name in outfit]
    for obj in [body, *skin_objects, *outfit_objects]:
        blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
        if blocks and "fort" in blocks:
            blocks["fort"].value = 0.0
    set_pose(rig, attente, 0)
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()

    # Le témoin sans vêtement distingue une perte de masque d'une occlusion normale.
    reference_scene = visible_defect_scene(skin_objects, depsgraph)
    visible_zones = visible_body_zone_names(worn)
    masked_scene = visible_defect_scene(
        [*(BODY_ZONE_OBJECTS[name] for name in visible_zones), head, *outfit_objects],
        depsgraph,
    )
    skin_coordinates, skin_triangles, _ = evaluated_geometry(body, depsgraph)
    _, radius = reference_scene[-2:]
    maximum_distance = radius * BODY_ZONE_MASK_RAY_START_SCALE
    reference_skin_names = set(BODY_ZONE_NAMES) | {head.name}
    masked_skin_names = set(BODY_ZONE_NAMES) | {head.name}
    failures = []
    visible_rays = 0

    for camera_label, direction in visible_defect_directions():
        for triangle_index, triangle in enumerate(skin_triangles):
            first, second, third = (skin_coordinates[index] for index in triangle)
            point = (first + second + third) / 3
            normal = (second - first).cross(third - first).normalized()
            if normal.dot(direction) >= -0.05:
                continue
            origin = point - direction * maximum_distance
            reference_hit = visible_scene_hit(
                reference_scene, origin, direction, maximum_distance * 2
            )
            if (
                reference_hit is None
                or reference_hit[0] not in reference_skin_names
                or (reference_hit[1] - point).length > BODY_ZONE_MASK_RAY_TOLERANCE
            ):
                continue

            visible_rays += 1
            zone = reference_hit[0]
            masked_hit = visible_scene_hit(
                masked_scene, origin, direction, maximum_distance * 2
            )
            if masked_hit is not None:
                owner, _, distance = masked_hit
                if (
                    owner in masked_skin_names
                    and abs(distance - reference_hit[2]) <= BODY_ZONE_MASK_RAY_TOLERANCE
                ):
                    continue
                piece = PIECES.get(owner)
                if (
                    piece is not None
                    and piece.slot in ("haut", "bas", "chaussures")
                    and distance <= reference_hit[2] + BODY_ZONE_MASK_RAY_TOLERANCE
                ):
                    continue

            masked_description = "none"
            if masked_hit is not None:
                masked_description = (
                    f"{masked_hit[0]}@{masked_hit[2] - reference_hit[2]:.4f}m"
                )
            failures.append((camera_label, triangle_index, zone))
            if len(failures) <= 8:
                print(
                    "BODY_ZONE_MASK_FAULT",
                    f"view={camera_label}",
                    f"triangle={triangle_index}",
                    f"zone={zone}",
                    f"point={tuple(round(value, 4) for value in point)}",
                    f"masked_hit={masked_description}",
                    f"outfit={'+'.join(outfit)}",
                    flush=True,
                )

    print(
        "BODY_ZONE_MASK_CHECK",
        f"outfit={'+'.join(outfit)}",
        f"visible_skin_rays={visible_rays}",
        f"missing={len(failures)}",
        flush=True,
    )
    if failures:
        raise RuntimeError(
            f"Le masquage retire {len(failures)} faces visibles sans vêtement couvrant"
        )


def covering_piece_behind(owner, location, direction, overlap_trees, skin_tree):
    piece = PIECES.get(owner)
    if piece is None:
        return None
    origin = location + direction * 0.00001
    for covering_name, tree in overlap_trees.items():
        if piece.slot not in PIECES[covering_name].over:
            continue
        hit, _, _, _ = tree.ray_cast(origin, direction, 0.015)
        if hit is not None:
            region = PIECES[covering_name].over_region
            skin_point = skin_tree.find_nearest(hit)[0] if region else None
            if region and (skin_point is None or not region(skin_point)):
                continue
            gap = (hit - location).dot(direction)
            if 0 < gap <= 0.015:
                return covering_name
    return None


def visible_defect_clusters(impacts):
    cells = defaultdict(list)
    for point, owner, category in impacts:
        cell = tuple(
            math.floor(point[axis] / VISIBLE_DEFECT_CLUSTER_STEP)
            for axis in range(3)
        )
        cells[cell].append((point, owner, category))
    unvisited = set(cells)
    clusters = []
    while unvisited:
        stack = [unvisited.pop()]
        component = set(stack)
        while stack:
            cell = stack.pop()
            for axis in range(3):
                for delta in (-1, 1):
                    neighbor = list(cell)
                    neighbor[axis] += delta
                    neighbor = tuple(neighbor)
                    if neighbor in unvisited:
                        unvisited.remove(neighbor)
                        component.add(neighbor)
                        stack.append(neighbor)
        samples = [
            sample
            for cell in component
            for sample in cells[cell]
        ]
        points = [point for point, _, _ in samples]
        clusters.append({
            "count": len(samples),
            "owners": dict(Counter(owner for _, owner, _ in samples)),
            "categories": dict(Counter(category for _, _, category in samples)),
            "minimum": tuple(min(point[axis] for point in points) for axis in range(3)),
            "maximum": tuple(max(point[axis] for point in points) for axis in range(3)),
        })
    return sorted(clusters, key=lambda cluster: cluster["count"], reverse=True)


def validate_visible_defects(
    rig,
    head,
    hair,
    builds=None,
    pairs=None,
    scenarios=None,
):
    validate_avatar_object_names([rig] + pieces + hairs)
    tops = [obj for obj in PIECE_OBJECTS.values() if PIECES[obj.name].slot == "haut"]
    bottoms = [obj for obj in PIECE_OBJECTS.values() if PIECES[obj.name].slot == "bas"]
    shoes = PIECE_OBJECTS["chaussures-baskets"]
    builds = (-1.0, 0.0, 1.0) if builds is None else tuple(builds)
    pairs = [(top, bottom) for top in tops for bottom in bottoms] if pairs is None else list(pairs)
    if scenarios is None:
        identity = lambda _time: ({}, Vector((0, 0, 0)))
        scenarios = [("liaison", identity, 0.0, "liaison")]
        for clip in ("marche", "saut", "bravo", "encouragement"):
            pose_fn, duration, _ = ANIMATIONS[clip]
            scenarios.extend(
                (clip, pose_fn, duration * frame / 8, f"frame{frame}")
                for frame in range(8)
            )
    directions = visible_defect_directions()
    errors = []

    for build in builds:
        for top, bottom in pairs:
            worn = (top.name, bottom.name, shoes.name)
            visible_zones = visible_body_zone_names(worn)
            visible_body = [BODY_ZONE_OBJECTS[name] for name in visible_zones]
            base_objects = [*visible_body, top, bottom, shoes, head, hair]
            defects_by_clip = {}
            causes_by_clip = {}
            categories_by_clip = {}
            impacts_by_clip = {}
            reports_by_case = {}
            for clip, pose_fn, time, image in scenarios:
                defects_by_clip.setdefault(clip, 0)
                causes_by_clip.setdefault(clip, {})
                categories_by_clip.setdefault(clip, {})
                impacts_by_clip.setdefault(clip, [])
                for obj in [*base_objects, body]:
                    blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
                    if blocks and "fort" in blocks:
                        blocks["fort"].value = build
                set_pose(rig, pose_fn, time)
                bpy.context.view_layer.update()
                depsgraph = bpy.context.evaluated_depsgraph_get()
                skin_coordinates, skin_faces, _ = evaluated_geometry(body, depsgraph)
                skin_tree = BVHTree.FromPolygons(skin_coordinates, skin_faces)
                (
                    tree,
                    coordinates,
                    face_owners,
                    edge_trees,
                    overlap_trees,
                    garment_names,
                    center,
                    radius,
                ) = (
                    visible_defect_scene(base_objects, depsgraph)
                )
                defects = 0
                defects_by_owner = {}
                defects_by_category = {}
                reported_key = (top.name, bottom.name, clip, build)
                reported = reports_by_case.get(reported_key, 0)
                impacts = []
                for camera_label, ray_direction in directions:
                    right = ray_direction.cross(Vector((0, 0, 1))).normalized()
                    up = right.cross(ray_direction).normalized()
                    projected_x = [(point - center).dot(right) for point in coordinates]
                    projected_y = [(point - center).dot(up) for point in coordinates]
                    x_values = np.arange(
                        math.floor((min(projected_x) - VISIBLE_DEFECT_GRID_STEP / 2)
                                   / VISIBLE_DEFECT_GRID_STEP) * VISIBLE_DEFECT_GRID_STEP,
                        max(projected_x) + VISIBLE_DEFECT_GRID_STEP,
                        VISIBLE_DEFECT_GRID_STEP,
                    )
                    y_values = np.arange(
                        math.floor((min(projected_y) - VISIBLE_DEFECT_GRID_STEP / 2)
                                   / VISIBLE_DEFECT_GRID_STEP) * VISIBLE_DEFECT_GRID_STEP,
                        max(projected_y) + VISIBLE_DEFECT_GRID_STEP,
                        VISIBLE_DEFECT_GRID_STEP,
                    )
                    origin_base = center - ray_direction * radius
                    for y in y_values:
                        for x in x_values:
                            origin = origin_base + right * float(x) + up * float(y)
                            location, normal, face_index, _ = tree.ray_cast(
                                origin, ray_direction, radius * 2
                            )
                            if location is None:
                                continue
                            owner = face_owners[face_index]
                            if not (owner.startswith("corps") or owner in garment_names):
                                continue
                            backface = normal.dot(ray_direction) > 0
                            overlap_piece = covering_piece_behind(
                                owner, location, ray_direction, overlap_trees, skin_tree
                            )
                            if not (backface or overlap_piece):
                                continue
                            if owner in garment_names:
                                edge_trees_to_check = (edge_trees[owner],)
                            else:
                                edge_trees_to_check = edge_trees.values()
                            edge_distance = nearest_open_edge_distance(location, edge_trees_to_check)
                            near_edge = edge_distance <= (
                                VISIBLE_DEFECT_OPEN_EDGE_DISTANCE + VISIBLE_DEFECT_EDGE_SAMPLE_STEP / 2
                            )
                            if near_edge and not overlap_piece:
                                continue
                            categories = []
                            if backface:
                                categories.append("dos")
                            if overlap_piece:
                                categories.append("superposition")
                            category = "+".join(categories)
                            defects += 1
                            defects_by_owner[owner] = defects_by_owner.get(owner, 0) + 1
                            impacts.append((tuple(location), owner, category))
                            for defect_category in categories:
                                defects_by_category[defect_category] = (
                                    defects_by_category.get(defect_category, 0) + 1
                                )
                            if reported < VISIBLE_DEFECT_MAX_REPORTS:
                                print(
                                    "VISIBLE_DEFECT",
                                    f"{top.name}+{bottom.name}",
                                    clip,
                                    f"fort={build:g}",
                                    f"piece={owner}",
                                    f"category={category}",
                                    f"position={tuple(round(value, 4) for value in location)}",
                                    f"image={image}",
                                    f"direction={camera_label}",
                                    f"normal_dot={normal.dot(ray_direction):.4f}",
                                    f"edge_distance={edge_distance:.4f}",
                                    f"covered_by={overlap_piece or '-'}",
                                    flush=True,
                                )
                                reported += 1
                reports_by_case[reported_key] = reported
                defects_by_clip[clip] += defects
                impacts_by_clip[clip].extend(impacts)
                for owner, count in defects_by_owner.items():
                    causes_by_clip[clip][owner] = causes_by_clip[clip].get(owner, 0) + count
                for category, count in defects_by_category.items():
                    categories_by_clip[clip][category] = (
                        categories_by_clip[clip].get(category, 0) + count
                    )
            for clip, defects in defects_by_clip.items():
                clusters = visible_defect_clusters(impacts_by_clip[clip])
                print(
                    "VISIBLE_DEFECTS",
                    f"{top.name}+{bottom.name}",
                    clip,
                    f"fort={build:g}",
                        f"defects={defects}",
                        flush=True,
                    )
                for owner, count in sorted(causes_by_clip[clip].items()):
                    print(
                        "VISIBLE_DEFECT_CAUSE",
                        f"{top.name}+{bottom.name}",
                        clip,
                        f"fort={build:g}",
                        f"owner={owner}",
                        f"defects={count}",
                        flush=True,
                    )
                for category, count in sorted(categories_by_clip[clip].items()):
                    print(
                        "VISIBLE_DEFECT_CATEGORY",
                        f"{top.name}+{bottom.name}",
                        clip,
                        f"fort={build:g}",
                        f"category={category}",
                        f"defects={count}",
                        flush=True,
                    )
                blocking_clusters = [
                    cluster
                    for cluster in clusters
                    if cluster["count"] >= VISIBLE_DEFECT_CLUSTER_LIMIT
                ]
                for index, cluster in enumerate(clusters, start=1):
                    print(
                        "VISIBLE_DEFECT_CLUSTER",
                        f"{top.name}+{bottom.name}",
                        clip,
                        f"fort={build:g}",
                        f"cluster={index}",
                        f"impacts={cluster['count']}",
                        f"owners={cluster['owners']}",
                        f"categories={cluster['categories']}",
                        f"minimum={tuple(round(value, 4) for value in cluster['minimum'])}",
                        f"maximum={tuple(round(value, 4) for value in cluster['maximum'])}",
                        flush=True,
                    )
                if blocking_clusters:
                    errors.append(
                        f"{top.name}+{bottom.name} {clip} fort={build:g}: "
                        f"clusters={[cluster['count'] for cluster in blocking_clusters]}"
                    )

    for obj in pieces + hairs + [head]:
        blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
        if blocks and "fort" in blocks:
            blocks["fort"].value = 0.0
    set_pose(rig, attente, 0)
    return errors


# Le glTF ignore les contraintes : leur résultat doit être cuit dans chaque image.
def bake_actions(rig):
    rig.animation_data_create()
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    for name, (fn, duration, loop) in ANIMATIONS.items():
        action = bpy.data.actions.new(name)
        action.use_fake_user = True
        rig.animation_data.action = action
        frames = round(duration * FPS)
        for frame in range(frames + 1):
            # Une boucle se referme sur sa première pose.
            scene.frame_set(frame)
            set_pose(rig, fn, (frame % frames if loop else frame) / FPS)
            for pb in rig.pose.bones:
                pb.keyframe_insert("rotation_quaternion", frame=frame)
            rig.pose.bones["root"].keyframe_insert("location", frame=frame)
        bpy.context.view_layer.update()
        bpy.ops.nla.bake(
            frame_start=0,
            frame_end=frames,
            step=1,
            only_selected=False,
            visual_keying=True,
            clear_constraints=False,
            clear_parents=False,
            use_current_action=True,
            clean_curves=False,
            bake_types={"POSE"},
        )
        print("ANIMATION", name, frames + 1, "images", flush=True)
    rig.animation_data.action = None
    for pb in rig.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = (0, 0, 0)
    scene.frame_set(0)
    bpy.ops.object.mode_set(mode="OBJECT")


def reshape_avatar(rig, objects):
    global HEAD_C, HEAD_R, TORSO_COLLISION, NECK_BASE_Z

    settings = {
        "head_height": 0.36,
        "torso_scale": 1.25,
        "torso_width_scale": 0.92,
        "shoulder_scale": 0.88,
        "depth_scale": 0.95,
    }
    head_bottom = HEAD_C.z - HEAD_R.z
    head_top = HEAD_C.z + HEAD_R.z
    head_scale = settings["head_height"] / (head_top - head_bottom)
    source_floor = min(
        (obj.matrix_world @ vertex.co).z
        for obj in objects
        for vertex in obj.data.vertices
    )
    target_head_top = 1.0
    target_head_bottom = target_head_top - settings["head_height"]
    target_shoulder = target_head_bottom - 0.05
    target_hip = target_shoulder - (SHOULDER.z - HIP.z) * settings["torso_scale"]
    TORSO_COLLISION = (
        target_hip + (TORSO_C - HIP.z) * settings["torso_scale"],
        TORSO_R.x * settings["torso_width_scale"],
        TORSO_R.y * settings["depth_scale"],
        TORSO_R.z * settings["torso_scale"],
    )
    points = (
        (source_floor, 0.0),
        (ANKLE.z, ANKLE.z),
        (HIP.z, target_hip),
        (SHOULDER.z, target_shoulder),
        (head_bottom, target_head_bottom),
        (head_top, target_head_top),
    )

    def remap_z(z):
        for (source_a, target_a), (source_b, target_b) in zip(points, points[1:]):
            if z <= source_b:
                amount = (z - source_a) / (source_b - source_a)
                return target_a + (target_b - target_a) * amount
        return target_head_top + (z - head_top) * head_scale

    def horizontal_scale(z):
        if z <= HIP.z:
            return 1.0
        if z <= SHOULDER.z:
            amount = (z - HIP.z) / (SHOULDER.z - HIP.z)
            return 1.0 + (settings["torso_width_scale"] - 1.0) * amount
        amount = min(1.0, max(0.0, (z - SHOULDER.z) / (head_bottom - SHOULDER.z)))
        return settings["torso_width_scale"] + (
            settings["shoulder_scale"] - settings["torso_width_scale"]
        ) * amount

    def depth_scale(z):
        if z <= HIP.z:
            return 1.0
        amount = min(1.0, max(0.0, (z - HIP.z) / (SHOULDER.z - HIP.z)))
        return 1.0 + (settings["depth_scale"] - 1.0) * amount

    def transform_point(point, is_head, object_name=""):
        if is_head:
            source_z = min(point.z, head_top) if object_name.startswith("cheveux-") else point.z
            return Vector((
                point.x * head_scale,
                point.y * head_scale,
                target_head_bottom + (source_z - head_bottom) * head_scale,
            ))
        return Vector((
            point.x * horizontal_scale(point.z),
            point.y * depth_scale(point.z),
            remap_z(point.z),
        ))

    def is_head_object(obj):
        return obj.name == "tete" or obj.name.startswith(("cheveux-", "tete-", "visage-"))

    for obj in objects:
        is_head = is_head_object(obj)
        matrix = obj.matrix_world.copy()
        inverse = matrix.inverted_safe()
        blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else ()
        if blocks:
            for block in blocks:
                for point in block.data:
                    point.co = inverse @ transform_point(matrix @ point.co, is_head, obj.name)
        else:
            for vertex in obj.data.vertices:
                vertex.co = inverse @ transform_point(matrix @ vertex.co, is_head, obj.name)
        obj.data.update()

    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for bone in rig.data.edit_bones:
        bone.head = transform_point(bone.head.copy(), False)
        bone.tail = transform_point(bone.tail.copy(), False)
    bpy.ops.object.mode_set(mode="OBJECT")

    HEAD_C = Vector((0.0, 0.0, (target_head_top + target_head_bottom) * 0.5))
    HEAD_R = Vector((HEAD_R.x * head_scale, HEAD_R.y * head_scale, settings["head_height"] * 0.5))
    NECK_BASE_Z = remap_z(NECK_BASE_Z)
    print(
        "PROPORTIONS",
        "A1",
        "height", round(target_head_top, 4),
        "head", round(settings["head_height"], 4),
        "torso", round((SHOULDER.z - HIP.z) * settings["torso_scale"], 4),
        "legs", round(target_hip - ANKLE.z, 4),
        "shoulders", settings["shoulder_scale"],
        flush=True,
    )


# ---------------------------------------------------------------------------
# Construction
# ---------------------------------------------------------------------------
rig = build_armature()
body = assign_weights(assign(remeshed("corps", body_parts, voxel=0.0045, smooth=8, triangles=5600), "peau"))
head = assign_weights(assign(remeshed("tete", head_parts, voxel=0.0035, smooth=6, triangles=2800), "peau"), "tete")
validate_rigid_weights(body, head)
default_clothes = [build_piece(name, body) for name in DEFAULT_PIECES]
pieces = [body, head] + default_clothes
hairs = [assign_weights(build_hair(style), "tete") for style in HAIRS]
clothes = wardrobe(body)
pieces += clothes
PIECE_OBJECTS = {obj.name: obj for obj in pieces if obj.name in PIECES}
simplify_pieces(pieces + hairs)
add_neck_geometry(body)
RIGID_BODY_ASSIGNMENTS = rigid_body_groups(body)
for obj in pieces + hairs:
    recalculate_face_normals(obj)
for obj in [body] + pieces[2:]:
    smooth_by_angle(obj)
validate_materials(pieces + hairs)
for hair in hairs:
    add_hat_key(hair)
# Après toutes les constructions (une conversion de maillage effacerait les formes).
# Les baskets et les couvre-chefs ne bougent pas avec la carrure (le champ y est nul) : pas de
# forme pour eux. Les lunettes ont déjà les leurs (écart et hauteur des yeux).
_skin_mesh = bmesh.new()
_skin_mesh.from_mesh(body.data)
BODY_SKIN = BVHTree.FromBMesh(_skin_mesh)
add_build_key(body)
# Les contrats de couverture restent exprimés dans le repère pré-remodelage.
BODY_REFERENCE = {build: shape_coordinates(body, build) for build in (-1.0, 0.0, 1.0)}
BODY_ZONE_FACES, BODY_ZONE_MASKS = classify_body_zones(
    body, BODY_REFERENCE, write_masks=False
)
write_body_zone_masks(BODY_ZONE_MASKS)
for piece_name, open_edge_segments in SHELL_INNER_LAYER_OPEN_EDGES.items():
    obj = PIECE_OBJECTS.get(piece_name)
    if obj is None:
        raise RuntimeError(f"Coque intérieure introuvable après simplification: {piece_name}")
    flatten_shell_inner_layer(
        obj,
        BODY_SKIN,
        open_edge_segments,
        piece_name,
    )
    recalculate_face_normals(obj)
    smooth_by_angle(obj)
for obj in [c for c in pieces if c.name in FOLLOW_BUILD]:
    add_build_key(obj, BODY_SKIN)
# Couverture vérifiée avant `reshape_avatar` : la même transformation, continue et monotone,
# s'applique ensuite à la peau et aux vêtements, sans pouvoir ouvrir de trou.
preview_only = bool(os.environ.get("AVATAR_PREVIEW")) and not os.environ.get("AVATAR_EXPORT_OUT")
if not preview_only or os.environ.get("AVATAR_COVERAGE") == "1":
    validate_wardrobe_coverage(
        body, [obj for obj in pieces if PIECES.get(obj.name) and PIECES[obj.name].slot in ("haut", "bas")]
    )
reshape_avatar(rig, pieces + hairs)
restore_neck_geometry(body)
for piece_name in SHELL_INNER_LAYER_OPEN_EDGES:
    obj = PIECE_OBJECTS.get(piece_name)
    if obj is None:
        raise RuntimeError(f"Coque de carrure introuvable: {piece_name}")
    preserve_shell_build_layers(obj, body, piece_name)
for obj in pieces + hairs:
    smooth_skinning_weights(obj, RIGID_BODY_ASSIGNMENTS)
transfer_over_piece_weights(pieces)
restore_rigid_weights(body, RIGID_BODY_ASSIGNMENTS)
restore_neck_weights(body)
validate_rigid_weights(body, head, RIGID_BODY_ASSIGNMENTS)
MAX_INFLUENCES = 0
for obj in pieces + hairs:
    # L'app retrouve les morceaux d'une pièce à plusieurs matières par le nom de son maillage.
    obj.data.name = obj.name
    if obj is not body:
        MAX_INFLUENCES = max(MAX_INFLUENCES, normalize_weights(obj))
    bind(obj, rig)
body.data.update()
validate_avatar_normals([body])
body.name = "corps-complet-validation"
body.data.name = "corps-complet-validation"
(
BODY_ZONE_OBJECTS,
    BODY_ZONE_VERTEX_INDICES,
    BODY_ZONE_BOUNDARY_VERTICES,
    BODY_ZONE_BOUNDARY_CAPS,
    BODY_ZONE_CAP_COMPONENT_FACES,
) = split_body_zones(body, BODY_ZONE_FACES)
pieces[0:1] = [BODY_ZONE_OBJECTS[name] for name in BODY_ZONE_NAMES]
for zone_obj in BODY_ZONE_OBJECTS.values():
    zone_obj.data.name = zone_obj.name
    MAX_INFLUENCES = max(MAX_INFLUENCES, normalize_weights(zone_obj, MAX_SKIN_INFLUENCES))
    bind(zone_obj, rig)
validate_avatar_object_names([rig] + pieces + hairs)
validate_zone_seams(
    BODY_ZONE_OBJECTS,
    BODY_ZONE_VERTEX_INDICES,
    BODY_ZONE_BOUNDARY_VERTICES,
    BODY_ZONE_BOUNDARY_CAPS,
    BODY_ZONE_CAP_COMPONENT_FACES,
    rig,
    body,
)
validate_avatar_normals(pieces + hairs)
if not preview_only or os.environ.get("AVATAR_COVERAGE") == "1":
    validate_body_zone_masking(rig, body, head)
for obj in pieces + hairs:
    print("TRIANGLES", obj.name, triangle_count(obj), flush=True)

triangle_totals = {obj.name: triangle_count(obj) for obj in pieces + hairs}
def max_piece(prefix):
    return max((name for name in triangle_totals if name.startswith(prefix)),
               key=lambda name: triangle_totals[name], default=None)


def piece_count(name):
    return triangle_totals.get(name, 0)


def outfit_triangle_count(worn, hair_name):
    visible_zones = visible_body_zone_names(worn)
    visible_objects = [*visible_zones, "tete", hair_name, *worn]
    return sum(piece_count(name) for name in visible_objects), visible_zones


default_outfit = list(DEFAULT_PIECES)
default_triangles, default_zones = outfit_triangle_count(default_outfit, "cheveux-court")
slot_options = [
    [None] + [name for name, piece in PIECES.items() if piece.slot == slot]
    for slot in PIECE_SLOT_PREFIXES
]
heavy_choice = None
for choices in product(*slot_options):
    worn = tuple(name for name in choices if name is not None)
    for hair in hairs:
        count, visible_zones = outfit_triangle_count(worn, hair.name)
        if heavy_choice is None or count > heavy_choice[0]:
            heavy_choice = (count, worn, hair.name, visible_zones)
heavy_triangles, heavy_pieces, heavy_hair, heavy_zones = heavy_choice
default_body_triangles = sum(piece_count(name) for name in default_zones)
heavy_body_triangles = sum(piece_count(name) for name in heavy_zones)
print(
    "BUDGET",
    f"default={default_triangles}",
    f"default_body={default_body_triangles}",
    f"default_outfit={','.join(default_outfit)}",
    f"default_visible_zones={','.join(default_zones)}",
    f"heavy={heavy_triangles}",
    f"heavy_body={heavy_body_triangles}",
    f"heavy_outfit={','.join((*heavy_pieces, heavy_hair))}",
    f"heavy_visible_zones={','.join(heavy_zones)}",
    flush=True,
)
if max(default_body_triangles, heavy_body_triangles) > BASE_TRIANGLE_CAPS["corps"]:
    raise RuntimeError(
        f"Budget du corps affiché dépassé : "
        f"{max(default_body_triangles, heavy_body_triangles)}/{BASE_TRIANGLE_CAPS['corps']}"
    )
print("RIG", "bones", len(rig.data.bones), flush=True)
print("WEIGHTS", "max_influences", MAX_INFLUENCES, flush=True)
if MAX_INFLUENCES > MAX_SKIN_INFLUENCES:
    raise RuntimeError(
        f"Export avatar bloqué : {MAX_INFLUENCES} influences dépasse le maximum {MAX_SKIN_INFLUENCES}"
    )
for hair in hairs:
    key = hair.data.shape_keys.key_blocks.get("chapeau") if hair.data.shape_keys else None
    if key is None or len(key.data) != len(hair.data.vertices):
        raise RuntimeError(f"{hair.name}: forme chapeau absente ou topologie incompatible")
    moved = sum((target.co - vertex.co).length > 1e-5 for vertex, target in zip(hair.data.vertices, key.data))
    if moved == 0 and hair.name != "cheveux-rase":
        raise RuntimeError(f"{hair.name}: forme chapeau sans effet")
    print("HAIR_SHAPE", hair.name, "vertices", len(hair.data.vertices), "chapeau_moved", moved, flush=True)


# ---------------------------------------------------------------------------
# Aperçu : huit figurines, chacune sa peau, sa coiffure, ses couleurs et sa pose
# ---------------------------------------------------------------------------
def placeholder_face(name, rig_obj):
    """Visage simple pour l'aperçu Blender ; l'app le dessine avec son shader."""
    bm = bmesh.new()
    for sx in (-1, 1):
        x, z = HEAD_R.x * 0.32 * sx, HEAD_C.z + HEAD_R.z * 0.08
        y = -HEAD_R.y * math.sqrt(max(0.0, 1 - (x / HEAD_R.x) ** 2 - ((z - HEAD_C.z) / HEAD_R.z) ** 2)) - 0.004
        ellipsoid(bm, (x, y, z), 0.016, (0.9, 0.22, 1.25), segments=12)
    eyes = assign(link(f"{name}-yeux", bm), "cheveux")
    eyes.data.materials[0] = material("oeil", srgb("#2a2420"))
    bm = bmesh.new()
    smile = []
    mouth_z = HEAD_C.z - HEAD_R.z * 0.34
    for k in range(9):
        x = -0.04 + 0.08 * k / 8
        z = mouth_z + 0.02 * (x / 0.04) ** 2
        y = -HEAD_R.y * math.sqrt(max(0.0, 1 - (x / HEAD_R.x) ** 2 - ((z - HEAD_C.z) / HEAD_R.z) ** 2)) - 0.004
        smile.append((x, y, z))
    for point in smile:
        ellipsoid(bm, point, 0.006, (1.0, 0.25, 1.0), segments=8)
    mouth = link(f"{name}-bouche", bm)
    mouth.data.materials.append(material("oeil", srgb("#2a2420")))
    for part in (eyes, mouth):
        skin(part, rig_obj, "tete")
    return [eyes, mouth]


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


def preview_lighting():
    world = bpy.data.worlds.new("Ciel avatar")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#eef5ff")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
    scene.world = world

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.018))
    floor = bpy.context.object
    floor.name = "Fond ciel"
    floor.data.materials.append(material("fond-ciel", srgb("#eef5ff")))

    def sun(name, app_direction, energy, color):
        direction = Vector((app_direction[0], -app_direction[2], app_direction[1])).normalized()
        data = bpy.data.lights.new(name, "SUN")
        data.energy = energy
        data.color = srgb(color)[:3]
        data.angle = math.radians(4)
        data.use_shadow = False
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.rotation_euler = Vector((0, 0, -1)).rotation_difference(-direction).to_euler()

    sun("Soleil commun", (-0.67, 0.656, 0.348), 2.2, "#fff1dc")
    sun("Remplissage", (3, 1, 4), 0.7, "#e8f0ff")
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = int(os.environ.get("AVATAR_SAMPLES", "24"))
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.cycles.glossy_bounces = 1
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.image_settings.file_format = "PNG"


if os.environ.get("AVATAR_PREVIEW"):
    hair_preview_mode = os.environ.get("AVATAR_HAIR_PREVIEW", "")
    hair_preview = bool(hair_preview_mode)
    close_mode = os.environ.get("AVATAR_CLOSE", "")
    single_view = not close_mode and not hair_preview and any(
        os.environ.get(key) for key in ("AVATAR_TURN", "AVATAR_BUILD", "AVATAR_TOP"))
    hair_wear = ("tete-couronne",) if hair_preview_mode == "crown" else (
        ("tete-bonnet",) if hair_preview_mode == "hat" else ())
    panels = (
        tuple(
            (f"cheveux {style}", 0, 0, hair_wear, style)
            for style in ("court", "epis", "carre", "long", "queue", "chignons", "boucles", "rase")
        )
        if hair_preview
        else (
            ("face", 0, 0, (), "court"),
            ("3/4", math.radians(35), 0, (), "court"),
            ("dos", math.pi, 0, (), "court"),
            ("sweat + pantalon + bonnet", 0, 0, ("haut-sweat", "bas-pantalon", "tete-bonnet"), "court"),
            ("carrure fine", 0, -1, (), "court"),
            ("carrure large", 0, 1, (), "court"),
            ("cheveux court", 0, 0, (), "court"),
            ("cheveux épis", 0, 0, (), "epis"),
            ("cheveux carré", 0, 0, (), "carre"),
            ("cheveux boucles", 0, 0, (), "boucles"),
        )
    )
    if close_mode:
        yaw = math.radians(float(os.environ.get("AVATAR_TURN", "0")))
        build = float(os.environ.get("AVATAR_BUILD", "0"))
        close_wear = tuple(w for w in os.environ.get("AVATAR_WEAR", "").split(",") if w)
        panels = ((f"gros plan {close_mode}", yaw, build, close_wear,
                   os.environ.get("AVATAR_HAIR_STYLE", "court")),)
    elif single_view:
        yaw = math.radians(float(os.environ.get("AVATAR_TURN", "0")))
        build = float(os.environ.get("AVATAR_BUILD", "0"))
        panels = (("vue", yaw, build, (), "court"),)
    spacing = 1.35
    skin_c = BASE_SKIN
    hair_c = "#5a3a22"
    top_c, bottom_c = "#3f7fd8", "#2f3b55"
    for k, (_, yaw, build, wear, hair_style) in enumerate(panels):
        def worn_or(prefix, default):
            return next((c for c in clothes if c.name in wear and c.name.startswith(prefix)), default)

        default_top = PIECE_OBJECTS["haut-sweat"] if os.environ.get("AVATAR_TOP") == "sweat" \
            else PIECE_OBJECTS["haut-tshirt"]
        top = worn_or("haut-", default_top)
        bottom = worn_or("bas-", PIECE_OBJECTS["bas-short"])
        shoes = worn_or("chaussures-", PIECE_OBJECTS["chaussures-baskets"])
        slots = ("haut-", "bas-", "chaussures-")
        extra = [c for c in clothes if c.name in wear and not c.name.startswith(slots)]
        chosen_hair = next(hair for hair in hairs if hair.name == f"cheveux-{hair_style}")
        worn_pieces = {top.name, bottom.name, shoes.name, *(obj.name for obj in extra)}
        visible_body = [BODY_ZONE_OBJECTS[name] for name in visible_body_zone_names(worn_pieces)]
        chosen = visible_body + [head, top, bottom, shoes, chosen_hair] + extra
        colors = {"peau": skin_c, "cheveux": hair_c}
        new_rig, objs = clone(rig, chosen, ((k - (len(panels) - 1) / 2) * spacing, 0, 0), colors)
        for obj in objs:
            if obj.name.startswith("haut"):
                top_material = material(f"haut-{k}", srgb(top_c))
                obj.data.materials[0] = top_material
            if obj.name.startswith("bas"):
                bottom_material = material(f"bas-{k}", srgb(bottom_c))
                obj.data.materials[0] = bottom_material
        face = placeholder_face(f"f{k}", new_rig)
        for part in face:
            part.parent = new_rig
        set_pose(new_rig, ANIMATIONS[os.environ.get("AVATAR_ANIM", "attente")][0],
                 float(os.environ.get("AVATAR_ANIM_T", "0.3")))
        for obj in objs:
            if obj.data.shape_keys and "fort" in obj.data.shape_keys.key_blocks:
                obj.data.shape_keys.key_blocks["fort"].value = build
            if obj.data.shape_keys and "chapeau" in obj.data.shape_keys.key_blocks:
                obj.data.shape_keys.key_blocks["chapeau"].value = 1.0 if "tete-bonnet" in wear else 0.0
        new_rig.rotation_euler.z = yaw
    for obj in [rig] + pieces + hairs:
        obj.hide_render = True
    preview_lighting()
    scene.render.resolution_x, scene.render.resolution_y = ((1400, 1200) if close_mode or single_view else
                                                            ((4800 if hair_preview else 6000), 1300))
    data = bpy.data.cameras.new("Camera")
    data.type = "ORTHO"
    data.ortho_scale = (0.64 if close_mode == "shoulder" else 0.58) if close_mode else (1.35 if single_view else 13.8)
    data.ortho_scale = float(os.environ.get("AVATAR_ORTHO", data.ortho_scale))
    camera = bpy.data.objects.new("Camera", data)
    scene.collection.objects.link(camera)
    focus_z = float(os.environ.get("AVATAR_FOCUS_Z", 0.52 if close_mode == "shoulder" else 0.42))
    camera_height_offset = float(os.environ.get("AVATAR_CAMERA_HEIGHT_OFFSET", "0"))
    camera.location = (0, -10, focus_z + 1.9 + camera_height_offset) if close_mode else (0, -10, 2.4)
    target = bpy.data.objects.new("Visee", None)
    target.location = (0, 0, focus_z if close_mode else 0.5)
    scene.collection.objects.link(target)
    camera.constraints.new("TRACK_TO").target = target
    scene.camera = camera
    scene.render.filepath = os.environ["AVATAR_PREVIEW"]
    bpy.ops.render.render(write_still=True)
    if not os.environ.get("AVATAR_EXPORT_OUT"):
        raise SystemExit(0)
    OUT = os.environ["AVATAR_EXPORT_OUT"]

# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------
bake_actions(rig)
clearance_errors = validate_arm_torso_clearance(rig, body)
head_clearance_errors = validate_hand_head_clearance(rig, body, head)
if clearance_errors or head_clearance_errors:
    raise RuntimeError(
        "Dégagement insuffisant: "
        + "; ".join(clearance_errors + head_clearance_errors)
    )
visible_errors = validate_visible_defects(
    rig,
    head,
    next(obj for obj in hairs if obj.name == "cheveux-court"),
)
validate_motion(rig, [body, head, hairs[0], PIECE_OBJECTS["haut-tshirt"],
                      PIECE_OBJECTS["bas-short"], PIECE_OBJECTS["chaussures-baskets"]])
for error in visible_errors:
    print("VISIBLE_DEFECT_WARNING", error)
print("VISIBLE_DEFECT_WARNING_TOTAL", len(visible_errors))
validate_avatar_object_names([rig] + pieces + hairs)
validate_export_rig(rig)
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
    export_morph=True,
    export_morph_normal=False,
)
print("GLB", OUT, os.path.getsize(OUT), "octets")
