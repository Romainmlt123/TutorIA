"""
Range les sprites des points de niveau (node_sprites.py) dans les assets de l'app, en WebP, et écrit le
module TypeScript qui les importe (un require() statique par image, comme Metro l'exige).

Usage (Python du système, avec Pillow) :
    python3 -I tools/explorer-3d/sprite_pack.py <dossier de node_sprites.py> assets/explorer/sprites \\
        src/features/explorer/tiles/sprites.generated.ts
"""
import json
import os
import sys

from PIL import Image

QUALITY = 90


def main(src, out, module):
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(src, "sprites.json")) as f:
        info = json.load(f)
    base = os.path.relpath(os.path.abspath(out), os.path.dirname(os.path.abspath(module))).replace(os.sep, "/")
    lines = [
        "/*",
        " * FICHIER GÉNÉRÉ — ne pas modifier à la main.",
        " * Sprites des points de niveau : tools/explorer-3d/node_sprites.py puis sprite_pack.py.",
        " */",
        "import type { NodeSprites } from './types';",
        "",
        "export const nodeSprites: NodeSprites = {",
        f"  ppm: {json.dumps(info['ppm'])},",
    ]
    total = 0
    for name, sprite in info["sprites"].items():
        file = sprite["file"].replace(".png", ".webp")
        with Image.open(os.path.join(src, sprite["file"])) as image:
            image.convert("RGBA").save(os.path.join(out, file), "WEBP", quality=QUALITY, method=6, alpha_quality=100)
        total += os.path.getsize(os.path.join(out, file))
        key = name if name.isidentifier() else json.dumps(name)
        lines.append(
            f"  {key}: {{ width: {sprite['width']}, height: {sprite['height']}, anchor: {json.dumps(sprite['anchor'])},"
            f" radius: {sprite['radius']}, source: require('{base}/{file}') }},")
    lines.append("};")
    with open(module, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"{len(info['sprites'])} sprites, {total} octets")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
