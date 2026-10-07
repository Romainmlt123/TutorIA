"""
Îlot de l'Algorithmique (région d'un seul chapitre, X2a) : une petite île flottante, même style que
l'île des Maths, avec des blocs d'instructions empilés façon Scratch, un engrenage et un panneau
fléché. Cuit en 1024 px ; l'app l'affiche à l'échelle 0,3 à côté de l'île.

Usage : blender -b -P tools/explorer-3d/islet_algo.py
Sortie : assets/explorer/models/islet-algo.glb
"""
import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402
from lib.geo import app, edge  # noqa: E402

geo.reset()
geo.island_body()

rng = random.Random(21)

# Pile de blocs d'instructions : événement (orange), mouvement (bleu), contrôle (violet).
BLOCKS = (("orange", -0.55, -0.35, 0.0), ("blue", -0.4, -0.3, 0.42), ("violet", -0.5, -0.32, 0.84))
for color, x, z, y in BLOCKS:
    geo.box(app(x, z, y + 0.22), (1.25, 0.5, 0.7), M.paint(color), bevel_width=0.05)
    for k in (-0.35, 0.25):
        geo.sphere(app(x + k, z, y + 0.47), 0.13, M.paint(color), 12).scale = (1, 1, 0.45)

# Engrenage : polygone à dents, debout.
teeth = 12
outline = []
for i in range(teeth * 2):
    r = 0.62 if i % 2 == 0 else 0.48
    a = i / (teeth * 2) * math.tau
    outline += [(math.cos(a) * r, math.sin(a) * r), (math.cos(a + math.pi / (teeth * 2) * 0.9) * r,
                                                       math.sin(a + math.pi / (teeth * 2) * 0.9) * r)]
geo.extruded(outline, 0.2, M.metal(), app(1.35, 0.25, 0.7), bevel_width=0.03, name="Engrenage")
geo.cylinder(app(1.35, 0.05, 0.7), 0.14, 0.26, M.paint("yellow"), 20, rotation=(math.pi / 2, 0, 0))

# Panneau fléché en bois.
geo.cylinder(app(0.6, 1.25, 0.45), 0.06, 0.9, M.wood(), 10)
arrow = [(-0.55, -0.16), (0.2, -0.16), (0.2, -0.3), (0.6, 0.0), (0.2, 0.3), (0.2, 0.16), (-0.55, 0.16)]
geo.extruded(arrow, 0.08, M.wood(), app(0.65, 1.22, 0.95), rotation=(math.pi / 2, 0, math.radians(-12)),
             bevel_width=0.02, name="Fleche")

# Buissons et fleurs.
bush = M.leaves("moss")
for x, z, size in ((-1.6, 0.9, 0.3), (1.5, 1.1, 0.26), (-0.2, 1.9, 0.22), (0.6, -1.7, 0.28)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=size, location=app(x, z, size * 0.45))
    obj = bpy.context.active_object
    obj.scale = (1, 1, 0.75)
    geo.displace(obj, "Buisson", 0.05, 0.035)
    geo.smooth(M.assign(obj, bush))
flowers = [M.flat("flower-white"), M.flat("flower-yellow"), M.flat("flower-violet")]
for _ in range(45):
    a = rng.uniform(0, math.tau)
    r = math.sqrt(rng.random()) * edge(a) * 0.9
    x, z = math.cos(a) * r, math.sin(a) * r
    if math.hypot(x + 0.5, z + 0.3) < 1.0 or math.hypot(x - 1.35, z - 0.25) < 0.8:
        continue
    geo.sphere(app(x, z, 0.03), 0.035, rng.choice(flowers), 6)

if os.environ.get("EXPLORER_PREVIEW"):
    bake.lights()
    bake.preview(os.environ["EXPLORER_PREVIEW"], width=600, height=600)
    raise SystemExit(0)

bake.apply_all()
meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
islet = geo.join(meshes, "ilot")
bake.unwrap(islet)
bake.lights()
bake.bake(islet, "ilot-algo", size=1024, samples=int(os.environ.get("EXPLORER_BAKE_SAMPLES", "32")))
path = bake.export("islet-algo.glb")
print("GLB", path, os.path.getsize(path), "octets")
