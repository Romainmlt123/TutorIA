"""
Eau et étalonnage des cartes de région pré-rendues (region_tiles.py, rewater.py), en numpy seulement.

L'eau n'est pas rendue par Cycles : la carte rend le fond (vase, rive mouillée), puis l'eau est posée
par-dessus, pixel par pixel, d'après le shader de l'app (stylized3d/water.ts) adapté à l'échelle de la
carte : fond moins profond, reflet du ciel, caustiques discrètes à deux échelles et bord adouci. Comme ce
calcul ne dépend que de la position, rewater.py peut le refaire sur des images déjà rendues, sans relancer
Cycles.
"""
import math

import numpy as np

SURFACE = 0.022  # hauteur de l'eau sur l'île (water.ts), agrandie avec la région
EDGE = 0.012  # largeur du bord fondu, en unités de l'île (≈ 7 cm sur une carte agrandie 6 fois)


def srgb_to_linear(hex_color):
    c = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def outlines(water, catmull_rom):
    """Tracé du π et de la rivière (unités de l'île), comme island_maths.py à partir de water.json."""
    o = water["pi"]["origin"]
    pi = [(o["x"] + x * o["sx"], o["z"] - y * o["sz"]) for x, y in water["pi"]["shape"]]
    river = catmull_rom([(x, z) for x, z in water["river"]["points"]], 40)
    return np.array(pi, dtype=np.float64), np.array(river, dtype=np.float64), water["river"]["width"] / 2


def pi_distance(pi, px, pz):
    """Distance signée au polygone du π (négative dedans), d'après Inigo Quilez, comme water.ts."""
    d = (px - pi[0, 0]) ** 2 + (pz - pi[0, 1]) ** 2
    sign = np.ones_like(px)
    for (ax, az), (bx, bz) in zip(pi, np.roll(pi, -1, axis=0)):
        ex, ez, wx, wz = bx - ax, bz - az, px - ax, pz - az
        h = np.clip((wx * ex + wz * ez) / (ex * ex + ez * ez), 0.0, 1.0)
        d = np.minimum(d, (wx - ex * h) ** 2 + (wz - ez * h) ** 2)
        c1, c2, c3 = pz >= az, pz < bz, ex * wz > ez * wx
        sign = np.where((c1 & c2 & c3) | (~c1 & ~c2 & ~c3), -sign, sign)
    return sign * np.sqrt(d)


def river_distance(river, px, pz):
    best = np.full_like(px, 1e3)
    for (ax, az), (bx, bz) in zip(river, river[1:]):
        ex, ez, wx, wz = bx - ax, bz - az, px - ax, pz - az
        h = np.clip((wx * ex + wz * ez) / (ex * ex + ez * ez), 0.0, 1.0)
        best = np.minimum(best, np.hypot(wx - ex * h, wz - ez * h))
    return best


def caustics(ux, uz, t=0.0):
    """Reflets au fond de l'eau (d'après Dave Hoskins), la même boucle que water.ts : motif périodique
    (une période par unité), à déformer avant usage pour ne pas voir de quadrillage."""
    tau = 2 * math.pi
    px, pz = np.mod(ux * tau, tau) - 250.0, np.mod(uz * tau, tau) - 250.0
    ix, iz = px.copy(), pz.copy()
    c = np.ones_like(px)
    for n in range(4):
        s = t * (1.0 - 3.5 / (n + 1))
        ix, iz = px + np.cos(s - ix) + np.sin(s + iz), pz + np.sin(s - iz) + np.cos(s + ix)
        c += 1.0 / np.hypot(px / (np.sin(ix + s) / 0.005), pz / (np.cos(iz + s) / 0.005))
    c = 1.17 - np.power(c / 4.0, 1.4)
    return np.clip(np.power(np.abs(c), 8.0), 0.0, 1.0)


def map_caustics(x, z):
    """Caustiques de la carte (x, z en mètres de la carte) : deux couches à des échelles et des angles
    différents, chacune déformée par une onde lente, pour casser la répétition du motif."""
    u1 = x * 2.2 + 0.6 * np.sin(z * 0.9 + 1.3)
    v1 = z * 2.2 + 0.6 * np.sin(x * 0.7 + 0.4)
    a = math.radians(37)
    rx, rz = x * math.cos(a) - z * math.sin(a), x * math.sin(a) + z * math.cos(a)
    u2 = rx * 1.37 + 0.5 * np.sin(rz * 0.6 + 2.1)
    v2 = rz * 1.37 + 0.5 * np.sin(rx * 1.1 + 0.8)
    return 0.6 * caustics(u1, v1) + 0.4 * caustics(u2, v2)


def water(x, z, scale, geometry, colors, sun, view):
    """Couleur linéaire et opacité de l'eau aux points (x, z) de la carte (mètres), et la distance au bord
    en unités de l'île (`inside`, positive dans l'eau)."""
    pi, river, half = geometry
    px, pz = x / scale, z / scale
    inside = np.maximum(-pi_distance(pi, px, pz), half - river_distance(river, px, pz))
    slope_x = np.zeros_like(px)
    slope_z = np.zeros_like(px)
    for d, k, amplitude in (((0.45, 0.9), 23.0, 0.5), ((-0.8, 0.6), 37.0, 0.3), ((0.95, -0.3), 53.0, 0.2)):
        dx, dz = np.array(d) / np.linalg.norm(d)
        wave = np.cos((px * dx + pz * dz) * k) * amplitude
        slope_x += dx * wave
        slope_z += dz * wave
    normal = np.stack([-slope_x * 0.09, np.ones_like(px), -slope_z * 0.09], axis=-1)
    normal /= np.linalg.norm(normal, axis=-1, keepdims=True)
    depth = (0.85 * smoothstep(0.0, 0.12, inside))[..., None]
    color = colors["shallow"] + (colors["deep"] - colors["shallow"]) * depth
    fresnel = np.power(1.0 - np.clip(normal @ view, 0.0, None), 4.0)[..., None]
    color = color + (colors["sky"] - color) * (0.12 + fresnel * 0.3)
    light = map_caustics(x, z)[..., None]
    color = color + colors["glow"] * light * (0.08 + (0.04 - 0.08) * depth)
    meniscus = (0.3 * (1.0 - smoothstep(0.0, 0.004, inside)))[..., None]
    color = color + (colors["foam"] - color) * meniscus
    reflected = 2.0 * (normal @ sun)[..., None] * normal - sun
    sparkle = np.power(np.clip(reflected @ view, 0.0, None), 180.0)[..., None]
    color = color + np.array([1.0, 0.97, 0.9]) * sparkle * 1.4
    return color, smoothstep(-0.004, EDGE, inside)[..., None], inside


def graded(rgba, grade, shadow_tint, light_tint, rng, dither_mask=None):
    """Étalonnage de la passe finale de Hd2dPost (saturation, ombres froides, lumières dorées, exposition)
    sur la couleur linéaire prémultipliée, puis encodage sRGB, tramé de ±1/255 contre les bandes.
    Ni halo, ni vignette, ni ciel : l'app pose le ciel. Renvoie du RGBA sRGB à alpha droit, de 0 à 1."""
    alpha = rgba[..., 3:4]
    color = rgba[..., :3] / np.maximum(alpha, 1e-4)
    luma = (color @ np.array([0.299, 0.587, 0.114], dtype=np.float32))[..., None]
    color = luma + (color - luma) * grade["saturation"]
    color = color + (color * shadow_tint - color) * ((1.0 - smoothstep(0.0, 0.4, luma)) * grade["shadowTint"])
    color = color + (color * light_tint - color) * (smoothstep(0.5, 1.0, luma) * grade["lightTint"])
    color = np.clip(color * grade["exposure"], 0.0, 1.0)
    encoded = np.where(color <= 0.0031308, color * 12.92, 1.055 * np.power(color, 1 / 2.4) - 0.055)
    noise = rng.random(encoded.shape, dtype=np.float32) - rng.random(encoded.shape, dtype=np.float32)
    if dither_mask is not None:
        noise *= np.asarray(dither_mask, dtype=np.float32)[..., None]
    encoded = np.clip(encoded + noise / 255.0, 0.0, 1.0)
    return np.concatenate([encoded, np.clip(alpha, 0.0, 1.0)], axis=-1)
