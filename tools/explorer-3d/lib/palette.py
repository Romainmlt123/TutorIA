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
    # objets peints, tons adoucis
    "blue": "#3d63a0", "blue-light": "#7c9cc8", "violet": "#6b5a96", "violet-light": "#a397c2",
    "cyan": "#3f8a8e", "cyan-light": "#86b8b6", "pink": "#c47b89", "pink-light": "#dca9b2",
    "yellow": "#d4ae4c", "orange": "#c47a3e", "green-toy": "#5f8f5c", "white": "#ebe5d8",
    "metal": "#a8acb0", "metal-dark": "#62666b", "graphite": "#34322f",
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
