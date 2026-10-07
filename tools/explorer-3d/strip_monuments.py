"""
Monuments des villes de la région « Nombres et calculs » (carte X2b) : une figurine de maquette par
ville, posée à même l'herbe (sans socle), d'environ 1,2 m de haut et de moins de 1 m de rayon une fois
agrandie (le cercle des niveaux l'entoure). Même style que l'île : objets peints aux couleurs douces,
bois, pierre, laiton, arêtes arrondies qui accrochent la lumière, lumière cuite.

- Ville des Relatifs : une bascule sur une droite graduée de −4 à +4, un poids − et un poids +.
- Ville des Fractions : une tarte en huit parts sur un présentoir, une part servie à côté.
- Ville des Produits de fractions : un moulin de pierre dont les ailes montrent 1/4, 2/4, 3/4 et 4/4.
- Ville des Puissances : une tour de cubes de 2¹ à 2⁴, couronnée.
- Ville du Calcul littéral : un atelier à colombages, son enseigne « x » et des cubes de lettres.
- Ville des Équations : une balance de laiton en équilibre, x d'un côté, 7 de l'autre, « = » au cadran.

Usage : blender -b -P tools/explorer-3d/strip_monuments.py
        EXPLORER_PREVIEW=/chemin/apercu.png blender -b -P tools/explorer-3d/strip_monuments.py   (sans cuisson)
Sortie : assets/explorer/models/strip-nombres.glb (une pièce par monument, nommée comme dans le contenu)
"""
import math
import os
import random
import sys
import time

import bmesh
import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402
from lib.geo import app  # noqa: E402

geo.reset()

ink = M.flat("ink")
paint = M.paint
wood = M.wood()
dark_wood = M.bark()
plank = M.plank()
brass = paint("brass", "brass-light")
iron = paint("iron", "iron-light")
white = paint("white")

PLUS = [(-0.14, 0.42), (0.14, 0.42), (0.14, 0.14), (0.42, 0.14), (0.42, -0.14), (0.14, -0.14), (0.14, -0.42),
        (-0.14, -0.42), (-0.14, -0.14), (-0.42, -0.14), (-0.42, 0.14), (-0.14, 0.14)]
FRONT = -1  # face avant d'un objet, vers la caméra : -y en Blender


# ---------------------------------------------------------------------------
# Outils
# ---------------------------------------------------------------------------
def standing(parts, name):
    """Fusionne les pièces d'un monument, origine au pied (0, 0, 0), transformations appliquées."""
    obj = geo.join(parts, name)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def group(parts, name, location=(0, 0, 0), yaw=0.0):
    """Pièces construites autour de l'origine, fusionnées puis posées et tournées d'un bloc."""
    obj = geo.join(parts, name)
    obj.location = location
    obj.rotation_euler.z = yaw
    return obj


def turn(objects, angle, pivot, axis="Y"):
    """Fait pivoter des objets autour d'un axe de Blender passant par `pivot`."""
    index = "XYZ".index(axis)
    rotation = Euler(tuple(angle if k == index else 0 for k in range(3))).to_matrix()
    pivot = Vector(pivot)
    for obj in objects:
        obj.location = pivot + rotation @ (Vector(obj.location) - pivot)
        r = list(obj.rotation_euler)
        r[index] += angle
        obj.rotation_euler = r


def lathe(profile, material, segments=40, name="Tour", caps=True):
    """Pièce de révolution autour de l'axe vertical : profil [(rayon, hauteur)], de bas en haut.
    `caps` ferme le bas et le haut quand le profil ne revient pas sur l'axe (sauf pour un anneau)."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        rings.append([bm.verts.new((math.cos(i / segments * math.tau) * r, math.sin(i / segments * math.tau) * r,
                                    z)) for i in range(segments)])
    for k in range(len(rings) - 1):
        for i in range(segments):
            j = (i + 1) % segments
            bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
    for ring, (r, z) in ((rings[0], profile[0]), (rings[-1], profile[-1])) if caps else ():
        if r > 1e-4:
            centre = bm.verts.new((0, 0, z))
            for i in range(segments):
                bm.faces.new((ring[i], ring[(i + 1) % segments], centre))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return geo.smooth(M.assign(geo.link(name, bm), material))


def rounded(location, size, material, radius=0.03, rotation=(0, 0, 0)):
    """Pavé aux arêtes bien arrondies (quatre segments) : la lumière cuite y dessine un liseré clair."""
    obj = geo.box(location, size, material, rotation=rotation, bevel_width=0)
    geo.bevel(obj, radius, 4)
    return geo.smooth(obj)


def front_text(body, x, y_face, z, size, material, depth=0.025):
    """Texte en relief sur une face avant (plan y = y_face, face tournée vers -y)."""
    return geo.text(body, (x, y_face - depth * 0.3, z), size, depth, material, bevel_depth=0.004, align_y="CENTER")


def top_text(body, x, y, z_face, size, material, depth=0.025, yaw=0.0):
    """Texte en relief couché sur une face du dessus (lisible depuis la caméra, devant)."""
    obj = geo.text(body, (x, y, z_face + depth * 0.3), size, depth, material, rotation=(0, 0, yaw), bevel_depth=0.004,
                   align_y="CENTER")
    return obj


def flat_shape(outline, depth, material, location, rotation=(0, 0, 0), bevel=0.01, name="Forme"):
    return geo.extruded(outline, depth, material, location, rotation=rotation, bevel_width=bevel, name=name)


def sector(a0, a1, radius, depth, material, location, steps=10):
    outline = [(0.0, 0.0)] + [(math.cos(a0 + (a1 - a0) * k / steps) * radius,
                               math.sin(a0 + (a1 - a0) * k / steps) * radius) for k in range(steps + 1)]
    return flat_shape(outline, depth, material, location, bevel=0.012, name="Part")


def flag(x, y, z_top, color, side=1):
    """Fanion : mât de bois, boule de laiton, toile triangulaire un peu épaisse."""
    parts = [geo.cylinder((x, y, z_top / 2), 0.012, z_top, wood, 10),
             geo.sphere((x, y, z_top + 0.015), 0.022, brass, 12)]
    parts.append(flat_shape([(0, 0), (0.2 * side, -0.05), (0, -0.11)], 0.012, paint(color), (x, y, z_top - 0.01),
                            rotation=(math.pi / 2, 0, 0), bevel=0.003, name="Toile"))
    return parts


# ---------------------------------------------------------------------------
# Ville des Relatifs : une bascule sur une droite graduée de −4 à +4
# ---------------------------------------------------------------------------
def balance_signes():
    parts = []
    # Droite graduée en bois clair posée dans l'herbe, le zéro sous le pivot.
    ry = app(0, 0.27, 0)[1]
    parts.append(rounded((0, ry, 0.014), (1.62, 0.26, 0.028), plank, 0.008))
    for k in range(-4, 5):
        x = k * 0.18
        parts.append(geo.box((x, ry + 0.09, 0.03), (0.014, 0.06, 0.006), ink, bevel_width=0))
        label = "0" if k == 0 else (f"+{k}" if k > 0 else f"-{-k}")
        color = paint("cherry") if k < 0 else paint("blue") if k > 0 else ink
        parts.append(top_text(label, x, ry - 0.03, 0.028, 0.085, color, depth=0.01))
    # Chevalet : deux A de bois, un axe de fer boulonné.
    for y in (-0.11, 0.11):
        for side in (-1, 1):
            parts.append(geo.tube([(side * 0.17, y, 0.0), (0, y, 0.4)], 0.022, dark_wood, "Pied"))
        parts.append(rounded((0, y, 0.17), (0.2, 0.03, 0.03), dark_wood, 0.008))
    parts.append(geo.cylinder((0, 0, 0.4), 0.03, 0.3, iron, 16, rotation=(math.pi / 2, 0, 0)))
    for y in (-0.155, 0.155):
        parts.append(geo.cylinder((0, y, 0.4), 0.04, 0.02, brass, 6, rotation=(math.pi / 2, 0, 0)))
    # Planche de trois lattes, poignées, poids − et +, le tout incliné du côté du poids le plus lourd.
    pivot = (0, 0, 0.43)
    moving = [rounded((0, 0, 0.415), (0.12, 0.2, 0.05), dark_wood, 0.01)]
    for y in (-0.075, 0.0, 0.075):
        moving.append(rounded((0, y, 0.45), (1.56, 0.066, 0.03), wood, 0.008))
    for side in (-1, 1):
        x = side * 0.46
        moving.append(geo.tube([(x, -0.07, 0.465), (x, -0.07, 0.56), (x, 0.07, 0.56), (x, 0.07, 0.465)], 0.012,
                               iron, "Poignee"))
    heavy, light = paint("cherry", "cherry-light"), paint("blue", "blue-light")
    moving.append(rounded((-0.64, 0, 0.465 + 0.14), (0.28, 0.24, 0.28), heavy, 0.045))
    moving.append(rounded((-0.64, -0.122, 0.605), (0.15, 0.02, 0.045), white, 0.008))
    moving.append(rounded((-0.64, 0, 0.745), (0.15, 0.045, 0.02), white, 0.008))
    moving.append(rounded((0.64, 0, 0.465 + 0.1), (0.2, 0.18, 0.2), light, 0.035))
    moving.append(flat_shape([(x * 0.17, y * 0.17) for x, y in PLUS], 0.02, white, (0.64, -0.095, 0.565),
                             rotation=(math.pi / 2, 0, 0), bevel=0.004, name="Plus"))
    moving.append(flat_shape([(x * 0.17, y * 0.17) for x, y in PLUS], 0.02, white, (0.64, 0, 0.67), bevel=0.004,
                             name="Plus dessus"))
    turn(moving, -0.18, pivot)
    parts += moving
    parts += flag(-0.78, 0.2, 0.55, "cherry", side=1)
    parts += flag(0.78, 0.2, 0.55, "blue", side=-1)
    return standing(parts, "balance-signes")


# ---------------------------------------------------------------------------
# Ville des Fractions : une tarte en huit parts sur un présentoir
# ---------------------------------------------------------------------------
def tartes_fractions():
    parts = []
    ceramic = paint("cream")
    parts.append(lathe([(0.2, 0.0), (0.21, 0.02), (0.12, 0.05), (0.05, 0.08), (0.045, 0.2), (0.08, 0.23),
                        (0.5, 0.25), (0.53, 0.27), (0.5, 0.28), (0.0, 0.28)], ceramic, 48, "Presentoir"))
    parts.append(lathe([(0.535, 0.262), (0.545, 0.272), (0.535, 0.282), (0.525, 0.272), (0.535, 0.262)],
                       paint("ceramic-blue"), 48, "Liseré", caps=False))
    crust, crust_dark = paint("crust", "crust-light"), paint("crust-dark", "crust")
    filling = paint("cherry", "cherry-light")
    cream, cherry, stem = paint("cream"), paint("cherry-light", "white"), M.flat("wood-dark")
    slices, gap = 8, 0.022
    rng = random.Random(3)

    def one_slice(a0, a1, cx, cy, z0, with_top=True):
        out = [sector(a0, a1, 0.46, 0.05, crust_dark, (cx, cy, z0 + 0.025)),
               sector(a0 + 0.02, a1 - 0.02, 0.43, 0.04, filling, (cx, cy, z0 + 0.07))]
        # Bord festonné : la pâte pincée tout autour.
        for k in range(5):
            a = a0 + (a1 - a0) * (k + 0.5) / 5
            bump = geo.sphere((cx + math.cos(a) * 0.44, cy + math.sin(a) * 0.44, z0 + 0.09), 0.035, crust, 12)
            bump.scale = (1.0, 1.0, 0.7)
            out.append(bump)
        if with_top:
            a = (a0 + a1) / 2
            tx, ty = cx + math.cos(a) * 0.27, cy + math.sin(a) * 0.27
            out.append(geo.sphere((tx, ty, z0 + 0.115), 0.05, cream, 16))
            out.append(geo.cylinder((tx, ty, z0 + 0.16), 0.04, 0.06, cream, 16, radius2=0.004))
            out.append(geo.sphere((tx + 0.01, ty, z0 + 0.2), 0.026, cherry, 14))
            out.append(geo.tube([(tx + 0.01, ty, z0 + 0.22), (tx + 0.03 * rng.uniform(0.5, 1), ty, z0 + 0.27)], 0.004,
                                stem, "Queue"))
        return out

    for k in range(slices):
        if k == 6:
            continue
        a0, a1 = k / slices * math.tau + gap, (k + 1) / slices * math.tau - gap
        parts += one_slice(a0, a1, 0, 0, 0.28)
    # La part servie, sur une petite assiette, avec sa cuillère, devant à droite.
    px, py = 0.55, app(0, 0.42, 0)[1]
    parts.append(lathe([(0.0, 0.0), (0.17, 0.0), (0.2, 0.025), (0.18, 0.03), (0.0, 0.012)], ceramic, 40, "Assiette"))
    parts[-1].location = (px, py, 0)
    a0 = math.radians(200)
    a1 = a0 + math.tau / slices - 2 * gap
    middle = (a0 + a1) / 2
    # La pointe de la part est décalée pour que la part soit centrée sur l'assiette.
    parts += one_slice(a0, a1, px - math.cos(middle) * 0.22, py - math.sin(middle) * 0.22, 0.03)
    parts.append(rounded((px + 0.05, py - 0.17, 0.018), (0.2, 0.025, 0.008), paint("metal"), 0.004,
                         rotation=(0, 0, 0.4)))
    return standing(parts, "tartes-fractions")


# ---------------------------------------------------------------------------
# Ville des Produits de fractions : un moulin de pierre aux ailes 1/4, 2/4, 3/4 et 4/4
# ---------------------------------------------------------------------------
def moulin_fractions():
    parts = []
    walls = M.masonry("moulin", "stone-warm", "stone-warm-light", "stone-warm-dark", cylindrical=True, scale=9.0,
                      row=0.3, width=0.7)
    tiles = M.masonry("tuiles", "terracotta", "terracotta-light", "terracotta-dark", cylindrical=True, scale=16.0,
                      row=0.45, width=0.5)
    parts.append(lathe([(0.34, 0.0), (0.335, 0.05), (0.27, 0.92), (0.0, 0.92)], walls, 48, "Tour"))
    parts.append(lathe([(0.29, 0.9), (0.31, 0.92), (0.31, 0.96), (0.28, 0.97), (0.0, 0.97)], dark_wood, 48, "Ceinture"))
    parts.append(lathe([(0.32, 0.96), (0.3, 1.04), (0.2, 1.18), (0.08, 1.27), (0.0, 1.3)], tiles, 48, "Toit"))
    parts.append(geo.sphere((0, 0, 1.32), 0.035, brass, 14))
    # Porte cintrée de planches, fenêtres à croisillons et volets.
    door_y = -0.33
    parts.append(rounded((0, door_y, 0.13), (0.15, 0.03, 0.26), plank, 0.01))
    parts.append(geo.cylinder((0, door_y, 0.26), 0.075, 0.03, plank, 20, rotation=(math.pi / 2, 0, 0)))
    parts.append(geo.sphere((0.045, door_y - 0.02, 0.13), 0.012, brass, 8))
    for x, z, yaw in ((-0.12, 0.58, -0.45), (0.15, 0.36, 0.5)):
        r = 0.335 - (0.335 - 0.27) * z / 0.92
        wx, wy = math.sin(yaw) * r, -math.cos(yaw) * r
        window = [rounded((0, 0, 0), (0.1, 0.03, 0.13), dark_wood, 0.008),
                  geo.box((0, -0.012, 0), (0.08, 0.012, 0.11), paint("glass", "white"), bevel_width=0.003),
                  geo.box((0, -0.02, 0), (0.012, 0.01, 0.11), dark_wood, bevel_width=0.002),
                  geo.box((0, -0.02, 0), (0.08, 0.01, 0.012), dark_wood, bevel_width=0.002)]
        parts.append(group(window, "Fenetre", location=(wx, wy, z), yaw=yaw))
    # Ailes : un bras de bois, un treillis de lattes, et des toiles qui montrent k quarts sur quatre.
    hub = (0, -0.37, 1.0)
    parts.append(geo.cylinder((0, -0.33, 1.0), 0.07, 0.12, dark_wood, 24, rotation=(math.pi / 2, 0, 0)))
    parts.append(geo.cylinder((0, -0.41, 1.0), 0.06, 0.06, brass, 24, rotation=(math.pi / 2, 0, 0), radius2=0.02))
    filled, empty = paint("blue", "blue-light"), paint("cream")
    for k in range(4):
        sail = [rounded((0.36, -0.44, 1.0), (0.66, 0.03, 0.035), wood, 0.008)]
        for x in (0.14, 0.26, 0.38, 0.5, 0.62):
            sail.append(geo.box((x, -0.455, 1.0 + 0.1), (0.014, 0.014, 0.17), wood, bevel_width=0.003))
        sail.append(geo.box((0.38, -0.455, 1.0 + 0.185), (0.5, 0.014, 0.014), wood, bevel_width=0.003))
        for j in range(4):
            cloth = filled if j <= k else empty
            sail.append(geo.box((0.2 + j * 0.12, -0.45, 1.0 + 0.1), (0.105, 0.008, 0.15), cloth, bevel_width=0.002))
        turn(sail, math.radians(30 + 90 * k), hub)
        parts += sail
    # Sacs de farine au pied du moulin.
    sack = paint("sack-dark", "sack")
    for x, y, s in ((0.38, -0.18, 1.0), (0.43, -0.02, 0.85)):
        body = geo.sphere((x, y, 0.07 * s), 0.1 * s, sack, 20)
        body.scale = (1.0, 0.8, 0.72)
        parts.append(body)
        parts.append(geo.cylinder((x, y, 0.17 * s), 0.03 * s, 0.05 * s, sack, 12))
        parts.append(geo.cylinder((x, y, 0.155 * s), 0.036 * s, 0.012 * s, paint("cherry"), 12))
    return standing(parts, "moulin-fractions")


# ---------------------------------------------------------------------------
# Ville des Puissances : une tour de cubes, de 2⁴ en bas à 2¹ en haut, couronnée
# ---------------------------------------------------------------------------
def tour_puissances():
    parts = []
    cubes = ((0.58, "violet", "violet-light", "4", 0.0), (0.43, "blue", "blue-light", "3", 0.14),
             (0.31, "cyan", "cyan-light", "2", -0.1), (0.22, "pink", "pink-light", "1", 0.16))
    z = 0.0
    for size, color, light, exponent, yaw in cubes:
        half = size / 2
        block = [rounded((0, 0, 0), (size, size, size), paint(color, light), size * 0.09)]
        # Un panneau plus clair sur chaque face visible : avant, côtés, et le dessus.
        panel = paint(light, "white")
        block.append(rounded((0, -half - 0.004, 0), (size * 0.78, 0.012, size * 0.78), panel, 0.006))
        for side in (-1, 1):
            block.append(rounded((side * (half + 0.004), 0, 0), (0.012, size * 0.78, size * 0.78), panel, 0.006))
        block.append(front_text("2", -size * 0.1, -half - 0.01, -size * 0.04, size * 0.5, white, depth=size * 0.06))
        block.append(front_text(exponent, size * 0.17, -half - 0.01, size * 0.17, size * 0.25, white,
                                depth=size * 0.06))
        parts.append(group(block, f"Cube {exponent}", location=(0, 0, z + half), yaw=yaw))
        z += size
    # Couronne de laiton au sommet.
    crown = [lathe([(0.07, 0.0), (0.075, 0.02), (0.075, 0.045), (0.065, 0.05), (0.0, 0.05)], brass, 32, "Couronne")]
    for k in range(5):
        a = k / 5 * math.tau
        crown.append(geo.cylinder((math.cos(a) * 0.062, math.sin(a) * 0.062, 0.075), 0.02, 0.06, brass, 4,
                                  radius2=0.002))
        crown.append(geo.sphere((math.cos(a) * 0.062, math.sin(a) * 0.062, 0.11), 0.012, paint("cherry-light"), 10))
    parts.append(group(crown, "Couronne", location=(0, 0, z), yaw=0.16))
    return standing(parts, "tour-puissances")


# ---------------------------------------------------------------------------
# Ville du Calcul littéral : un atelier à colombages, son enseigne « x » et des cubes de lettres
# ---------------------------------------------------------------------------
def atelier_lettres():
    parts = []
    W, D, H = 0.8, 0.52, 0.44  # largeur, profondeur, hauteur des murs
    ox, oy = -0.12, 0.06  # la maison est un peu en arrière à gauche, les cubes devant à droite
    plaster = paint("plaster", "plaster-light")
    beam = dark_wood
    found = M.masonry("soubassement", "stone-warm", "stone-warm-light", "stone-warm-dark", scale=14.0, row=0.4)
    parts.append(geo.box((ox, oy, 0.03), (W + 0.04, D + 0.04, 0.06), found, bevel_width=0.01))
    parts.append(rounded((ox, oy, 0.06 + H / 2), (W, D, H), plaster, 0.01))
    # Colombages : poteaux d'angle, sablières, croix de Saint-André entre les fenêtres.
    fy = oy - D / 2 - 0.006
    for x in (-W / 2, -0.12, 0.12, W / 2):
        parts.append(geo.box((ox + x, fy, 0.06 + H / 2), (0.035, 0.016, H), beam, bevel_width=0.005))
    for z in (0.08, 0.06 + H - 0.02):
        parts.append(geo.box((ox, fy, z), (W, 0.016, 0.035), beam, bevel_width=0.005))
    for side in (-1, 1):
        sx = ox + side * (W / 2 + 0.006)
        for y in (-D / 2, 0.0, D / 2):
            parts.append(geo.box((sx, oy + y, 0.06 + H / 2), (0.016, 0.035, H), beam, bevel_width=0.005))
        brace = geo.box((sx, oy - D / 4, 0.06 + H / 2), (0.016, 0.03, H * 1.05), beam, bevel_width=0.004)
        brace.rotation_euler.x = 0.55
        parts.append(brace)
    # Porte, fenêtres à volets et jardinières fleuries.
    parts.append(rounded((ox, fy - 0.006, 0.06 + 0.13), (0.15, 0.02, 0.26), plank, 0.008))
    parts.append(geo.sphere((ox + 0.05, fy - 0.02, 0.06 + 0.13), 0.012, brass, 8))
    parts.append(geo.box((ox, fy - 0.05, 0.012), (0.2, 0.08, 0.024), found, bevel_width=0.006))
    flowers = [paint(c) for c in ("cherry-light", "yellow", "pink-light", "white")]
    rng = random.Random(8)
    for x in (-0.26, 0.26):
        cx, cz = ox + x, 0.06 + 0.26
        parts.append(rounded((cx, fy - 0.004, cz), (0.13, 0.02, 0.14), dark_wood, 0.006))
        parts.append(geo.box((cx, fy - 0.012, cz), (0.1, 0.01, 0.11), paint("glass", "white"), bevel_width=0.002))
        parts.append(geo.box((cx, fy - 0.02, cz), (0.012, 0.008, 0.11), dark_wood, bevel_width=0.002))
        parts.append(geo.box((cx, fy - 0.02, cz), (0.1, 0.008, 0.012), dark_wood, bevel_width=0.002))
        for side in (-1, 1):
            parts.append(rounded((cx + side * 0.09, fy - 0.012, cz), (0.05, 0.014, 0.14), paint("shutter"), 0.004))
        parts.append(rounded((cx, fy - 0.035, cz - 0.09), (0.14, 0.05, 0.04), plank, 0.006))
        for k in range(6):
            parts.append(geo.sphere((cx - 0.055 + k * 0.022, fy - 0.035 + rng.uniform(-0.012, 0.012), cz - 0.06),
                                    0.016, flowers[k % 4], 10))
    # Toit de tuiles : deux pans, des rangées de tuiles qui se chevauchent, une faîtière.
    z0, ridge, over = 0.06 + H, 0.3, 0.07
    half_d = D / 2 + over
    slope = math.atan2(ridge, half_d)
    length = math.hypot(ridge, half_d)
    tones = [paint("terracotta", "terracotta-light"), paint("terracotta", "terracotta-light"),
             paint("terracotta-light", "terracotta")]
    rows, columns = 6, 9
    for side in (-1, 1):
        for row in range(rows):
            t = (row + 0.5) / rows
            y = oy + side * half_d * (1 - t)
            z = z0 + ridge * t + 0.012
            for c in range(columns + (row % 2)):
                x = ox - (W / 2 + over) + (c + (0.0 if row % 2 else 0.5)) * (W + 2 * over) / columns
                tile = rounded((x, y, z), ((W + 2 * over) / columns * 0.97, length / rows * 1.3, 0.02),
                               rng.choice(tones), 0.008)
                tile.rotation_euler.x = -side * slope
                parts.append(tile)
    parts.append(geo.cylinder((ox, oy, z0 + ridge + 0.02), 0.03, W + 2 * over, paint("terracotta-dark"), 12,
                              rotation=(0, math.pi / 2, 0)))
    for side in (-1, 1):
        gable = bmesh.new()
        x = ox + side * W / 2
        v = [gable.verts.new((x, oy + yy, zz)) for yy, zz in ((-D / 2, z0), (D / 2, z0), (0, z0 + ridge - 0.02))]
        gable.faces.new(v)
        obj = M.assign(geo.link("Pignon", gable), plaster)
        obj.modifiers.new("Epaisseur", "SOLIDIFY").thickness = 0.02
        parts.append(obj)
    bricks = M.masonry("cheminee", "brick", "brick-light", "stone-warm-dark", scale=22.0, row=0.45)
    parts.append(geo.box((ox + 0.22, oy + 0.08, z0 + 0.3), (0.1, 0.1, 0.32), bricks, bevel_width=0.006))
    parts.append(geo.box((ox + 0.22, oy + 0.08, z0 + 0.47), (0.13, 0.13, 0.025), M.rock("rock-light"),
                         bevel_width=0.006))
    # Enseigne « x » sur une potence.
    sx, sy = ox + W / 2 + 0.03, fy + 0.04
    parts.append(geo.box((sx + 0.07, sy, 0.06 + H - 0.04), (0.16, 0.02, 0.02), beam, bevel_width=0.004))
    parts.append(geo.tube([(sx + 0.13, sy, 0.06 + H - 0.05), (sx + 0.13, sy, 0.06 + H - 0.1)], 0.004, iron, "Chaine"))
    parts.append(rounded((sx + 0.13, sy, 0.06 + H - 0.17), (0.14, 0.02, 0.12), plank, 0.01))
    parts.append(front_text("x", sx + 0.13, sy - 0.012, 0.06 + H - 0.175, 0.11, paint("yellow"), depth=0.012))
    # Cubes de lettres en bois, lettres en relief de couleur sur l'avant et le dessus.
    for x, y, z, letter, color, yaw in ((0.5, -0.38, 0.0, "a", "cherry", 0.3), (0.72, -0.2, 0.0, "y", "blue", -0.25),
                                        (0.58, -0.32, 0.2, "b", "shutter", 0.15)):
        s = 0.2
        block = [rounded((0, 0, 0), (s, s, s), wood, 0.025)]
        block.append(front_text(letter, 0, -s / 2 - 0.004, -0.01, 0.15, paint(color), depth=0.02))
        block.append(top_text(letter, 0, 0.0, s / 2, 0.14, paint(color), depth=0.02))
        for side in (-1, 1):
            block.append(rounded((side * (s / 2 + 0.003), 0, 0), (0.008, s * 0.75, s * 0.75), paint(color), 0.003))
        parts.append(group(block, f"Cube {letter}", location=(x, app(0, -y, 0)[1], z + s / 2), yaw=yaw))
    return standing(parts, "atelier-lettres")


# ---------------------------------------------------------------------------
# Ville des Équations : une balance de laiton en équilibre, x d'un côté, 7 de l'autre
# ---------------------------------------------------------------------------
def balance_equations():
    parts = []
    parts.append(lathe([(0.3, 0.0), (0.3, 0.04), (0.27, 0.06), (0.22, 0.06), (0.22, 0.09), (0.16, 0.11),
                        (0.0, 0.11)], dark_wood, 48, "Pied"))
    parts.append(lathe([(0.1, 0.11), (0.1, 0.14), (0.06, 0.17), (0.045, 0.3), (0.06, 0.32), (0.045, 0.34),
                        (0.04, 0.8), (0.06, 0.82), (0.05, 0.86), (0.0, 0.88)], brass, 32, "Colonne"))
    beam_z, reach = 0.92, 0.6
    parts.append(geo.sphere((0, 0, beam_z), 0.06, brass, 20))
    for side in (-1, 1):
        arm = geo.cylinder((side * reach / 2, 0, beam_z), 0.028, reach, brass, 16, rotation=(0, math.pi / 2, 0),
                           radius2=0.016)
        if side < 0:
            arm.rotation_euler.y = -math.pi / 2
        parts.append(arm)
        parts.append(geo.sphere((side * reach, 0, beam_z), 0.026, brass, 14))
    # Cadran au milieu : une aiguille droite sur un « = ».
    parts.append(lathe([(0.0, 0.0), (0.11, 0.0), (0.11, 0.012), (0.0, 0.012)], paint("cream"), 40, "Cadran"))
    parts[-1].rotation_euler.x = math.pi / 2
    parts[-1].location = (0, -0.06, 0.72)
    for dz in (-0.016, 0.016):
        parts.append(rounded((0, -0.075, 0.69 + dz), (0.07, 0.012, 0.016), paint("cherry"), 0.004))
    parts.append(geo.box((0, -0.08, 0.79), (0.012, 0.01, 0.12), ink, bevel_width=0.002))
    pan_z = 0.46
    for side in (-1, 1):
        x = side * reach
        for k in range(3):
            a = k / 3 * math.tau + 0.4
            parts.append(geo.tube([(x, 0, beam_z - 0.02), (x + math.cos(a) * 0.19, math.sin(a) * 0.19, pan_z + 0.04)],
                                  0.006, brass, "Chaine"))
        pan = lathe([(0.0, 0.0), (0.12, 0.002), (0.2, 0.025), (0.235, 0.05), (0.225, 0.052), (0.19, 0.03),
                     (0.0, 0.012)], brass, 48, "Plateau")
        pan.location = (x, 0, pan_z)
        parts.append(pan)
    # Plateau gauche : le bloc x ; plateau droit : le poids de fonte 7.
    s = 0.2
    block = [rounded((0, 0, 0), (s, s, s), paint("cherry", "cherry-light"), 0.03),
             front_text("x", 0, -s / 2 - 0.004, -0.01, 0.17, white, depth=0.022),
             top_text("x", 0, 0, s / 2, 0.16, white, depth=0.022)]
    parts.append(group(block, "Bloc x", location=(-reach, 0, pan_z + 0.012 + s / 2), yaw=0.12))
    weight = [lathe([(0.0, 0.0), (0.12, 0.0), (0.13, 0.015), (0.13, 0.12), (0.11, 0.14), (0.03, 0.15),
                     (0.03, 0.18), (0.05, 0.19), (0.05, 0.22), (0.0, 0.225)], iron, 40, "Poids"),
              front_text("7", 0, -0.13, 0.07, 0.11, white, depth=0.02),
              top_text("7", 0, 0.06, 0.145, 0.08, white, depth=0.014)]
    parts.append(group(weight, "Poids 7", location=(reach, 0, pan_z + 0.012), yaw=-0.1))
    return standing(parts, "balance-equations")


def scaled(build, factor):
    """Monument agrandi autour de son pied (l'origine)."""
    def make():
        obj = build()
        obj.scale = (factor, factor, factor)
        return obj
    return make


# Chaque monument et son échelle : ils doivent se valoir en présence, sans dépasser 1 m de rayon.
MONUMENTS = {
    "balance-signes": scaled(balance_signes, 1.15),
    "tartes-fractions": scaled(tartes_fractions, 1.15),
    "moulin-fractions": scaled(moulin_fractions, 1.15),
    "tour-puissances": scaled(tour_puissances, 1.05),
    "atelier-lettres": scaled(atelier_lettres, 1.15),
    "balance-equations": scaled(balance_equations, 1.2),
}

SPACING = 2.4


def preview_camera(width, aspect, center, elevation_degrees=62):
    """Caméra de la carte d'une région : vue plongeante, champ étroit (shots.ts)."""
    scene = bpy.context.scene
    fov = math.radians(12)
    half_x = math.atan(math.tan(fov / 2) * aspect)
    distance = width / 2 / math.tan(half_x)
    elevation = math.radians(elevation_degrees)
    data = bpy.data.cameras.new("Camera")
    data.sensor_fit = "VERTICAL"
    data.angle_y = fov
    data.clip_end = distance * 4
    camera = bpy.data.objects.new("Camera", data)
    scene.collection.objects.link(camera)
    cx, cy, cz = center
    camera.location = (cx, cy - math.cos(elevation) * distance, cz + math.sin(elevation) * distance)
    target = bpy.data.objects.new("Visee", None)
    target.location = center
    scene.collection.objects.link(target)
    camera.constraints.new("TRACK_TO").target = target
    scene.camera = camera


def grid_position(k):
    """Trois monuments par rangée, deux rangées."""
    return ((k % 3 - 1) * SPACING, -(k // 3) * SPACING * 0.95 + SPACING * 0.47, 0.0)


if os.environ.get("EXPLORER_PREVIEW"):
    only = os.environ.get("EXPLORER_ONLY")
    chosen = {k: v for k, v in MONUMENTS.items() if not only or k == only}
    ground = geo.box((0, 0, -0.05), (SPACING * 4, SPACING * 3, 0.1), M.grass(), bevel_width=0)
    for k, build in enumerate(chosen.values()):
        obj = build()
        obj.location = (0, 0, 0) if only else grid_position(k)
    bake.lights()
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = int(os.environ.get("EXPLORER_PREVIEW_SAMPLES", "16"))
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.cycles.glossy_bounces = 0
    width, height = (900, 900) if only else (1500, 1000)
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.view_settings.view_transform = "Standard"
    for mat in bpy.data.materials:
        for node in mat.node_tree.nodes if mat.node_tree else []:
            if node.bl_idname == "ShaderNodeBsdfPrincipled":
                node.inputs["Specular IOR Level"].default_value = 0.0
    preview_camera(2.6 if only else SPACING * 3.1, width / height, (0, 0, 0.45))
    scene.render.filepath = os.environ["EXPLORER_PREVIEW"]
    bpy.ops.render.render(write_still=True)
    raise SystemExit(0)

# ---------------------------------------------------------------------------
# Cuisson et export : une texture par monument
# ---------------------------------------------------------------------------
SAMPLES = int(os.environ.get("EXPLORER_BAKE_SAMPLES", "48"))
SIZE = int(os.environ.get("EXPLORER_MONUMENT_SIZE", "1536"))
catcher = geo.box(app(0, -8, -0.05), (SPACING * len(MONUMENTS) + 2, 3.0, 0.1), M.grass(), bevel_width=0)
pieces = []
for k, (name, build) in enumerate(MONUMENTS.items()):
    obj = build()
    obj.location = app((k - (len(MONUMENTS) - 1) / 2) * SPACING, -8, 0)
    pieces.append((obj, name))
bake.apply_all()
bake.lights()
started = time.time()
for obj, name in pieces:
    print("TRIANGLES", name, sum(len(p.vertices) - 2 for p in obj.data.polygons), flush=True)
    bake.unwrap(obj)
    bake.bake(obj, name, size=SIZE, samples=SAMPLES)
    print("CUIT", name, round(time.time() - started), "s", flush=True)
bpy.data.objects.remove(catcher, do_unlink=True)
for obj, name in pieces:
    obj.location = (0, 0, 0)
path = bake.export("strip-nombres.glb", jpeg_quality=86)
print("GLB", path, os.path.getsize(path), "octets")
