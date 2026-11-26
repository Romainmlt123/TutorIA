"""Assemble un terrain de contexte basse résolution pour une carte pré-rendue."""
import json
import os
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from tile_map import assemble, save_webp

MAX_BYTES = 250_000


def write_module(info, image, ppm, asset, module):
    """Écrit les métadonnées TypeScript du contexte assemblé."""
    relative = os.path.relpath(asset.resolve(), module.parent.resolve()).replace(os.sep, "/")
    lines = [
        "/*",
        " * FICHIER GÉNÉRÉ — ne pas modifier à la main.",
        f" * Terrain de contexte de la région {info['regionId']} : tools/explorer-3d/context_map.py.",
        " */",
        "import type { MapContext } from './types';",
        "",
        "export const context: MapContext = {",
        f"  ppm: {json.dumps(ppm)},",
        f"  x0: {json.dumps(round(info['x0'], 6))},",
        f"  v0: {json.dumps(round(info['v0'], 6))},",
        f"  width: {image.width},",
        f"  height: {image.height},",
        f"  source: require('{relative}'),",
        "};",
    ]
    module.parent.mkdir(parents=True, exist_ok=True)
    module.write_text("\n".join(lines) + "\n")


def main(source, region_id):
    """Assemble une image basse résolution et ses métadonnées TypeScript."""
    source = Path(source)
    if not source.is_dir():
        raise SystemExit(f"dossier de rendu introuvable : {source}")
    if not region_id or any(char not in "abcdefghijklmnopqrstuvwxyz0123456789-" for char in region_id):
        raise SystemExit(f"identifiant de région invalide : {region_id}")
    info, image = assemble(source)
    if info["regionId"] != region_id:
        raise SystemExit(f"région rendue {info['regionId']} différente de {region_id}")
    assembled = source / "terrain-assemble.png"
    image.save(assembled)

    asset = ROOT / "assets" / "explorer" / "tiles" / region_id / "contexte.webp"
    asset.parent.mkdir(parents=True, exist_ok=True)
    output = image
    divisor = 1
    size = save_webp(output, asset, 70)
    while size > MAX_BYTES and min(output.size) > 256:
        divisor *= 2
        output = image.resize(
            (max(1, image.width // divisor), max(1, image.height // divisor)),
            Image.Resampling.LANCZOS,
        )
        size = save_webp(output, asset, 70)
    if size > MAX_BYTES:
        raise SystemExit(f"contexte trop lourd : {size} octets (maximum {MAX_BYTES})")
    module = ROOT / "src" / "features" / "explorer" / "tiles" / f"{region_id}.context.generated.ts"
    ppm = info["ppm"] / divisor
    write_module(info, output, int(ppm) if ppm.is_integer() else ppm, asset, module)
    print(assembled)
    print(f"{asset.relative_to(ROOT)} : {size} octets")
    print(module.relative_to(ROOT))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage : python3 -I tools/explorer-3d/context_map.py <dossier rendu> <id>")
    main(sys.argv[1], sys.argv[2])
