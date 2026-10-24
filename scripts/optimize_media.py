import os
import shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_MEDIA = ROOT / "public" / "media"
MARKER = PUBLIC_MEDIA / ".optimized_v1"

COLLECTIONS = [
    ("exclusive", "exclusive"),
    ("isha", "isha"),
    ("reyhan&isha", "reyhan_isha"),
]

MAX_DIM = 960
JPEG_QUALITY = 78


def remove_existing_junction_or_dir(p: Path):
    if not p.exists() and not p.is_symlink():
        return
    try:
        # On Windows, directory junctions can be removed cleanly with os.rmdir
        os.rmdir(p)
        print(f"[optimize-media] Removed junction: {p}")
    except OSError:
        shutil.rmtree(p, ignore_errors=True)


def process_single_file(task):
    src_path, dst_path = task
    ext = src_path.suffix.lower()
    if ext in (".mp4", ".webm"):
        if not dst_path.exists():
            shutil.copy2(src_path, dst_path)
        return src_path.stat().st_size, dst_path.stat().st_size

    try:
        with Image.open(src_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            w, h = img.size
            if max(w, h) > MAX_DIM:
                if w >= h:
                    new_w = MAX_DIM
                    new_h = max(1, int(h * (MAX_DIM / w)))
                else:
                    new_h = MAX_DIM
                    new_w = max(1, int(w * (MAX_DIM / h)))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            img.save(dst_path, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        return src_path.stat().st_size, dst_path.stat().st_size
    except Exception as e:
        print(f"[optimize-media] Fallback copy for {src_path.name}: {e}")
        shutil.copy2(src_path, dst_path)
        return src_path.stat().st_size, dst_path.stat().st_size


def main():
    if MARKER.exists():
        print("[optimize-media] Optimized media cache already up to date.")
        return

    PUBLIC_MEDIA.mkdir(parents=True, exist_ok=True)

    # First safely unlink any directory junctions in public/media
    for _, dst_name in COLLECTIONS + [("reyhan&isha", "reyhan&isha")]:
        remove_existing_junction_or_dir(PUBLIC_MEDIA / dst_name)

    tasks = []
    for src_name, dst_name in COLLECTIONS:
        src_dir = ROOT / src_name
        dst_dir = PUBLIC_MEDIA / dst_name
        dst_dir.mkdir(parents=True, exist_ok=True)
        for item in src_dir.iterdir():
            if item.is_file():
                tasks.append((item, dst_dir / item.name))

    print(f"[optimize-media] Optimizing {len(tasks)} media assets for fast web delivery...")
    orig_total = 0
    opt_total = 0

    with ThreadPoolExecutor(max_workers=8) as pool:
        for orig_sz, opt_sz in pool.map(process_single_file, tasks):
            orig_total += orig_sz
            opt_total += opt_sz

    # Also create backward-compatible junction public/media/reyhan&isha -> public/media/reyhan_isha
    alias_link = PUBLIC_MEDIA / "reyhan&isha"
    alias_target = PUBLIC_MEDIA / "reyhan_isha"
    if not alias_link.exists():
        try:
            import _winapi
            _winapi.CreateJunction(str(alias_target), str(alias_link))
        except Exception:
            shutil.copytree(alias_target, alias_link, dirs_exist_ok=True)

    MARKER.write_text("optimized=true\n", encoding="utf-8")
    print(
        f"[optimize-media] Done! Reduced payload from {orig_total / 1024 / 1024:.2f} MB "
        f"to {opt_total / 1024 / 1024:.2f} MB ({100 - (opt_total / max(1, orig_total) * 100):.1f}% smaller)."
    )


if __name__ == "__main__":
    main()
