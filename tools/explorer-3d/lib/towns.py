"""Décor habité des villes sur la carte pré-rendue."""
import math
import random


def dress_towns(g):
    import bpy

    from lib import geo, materials as M, palette

    layout = g["LAYOUT"]
    ns = g["ns"]
    scale = g["SCALE"]
    height = g["ground_height"]
    cities = layout["cities"]
    nodes = layout["nodes"]
    path = [(p[0], p[1]) for p in layout["path"]]
    landmarks = ns["LANDMARKS"]
    inside_outline = ns["inside_outline"]
    wet = ns["wet"]
    templates = {o.name.split(".")[0] for o in g["templates"].values()}
    occupied = []
    min_margins = {}
    footprints = []

    roofs = {
        "maths-relatifs": (("cherry", "cherry-light", "c1-roof-cherry"),
                           ("ceramic-blue", "blue-light", "c1-roof-blue")),
        "maths-fractions": (("cherry", "cherry-light", "c1-roof-cherry"),
                            ("crust", "crust-light", "crust-dark")),
        "maths-fractions-produits": (("terracotta", "terracotta-light", "terracotta-dark"),
                                     ("blue", "blue-light", "c1-roof-blue")),
        "maths-puissances": (("violet", "violet-light", "town-roof-violet-dark"),
                             ("blue", "blue-light", "c1-roof-blue")),
        "maths-calcul-litteral": (("terracotta", "terracotta-light", "terracotta-dark"),
                                 ("plaster", "plaster-light", "stone-warm-dark")),
        "maths-equations": (("cherry", "cherry-light", "c1-roof-cherry"),
                            ("brass", "brass-light", "brass-dark")),
    }

    def at(x, z, y=0.0):
        return geo.app(x, z, height(x, z) + y)

    def path_distance(x, z):
        best = math.inf
        for (ax, az), (bx, bz) in zip(path, path[1:]):
            dx, dz = bx - ax, bz - az
            t = max(0.0, min(1.0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz or 1)))
            best = min(best, math.hypot(x - ax - dx * t, z - az - dz * t))
        return best

    def disk_distance(x, z):
        return min((math.hypot(x - n["x"], z - n["z"]) - n["radius"] for n in nodes), default=math.inf)

    def valid_site(x, z, city, path_margin, disk_margin, footprint):
        path_clearance = path_distance(x, z) - 0.2
        disk_clearance = disk_distance(x, z)
        if path_clearance < path_margin or disk_clearance < disk_margin:
            return None
        edge_margin = footprint + 0.05
        if not inside_outline(x / scale, z / scale, edge_margin / scale) or wet(x, z, edge_margin):
            return None
        if any(math.hypot(x - lx, z - lz) < lr + edge_margin for lx, lz, lr in landmarks):
            return None
        if any(c["id"] != city["id"] and
               math.hypot(x - c["x"], z - c["z"]) < c["radius"] + edge_margin for c in cities):
            return None
        return path_clearance, disk_clearance

    def spots(city, rng, count, rmin, rmax, spacing, path_margin, disk_margin, footprint):
        cx, cz = city["x"], city["z"]
        step = 0.08
        candidates = []
        for ix in range(round(2 * rmax / step) + 1):
            x = cx - rmax + ix * step
            for iz in range(round(2 * rmax / step) + 1):
                z = cz - rmax + iz * step
                radius = math.hypot(x - cx, z - cz)
                if not rmin <= radius <= rmax:
                    continue
                margins = valid_site(x, z, city, path_margin, disk_margin, footprint)
                if margins is not None:
                    candidates.append((radius + rng.random() * 0.6, x, z, margins))
        candidates.sort()
        placed = []
        for _, x, z, margins in candidates:
            previous = occupied + [(px, pz) for px, pz, _ in placed]
            if any(math.hypot(x - px, z - pz) < spacing for px, pz in previous):
                continue
            placed.append((x, z, margins))
            if len(placed) == count:
                break
        occupied.extend((x, z) for x, z, _ in placed)
        return [(x, z) for x, z, _ in placed], [m for _, _, m in placed]

    def clear_decor(x, z, radius):
        for obj in list(bpy.data.objects):
            if obj.name.split(".")[0] in templates and "." in obj.name:
                if math.hypot(obj.location.x - x, -obj.location.y - z) < radius:
                    bpy.data.objects.remove(obj, do_unlink=True)

    def lift_monument(city, amount):
        target = geo.app(city["x"], city["z"], 0.0)
        from mathutils import Vector

        for obj in bpy.data.objects:
            if obj.type == "MESH" and (obj.location - Vector(target)).length < 1e-4:
                obj.location.z += amount

    def group(name, parts, x, z, yaw=0.0):
        empty = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(empty)
        for part in parts:
            part.parent = empty
        empty.location = at(x, z)
        empty.rotation_euler = (0, 0, yaw)
        return empty

    def face_center(city, x, z):
        bx, by = city["x"] - x, -(city["z"] - z)
        return math.atan2(bx, -by)

    def glow_material(name, strength, falloff, sphere):
        def build():
            mat = bpy.data.materials.new(name)
            mat.use_nodes = True
            nt = mat.node_tree
            nt.nodes.clear()
            out = nt.nodes.new("ShaderNodeOutputMaterial")
            add = nt.nodes.new("ShaderNodeAddShader")
            transparent = nt.nodes.new("ShaderNodeBsdfTransparent")
            emission = nt.nodes.new("ShaderNodeEmission")
            emission.inputs["Color"].default_value = palette.rgba("c1-lamp-hot")
            power = nt.nodes.new("ShaderNodeMath")
            power.operation = "POWER"
            power.inputs[1].default_value = falloff
            mult = nt.nodes.new("ShaderNodeMath")
            mult.operation = "MULTIPLY"
            mult.inputs[1].default_value = strength
            if sphere:
                facing = nt.nodes.new("ShaderNodeLayerWeight")
                facing.inputs["Blend"].default_value = 0.5
                invert = nt.nodes.new("ShaderNodeMath")
                invert.operation = "SUBTRACT"
                invert.inputs[0].default_value = 1.0
                nt.links.new(facing.outputs["Facing"], invert.inputs[1])
                source = invert.outputs[0]
            else:
                coords = nt.nodes.new("ShaderNodeTexCoord")
                gradient = nt.nodes.new("ShaderNodeTexGradient")
                gradient.gradient_type = "SPHERICAL"
                nt.links.new(coords.outputs["Object"], gradient.inputs["Vector"])
                source = gradient.outputs["Fac"]
            nt.links.new(source, power.inputs[0])
            nt.links.new(power.outputs[0], mult.inputs[0])
            nt.links.new(mult.outputs[0], emission.inputs["Strength"])
            nt.links.new(transparent.outputs[0], add.inputs[0])
            nt.links.new(emission.outputs[0], add.inputs[1])
            nt.links.new(add.outputs[0], out.inputs["Surface"])
            return mat

        return M._cached(name, build)

    def place_pool(parts, location, radius, strength):
        bpy.ops.mesh.primitive_circle_add(vertices=32, radius=1.0, fill_type="TRIFAN", location=location)
        obj = geo.active()
        obj.scale = (radius, radius, 1.0)
        obj.data.materials.append(glow_material(f"c1-flaque-{strength}", strength, 2.2, False))
        parts.append(obj)

    def point_light(parts, location, energy, radius=0.02):
        data = bpy.data.lights.new("c1-lueur", "POINT")
        data.energy = energy
        data.shadow_soft_size = radius
        data.color = palette.rgb("c1-point-light")
        obj = bpy.data.objects.new("c1-lueur", data)
        obj.location = location
        bpy.context.scene.collection.objects.link(obj)
        parts.append(obj)

    def glass():
        def build():
            graph = M.Graph("c1-vitre")
            color = graph.ramp(graph.noise(9.0, 2), [(0.3, "c1-window-deep"), (0.75, "c1-window")])
            return graph.finish(color, 0.3, emission="c1-window", strength=8.0)

        return M._cached("c1-vitre", build)

    def lamp_material():
        def build():
            graph = M.Graph("c1-lampe")
            color = graph.ramp(graph.noise(6.0, 2), [(0.3, "c1-lamp"), (0.8, "cream")])
            return graph.finish(color, 0.3, emission="c1-lamp-hot", strength=7.0)

        return M._cached("c1-lampe", build)

    def window(parts, x, y, z, normal):
        glass_mat = glass()
        if normal == "y":
            parts.append(geo.box((x, y, z), (0.085, 0.014, 0.085), M.paint("white"), bevel_width=0.006))
            parts.append(geo.box((x, y - 0.006, z), (0.06, 0.012, 0.06), glass_mat, bevel_width=0.004))
            for side in (-1, 1):
                parts.append(geo.box((x + side * 0.062, y - 0.002, z), (0.03, 0.012, 0.085),
                                     M.paint("shutter"), bevel_width=0.004))
        else:
            parts.append(geo.box((x, y, z), (0.014, 0.085, 0.085), M.paint("white"), bevel_width=0.006))
            parts.append(geo.box((x + 0.006 * (1 if x > 0 else -1), y, z), (0.012, 0.06, 0.06),
                                 glass_mat, bevel_width=0.004))

    def house(city, index, x, z, rng):
        tall = index % 3 == 1
        width, depth = rng.uniform(0.38, 0.46), rng.uniform(0.32, 0.37)
        height = 0.46 if tall else rng.uniform(0.27, 0.32)
        roof, roof_light, ridge = roofs[city["id"]][0 if x < city["x"] else 1]
        wall = ("plaster", "plaster-light", "stone-warm-light")[index % 3]
        parts = [
            geo.box((0, 0, 0.025), (width + 0.04, depth + 0.04, 0.05), M.paint("stone-warm-dark"),
                    bevel_width=0.012),
            geo.box((0, 0, height / 2 + 0.03), (width, depth, height), M.paint(wall), bevel_width=0.02),
        ]
        top, roof_height = height + 0.03, 0.21
        parts.append(geo.extruded([(-width / 2 - 0.055, 0), (width / 2 + 0.055, 0), (0, roof_height)],
                                  depth + 0.09, M.paint(roof, roof_light), (0, 0, top - 0.012),
                                  bevel_width=0.018, name="Toit"))
        parts.append(geo.box((0, 0, top + roof_height - 0.02), (0.035, depth + 0.1, 0.035),
                             M.paint(ridge), bevel_width=0.01))
        front = -depth / 2 - 0.006
        parts.append(geo.box((0, front, 0.14), (0.12, 0.012, 0.19), M.paint("white"), bevel_width=0.006))
        parts.append(geo.box((0, front - 0.006, 0.135), (0.09, 0.012, 0.17), M.paint("wood-dark"),
                             bevel_width=0.008))
        parts.append(geo.box((0, front - 0.04, 0.012), (0.16, 0.07, 0.024), M.paint("stone-warm"),
                             bevel_width=0.008))
        parts.append(geo.box((0.085, front - 0.012, 0.27), (0.028, 0.024, 0.036), lamp_material(),
                            bevel_width=0.006))
        point_light(parts, (0.085, front - 0.05, 0.25), 4.0)
        place_pool(parts, (0.04, front - 0.12, 0.03), 0.27, 0.8)
        rows = (0.2, 0.37) if tall else (0.2,)
        for row in rows:
            for side in (-1, 1):
                window(parts, side * width * 0.3, front, row + 0.03, "y")
            for side in (-1, 1):
                window(parts, side * (width / 2 + 0.006), 0.0, row + 0.03, "x")
        box_x = -width * 0.3
        parts.append(geo.box((box_x, front - 0.03, 0.17), (0.1, 0.04, 0.035), M.paint("wood"),
                             bevel_width=0.006))
        for j in range(4):
            parts.append(geo.sphere((box_x - 0.036 + j * 0.024, front - 0.03, 0.195), 0.016,
                                    M.paint(("flower-pink", "flower-yellow")[j % 2]), segments=8))
        parts.append(geo.box((width * 0.24, depth * 0.15, top + roof_height * 0.68), (0.065, 0.065, 0.16),
                             M.paint("brick"), bevel_width=0.01))
        yaw = face_center(city, x, z)
        group(f"maison-{city['id']}-{index}", parts, x, z, yaw)
        return {
            "name": f"maison-{city['id']}-{index}",
            "city": city["id"],
            "shape": "rectangle",
            "x": x,
            "z": z,
            "half_x": width / 2 + 0.055,
            "half_z": depth / 2 + 0.045,
            "yaw": yaw,
        }

    def tree(city, index, x, z, rng):
        canopy = [((0, 0, 0.3), 0.17), ((0.08, 0.05, 0.36), 0.13), ((-0.07, -0.04, 0.38), 0.12)]
        parts = [
            geo.cylinder((0, 0, 0.11), 0.03, 0.22, M.bark(), vertices=10),
            geo.blob(canopy, M.paint("crown", "crown-light"), name="Couronne"),
        ]
        group(f"arbre-{city['id']}-{index}", parts, x, z, rng.uniform(0, math.tau))
        return {
            "name": f"arbre-{city['id']}-{index}",
            "city": city["id"],
            "shape": "circle",
            "x": x,
            "z": z,
            "radius": 0.22,
        }

    def lantern(city, index, x, z):
        parts = [
            geo.cylinder((0, 0, 0.13), 0.012, 0.26, M.paint("iron"), vertices=8),
            geo.box((0, 0, 0.3), (0.07, 0.07, 0.08), lamp_material(), bevel_width=0.01),
            geo.box((0, 0, 0.35), (0.095, 0.095, 0.025), M.paint("iron"), bevel_width=0.008),
        ]
        point_light(parts, (0, 0, 0.3), 14.0, 0.035)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.3, location=(0, 0, 0.3))
        halo = geo.active()
        bpy.ops.object.shade_smooth()
        halo.data.materials.append(glow_material("c1-halo", 0.9, 3.0, True))
        parts.append(halo)
        place_pool(parts, (0, 0, 0.012), 0.45, 0.7)
        group(f"lanterne-{city['id']}-{index}", parts, x, z)
        return {
            "name": f"lanterne-{city['id']}-{index}",
            "city": city["id"],
            "shape": "circle",
            "x": x,
            "z": z,
            "radius": 0.45,
        }

    for city_index, city in enumerate(cities):
        cx, cz = city["x"], city["z"]
        rng = random.Random(7 + city_index * 1009)
        clear_decor(cx, cz, 1.25)
        largest_node = max((n["radius"] for n in nodes if n["cityId"] == city["id"]), default=0.255)
        place_radius = min(1.16, city["radius"] - largest_node - 0.05)
        geo.cylinder(at(cx, cz, -0.04), place_radius, 0.12, M.paint("stone-warm-dark"), vertices=96)
        footprints.append({
            "name": f"socle-{city['id']}",
            "city": city["id"],
            "shape": "circle",
            "x": cx,
            "z": cz,
            "radius": place_radius,
        })
        footprints.append({
            "name": f"monument-{city['id']}",
            "city": city["id"],
            "shape": "circle",
            "x": cx,
            "z": cz,
            "radius": 0.95,
        })
        stones = {"c1-pave": [], "c1-pave-light": []}
        radius = 0.16
        while radius < place_radius - 0.14:
            count = max(6, int(2 * math.pi * radius / 0.125))
            for i in range(count):
                angle = (i + 0.5 * (int(radius * 100) % 2)) / count * math.tau
                x, z = cx + radius * math.cos(angle), cz + radius * math.sin(angle)
                key = rng.choice(tuple(stones))
                stones[key].append(geo.box(at(x, z, 0.03), (0.105, 0.1, 0.05), M.paint(key),
                                           (0, 0, -angle), bevel_width=0.018))
            radius += 0.12
        curb_radius = place_radius - 0.06
        curb_count = int(2 * math.pi * curb_radius / 0.17)
        curb = []
        for i in range(curb_count):
            angle = i / curb_count * math.tau
            x, z = cx + curb_radius * math.cos(angle), cz + curb_radius * math.sin(angle)
            curb.append(geo.box(at(x, z, 0.05), (0.09, 0.16, 0.07), M.paint("stone-warm-dark"),
                                (0, 0, -angle), bevel_width=0.02))
        for key, objects in stones.items():
            if objects:
                geo.join(objects, f"paves-{city_index}-{key}")
        geo.join(curb, f"bordure-{city_index}")
        lift_monument(city, 0.055)

        fixed_lanterns = []
        for index, angle in enumerate((math.radians(205), math.radians(335))):
            x, z = cx + 1.95 * math.cos(angle), cz + 1.95 * math.sin(angle)
            if valid_site(x, z, city, 0.2, 0.45, 0.45) is not None:
                fixed_lanterns.append((index, x, z))
                occupied.append((x, z))

        houses, house_margins = spots(city, rng, 5, 1.95, 4.6, 0.95, 0.44, 0.44, 0.32)
        for index, (x, z) in enumerate(houses):
            clear_decor(x, z, 0.5)
            footprints.append(house(city, index, x, z, rng))

        trees, tree_margins = spots(city, rng, 3, 2.0, 4.8, 0.8, 0.32, 0.32, 0.22)
        for index, (x, z) in enumerate(trees):
            clear_decor(x, z, 0.35)
            footprints.append(tree(city, index, x, z, rng))

        for index, x, z in fixed_lanterns:
            clear_decor(x, z, 0.2)
            footprints.append(lantern(city, index, x, z))
        extra_lanterns, lantern_margins = spots(city, rng, 2, 1.8, 2.9, 0.8, 0.2, 0.45, 0.45)
        for index, (x, z) in enumerate(extra_lanterns, start=2):
            clear_decor(x, z, 0.2)
            footprints.append(lantern(city, index, x, z))

        all_margins = house_margins + tree_margins + lantern_margins
        for index, x, z in fixed_lanterns:
            margins = valid_site(x, z, city, 0.2, 0.45, 0.45)
            if margins is not None:
                all_margins.append(margins)
        min_path = min((m[0] for m in all_margins), default=math.inf)
        min_disk = min((m[1] for m in all_margins), default=math.inf)
        min_margins[city["id"]] = (min_disk, min_path)
        fmt = lambda value: "n/a" if not math.isfinite(value) else f"{value:.2f} m"
        print(f"VILLE {city['id']} maisons {len(houses)} arbres {len(trees)} lanternes "
              f"{len(fixed_lanterns) + len(extra_lanterns)} marge-disque {fmt(min_disk)} "
              f"marge-chemin {fmt(min_path)}", flush=True)

    g["TOWN_FOOTPRINTS"] = footprints
    return min_margins
