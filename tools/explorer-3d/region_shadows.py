"""Génère les contours des régions voisines d'une carte pré-rendue, sans Blender."""
import ast
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STYLIZED = ROOT / "src/features/explorer/stylized3d"
REGIONS_PATH = STYLIZED / "regions.json"
SCALES_PATH = STYLIZED / "terrainScales.ts"
OUTPUT = STYLIZED / "regionShadows.json"
MAPS_PATH = ROOT / "src/features/explorer/tiles/index.ts"
ISLAND_GEOMETRY = ROOT / "tools/explorer-3d/lib/geo.py"
RAYS = 360
GRID_STEP = 0.01
SIMPLIFY_TOLERANCE = 0.01


def island_edge():
    """Charge la courbe de côte de geo.py sans recopier sa formule."""
    tree = ast.parse(ISLAND_GEOMETRY.read_text())
    radius = next(
        (
            node
            for node in tree.body
            if isinstance(node, ast.Assign)
            and any(isinstance(target, ast.Name) and target.id == "R" for target in node.targets)
        ),
        None,
    )
    function = next(
        (
            node
            for node in tree.body
            if isinstance(node, ast.FunctionDef) and node.name == "edge"
        ),
        None,
    )
    if radius is None or function is None:
        raise ValueError(f"{ISLAND_GEOMETRY} doit définir R et edge(angle)")
    namespace = {"math": math}
    exec(
        compile(ast.Module(body=[radius, function], type_ignores=[]), str(ISLAND_GEOMETRY), "exec"),
        namespace,
    )
    return namespace["edge"]


def land_outline(edge):
    """Échantillonne la côte de l'île avec une marge pour le tracé."""
    return [
        (
            math.cos(index / RAYS * math.tau) * edge(index / RAYS * math.tau) * 0.985,
            math.sin(index / RAYS * math.tau) * edge(index / RAYS * math.tau) * 0.985,
        )
        for index in range(RAYS)
    ]


def scanline(polygon, z):
    """Retourne les intervalles traversés par un contour à cette hauteur."""
    crossings = []
    for (x1, z1), (x2, z2) in zip(polygon, polygon[1:] + polygon[:1]):
        if (z1 <= z < z2) or (z2 <= z < z1):
            crossings.append(x1 + (z - z1) * (x2 - x1) / (z2 - z1))
    crossings.sort()
    if len(crossings) % 2:
        raise ValueError(f"Contour polygon invalide sur z={z}")
    return list(zip(crossings[::2], crossings[1::2]))


def intersect_intervals(first, second):
    """Intersecte deux listes triées d'intervalles horizontaux."""
    intersections = []
    i = j = 0
    while i < len(first) and j < len(second):
        left = max(first[i][0], second[j][0])
        right = min(first[i][1], second[j][1])
        if left < right:
            intersections.append((left, right))
        if first[i][1] < second[j][1]:
            i += 1
        else:
            j += 1
    return intersections


def rasterize_intersection(first, second):
    """Rasterise l'intersection des contours sur une grille régulière."""
    min_x = max(min(point[0] for point in first), min(point[0] for point in second))
    max_x = min(max(point[0] for point in first), max(point[0] for point in second))
    min_z = max(min(point[1] for point in first), min(point[1] for point in second))
    max_z = min(max(point[1] for point in first), max(point[1] for point in second))
    if min_x >= max_x or min_z >= max_z:
        return [], 0.0, 0.0

    x0 = math.floor(min_x / GRID_STEP) * GRID_STEP - GRID_STEP
    z0 = math.floor(min_z / GRID_STEP) * GRID_STEP - GRID_STEP
    width = math.ceil((max_x - x0) / GRID_STEP) + 2
    height = math.ceil((max_z - z0) / GRID_STEP) + 2
    mask = [bytearray(width) for _ in range(height)]
    for row in range(height):
        z = z0 + row * GRID_STEP
        spans = intersect_intervals(scanline(first, z), scanline(second, z))
        for left, right in spans:
            start = max(0, math.ceil((left - x0) / GRID_STEP))
            end = min(width - 1, math.floor((right - x0) / GRID_STEP))
            for column in range(start, end + 1):
                mask[row][column] = 1
    return mask, x0, z0


def component_count(mask):
    """Compte les composantes connexes du masque rasterisé."""
    if not mask:
        return 0
    height, width = len(mask), len(mask[0])
    seen = [bytearray(width) for _ in range(height)]
    components = 0
    for row in range(height):
        for column in range(width):
            if not mask[row][column] or seen[row][column]:
                continue
            components += 1
            stack = [(column, row)]
            seen[row][column] = 1
            while stack:
                x, y = stack.pop()
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if (
                            0 <= nx < width
                            and 0 <= ny < height
                            and mask[ny][nx]
                            and not seen[ny][nx]
                        ):
                            seen[ny][nx] = 1
                            stack.append((nx, ny))
    return components


def marching_squares(mask, x0, z0):
    """Trace les contours fermés du masque par marching squares."""
    segments = []
    for row in range(len(mask) - 1):
        for column in range(len(mask[row]) - 1):
            corners = (
                mask[row][column],
                mask[row][column + 1],
                mask[row + 1][column + 1],
                mask[row + 1][column],
            )
            case = sum(value << index for index, value in enumerate(corners))
            if case in (0, 15):
                continue
            edges = (
                ("h", row, column),
                ("v", row, column + 1),
                ("h", row + 1, column),
                ("v", row, column),
            )
            crossed = [index for index, (start, end) in enumerate(((0, 1), (1, 2), (2, 3), (3, 0))) if corners[start] != corners[end]]
            if len(crossed) == 2:
                segments.append((edges[crossed[0]], edges[crossed[1]]))
            elif case == 5:
                segments.extend(((edges[0], edges[1]), (edges[2], edges[3])))
            elif case == 10:
                segments.extend(((edges[0], edges[3]), (edges[1], edges[2])))
            else:
                raise ValueError(f"Cas marching squares inattendu {case} à {column},{row}")

    def point(key):
        """Convertit une arête de grille au milieu de son segment."""
        axis, row, column = key
        if axis == "h":
            return x0 + (column + 0.5) * GRID_STEP, z0 + row * GRID_STEP
        return x0 + column * GRID_STEP, z0 + (row + 0.5) * GRID_STEP

    adjacency = {}
    unused = set()
    for first, second in segments:
        adjacency.setdefault(first, []).append(second)
        adjacency.setdefault(second, []).append(first)
        unused.add(tuple(sorted((first, second))))

    loops = []
    while unused:
        first, second = min(unused)
        unused.remove((first, second))
        path = [first]
        current = second
        while current != first:
            path.append(current)
            next_points = [
                candidate
                for candidate in adjacency[current]
                if tuple(sorted((current, candidate))) in unused
            ]
            if not next_points:
                raise ValueError("Contour marching squares ouvert")
            following = min(next_points)
            unused.remove(tuple(sorted((current, following))))
            current = following
            if len(path) > len(segments) + 1:
                raise ValueError("Contour marching squares trop long")
        loops.append([point(key) for key in path])
    return loops


def point_segment_distance(point, start, end):
    """Mesure la distance entre un point et un segment."""
    dx, dz = end[0] - start[0], end[1] - start[1]
    length = dx * dx + dz * dz
    progress = (
        0
        if length == 0
        else max(0, min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dz) / length))
    )
    return math.hypot(point[0] - start[0] - progress * dx, point[1] - start[1] - progress * dz)


def simplify_open(points, tolerance):
    """Simplifie une ligne ouverte par Douglas–Peucker."""
    if len(points) <= 2:
        return points
    keep = {0, len(points) - 1}
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        farthest = max(
            range(start + 1, end),
            key=lambda index: point_segment_distance(points[index], points[start], points[end]),
            default=None,
        )
        if farthest is not None and point_segment_distance(
            points[farthest], points[start], points[end]
        ) > tolerance:
            keep.add(farthest)
            stack.extend(((start, farthest), (farthest, end)))
    return [points[index] for index in sorted(keep)]


def simplify_closed(points, tolerance):
    """Simplifie un contour fermé sans perdre sa fermeture."""
    farthest = max(
        range(1, len(points)),
        key=lambda index: point_segment_distance(points[index], points[0], points[0]),
    )
    first = simplify_open(points[: farthest + 1], tolerance)
    second = simplify_open(points[farthest:] + [points[0]], tolerance)
    simplified = first[:-1] + second[:-1]
    return simplified if len(simplified) >= 3 else points


def clipped_outline(region, land):
    """Découpe une région par la terre et refuse les intersections multiples."""
    mask, x0, z0 = rasterize_intersection(region["polygon"], land)
    components = component_count(mask)
    if components != 1:
        raise ValueError(f"{region['id']} : intersection avec le terrain = {components} composantes")
    loops = marching_squares(mask, x0, z0)
    if len(loops) != 1:
        raise ValueError(f"{region['id']} : intersection avec le terrain = {len(loops)} contours")
    return simplify_closed(loops[0], SIMPLIFY_TOLERANCE)


def scales():
    """Lit les échelles des cartes pré-rendues dans le module TypeScript."""
    import re

    return {
        region: float(scale)
        for region, scale in re.findall(r"'([^']+)':\s*([\d.]+)", SCALES_PATH.read_text())
    }


def prerendered_ids():
    """Lit les identifiants des cartes pré-rendues."""
    import re

    text = MAPS_PATH.read_text()
    return re.findall(
        r"'([^']+)':", text.split("PRERENDERED_MAPS", 1)[1].split("};", 1)[0]
    )


def generate():
    """Génère les polygones de terre et d'ombres, puis écrit le JSON."""
    layout = json.loads(REGIONS_PATH.read_text())
    regions = layout["regions"]
    scale_by_id = scales()
    edge = island_edge()
    result = {}
    for map_id in prerendered_ids():
        if map_id not in scale_by_id:
            raise ValueError(f"Échelle de terrain absente pour la carte {map_id}")
        scale = scale_by_id[map_id]
        land = land_outline(edge)
        shadows = []
        for region in regions:
            if region["id"] == map_id:
                continue
            polygon = clipped_outline(region, land)
            shadows.append({
                "id": region["id"],
                "focus": [round(value * scale, 6) for value in region["focus"]],
                "polygon": [[round(x * scale, 6), round(z * scale, 6)] for x, z in polygon],
            })
        islet = layout["islet"]
        center_x, _, center_z = islet["position"]
        radius = 3.2 * islet["scale"]
        shadows.append({
            "id": islet["region"],
            "focus": [round(center_x * scale, 6), round(center_z * scale, 6)],
            "polygon": [
                [
                    round((center_x + math.cos(index / 64 * math.tau) * radius) * scale, 6),
                    round((center_z + math.sin(index / 64 * math.tau) * radius) * scale, 6),
                ]
                for index in range(64)
            ],
        })
        result[map_id] = {
            "scale": scale,
            "land": [[round(x * scale, 6), round(z * scale, 6)] for x, z in land],
            "shadows": shadows,
        }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"Écrit {OUTPUT.relative_to(ROOT)} : {sum(len(v['shadows']) for v in result.values())} contours")


if __name__ == "__main__":
    generate()
