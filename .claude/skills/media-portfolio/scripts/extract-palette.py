"""Pull dominant colors from one or more images via k-means.

Used by both analyze-model.py (texture files referenced by an OBJ) and
analyze-video.py (ffmpeg keyframes). Output is a JSON list of hex codes
ranked by total coverage across the input set.

Tries scikit-learn first; falls back to a numpy-only median-cut if
sklearn isn't installed in the environment running the skill.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def load_pixels(paths: list[Path], max_pixels_per_image: int = 50000):
    from PIL import Image
    import numpy as np

    chunks = []
    for p in paths:
        try:
            with Image.open(p) as im:
                im = im.convert("RGB")
                pix = np.asarray(im, dtype=np.uint8).reshape(-1, 3)
                if pix.shape[0] > max_pixels_per_image:
                    idx = np.random.default_rng(seed=0).choice(
                        pix.shape[0], max_pixels_per_image, replace=False
                    )
                    pix = pix[idx]
                chunks.append(pix)
        except Exception as exc:  # noqa: BLE001
            print(f"[extract-palette] skipping {p}: {exc}", file=sys.stderr)
    if not chunks:
        return None
    import numpy as np
    return np.concatenate(chunks, axis=0)


def kmeans_palette(pixels, k: int):
    try:
        from sklearn.cluster import MiniBatchKMeans
    except ImportError:
        return median_cut_palette(pixels, k)

    model = MiniBatchKMeans(n_clusters=k, n_init=4, random_state=0, batch_size=2048)
    labels = model.fit_predict(pixels)
    centers = model.cluster_centers_.astype(int)
    counts = [int((labels == i).sum()) for i in range(k)]
    return [(tuple(centers[i].tolist()), counts[i]) for i in range(k)]


def median_cut_palette(pixels, k: int):
    """Fallback when sklearn is unavailable. Recursive median-cut."""
    import numpy as np

    boxes = [pixels]
    while len(boxes) < k:
        boxes.sort(key=lambda b: -(b.max(0) - b.min(0)).max())
        biggest = boxes.pop(0)
        if biggest.shape[0] < 2:
            boxes.append(biggest)
            break
        spread = biggest.max(0) - biggest.min(0)
        axis = int(spread.argmax())
        sorted_box = biggest[biggest[:, axis].argsort()]
        mid = sorted_box.shape[0] // 2
        boxes.append(sorted_box[:mid])
        boxes.append(sorted_box[mid:])
    return [(tuple(int(c) for c in b.mean(axis=0)), int(b.shape[0])) for b in boxes]


def to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def main() -> int:
    ap = argparse.ArgumentParser(description="Extract dominant colors from images.")
    ap.add_argument("images", nargs="+", type=Path, help="Image file paths.")
    ap.add_argument("-k", "--top", type=int, default=5, help="How many colors to return.")
    ap.add_argument("--out", type=Path, help="Optional JSON path; defaults to stdout.")
    args = ap.parse_args()

    pixels = load_pixels([p for p in args.images if p.exists()])
    if pixels is None or len(pixels) == 0:
        print("[extract-palette] no readable images supplied", file=sys.stderr)
        return 2

    palette = kmeans_palette(pixels, args.top)
    palette.sort(key=lambda x: -x[1])
    total = sum(c for _, c in palette) or 1
    out = [
        {"hex": to_hex(rgb), "rgb": list(rgb), "coverage": round(c / total, 4)}
        for rgb, c in palette
    ]

    payload = json.dumps({"palette": out}, indent=2)
    if args.out:
        args.out.write_text(payload)
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
