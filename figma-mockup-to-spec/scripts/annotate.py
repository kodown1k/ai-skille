#!/usr/bin/env python3
"""Nakłada ponumerowane znaczniki na obraz makiety (wspólny słownik wizualny).

Użycie:
    python3 annotate.py <src.png> <out.png> <markers.json>

markers.json: lista obiektów {"label": "A", "fx": 0.93, "fy": 0.10}
  fx, fy = pozycja środka znacznika jako FRAKCJA szerokości/wysokości (0..1).
  Frakcje (nie piksele) => ta sama mapa działa w dowolnej rozdzielczości renderu.

Po wygenerowaniu ZAWSZE odczytaj <out.png> i popraw markery, które trafiły obok
elementu — pozycje są szacowane, więc bez weryfikacji bywają przesunięte.
"""
import json
import sys
from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]


def load_font(size):
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    if len(sys.argv) != 4:
        sys.exit("usage: annotate.py <src.png> <out.png> <markers.json>")
    src, out, markers_path = sys.argv[1:4]

    img = Image.open(src).convert("RGB")
    W, H = img.size
    draw = ImageDraw.Draw(img, "RGBA")

    with open(markers_path) as fh:
        markers = json.load(fh)

    R = max(14, int(min(W, H) * 0.018))   # promień skalowany do obrazu
    font = load_font(int(R * 1.2))

    for m in markers:
        label = str(m["label"])
        cx, cy = int(W * m["fx"]), int(H * m["fy"])
        draw.ellipse([cx - R, cy - R, cx + R, cy + R],
                     fill=(220, 38, 38, 235), outline=(255, 255, 255, 255), width=3)
        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), label,
                  fill=(255, 255, 255, 255), font=font)

    img.save(out)
    print(f"OK {out} ({W}x{H}), markerów: {len(markers)}")


if __name__ == "__main__":
    main()
