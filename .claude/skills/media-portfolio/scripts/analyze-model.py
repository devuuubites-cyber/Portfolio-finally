"""Analyze an OBJ + MTL model.

Outputs a JSON report:
  - bounding boxes per material
  - recommended camera waypoints along the dominant traversal axis
  - dominant texture colors (forwarded from extract-palette.py)
  - the MTL's referenced texture files

The skill consumes the JSON to write `src/lib/cameraPath.ts`, identify
sky materials, and seed the palette suggestions for Round 5c.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def parse_obj(obj_path: Path):
    """Return (verts, faces_by_material). verts is a list of (x,y,z); faces_by_material is dict[mat -> list[list[int]]]."""
    verts: list[tuple[float, float, float]] = []
    faces: dict[str, list[list[int]]] = {}
    cur_mat = "default"
    with obj_path.open() as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            tag, _, rest = line.partition(" ")
            if tag == "v":
                xyz = rest.split()
                verts.append((float(xyz[0]), float(xyz[1]), float(xyz[2])))
            elif tag == "usemtl":
                cur_mat = rest.strip()
                faces.setdefault(cur_mat, [])
            elif tag == "f":
                idx = []
                for tok in rest.split():
                    # token is like "v/vt/vn" — first field is the vertex index (1-based).
                    first = tok.split("/")[0]
                    if first:
                        idx.append(int(first) - 1)
                if idx:
                    faces.setdefault(cur_mat, []).append(idx)
    return verts, faces


def material_bboxes(verts, faces):
    out = {}
    for mat, face_list in faces.items():
        if not face_list:
            continue
        used = sorted({i for face in face_list for i in face})
        if not used:
            continue
        xs = [verts[i][0] for i in used]
        ys = [verts[i][1] for i in used]
        zs = [verts[i][2] for i in used]
        out[mat] = {
            "min": [min(xs), min(ys), min(zs)],
            "max": [max(xs), max(ys), max(zs)],
            "vertices": len(used),
        }
    return out


def parse_mtl(mtl_path: Path):
    """Return list of dicts: name + texture file references."""
    if not mtl_path.exists():
        return []
    materials = []
    cur = None
    with mtl_path.open() as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            tag, _, rest = line.partition(" ")
            if tag == "newmtl":
                if cur:
                    materials.append(cur)
                cur = {"name": rest.strip(), "textures": []}
            elif tag in ("map_Kd", "map_Ka", "map_Bump", "map_Ks"):
                if cur is None:
                    continue
                # MTL map lines can have flags (-clamp on, -s 1 1 1 etc.); take last token.
                tex = rest.split()[-1]
                cur["textures"].append({"slot": tag, "file": tex})
    if cur:
        materials.append(cur)
    return materials


def recommend_waypoints(bboxes, samples: int = 7):
    """Sample the centerline of the largest-volume material along its dominant axis.

    Heuristic: the most traversable material (road, floor) tends to be the
    largest by bounding-box volume. Walk Z (or whichever axis is widest)
    and emit ~`samples` evenly spaced (cx, cy_eye, cz) waypoints.
    """
    if not bboxes:
        return []

    def volume(b):
        d = [b["max"][i] - b["min"][i] for i in range(3)]
        return d[0] * d[1] * d[2]

    biggest = max(bboxes.items(), key=lambda kv: volume(kv[1]))[1]
    spans = [biggest["max"][i] - biggest["min"][i] for i in range(3)]
    axis = int(max(range(3), key=lambda i: spans[i]))

    eye_y = biggest["min"][1] + spans[1] * 0.55  # eye-level above floor

    waypoints = []
    for s in range(samples):
        t = s / (samples - 1)
        coord_along_axis = biggest["min"][axis] + spans[axis] * t
        cross_axes = [a for a in range(3) if a not in (axis, 1)]
        # Walk the centerline of the cross axis at this slice (rough).
        cross_min = biggest["min"][cross_axes[0]]
        cross_max = biggest["max"][cross_axes[0]]
        cross = (cross_min + cross_max) * 0.5

        point = [0.0, 0.0, 0.0]
        point[axis] = coord_along_axis
        point[1] = eye_y
        point[cross_axes[0]] = cross
        waypoints.append([round(p, 3) for p in point])
    return waypoints


def palette_from_textures(textures_dir: Path | None, mtl_textures: list[dict], top: int) -> list[dict]:
    if not textures_dir or not mtl_textures:
        return []
    images: list[Path] = []
    for m in mtl_textures:
        for t in m.get("textures", []):
            cand = textures_dir / Path(t["file"]).name
            if cand.exists():
                images.append(cand)
    if not images:
        return []
    script = Path(__file__).with_name("extract-palette.py")
    try:
        proc = subprocess.run(
            [sys.executable, str(script), *map(str, images), "-k", str(top)],
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError as exc:
        print(f"[analyze-model] palette extraction failed: {exc.stderr}", file=sys.stderr)
        return []
    return json.loads(proc.stdout).get("palette", [])


SKY_NAME_HINTS = re.compile(r"sky|cloud|skybox|cubemap|backdrop", re.IGNORECASE)


def main() -> int:
    ap = argparse.ArgumentParser(description="Analyze an OBJ + MTL model.")
    ap.add_argument("obj", type=Path, help="Path to the .obj file.")
    ap.add_argument("--mtl", type=Path, help="Path to the .mtl (default: same name as obj).")
    ap.add_argument("--textures", type=Path, help="Directory with the model's texture PNGs.")
    ap.add_argument("--out", type=Path, help="Path to write JSON to (default: stdout).")
    ap.add_argument("--palette-size", type=int, default=5)
    ap.add_argument("--waypoints", type=int, default=7)
    args = ap.parse_args()

    if not args.obj.exists():
        print(f"[analyze-model] missing OBJ: {args.obj}", file=sys.stderr)
        return 2

    mtl_path = args.mtl or args.obj.with_suffix(".mtl")
    verts, faces = parse_obj(args.obj)
    bboxes = material_bboxes(verts, faces)
    mtl_materials = parse_mtl(mtl_path)

    sky_materials = [m for m in bboxes if SKY_NAME_HINTS.search(m)]

    waypoints = recommend_waypoints(bboxes, samples=args.waypoints)
    palette = palette_from_textures(args.textures, mtl_materials, args.palette_size)

    payload = {
        "obj": str(args.obj),
        "mtl": str(mtl_path) if mtl_path.exists() else None,
        "vertex_count": len(verts),
        "materials": bboxes,
        "mtl_materials": mtl_materials,
        "sky_material_names": sky_materials,
        "recommended_waypoints": waypoints,
        "palette": palette,
    }
    text = json.dumps(payload, indent=2)
    if args.out:
        args.out.write_text(text)
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
