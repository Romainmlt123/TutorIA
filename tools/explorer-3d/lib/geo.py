"""
Formes d'Explorer (Blender) : île (plateau, bordure d'herbe, falaise striée, motte de terre),
et objets arrondis (biseaux, tubes, lettres, feuillages fondus). Tout est déterministe.
Repère : celui de l'app (three.js) est x à droite, z vers la caméra, y en haut ; en Blender,
un point (x, z) du plateau de l'app est (x, -z), et la hauteur est z.
"""
import math
import os
import random

import bmesh
import bpy

from . import materials as M

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
FONT = os.path.join(ROOT, "assets", "typographie", "Satoshi_Complete", "Fonts", "OTF", "Satoshi-Black.otf")

R = 3.2
# Profondeur de la motte de terre sous le plateau (de son haut, caché sous l'herbe, à sa pointe).
TOP = -0.05
DEPTH = 4.4


def edge(a):
    """Contour du plateau, identique à celui de l'app (src/features/explorer/stylized3d)."""
    return R * (1 + 0.06 * math.sin(5 * a + 0.7) + 0.04 * math.sin(8 * a + 2.1) + 0.03 * math.sin(2 * a + 4.4))


def app(x, z, y=0.0):
    """Point de l'app (x, y, z) en coordonnées Blender."""
    return (x, -z, y)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(name, bm):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def active():
    return bpy.context.active_object


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def bevel(obj, width=0.04, segments=3):
    mod = obj.modifiers.new("Biseau", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    return obj


def subdivide(obj, levels=1):
    mod = obj.modifiers.new("Lissage", "SUBSURF")
    mod.levels = levels
    mod.render_levels = levels
    return obj


# ---------------------------------------------------------------------------
# Île
# ---------------------------------------------------------------------------

SIDES = 160


def _angle(i):
    # Sens horaire en Blender = sens trigonométrique dans l'app (z inversé).
    return -(i / SIDES) * math.tau


def plateau(shore=None):
    """Plateau d'herbe presque plat (léger moutonnement), au contour de l'app."""
    rng = random.Random(3)
    rings = 14
    bm = bmesh.new()
    center = bm.verts.new((0, 0, 0.02))
    grid = []
    for k in range(1, rings + 1):
        ring = []
        for i in range(SIDES):
            a = _angle(i)
            r = edge(-a) * k / rings
            x, y = math.cos(a) * r, math.sin(a) * r
            bump = 0.012 * math.sin(x * 2.3 + 1) * math.sin(y * 1.9) + rng.uniform(-0.003, 0.003)
            ring.append(bm.verts.new((x, y, bump if k < rings else 0.0)))
        grid.append(ring)
    # Les angles tournent en sens horaire vu du dessus : faces listées à l'envers pour regarder en haut.
    for i in range(SIDES):
        bm.faces.new((center, grid[0][(i + 1) % SIDES], grid[0][i]))
    for k in range(rings - 1):
        for i in range(SIDES):
            j = (i + 1) % SIDES
            bm.faces.new((grid[k][i], grid[k][j], grid[k + 1][j], grid[k + 1][i]))
    obj = link("Plateau", bm)
    return smooth(M.assign(obj, M.grass(shore)))


def band(name, rings, material, grooves=0.0, seed=1, sides=SIDES, scallops=(0, 0.0)):
    """
    Bande verticale entre anneaux (rayon relatif, hauteur, bosses) : bordure, falaise ou motte.
    `grooves` creuse des stries verticales dans la géométrie (falaise de terre) ; `scallops`
    (nombre, profondeur) découpe le bas de la bande en festons arrondis (herbe qui déborde).
    """
    rng = random.Random(seed)
    phases = [rng.uniform(0, math.tau) for _ in range(4)]
    count, depth = scallops
    # Festons irréguliers : chaque touffe d'herbe pend plus ou moins bas.
    lobes = [rng.uniform(0.55, 1.3) for _ in range(max(count, 1))]
    bm = bmesh.new()
    verts = []
    for k, (scale, z, lumps) in enumerate(rings):
        row = []
        for i in range(sides):
            a = -(i / sides) * math.tau
            s = scale * (1 + lumps * (math.sin(a * 5 + phases[0] + z) * 0.6 + math.sin(a * 11 + phases[1]) * 0.4))
            s += grooves * (math.sin(a * 70 + phases[2]) * 0.5 + math.sin(a * 131 + phases[3]) * 0.5)
            r = edge(-a) * s
            h = z
            if count and k == len(rings) - 1:
                lobe = lobes[int(((-a) % math.tau) / math.tau * count) % count]
                h -= depth * lobe * abs(math.sin(a * count / 2)) ** 0.6
            row.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, h)))
        verts.append(row)
    for k in range(len(rings) - 1):
        for i in range(sides):
            j = (i + 1) % sides
            bm.faces.new((verts[k][i], verts[k][j], verts[k + 1][j], verts[k + 1][i]))
    bottom = rings[-1]
    if bottom[0] < 0.02:
        tip = bm.verts.new((0, 0, bottom[1] - 0.2))
        for i in range(sides):
            bm.faces.new((verts[-1][i], verts[-1][(i + 1) % sides], tip))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    obj = link(name, bm)
    return smooth(M.assign(obj, material))


def profile(t):
    """Rayon relatif de la motte à la profondeur t (0 sous l'herbe, 1 à la pointe) : une courbe
    continue qui s'affine jusqu'à une pointe, sans marche ni anneau."""
    return max(math.cos(t * math.pi / 2), 0.0) ** 1.05


def displace(obj, name, scale, strength, depth=2):
    """Relief organique : bosses d'une texture de nuages, le long des normales (déterministe)."""
    texture = bpy.data.textures.new(name, "CLOUDS")
    texture.noise_scale = scale
    texture.noise_depth = depth
    mod = obj.modifiers.new(name, "DISPLACE")
    mod.texture = texture
    mod.texture_coords = "LOCAL"
    mod.strength = strength
    return obj


def underside(rings=36):
    """Motte de terre d'un seul tenant : du bord du plateau jusqu'à une pointe arrondie."""
    rng = random.Random(4)
    phases = [rng.uniform(0, math.tau) for _ in range(3)]
    bm = bmesh.new()
    verts = []
    for k in range(rings + 1):
        t = k / rings
        z = TOP - t * DEPTH
        row = []
        for i in range(SIDES):
            a = _angle(i)
            lumps = (0.05 * math.sin(a * 3 + t * 4.1 + phases[0]) + 0.035 * math.sin(a * 7 - t * 6.3 + phases[1])
                     + 0.02 * math.sin(a * 13 + t * 11 + phases[2]))
            # Tout en haut, la terre reste en retrait sous le rebord d'herbe : ses bosses ne le percent pas.
            tuck = 1 - 0.05 * max(0.0, 1 - t / 0.1)
            r = edge(-a) * profile(t) * tuck * (1 + lumps * (0.2 + t))
            row.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, z)))
        verts.append(row)
    for k in range(rings):
        for i in range(SIDES):
            j = (i + 1) % SIDES
            bm.faces.new((verts[k][i], verts[k][j], verts[k + 1][j], verts[k + 1][i]))
    bmesh.ops.remove_doubles(bm, verts=verts[-1], dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    obj = link("Motte", bm)
    displace(obj, "Motte bosses", 0.7, 0.22)
    displace(obj, "Motte mottes", 0.32, 0.09)
    displace(obj, "Motte grain", 0.14, 0.05)
    return smooth(M.assign(obj, M.soil(TOP, TOP - DEPTH)))


def underside_point(angle, t, inset=0.0):
    """Point à la surface de la motte (angle et profondeur t de l'app), en coordonnées Blender."""
    r = edge(angle) * profile(t) * (1 - inset)
    return (math.cos(angle) * r, -math.sin(angle) * r, TOP - t * DEPTH)


def island_body(shore=None):
    lip = band("Bordure", [(1.0, 0.0, 0), (1.028, -0.1, 0.004), (1.02, -0.22, 0.006)], M.grass(),
               sides=26 * 12, scallops=(26, 0.1))
    return [plateau(shore), lip, underside()]


# ---------------------------------------------------------------------------
# Objets
# ---------------------------------------------------------------------------

def box(location, size, material, rotation=(0, 0, 0), bevel_width=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = active()
    obj.scale = size
    if bevel_width:
        bevel(obj, bevel_width, 3)
    return M.assign(obj, material)


def cylinder(location, radius, depth, material, vertices=24, rotation=(0, 0, 0), radius2=None):
    if radius2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location,
                                            rotation=rotation)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius2, depth=depth,
                                        location=location, rotation=rotation)
    return smooth(M.assign(active(), material))


def sphere(location, radius, material, segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=segments // 2, radius=radius, location=location)
    return smooth(M.assign(active(), material))


def text(body, location, size, depth, material, rotation=(math.pi / 2, 0, 0), bevel_depth=0.02, align_y="BOTTOM"):
    curve = bpy.data.curves.new(f"Texte {body}", type="FONT")
    curve.body = body
    curve.font = bpy.data.fonts.load(FONT, check_existing=True)
    curve.size = size
    curve.resolution_u = 3
    curve.extrude = depth / 2
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 1
    curve.align_x = "CENTER"
    curve.align_y = align_y
    obj = bpy.data.objects.new(f"Texte {body}", curve)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rotation
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return M.assign(active(), material)


def tube(points, radius, material, name="Tube", cyclic=False, taper=None):
    """Trait arrondi (tige, câble, berge, racine) : une courbe à section ronde, bouts fermés.
    `taper` donne un facteur d'épaisseur par point (racine qui s'affine)."""
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    curve.use_fill_caps = True
    spline = curve.splines.new("POLY")
    spline.use_cyclic_u = cyclic
    spline.points.add(len(points) - 1)
    for k, (p, co) in enumerate(zip(spline.points, points)):
        p.co = (*co, 1)
        if taper:
            p.radius = taper[k]
    obj = bpy.data.objects.new(name, curve)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    return smooth(M.assign(active(), material))


def join(objects, name):
    """Fusionne des objets en un seul. Leurs modificateurs sont appliqués avant : sinon, ceux de
    l'objet actif (un biseau, par exemple) s'étendraient à toutes les pièces fusionnées."""
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    obj = active()
    obj.name = name
    return obj


def blob(centers, material, voxel=0.045, name="Feuillage"):
    """Masse organique : des sphères fondues en une seule surface (remaillage par voxels)."""
    parts = [sphere(c, r, material, 16) for c, r in centers]
    obj = join(parts, name)
    mod = obj.modifiers.new("Fusion", "REMESH")
    mod.mode = "VOXEL"
    mod.voxel_size = voxel
    mod.use_smooth_shade = True
    smooth_mod = obj.modifiers.new("Douceur", "SMOOTH")
    smooth_mod.iterations = 6
    displace(obj, f"{name} touffes", 0.09, 0.07)
    return M.assign(obj, material)


def extruded(outline, depth, material, location, rotation=(math.pi / 2, 0, 0), bevel_width=0.05, name="Forme"):
    """Polygone plan (x, y) extrudé et biseauté : signes +, ×, ÷, équerre, rapporteur."""
    bm = bmesh.new()
    front = [bm.verts.new((x, y, -depth / 2)) for x, y in outline]
    back = [bm.verts.new((x, y, depth / 2)) for x, y in outline]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(len(outline)):
        j = (i + 1) % len(outline)
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    obj = link(name, bm)
    obj.location = location
    obj.rotation_euler = rotation
    bevel(obj, bevel_width, 3)
    return M.assign(obj, material)


def rock(location, radius, material, seed, stretch=(1.2, 1.0, 0.85)):
    rng = random.Random(seed)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=location)
    obj = active()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for v in bm.verts:
        v.co *= rng.uniform(0.82, 1.12)
    bm.to_mesh(obj.data)
    bm.free()
    obj.scale = stretch
    obj.rotation_euler = (rng.uniform(0, 1), rng.uniform(0, 1), rng.uniform(0, math.tau))
    bevel(obj, 0.02, 1)
    return M.assign(obj, material)


def catmull_rom(points, divisions):
    """Même courbe que THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5).getPoints(divisions)."""
    n = len(points)

    def at(t):
        p = (n - 1) * t
        i = min(int(math.floor(p)), n - 2)
        w = p - i
        p1, p2 = points[i], points[i + 1]
        p0 = points[i - 1] if i > 0 else tuple(2 * a - b for a, b in zip(points[0], points[1]))
        p3 = points[i + 2] if i + 2 < n else tuple(2 * a - b for a, b in zip(points[-1], points[-2]))
        out = []
        for c in range(len(p1)):
            t0, t1 = 0.5 * (p2[c] - p0[c]), 0.5 * (p3[c] - p1[c])
            a, b = p1[c], t0
            cc = -3 * p1[c] + 3 * p2[c] - 2 * t0 - t1
            d = 2 * p1[c] - 2 * p2[c] + t0 + t1
            out.append(a + b * w + cc * w * w + d * w * w * w)
        return tuple(out)

    return [at(k / divisions) for k in range(divisions + 1)]
