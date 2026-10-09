"""
Palette de l'île 3D, libre par rapport à la marque (validé par Romain) : des tons naturels de
maquette réaliste (herbe de prairie, terre, pierre, bois), et des objets peints aux couleurs
douces et légèrement passées. En sRGB ; converties en linéaire pour Blender.
"""

COLORS = {
    # herbe de prairie, de l'ombre à l'herbe sèche
    "grass-dark": "#3b5423", "grass": "#5b7a33", "grass-light": "#7f9a45", "grass-tip": "#a7ad63",
    "grass-dry": "#9c9258", "moss": "#4c6a2c", "grass-wet": "#2f4a1f", "mud": "#4a4030",
    # terre, du sol sous l'herbe au fond de la motte
    "topsoil": "#3f2e22", "dirt-dark": "#3a2b20", "dirt": "#654b37", "dirt-light": "#86694f",
    "clay": "#77583f", "clay-light": "#9a7c5c", "earth-deep": "#2a211b", "root": "#4b3526",
    "earth-red": "#7a4a33", "earth-grey": "#5b544d",
    # pierre
    "rock-dark": "#4a4843", "rock": "#7a766d", "rock-light": "#a7a296", "pebble": "#b2aa99",
    # bois clair, un peu vieilli
    "wood-dark": "#6a4a2e", "wood": "#a07a50", "wood-light": "#c4a57a", "ink": "#2b2520",
    # planches du panneau « Ta quête » (HUD d'Explorer), bois chaud et contrasté
    "plank-dark": "#5e3113", "plank": "#a8622a", "plank-light": "#d69050", "plank-back": "#2a170a",
    # objets peints, tons adoucis
    "blue": "#3d63a0", "blue-light": "#7c9cc8", "violet": "#6b5a96", "violet-light": "#a397c2",
    "cyan": "#3f8a8e", "cyan-light": "#86b8b6", "pink": "#c47b89", "pink-light": "#dca9b2",
    "yellow": "#d4ae4c", "orange": "#c47a3e", "green-toy": "#5f8f5c", "white": "#ebe5d8",
    "metal": "#a8acb0", "metal-dark": "#62666b", "graphite": "#34322f",
    # eau (image de repli seulement : dans l'app, l'eau est animée par un shader)
    "water": "#1f5570", "water-light": "#7fb0c4",
    # herbe vive des cartes de région : plus claire et plus saturée que celle de l'île
    "vivid-dark": "#2f6a2b", "vivid": "#4d9638", "vivid-light": "#73b04f", "vivid-tip": "#a5c86a",
    "vivid-dry": "#a3b052", "vivid-moss": "#3b8a35", "vivid-leaf": "#43a53a",
    "bush-dark": "#2d6f2e", "bush": "#3f8a3a", "bush-light": "#5aa24b",
    "crown-dark": "#2a6a30", "crown": "#3c8a3a", "crown-light": "#62a84a", "bark-brown": "#6a4a2e",
    "flower-red": "#e0524a", "flower-pink": "#ee7fa8", "flower-orange": "#f29a3a", "flower-blue": "#5b8fe8",
    "mushroom": "#d8443a", "stem": "#efe6d2",
    # monuments des cartes de région
    "terracotta": "#b5532f", "terracotta-light": "#d77a4a", "terracotta-dark": "#7d3420", "plaster": "#efe4cc",
    "plaster-light": "#faf3e2", "brass": "#c49a3c", "brass-light": "#e8c873", "brass-dark": "#8a6a22",
    "cherry": "#b8283c", "cherry-light": "#de4b5a", "cream": "#fbf3e2", "crust": "#d39345", "crust-light": "#ecc07a",
    "crust-dark": "#a8652a", "sack": "#e6dbc0", "sack-dark": "#cdb98f", "ceramic-blue": "#3b6ea8", "shutter": "#4f8a5b", "glass": "#9fcfe0",
    "stone-warm": "#c9b99c", "stone-warm-light": "#e2d6bd", "stone-warm-dark": "#8e7f68", "brick": "#a24a32",
    "brick-light": "#c5674a", "iron": "#4b4f55", "iron-light": "#7a8088",
    # fleurs des champs
    "flower-white": "#efece2", "flower-yellow": "#e3c75a", "flower-violet": "#9f8fc4",
    # lumière
    "crystal-cyan": "#6fd0d6", "crystal-violet": "#a78fd8", "crystal-blue": "#7fa9e0",
    "sun": "#fff0d4", "sky": "#a8c6ea",
}


def _linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb(name):
    h = COLORS[name].lstrip("#")
    return tuple(_linear(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4))


def rgba(name):
    return (*rgb(name), 1.0)
