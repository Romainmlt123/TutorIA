"""
Matériaux procéduraux d'Explorer (Cycles), pour un rendu de maquette réaliste : herbe de prairie,
terre en strates avec cailloux et racines, pierre, bois, feuillage, peinture mate légèrement usée,
métal, cristal. Ils ne servent qu'à la cuisson : couleur, relief (bump) et lumière finissent
peints dans une seule texture. Les creux sont un peu assombris et les arêtes un peu éclaircies
(« pointiness »), comme la poussière et l'usure d'un vrai objet.
"""
import bpy

from .palette import rgba

_cache = {}


def _input(node, name, socket_type=None):
    for socket in node.inputs:
        if socket.name == name and (socket_type is None or socket.type == socket_type):
            return socket
    raise KeyError(f"{node.bl_idname}: entrée {name} introuvable")


def _output(node, name, socket_type=None):
    for socket in node.outputs:
        if socket.name == name and (socket_type is None or socket.type == socket_type):
            return socket
    raise KeyError(f"{node.bl_idname}: sortie {name} introuvable")


class Graph:
    """Petit assistant pour écrire des arbres de nœuds lisibles."""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.mat.use_nodes = True
        self.nodes = self.mat.node_tree.nodes
        self.links = self.mat.node_tree.links
        self.nodes.clear()
        self.out = self.nodes.new("ShaderNodeOutputMaterial")
        self.bsdf = self.nodes.new("ShaderNodeBsdfPrincipled")
        _input(self.bsdf, "Roughness").default_value = 0.85
        self.link(self.bsdf.outputs["BSDF"], _input(self.out, "Surface"))
        coords = self.nodes.new("ShaderNodeTexCoord")
        self.object = coords.outputs["Object"]
        self.geometry = self.nodes.new("ShaderNodeNewGeometry")

    def link(self, a, b):
        self.links.new(a, b)

    def noise(self, scale, detail=3.0, vector=None, roughness=0.5):
        n = self.nodes.new("ShaderNodeTexNoise")
        _input(n, "Scale").default_value = scale
        _input(n, "Detail").default_value = detail
        _input(n, "Roughness").default_value = roughness
        self.link(vector or self.object, _input(n, "Vector"))
        return _output(n, "Factor")

    def voronoi(self, scale, vector=None, output="Distance", randomness=1.0, feature="F1"):
        v = self.nodes.new("ShaderNodeTexVoronoi")
        v.feature = feature
        _input(v, "Scale").default_value = scale
        _input(v, "Randomness").default_value = randomness
        self.link(vector or self.object, _input(v, "Vector"))
        return _output(v, output)

    def warped(self, scale, strength):
        """Coordonnées de l'objet décalées par un bruit : casse la régularité d'un motif."""
        n = self.nodes.new("ShaderNodeTexNoise")
        _input(n, "Scale").default_value = scale
        self.link(self.object, _input(n, "Vector"))
        centered = self.nodes.new("ShaderNodeVectorMath")
        centered.operation = "MULTIPLY_ADD"
        self.link(_output(n, "Color"), centered.inputs[0])
        centered.inputs[1].default_value = (strength, strength, strength)
        centered.inputs[2].default_value = (-strength / 2, -strength / 2, -strength / 2)
        moved = self.nodes.new("ShaderNodeVectorMath")
        moved.operation = "ADD"
        self.link(self.object, moved.inputs[0])
        self.link(centered.outputs[0], moved.inputs[1])
        return moved.outputs[0]

    def stretched(self, x, y, z):
        """Position dans la scène étirée par axe (fibres du bois, allongées le long des planches).
        La position du monde, et non de l'objet : chaque planche a ainsi son propre motif."""
        m = self.nodes.new("ShaderNodeVectorMath")
        m.operation = "MULTIPLY"
        self.link(_output(self.geometry, "Position"), m.inputs[0])
        m.inputs[1].default_value = (x, y, z)
        return m.outputs[0]

    def wave(self, scale, direction="X", distortion=4.0, vector=None, detail=2.0):
        w = self.nodes.new("ShaderNodeTexWave")
        w.wave_type = "BANDS"
        w.bands_direction = direction
        _input(w, "Scale").default_value = scale
        _input(w, "Distortion").default_value = distortion
        _input(w, "Detail").default_value = detail
        self.link(vector or self.object, _input(w, "Vector"))
        return _output(w, "Factor")

    def height(self, top, bottom):
        """Hauteur de l'objet ramenée de [top, bottom] à [0, 1] (0 en haut)."""
        xyz = self.nodes.new("ShaderNodeSeparateXYZ")
        self.link(self.object, _input(xyz, "Vector"))
        m = self.nodes.new("ShaderNodeMapRange")
        _input(m, "From Min", "VALUE").default_value = top
        _input(m, "From Max", "VALUE").default_value = bottom
        self.link(_output(xyz, "Z"), _input(m, "Value", "VALUE"))
        return _output(m, "Result", "VALUE")

    def ramp(self, fac, stops):
        """Rampe : [(position, nom de couleur ou niveau de gris), …]."""
        r = self.nodes.new("ShaderNodeValToRGB")
        elements = r.color_ramp.elements
        while len(elements) < len(stops):
            elements.new(0.5)
        for element, (pos, color) in zip(elements, stops):
            element.position = pos
            element.color = (color, color, color, 1) if isinstance(color, float) else rgba(color)
        self.link(fac, _input(r, "Factor"))
        return _output(r, "Color")

    def mask(self, fac, start, end):
        """Masque en niveaux de gris : 0 avant `start`, 1 après `end` (ou l'inverse si start > end)."""
        return self.ramp(fac, [(min(start, end), 0.0 if start < end else 1.0),
                               (max(start, end), 1.0 if start < end else 0.0)])

    def times(self, a, b):
        """Produit de deux valeurs (masque atténué, ou masque croisé avec un autre)."""
        m = self.nodes.new("ShaderNodeMath")
        m.operation = "MULTIPLY"
        first, second = m.inputs[0], m.inputs[1]
        self.link(a, first)
        if isinstance(b, float):
            second.default_value = b
        else:
            self.link(b, second)
        return m.outputs[0]

    def mix(self, fac, a, b, blend="MIX"):
        m = self.nodes.new("ShaderNodeMix")
        m.data_type = "RGBA"
        m.blend_type = blend
        if isinstance(fac, float):
            _input(m, "Factor", "VALUE").default_value = fac
        else:
            self.link(fac, _input(m, "Factor", "VALUE"))
        for socket, value in ((_input(m, "A", "RGBA"), a), (_input(m, "B", "RGBA"), b)):
            if isinstance(value, str):
                socket.default_value = rgba(value)
            else:
                self.link(value, socket)
        return _output(m, "Result", "RGBA")

    def wear(self, color, strength=0.25):
        """Creux un peu plus sombres (poussière), arêtes un peu plus claires (usure)."""
        pointiness = _output(self.geometry, "Pointiness")
        cavity = self.ramp(pointiness, [(0.42, 0.55), (0.5, 1.0)])
        color = self.mix(strength, color, cavity, "MULTIPLY")
        edges = self.ramp(pointiness, [(0.5, 0.0), (0.6, 0.35)])
        return self.mix(strength, color, edges, "SCREEN")

    def shore(self, color, image, extent=3.6):
        """Rive et fond de l'eau, lus dans une image vue du dessus qui couvre [-extent, extent]²."""
        mapped = self.nodes.new("ShaderNodeVectorMath")
        mapped.operation = "MULTIPLY_ADD"
        self.link(self.object, mapped.inputs[0])
        mapped.inputs[1].default_value = (0.5 / extent, 0.5 / extent, 0.0)
        mapped.inputs[2].default_value = (0.5, 0.5, 0.0)
        tex = self.nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.extension = "EXTEND"
        self.link(mapped.outputs[0], _input(tex, "Vector"))
        channels = self.nodes.new("ShaderNodeSeparateColor")
        self.link(_output(tex, "Color"), channels.inputs[0])
        color = self.mix(self.times(channels.outputs[0], 0.7), color, "grass-wet")
        return self.mix(channels.outputs[1], color, "mud")

    def bump(self, height, strength, distance=0.02):
        b = self.nodes.new("ShaderNodeBump")
        _input(b, "Strength").default_value = strength
        _input(b, "Distance").default_value = distance
        self.link(height, _input(b, "Height"))
        self.link(_output(b, "Normal"), _input(self.bsdf, "Normal"))

    def finish(self, color, roughness=0.85, emission=None, strength=0.0):
        self.link(color, _input(self.bsdf, "Base Color"))
        _input(self.bsdf, "Roughness").default_value = roughness
        if emission:
            _input(self.bsdf, "Emission Color").default_value = rgba(emission)
            _input(self.bsdf, "Emission Strength").default_value = strength
        return self.mat


def _cached(key, build):
    if key not in _cache:
        _cache[key] = build()
    return _cache[key]


def grass(shore=None, extent=3.6, vivid=False):
    """Herbe de prairie. `shore` (image vue du dessus : rouge = rive, vert = sous l'eau, qui couvre
    [-extent, extent]²) assombrit l'herbe humide au bord de l'eau et met de la vase sous l'eau, que
    l'on devine par transparence. `vivid` : verts plus clairs et saturés (cartes de région)."""
    def build():
        g = Graph("herbe-rive" if shore else "herbe")
        tone = ("vivid-dark", "vivid", "vivid-light", "vivid-tip", "vivid-dry", "vivid-moss") if vivid else (
            "grass-dark", "grass", "grass-light", "grass-tip", "grass-dry", "moss")
        dark, mid, light, tip, dry_c, moss = tone
        color = g.ramp(g.noise(1.6, 6), [(0.32, dark), (0.5, mid), (0.7, light)])
        dry = g.mask(g.noise(0.7, 3), 0.56, 0.72)
        color = g.mix(g.times(dry, 0.6), color, dry_c)
        clover = g.mask(g.voronoi(9.0), 0.16, 0.05)
        color = g.mix(g.times(clover, 0.45), color, moss)
        # Détail fin : touffes de taille moyenne, puis brins serrés.
        tufts = g.ramp(g.noise(14.0, 4), [(0.3, dark), (0.65, tip)])
        color = g.mix(0.3, color, tufts, "OVERLAY")
        blades = g.noise(55.0, 2)
        color = g.mix(0.3, color, g.ramp(blades, [(0.3, dark), (0.75, tip)]), "OVERLAY")
        if shore:
            color = g.shore(color, shore, extent)
        g.bump(blades, 0.45, 0.015)
        return g.finish(g.wear(color, 0.15), 0.95)
    return _cached(f"herbe-rive-{extent}-{vivid}" if shore else f"herbe-{vivid}", build)


def soil(top=0.0, bottom=-3.9):
    """Dessous de l'île : sol sombre sous l'herbe, strates d'argile plus ou moins claires, taches
    rousses et grises, fissures, cailloux de plusieurs tailles, racines, et une terre de plus en
    plus sombre vers la pointe."""
    def build():
        g = Graph("terre")
        depth = g.height(top, bottom)
        color = g.ramp(depth, [(0.0, "topsoil"), (0.06, "dirt"), (0.38, "clay"), (0.72, "dirt-dark"),
                               (1.0, "earth-deep")])
        # Strates : de larges bandes ondulées, et de fines couches claires d'argile.
        strata = g.ramp(g.wave(2.4, "Z", 7.0), [(0.25, "dirt-dark"), (0.55, "dirt"), (0.85, "dirt-light")])
        color = g.mix(0.4, color, strata, "OVERLAY")
        seams = g.ramp(g.wave(3.2, "Z", 5.0), [(0.0, 0.0), (0.86, 0.0), (0.95, 1.0)])
        seams = g.times(seams, g.mask(g.noise(1.1, 2), 0.45, 0.6))
        color = g.mix(g.times(seams, 0.4), color, "clay-light")
        # Taches de terre rousse et de terre grise, sur de grandes zones.
        patches = g.noise(0.9, 3)
        color = g.mix(g.times(g.mask(patches, 0.58, 0.72), 0.5), color, "earth-red")
        color = g.mix(g.times(g.mask(patches, 0.4, 0.28), 0.35), color, "earth-grey")
        grain = g.noise(18.0, 5)
        color = g.mix(0.3, color, g.ramp(grain, [(0.35, "dirt-dark"), (0.65, "dirt-light")]), "OVERLAY")
        # Fissures : bords de cellules de Voronoï déformées, fines, et seulement par endroits.
        cracks = g.mask(g.voronoi(2.6, g.warped(1.8, 0.6), feature="DISTANCE_TO_EDGE"), 0.022, 0.0)
        cracks = g.times(cracks, g.mask(g.noise(1.4, 3), 0.52, 0.66))
        color = g.mix(g.times(cracks, 0.7), color, "earth-deep")
        # Cailloux : une cellule sur trois, en deux tailles.
        stone = g.ramp(g.noise(9.0, 3), [(0.35, "rock-dark"), (0.6, "rock"), (0.8, "rock-light")])
        pebbles = None
        for scale, radius in ((4.5, 0.2), (11.0, 0.24)):
            picked = g.mask(g.voronoi(scale, output="Color"), 0.62, 0.66)
            pebble = g.times(picked, g.mask(g.voronoi(scale), radius, radius - 0.06))
            color = g.mix(pebble, color, stone)
            pebbles = pebble if pebbles is None else g.mix(0.5, pebbles, pebble, "ADD")
        roots = g.ramp(g.noise(3.2, 6), [(0.485, 0.0), (0.5, 1.0), (0.515, 0.0)])
        fine_roots = g.ramp(g.noise(7.0, 6), [(0.492, 0.0), (0.5, 1.0), (0.508, 0.0)])
        color = g.mix(g.times(roots, 0.7), color, "root")
        fine_roots = g.times(fine_roots, g.mask(g.noise(0.8, 2), 0.5, 0.62))
        color = g.mix(g.times(fine_roots, 0.5), color, "root")
        relief = g.mix(0.5, g.mix(0.5, grain, pebbles, "ADD"), roots, "SUBTRACT")
        relief = g.mix(0.6, relief, cracks, "SUBTRACT")
        g.bump(relief, 0.9, 0.035)
        return g.finish(g.wear(color, 0.35), 0.95)
    return _cached("terre", build)


def meadow():
    """Herbe des cartes de région, vue de plus près que celle de l'île : moins de grandes taches,
    plus de grain. Les touffes qui ondulent sont ajoutées par l'app."""
    def build():
        g = Graph("herbe-bande")
        color = g.ramp(g.noise(3.2, 6), [(0.3, "grass-dark"), (0.52, "grass"), (0.72, "grass-light")])
        tufts = g.ramp(g.noise(16.0, 4), [(0.3, "grass-dark"), (0.65, "grass-tip")])
        color = g.mix(0.4, color, tufts, "OVERLAY")
        dry = g.mask(g.noise(0.8, 3), 0.56, 0.72)
        color = g.mix(g.times(dry, 0.5), color, "grass-dry")
        clover = g.mask(g.voronoi(11.0), 0.16, 0.05)
        color = g.mix(g.times(clover, 0.4), color, "moss")
        blades = g.noise(95.0, 2)
        color = g.mix(0.35, color, g.ramp(blades, [(0.3, "grass-dark"), (0.75, "grass-tip")]), "OVERLAY")
        g.bump(g.mix(0.5, blades, g.noise(16.0, 3), "ADD"), 0.55, 0.018)
        return g.finish(g.wear(color, 0.15), 0.95)
    return _cached("herbe-bande", build)


def bark():
    """Écorce sombre des troncs."""
    def build():
        g = Graph("ecorce")
        grain = g.ramp(g.wave(1.2, "Z", 5.0, detail=4), [(0.2, "wood-dark"), (0.6, "dirt"), (0.95, "wood-dark")])
        color = g.mix(0.3, grain, g.ramp(g.noise(30.0, 2), [(0.4, "earth-deep"), (0.62, "dirt-light")]), "OVERLAY")
        g.bump(g.noise(30.0, 2), 0.4, 0.012)
        return g.finish(g.wear(color, 0.3), 0.85)
    return _cached("ecorce", build)


def masonry(name, stone, light, mortar, cylindrical=False, scale=6.0, row=0.35, width=0.9):
    """Maçonnerie (pierres, briques, tuiles) : briques de deux tons, joints en creux. Sur un objet
    rond (`cylindrical`), le motif suit le tour ; sinon il court sur les faces verticales d'un pavé."""
    def build():
        g = Graph(f"maconnerie-{name}")
        xyz = g.nodes.new("ShaderNodeSeparateXYZ")
        g.link(g.object, _input(xyz, "Vector"))
        if cylindrical:
            angle = g.nodes.new("ShaderNodeMath")
            angle.operation = "ARCTAN2"
            g.link(_output(xyz, "Y"), angle.inputs[0])
            g.link(_output(xyz, "X"), angle.inputs[1])
            around = g.times(angle.outputs[0], 0.3)
        else:
            across = g.nodes.new("ShaderNodeMath")
            across.operation = "ADD"
            g.link(_output(xyz, "X"), across.inputs[0])
            g.link(_output(xyz, "Y"), across.inputs[1])
            around = across.outputs[0]
        vector = g.nodes.new("ShaderNodeCombineXYZ")
        g.link(around, _input(vector, "X"))
        g.link(_output(xyz, "Z"), _input(vector, "Y"))
        brick = g.nodes.new("ShaderNodeTexBrick")
        g.link(vector.outputs[0], _input(brick, "Vector"))
        _input(brick, "Scale").default_value = scale
        _input(brick, "Mortar Size").default_value = 0.02
        _input(brick, "Mortar Smooth").default_value = 0.2
        _input(brick, "Brick Width").default_value = width
        _input(brick, "Row Height").default_value = row
        _input(brick, "Color1").default_value = rgba(stone)
        _input(brick, "Color2").default_value = rgba(light)
        _input(brick, "Mortar").default_value = rgba(mortar)
        color = _output(brick, "Color")
        grain = g.noise(30.0, 3)
        color = g.mix(0.25, color, g.ramp(grain, [(0.35, mortar), (0.65, light)]), "OVERLAY")
        g.bump(g.mix(0.7, _output(brick, "Factor"), grain, "ADD"), 0.6, 0.012)
        return g.finish(g.wear(color, 0.35), 0.85)
    return _cached(f"maconnerie-{name}", build)


def rock(color_name="rock"):
    def build():
        g = Graph(f"pierre-{color_name}")
        facets = g.ramp(g.voronoi(3.0), [(0.0, "rock-light"), (0.5, color_name), (0.95, "rock-dark")])
        grain = g.noise(14.0, 4)
        color = g.mix(0.3, facets, g.ramp(grain, [(0.4, "rock-dark"), (0.62, "rock-light")]), "OVERLAY")
        lichen = g.mask(g.noise(5.0, 3), 0.62, 0.7)
        color = g.mix(g.times(lichen, 0.35), color, "moss")
        g.bump(grain, 0.5, 0.02)
        return g.finish(g.wear(color, 0.35), 0.8)
    return _cached(f"pierre-{color_name}", build)


def wood():
    def build():
        g = Graph("bois")
        grain = g.ramp(g.wave(1.4, "X", 3.0, detail=4), [(0.2, "wood"), (0.6, "wood-light"), (0.95, "wood")])
        fibres = g.noise(28.0, 2)
        color = g.mix(0.3, grain, g.ramp(fibres, [(0.4, "wood-dark"), (0.62, "wood-light")]), "OVERLAY")
        g.bump(fibres, 0.25, 0.01)
        return g.finish(g.wear(color, 0.3), 0.7)
    return _cached("bois", build)


def plank():
    """Planche du panneau « Ta quête » : fibres allongées, veines irrégulières, quelques nœuds."""
    def build():
        g = Graph("planche")
        fibres = g.stretched(0.35, 7.0, 1.0)
        streaks = g.stretched(0.12, 2.2, 1.0)
        tone = g.ramp(g.noise(1.6, 3, streaks), [(0.3, "plank-dark"), (0.55, "plank"), (0.8, "plank-light")])
        grain = g.noise(2.2, 8, fibres, roughness=0.6)
        color = g.mix(0.45, tone, g.ramp(grain, [(0.3, "plank-dark"), (0.7, "plank-light")]), "OVERLAY")
        veins = g.ramp(g.noise(3.0, 5, streaks), [(0.44, 0.0), (0.5, 1.0), (0.56, 0.0)])
        color = g.mix(g.times(veins, 0.7), color, "plank-dark")
        knots = g.mask(g.voronoi(0.9, g.stretched(0.9, 2.2, 1.0)), 0.07, 0.025)
        color = g.mix(g.times(knots, 0.9), color, "plank-dark")
        g.bump(g.mix(0.6, grain, veins, "SUBTRACT"), 0.45, 0.01)
        return g.finish(g.wear(color, 0.35), 0.6)
    return _cached("planche", build)


def leaves(tone="grass"):
    def build():
        g = Graph(f"feuillage-{tone}")
        clusters = g.voronoi(18.0)
        base = g.ramp(g.noise(3.0, 5), [(0.35, "grass-dark"), (0.58, tone), (0.8, "grass-light")])
        lit = g.ramp(g.voronoi(18.0, output="Color"), [(0.3, "grass-dark"), (0.7, tone), (0.95, "grass-tip")])
        color = g.mix(0.45, base, lit, "OVERLAY")
        color = g.mix(g.times(g.mask(clusters, 0.55, 0.85), 0.5), color, "grass-dark")
        g.bump(g.mask(clusters, 0.8, 0.1), 0.9, 0.03)
        return g.finish(g.wear(color, 0.2), 0.9)
    return _cached(f"feuillage-{tone}", build)


def paint(color_name, light_name=None):
    """Objet peint : teinte mate légèrement irrégulière, micro-relief, arêtes un peu usées."""
    def build():
        g = Graph(f"peinture-{color_name}")
        light = light_name or "white"
        color = g.ramp(g.noise(4.0, 3), [(0.25, color_name), (0.75, color_name), (1.0, light)])
        speckle = g.noise(40.0, 2)
        color = g.mix(0.08, color, g.ramp(speckle, [(0.3, 0.0), (0.7, 1.0)]), "OVERLAY")
        g.bump(speckle, 0.08, 0.005)
        return g.finish(g.wear(color, 0.35), 0.55)
    return _cached(f"peinture-{color_name}", build)


def metal():
    def build():
        g = Graph("metal")
        brushed = g.noise(3.0, 2, roughness=0.3)
        color = g.ramp(brushed, [(0.3, "metal-dark"), (0.7, "metal")])
        # La cuisson ne garde que la lumière diffuse : métal non « metallic », mais clair et satiné.
        return g.finish(g.wear(color, 0.45), 0.4)
    return _cached("metal", build)


def crystal(color_name):
    def build():
        g = Graph(f"cristal-{color_name}")
        color = g.ramp(g.voronoi(6.0), [(0.0, "white"), (0.3, color_name), (1.0, color_name)])
        return g.finish(color, 0.3, emission=color_name, strength=0.6)
    return _cached(f"cristal-{color_name}", build)


def water():
    """Eau immobile (image de repli) : bleu profond et brillant, qui reflète le ciel."""
    def build():
        g = Graph("eau")
        color = g.ramp(g.noise(3.0, 2), [(0.3, "water"), (0.8, "water-light")])
        g.bump(g.noise(18.0, 2), 0.15, 0.005)
        return g.finish(color, 0.08)
    return _cached("eau", build)


def waterfall(bottom):
    """Cascade (image de repli) : eau claire, de plus en plus transparente jusqu'à `bottom`."""
    def build():
        g = Graph("cascade")
        g.finish(g.ramp(g.noise(6.0, 2), [(0.3, "water-light"), (0.9, "white")]), 0.2)
        fade = g.nodes.new("ShaderNodeMixShader")
        clear = g.nodes.new("ShaderNodeBsdfTransparent")
        g.link(g.height(0.0, bottom), fade.inputs[0])
        g.link(g.bsdf.outputs["BSDF"], fade.inputs[1])
        g.link(clear.outputs[0], fade.inputs[2])
        g.link(fade.outputs[0], _input(g.out, "Surface"))
        return g.mat
    return _cached("cascade", build)


def flat(color_name):
    """Couleur simple (petits détails : graduations, points des dés, fleurs)."""
    def build():
        g = Graph(f"aplat-{color_name}")
        return g.finish(g.ramp(g.noise(5.0), [(0.0, color_name), (1.0, color_name)]), 0.7)
    return _cached(f"aplat-{color_name}", build)


def assign(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)
    return obj
