"""
Découpe le pré-rendu d'une carte de région (region_tiles.py) en tuiles WebP pour l'app, avec une
sous-couche basse résolution et le manifeste de la carte.

- Tuiles de TILE px du rendu, chacune avec BLEED px de recouvrement de chaque côté : agrandies par
  l'écran, deux tuiles voisines ne laissent pas de joint visible.
- Les tuiles entièrement transparentes (ciel) ne sont pas écrites : l'app dessine le ciel.
- Sous-couche : l'image entière au quart, posée sous les tuiles pour qu'aucun trou n'apparaisse.

Usage (Python du système, avec Pillow) :
    python3 -I tools/explorer-3d/tile_map.py <dossier de region_tiles.py> <dossier de sortie> [<module TS>]
Avec <module TS> (par exemple src/features/explorer/tiles/maths-nombres.generated.ts), écrit aussi le module
que l'app importe : un require() statique par image, comme Metro l'exige.
Sortie : <sortie>/<col>-<ligne>.webp, <sortie>/sous-couche.webp, <sortie>/manifest.json, et, si la passe des
planches miel a tourné (segments.json), <sortie>/troncon-<i>.webp : le chemin parcouru, tronçon par tronçon.
"""
import json
import os
import sys

from PIL import Image

TILE = 512
BLEED = 1
QUALITY = 80
UNDERLAY_FACTOR = 4
UNDERLAY_QUALITY = 70


def assemble(src):
    with open(os.path.join(src, "crops.json")) as f:
        info = json.load(f)
    image = Image.new("RGBA", (info["width"], info["height"]), (0, 0, 0, 0))
    for crop in info["crops"]:
        with Image.open(os.path.join(src, crop["file"])) as part:
            image.paste(part.convert("RGBA"), (crop["x"], crop["y"]))
    return info, image


def save_webp(image, path, quality):
    image.save(path, "WEBP", quality=quality, method=6, alpha_quality=100)
    return os.path.getsize(path)


def main(src, out):
    os.makedirs(out, exist_ok=True)
    info, image = assemble(src)
    width, height = image.size
    alpha = image.getchannel("A")
    tiles, total = [], 0
    for row in range((height + TILE - 1) // TILE):
        for col in range((width + TILE - 1) // TILE):
            left, top = col * TILE - BLEED, row * TILE - BLEED
            box = (max(left, 0), max(top, 0), min(left + TILE + 2 * BLEED, width), min(top + TILE + 2 * BLEED, height))
            if alpha.crop(box).getextrema()[1] == 0:
                continue
            name = f"{col}-{row}.webp"
            size = save_webp(image.crop(box), os.path.join(out, name), QUALITY)
            total += size
            tiles.append({"col": col, "row": row, "file": name, "x": box[0], "y": box[1],
                          "width": box[2] - box[0], "height": box[3] - box[1], "bytes": size})
    underlay = image.resize((max(width // UNDERLAY_FACTOR, 1), max(height // UNDERLAY_FACTOR, 1)), Image.LANCZOS)
    underlay_bytes = save_webp(underlay, os.path.join(out, "sous-couche.webp"), UNDERLAY_QUALITY)
    manifest = {
        "version": 1,
        "regionId": info["regionId"],
        "ppm": info["ppm"],
        "elevation": info["elevation"],
        "x0": round(info["x0"], 6),
        "v0": round(info["v0"], 6),
        "width": width,
        "height": height,
        "tile": TILE,
        "bleed": BLEED,
        "layoutHash": info.get("layoutHash"),
        "underlay": {"file": "sous-couche.webp", "factor": UNDERLAY_FACTOR},
        "tiles": [{k: t[k] for k in ("col", "row", "file", "x", "y", "width", "height")} for t in tiles],
    }
    segments_path = os.path.join(src, "segments.json")
    if os.path.exists(segments_path):
        with open(segments_path) as f:
            segments = json.load(f)
        if (segments["width"], segments["height"], segments["layoutHash"]) != (width, height, info.get("layoutHash")):
            raise SystemExit("planches miel rendues pour une autre zone ou une autre disposition que le sol")
        manifest["doneSegments"] = []
        for segment in segments["segments"]:
            name = segment["file"].replace(".png", ".webp")
            with Image.open(os.path.join(src, segment["file"])) as part:
                total += save_webp(part.convert("RGBA"), os.path.join(out, name), QUALITY)
            manifest["doneSegments"].append({**{k: segment[k] for k in ("gap", "x", "y", "width", "height")},
                                             "file": name})
    with open(os.path.join(out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1)
    pixels = width * height
    print(f"{len(tiles)} tuiles, {total} octets ({total * 8 / pixels:.3f} bit/px sur {pixels / 1e6:.2f} Mpx),"
          f" sous-couche {underlay_bytes} octets")


def write_module(manifest, out, module):
    """Module TypeScript généré : le manifeste et un require() par tuile, sous-couche et tronçon."""
    base = os.path.relpath(os.path.abspath(out), os.path.dirname(os.path.abspath(module))).replace(os.sep, "/")

    def source(file):
        return f"require('{base}/{file}')"

    def entry(item, keys):
        fields = ", ".join(f"{k}: {json.dumps(item[k])}" for k in keys)
        return f"    {{ {fields}, source: {source(item['file'])} }},"
    lines = [
        "/*",
        " * FICHIER GÉNÉRÉ — ne pas modifier à la main.",
        f" * Carte pré-rendue de la région {manifest['regionId']} : tools/explorer-3d/region_tiles.py puis tile_map.py.",
        " */",
        "import type { MapTiles } from './types';",
        "",
        "export const tiles: MapTiles = {",
    ]
    for key in ("version", "regionId", "ppm", "elevation", "x0", "v0", "width", "height", "tile", "bleed", "layoutHash"):
        lines.append(f"  {key}: {json.dumps(manifest[key])},")
    underlay = manifest["underlay"]
    lines.append(f"  underlay: {{ factor: {underlay['factor']}, source: {source(underlay['file'])} }},")
    lines.append("  tiles: [")
    lines += [entry(t, ("col", "row", "x", "y", "width", "height")) for t in manifest["tiles"]]
    lines.append("  ],")
    lines.append("  doneSegments: [")
    lines += [entry(t, ("gap", "x", "y", "width", "height")) for t in manifest.get("doneSegments", [])]
    lines.append("  ],")
    lines.append("};")
    with open(module, "w") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
    if len(sys.argv) == 4:
        with open(os.path.join(sys.argv[2], "manifest.json")) as f:
            write_module(json.load(f), sys.argv[2], sys.argv[3])
