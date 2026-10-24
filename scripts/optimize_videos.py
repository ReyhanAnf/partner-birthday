"""Transcode every exclusive/*.mp4 into a lightweight web copy under public/media/exclusive.

- Max 720px on the long edge, H.264 CRF 28, AAC 96k, +faststart for instant streaming.
- Writes a JPEG poster (first second) next to each video: <name>.poster.jpg
- Prints JSON metadata (width, height, duration) for the asset manifest.
Original files are never modified.
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "exclusive"
DST = ROOT / "public" / "media" / "exclusive"


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    data = json.loads(out)
    s = data["streams"][0]
    return {"width": s["width"], "height": s["height"], "duration": round(float(data["format"]["duration"]), 1)}


def main():
    DST.mkdir(parents=True, exist_ok=True)
    meta = {}
    for src in sorted(SRC.glob("*.mp4")):
        dst = DST / src.name
        poster = DST / (src.stem + ".poster.jpg")
        marker = DST / (src.stem + ".optimized")
        if not marker.exists():
            print(f"[optimize-videos] Transcoding {src.name} ...", flush=True)
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
                "-vf", "scale='if(gt(iw,ih),min(720,iw),-2)':'if(gt(iw,ih),-2,min(720,ih))'",
                "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(dst),
            ], check=True)
            subprocess.run([
                "ffmpeg", "-y", "-loglevel", "error", "-ss", "0.5", "-i", str(dst),
                "-frames:v", "1", "-q:v", "4", str(poster),
            ], check=True)
            marker.write_text("ok", encoding="utf-8")
        info = probe(dst)
        info["sizeBytes"] = dst.stat().st_size
        meta[src.name] = info
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
