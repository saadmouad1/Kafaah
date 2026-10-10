import math
from PIL import Image, ImageDraw

def render_master_icon():
    # Render at 1024x1024 for maximum vector-like precision
    dim = 1024
    img = Image.new("RGBA", (dim, dim), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # 1. Soft Pure White Card with gentle border
    pad = 48
    radius = 224
    card_rect = [pad, pad, dim - pad, dim - pad]
    draw.rounded_rectangle(card_rect, radius=radius, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=5)

    cx, cy = dim // 2, dim // 2

    # 2. Concentric Official Accreditation Rings
    # Outer subtle ring
    r_outer = 380
    draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], outline=(241, 245, 249, 255), width=24)

    # Emerald dashed accent ring
    r_mid = 352
    num_dashes = 48
    for i in range(num_dashes):
        start_angle = i * (360 / num_dashes)
        end_angle = start_angle + (360 / num_dashes) * 0.5
        draw.arc([cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid], start=start_angle, end=end_angle, fill=(5, 150, 105, 180), width=5)

    # Inner Gold Hairline Ring
    r_gold = 324
    draw.ellipse([cx - r_gold, cy - r_gold, cx + r_gold, cy + r_gold], outline=(217, 119, 6, 220), width=4)

    # 4 Cardinal Dots
    dot_dist = 324
    dot_r = 8
    for angle in [0, 90, 180, 270]:
        rad = math.radians(angle)
        dx = cx + dot_dist * math.cos(rad)
        dy = cy + dot_dist * math.sin(rad)
        draw.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=(217, 119, 6, 255))

    # 3. Foundation Pedestal (Book of Knowledge / Arch Base)
    base_pts = [
        (cx - 190, cy + 230),
        (cx - 100, cy + 250),
        (cx + 100, cy + 250),
        (cx + 190, cy + 230),
        (cx + 180, cy + 204),
        (cx, cy + 156),
        (cx - 180, cy + 204),
    ]
    draw.polygon(base_pts, fill=(5, 150, 105, 255))

    # Gold line across base
    draw.line([(cx - 140, cy + 200), (cx + 140, cy + 200)], fill=(245, 158, 11, 240), width=6)

    # 4. Central Majestic Wings / Crest of Kaf (ك)
    # Right curve
    draw.arc([cx - 160, cy - 160, cx + 160, cy + 100], start=160, end=380, fill=(4, 120, 87, 255), width=28)
    # Inner gold ascent
    draw.arc([cx - 90, cy - 100, cx + 90, cy + 60], start=180, end=360, fill=(217, 119, 6, 255), width=14)

    # Central torch/spine
    draw.line([(cx, cy - 180), (cx, cy + 20)], fill=(245, 158, 11, 255), width=12)

    # 5. Top Star of Accreditation (8-point geometric star)
    star_cy = cy - 260
    star_r1 = 40
    star_r2 = 14
    star_pts = []
    for i in range(16):
        r = star_r1 if i % 2 == 0 else star_r2
        a = math.radians(i * (360 / 16) - 90)
        star_pts.append((cx + r * math.cos(a), star_cy + r * math.sin(a)))
    draw.polygon(star_pts, fill=(245, 158, 11, 255))
    draw.ellipse([cx - 8, star_cy - 8, cx + 8, star_cy + 8], fill=(255, 255, 255, 255))

    return img

master_img = render_master_icon()

# Downsample with Lanczos
icon_512 = master_img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('d:/professional_practice_exam/kafaah/public/kafaah-icon.png')

icon_180 = master_img.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save('d:/professional_practice_exam/kafaah/public/apple-touch-icon.png')

icon_32 = master_img.resize((32, 32), Image.Resampling.LANCZOS)
icon_32.save('d:/professional_practice_exam/kafaah/public/favicon.ico', format='ICO')

print("All raster icons downsampled and saved flawlessly!")
