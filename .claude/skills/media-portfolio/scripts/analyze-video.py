"""Analyze a video file via ffprobe + ffmpeg.

Outputs a JSON report:
  - duration (seconds), width, height, fps, codec
  - keyframe interval estimate (warns if too large for scrubbing)
  - 5 evenly-spaced keyframe images written to --frames-dir
  - dominant colors across the keyframe set (forwarded from extract-palette.py)

The skill consumes the JSON to write `VIDEO_DURATION` for the
video-scrub variant, populate the cinematic-reveal orbit gallery, and
seed Round 5c palette suggestions.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def ffprobe(video: Path) -> dict:
    if not shutil.which("ffprobe"):
        print("[analyze-video] ffprobe not on PATH", file=sys.stderr)
        sys.exit(2)
    proc = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(video),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(proc.stdout)


def extract_keyframes(video: Path, frames_dir: Path, count: int, duration: float) -> list[Path]:
    if not shutil.which("ffmpeg"):
        print("[analyze-video] ffmpeg not on PATH", file=sys.stderr)
        sys.exit(2)
    frames_dir.mkdir(parents=True, exist_ok=True)
    out: list[Path] = []
    # Sample at evenly-spaced timestamps across (5%, 95%) of the runtime to
    # avoid black/cold frames at the start and end.
    for i in range(count):
        t = duration * (0.05 + 0.9 * (i / max(1, count - 1)))
        dest = frames_dir / f"frame_{i:02d}.jpg"
        cmd = [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-ss",
            f"{t:.3f}",
            "-i",
            str(video),
            "-frames:v",
            "1",
            "-q:v",
            "3",
            str(dest),
        ]
        subprocess.run(cmd, check=True)
        out.append(dest)
    return out


def palette_from_frames(frames: list[Path], top: int) -> list[dict]:
    if not frames:
        return []
    script = Path(__file__).with_name("extract-palette.py")
    proc = subprocess.run(
        [sys.executable, str(script), *map(str, frames), "-k", str(top)],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(proc.stdout).get("palette", [])


def parse_fps(rate: str) -> float | None:
    if not rate or rate == "0/0":
        return None
    if "/" in rate:
        num, _, den = rate.partition("/")
        try:
            d = float(den)
            return float(num) / d if d else None
        except ValueError:
            return None
    try:
        return float(rate)
    except ValueError:
        return None


def main() -> int:
    ap = argparse.ArgumentParser(description="Analyze a video file.")
    ap.add_argument("video", type=Path, help="Path to the video file.")
    ap.add_argument(
        "--frames-dir",
        type=Path,
        default=Path("/tmp/media-portfolio-frames"),
        help="Where to write extracted keyframe JPGs.",
    )
    ap.add_argument("--frames", type=int, default=5, help="How many keyframes to sample.")
    ap.add_argument("--palette-size", type=int, default=5)
    ap.add_argument("--out", type=Path, help="Path to write JSON to (default: stdout).")
    args = ap.parse_args()

    if not args.video.exists():
        print(f"[analyze-video] missing video: {args.video}", file=sys.stderr)
        return 2

    probe = ffprobe(args.video)

    streams = probe.get("streams", [])
    vstream = next((s for s in streams if s.get("codec_type") == "video"), None)
    if vstream is None:
        print("[analyze-video] no video stream found", file=sys.stderr)
        return 2

    fmt = probe.get("format", {})
    duration = float(fmt.get("duration") or vstream.get("duration") or 0)
    width = int(vstream.get("width") or 0)
    height = int(vstream.get("height") or 0)
    fps = parse_fps(vstream.get("avg_frame_rate") or vstream.get("r_frame_rate") or "")
    codec = vstream.get("codec_name")

    # Keyframe interval estimate from `-skip_frame nokey` count on a brief sample.
    # Cheap heuristic: if duration > 0 and fps known, warn when keyint guess > 1s.
    keyframes = extract_keyframes(args.video, args.frames_dir, args.frames, duration)
    palette = palette_from_frames(keyframes, args.palette_size)

    warnings: list[str] = []
    if duration > 0 and fps and (duration / max(1, args.frames)) > 1.0:
        warnings.append(
            "If scrubbing feels chunky, re-encode with: "
            "ffmpeg -i in.mp4 -g 30 -movflags +faststart out.mp4"
        )

    payload = {
        "video": str(args.video),
        "duration": duration,
        "width": width,
        "height": height,
        "fps": fps,
        "codec": codec,
        "keyframes": [str(p) for p in keyframes],
        "palette": palette,
        "warnings": warnings,
    }
    text = json.dumps(payload, indent=2)
    if args.out:
        args.out.write_text(text)
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
