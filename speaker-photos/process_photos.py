#!/usr/bin/env python3
"""
Speaker photo downloader + standardizer for the 29-30 July workshop list.

Usage (run on a machine with normal internet access):

    pip install pillow requests
    python process_photos.py download     # fetch what can be fetched automatically
    python process_photos.py process      # standardize everything in photos_raw/
    python process_photos.py sheet        # build a contact-sheet PDF for review

Workflow:
  1. `download` reads manifest.csv. For rows whose source_url points to a normal
     web page it downloads the page, extracts the og:image / largest portrait
     image and saves it to photos_raw/NN_Name.jpg. LinkedIn URLs are skipped
     (login wall) and listed at the end — open them in a logged-in browser and
     save the profile photo manually into photos_raw/ using the same NN_Name.jpg
     naming.
  2. `process` takes every image in photos_raw/ and produces photos_final/ with
     uniform 10x15 cm portraits (1181x1772 px @ 300 DPI), identical color
     treatment (gray-world white balance, matched brightness, gentle contrast,
     unified saturation) so the whole set looks consistent.
  3. `sheet` renders contact_sheet.pdf so you can quickly verify identities.

Naming convention in photos_raw/:  <no>_<Name>.jpg   e.g.  05_Edward_Kwakwa.jpg
"""

import csv
import io
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps, ImageEnhance

BASE = Path(__file__).resolve().parent
RAW = BASE / "photos_raw"
FINAL = BASE / "photos_final"
MANIFEST = BASE / "manifest.csv"

# 10 x 15 cm at 300 DPI
TARGET_W, TARGET_H = 1181, 1772
DPI = (300, 300)
JPEG_QUALITY = 92
# Fraction of the crop height kept above center — portraits look best when the
# crop favors the top of the source image (faces sit in the upper third).
TOP_BIAS = 0.35

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def slugify(name: str) -> str:
    tr = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
    s = name.translate(tr)
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")
    return s


def read_manifest():
    with open(MANIFEST, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def extract_image_url(html: str, base_url: str) -> str | None:
    """Pick og:image first, else the largest-looking <img> src."""
    from urllib.parse import urljoin

    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if not m:
        m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.I)
    if m:
        return urljoin(base_url, m.group(1))

    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I)
    candidates = [u for u in imgs if not re.search(r"(logo|icon|sprite|banner|flag|\.svg)", u, re.I)]
    return urljoin(base_url, candidates[0]) if candidates else None


def cmd_download():
    import requests

    RAW.mkdir(exist_ok=True)
    manual = []
    for row in read_manifest():
        url = row["source_url"].strip()
        name = f'{int(row["no"]):02d}_{slugify(row["name"])}'
        out = RAW / f"{name}.jpg"
        if out.exists():
            continue
        if not url:
            manual.append((row["no"], row["name"], "kaynak yok - manuel arama gerekli"))
            continue
        if "linkedin.com" in url:
            manual.append((row["no"], row["name"], url))
            continue
        try:
            r = requests.get(url, headers=UA, timeout=30)
            r.raise_for_status()
            ctype = r.headers.get("content-type", "")
            if ctype.startswith("image/"):
                img_bytes = r.content
            else:
                img_url = extract_image_url(r.text, url)
                if not img_url:
                    manual.append((row["no"], row["name"], f"{url} (sayfada resim bulunamadi)"))
                    continue
                img_bytes = requests.get(img_url, headers=UA, timeout=30).content
            img = Image.open(io.BytesIO(img_bytes))
            if img.width < 200 or img.height < 200:
                manual.append((row["no"], row["name"], f"{url} (resim cok kucuk: {img.size})"))
                continue
            img.convert("RGB").save(out, "JPEG", quality=95)
            print(f"OK   {out.name}  {img.size}  <- {url}")
        except Exception as e:
            manual.append((row["no"], row["name"], f"{url} ({e})"))

    if manual:
        print("\n--- Manuel islem gereken kisiler (fotografi photos_raw/ altina NN_Isim.jpg olarak kaydedin) ---")
        for no, name, why in manual:
            print(f"  {no:>2}  {name}: {why}")


def gray_world_balance(img: Image.Image) -> Image.Image:
    """Neutralize color casts so all photos share the same tone."""
    r, g, b = img.split()
    means = [max(1.0, sum(c.histogram()[i] * i for i in range(256)) / (img.width * img.height)) for c in (r, g, b)]
    gray = sum(means) / 3
    channels = [c.point([min(255, int(i * gray / m)) for i in range(256)]) for c, m in zip((r, g, b), means)]
    return Image.merge("RGB", channels)


def match_brightness(img: Image.Image, target_mean: float = 135.0) -> Image.Image:
    hist = img.convert("L").histogram()
    mean = sum(i * h for i, h in enumerate(hist)) / max(1, sum(hist))
    factor = max(0.7, min(1.4, target_mean / max(1.0, mean)))
    return ImageEnhance.Brightness(img).enhance(factor)


def standardize(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img).convert("RGB")

    # Crop to 2:3 with the window biased toward the top (faces).
    ratio = TARGET_W / TARGET_H
    w, h = img.size
    if w / h > ratio:  # too wide -> crop sides
        new_w = int(h * ratio)
        x0 = (w - new_w) // 2
        img = img.crop((x0, 0, x0 + new_w, h))
    else:  # too tall -> crop top/bottom, keep upper part
        new_h = int(w / ratio)
        y0 = int((h - new_h) * TOP_BIAS)
        img = img.crop((0, y0, w, y0 + new_h))

    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    # Uniform color treatment.
    img = gray_world_balance(img)
    img = match_brightness(img)
    img = ImageOps.autocontrast(img, cutoff=1)
    img = ImageEnhance.Color(img).enhance(0.95)      # tame oversaturated sources
    img = ImageEnhance.Sharpness(img).enhance(1.05)  # slight lift after resize
    return img


def cmd_process():
    FINAL.mkdir(exist_ok=True)
    files = sorted(p for p in RAW.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    if not files:
        sys.exit(f"photos_raw/ bos - once 'download' calistirin veya fotograflari elle ekleyin: {RAW}")
    for p in files:
        out = FINAL / (p.stem + ".jpg")
        img = standardize(Image.open(p))
        img.save(out, "JPEG", quality=JPEG_QUALITY, dpi=DPI)
        print(f"OK  {out.name}  ({TARGET_W}x{TARGET_H}px = 10x15cm @300dpi)")
    print(f"\n{len(files)} fotograf standartlastirildi -> {FINAL}")


def cmd_sheet():
    from PIL import ImageDraw

    files = sorted(FINAL.glob("*.jpg"))
    if not files:
        sys.exit("photos_final/ bos - once 'process' calistirin.")
    cols, thumb_w = 5, 300
    thumb_h = int(thumb_w * TARGET_H / TARGET_W)
    cell_h = thumb_h + 40
    rows = -(-len(files) // cols)
    sheet = Image.new("RGB", (cols * (thumb_w + 20) + 20, rows * cell_h + 20), "white")
    draw = ImageDraw.Draw(sheet)
    for i, p in enumerate(files):
        x = 20 + (i % cols) * (thumb_w + 20)
        y = 20 + (i // cols) * cell_h
        sheet.paste(Image.open(p).resize((thumb_w, thumb_h)), (x, y))
        draw.text((x, y + thumb_h + 6), p.stem.replace("_", " "), fill="black")
    out = BASE / "contact_sheet.pdf"
    sheet.save(out, "PDF", resolution=100)
    print(f"Kontrol sayfasi: {out}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    {"download": cmd_download, "process": cmd_process, "sheet": cmd_sheet}.get(
        cmd, lambda: sys.exit(__doc__)
    )()
