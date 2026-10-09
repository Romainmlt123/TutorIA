"""
Texture du panneau « Ta quête » (HUD de l'onglet Explorer) : trois planches de bois vues de face,
avec leur grain, leurs nœuds, des bords arrondis et des rainures sombres, éclairées en douceur.

Usage : blender -b -P tools/explorer-3d/wood_panel.py
Sortie : assets/explorer/images/wood-panel.webp
"""
import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import geo  # noqa: E402
from lib import materials as M  # noqa: E402
from lib.palette import rgba  # noqa: E402

WIDTH, HEIGHT = 3.2, 2.0
PLANKS = 3
GAP = 0.035
OUTPUT = os.path.join(geo.ROOT, "assets", "explorer", "images", "wood-panel.webp")

geo.reset()
rng = random.Random(7)

# Fond sombre, visible dans les rainures entre les planches.
geo.box((0, 0, -0.06), (WIDTH * 1.2, HEIGHT * 1.2, 0.02), M.flat("plank-back"), bevel_width=0)
plank_height = (HEIGHT - GAP * (PLANKS - 1)) / PLANKS
for k in range(PLANKS):
    y = -HEIGHT / 2 + plank_height / 2 + k * (plank_height + GAP)
    board = geo.box((rng.uniform(-0.3, 0.3), y, 0), (WIDTH * 1.25, plank_height, 0.08), M.plank(), bevel_width=0.025)
    board.rotation_euler = (0, 0, rng.uniform(-0.004, 0.004))

scene = bpy.context.scene
sun_data = bpy.data.lights.new("Soleil", "SUN")
sun_data.energy = 2.8
sun_data.angle = math.radians(12)
sun = bpy.data.objects.new("Soleil", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(35), math.radians(-20), 0)
world = bpy.data.worlds.new("Ciel")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = rgba("white")
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.45
scene.world = world

camera_data = bpy.data.cameras.new("Camera")
camera_data.type = "ORTHO"
camera_data.ortho_scale = WIDTH
camera = bpy.data.objects.new("Camera", camera_data)
scene.collection.objects.link(camera)
camera.location = (0, 0, 5)
scene.camera = camera

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = int(os.environ.get("EXPLORER_SAMPLES", "32"))
scene.cycles.use_denoising = True
size = int(os.environ.get("EXPLORER_WIDTH", "1200"))
scene.render.resolution_x, scene.render.resolution_y = size, int(size * HEIGHT / WIDTH)
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.quality = 82
scene.render.filepath = os.environ.get("EXPLORER_OUTPUT", OUTPUT)
bpy.ops.render.render(write_still=True)
