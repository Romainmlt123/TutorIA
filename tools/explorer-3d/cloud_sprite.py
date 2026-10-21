"""Rend le sprite transparent du nuage et, avec EXPLORER_PREVIEW, son aperçu sur ciel."""

import os
import subprocess
import tempfile
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/explorer/sprites/nuage.webp"
PREVIEW = os.environ.get("EXPLORER_PREVIEW")


def point_camera(camera, target):
    """Oriente la caméra vers le centre du nuage."""
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def make_cloud_material():
    """Crée le matériau émissif qui garde un alpha transparent."""
    material = bpy.data.materials.new("Nuage blanc chaud")
    material.diffuse_color = (1, 1, 1, 1)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeEmission")
    shader.inputs["Strength"].default_value = 1.0
    geometry = nodes.new("ShaderNodeNewGeometry")
    separate = nodes.new("ShaderNodeSeparateXYZ")
    height = nodes.new("ShaderNodeMapRange")
    height.inputs["From Min"].default_value = -0.45
    height.inputs["From Max"].default_value = 1.0
    height.clamp = True
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "EASE"
    ramp.color_ramp.elements[0].color = (0.55, 0.72, 0.95, 1)
    ramp.color_ramp.elements[0].position = 0
    ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
    ramp.color_ramp.elements[1].position = 1
    middle = ramp.color_ramp.elements.new(0.2)
    middle.color = (0.78, 0.87, 0.98, 1)
    highlight = ramp.color_ramp.elements.new(0.42)
    highlight.color = (0.99, 0.995, 1.0, 1)
    links = material.node_tree.links
    links.new(geometry.outputs["Position"], separate.inputs["Vector"])
    links.new(separate.outputs["Z"], height.inputs["Value"])
    links.new(height.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], shader.inputs["Color"])
    links.new(shader.outputs["Emission"], output.inputs["Surface"])
    return material


def render():
    """Rend le sprite WebP et l'aperçu demandé."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 960
    scene.render.resolution_y = 600
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 20
    scene.view_settings.view_transform = "Standard"
    cloud = bpy.data.metaballs.new("Nuage fondu")
    cloud.resolution = 0.05
    cloud.render_resolution = 0.03
    cloud.threshold = 0.65
    cloud_object = bpy.data.objects.new("Nuage fondu", cloud)
    scene.collection.objects.link(cloud_object)
    cloud.materials.append(make_cloud_material())
    lobes = [
        (0, 0.08, 0.12, 1.62, 1.2, 0.7, 0.55),
        (-1.48, 0, 0.54, 0.86, 1.0, 0.75, 1.0),
        (-0.62, 0, 0.82, 1.04, 1.0, 0.75, 1.0),
        (0.40, 0, 0.96, 1.22, 1.0, 0.75, 1.0),
        (1.43, 0, 0.67, 0.94, 1.0, 0.75, 1.0),
        (2.05, 0, 0.34, 0.62, 1.0, 0.75, 1.0),
    ]
    for x, y, z, radius, size_x, size_y, size_z in lobes:
        element = cloud.elements.new()
        element.co = (x, y, z)
        element.radius = radius
        element.size_x = size_x
        element.size_y = size_y
        element.size_z = size_z
    scene.camera = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    scene.collection.objects.link(scene.camera)
    scene.camera.data.type = "ORTHO"
    scene.camera.data.ortho_scale = 6.3
    scene.camera.location = (0, -9, 3.2)
    point_camera(scene.camera, (0, 0, 0.2))
    with tempfile.TemporaryDirectory() as temp:
        png = Path(temp) / "nuage.png"
        scene.render.filepath = str(png)
        bpy.ops.render.render(write_still=True)
        conversion = """
from PIL import Image
import sys
sprite = Image.open(sys.argv[1]).convert('RGBA')
sprite.save(sys.argv[2], 'WEBP', lossless=False, quality=88, method=6)
if sys.argv[3]:
    canvas = Image.new('RGB', (960, 600), '#b9dcff')
    cloud = sprite.resize((800, 500), Image.Resampling.LANCZOS)
    canvas.paste(cloud, ((960 - 800) // 2, (600 - 500) // 2), cloud)
    canvas.save(sys.argv[3])
"""
    subprocess.run(
            ["python3", "-c", conversion, str(png), str(OUTPUT), PREVIEW or ""],
        check=True,
    )


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    render()
