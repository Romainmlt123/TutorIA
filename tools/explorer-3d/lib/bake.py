"""
Cuisson de la lumière (Cycles) : toute la géométrie fixe est fusionnée, dépliée (UV), puis sa
couleur éclairée (lumière directe et rebondie, ombres douces, occlusion, émission des cristaux)
est peinte dans une seule texture. L'app l'affiche sans calcul de lumière : un rendu de qualité
cinéma pour le prix d'un seul appel de dessin.
"""
import math
import os

import bpy

from . import palette

MODELS = os.path.join(os.path.dirname(__file__), "..", "..", "..", "assets", "explorer", "models")


def apply_all():
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type in {"MESH", "CURVE", "FONT"}:
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def lights():
    """Soleil doré de fin d'après-midi (ombres douces), ciel bleu clair qui éclaire les ombres."""
    sun_data = bpy.data.lights.new("Soleil", "SUN")
    sun_data.energy = 5.0
    sun_data.color = palette.rgb("sun")
    sun_data.angle = math.radians(6)
    sun = bpy.data.objects.new("Soleil", sun_data)
    bpy.context.scene.collection.objects.link(sun)
    # Soleil haut, à gauche et devant (repère de l'app : devant = -y en Blender).
    sun.rotation_euler = (math.radians(42), math.radians(-28), math.radians(-35))
    world = bpy.data.worlds.new("Ciel")
    world.use_nodes = True
    background = world.node_tree.nodes["Background"]
    background.inputs["Color"].default_value = (*palette.rgb("sky"), 1)
    background.inputs["Strength"].default_value = 1.25
    bpy.context.scene.world = world
    return sun


def _app_camera(scene, width, height, azimuth=-0.2, elevation_degrees=24):
    """Même cadrage que l'atelier 3D de l'app : champ vertical de 26°, élévation de 24°, île de
    7,4 m sur toute la largeur de l'écran (hd2d/camera.ts)."""
    fov = math.radians(26)
    aspect = width / height
    half_x = math.atan(math.tan(fov / 2) * aspect)
    distance = 7.4 / 2 / 1.02 / math.tan(half_x)
    elevation = math.radians(elevation_degrees)
    flat = math.cos(elevation) * distance
    target = (0.0, 0.0, -0.9)
    data = bpy.data.cameras.new("Camera")
    data.sensor_fit = "VERTICAL"
    data.angle_y = fov
    data.clip_end = distance * 4
    camera = bpy.data.objects.new("Camera", data)
    scene.collection.objects.link(camera)
    # Repère de l'app : (x, y, z) → Blender (x, -z, y).
    camera.location = (math.sin(azimuth) * flat, -math.cos(azimuth) * flat, target[2] + math.sin(elevation) * distance)
    aim = bpy.data.objects.new("Visee", None)
    aim.location = target
    scene.collection.objects.link(aim)
    camera.constraints.new("TRACK_TO").target = aim
    scene.camera = camera


def preview(path, width=520, height=1126, samples=32, crop=None):
    """Rendu direct (sans cuisson) avec le cadrage de l'app : pour régler formes et matières vite.
    Les reflets sont coupés, comme dans la cuisson, qui ne garde que la lumière diffuse."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 0
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.view_settings.view_transform = "Standard"
    for mat in bpy.data.materials:
        for node in mat.node_tree.nodes if mat.node_tree else []:
            if node.bl_idname == "ShaderNodeBsdfPrincipled":
                node.inputs["Specular IOR Level"].default_value = 0.0
    _app_camera(scene, width, height)
    if crop:
        # Zone (x min, y min, x max, y max) en fractions de l'image, 0 en bas à gauche.
        scene.render.use_border = True
        scene.render.use_crop_to_border = True
        scene.render.border_min_x, scene.render.border_min_y, scene.render.border_max_x, scene.render.border_max_y = crop
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def fallback(path, width=900, height=1250, samples=48):
    """Image fixe de l'île sur fond transparent (WebP), cadrée comme dans l'app : elle remplace la
    3D quand WebGL manque ou que la scène échoue."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.view_settings.view_transform = "Standard"
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = 86
    _app_camera(scene, width, height)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def unwrap(obj, margin=0.003):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=margin)
    bpy.ops.uv.pack_islands(margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")


def bake(obj, name, size=2048, samples=96):
    """Peint la lumière de `obj` dans une image, puis remplace ses matériaux par cette image."""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    # Peu de rebonds suffisent pour des couleurs mates : la cuisson va bien plus vite.
    scene.cycles.max_bounces = 4
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 0
    scene.cycles.transmission_bounces = 0
    scene.cycles.transparent_max_bounces = 0
    scene.render.bake.margin = 6
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_diffuse = True
    scene.render.bake.use_pass_glossy = False
    scene.render.bake.use_pass_transmission = False
    scene.render.bake.use_pass_emit = True
    image = bpy.data.images.new(name, size, size)
    for slot in obj.material_slots:
        nodes = slot.material.node_tree.nodes
        node = nodes.new("ShaderNodeTexImage")
        node.image = image
        nodes.active = node
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(type="COMBINED")

    baked = bpy.data.materials.new(f"cuit/{name}")
    baked.use_nodes = True
    bsdf = baked.node_tree.nodes["Principled BSDF"]
    texture = baked.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = image
    baked.node_tree.links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
    obj.data.materials.clear()
    obj.data.materials.append(baked)
    return image


def export(filename):
    path = os.path.abspath(os.path.join(MODELS, filename))
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        obj.select_set(obj.type == "MESH")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_image_format="JPEG",
        export_jpeg_quality=90,
        export_materials="EXPORT",
    )
    return path
