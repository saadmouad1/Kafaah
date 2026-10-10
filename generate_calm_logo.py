import os
import math
from PIL import Image, ImageDraw

os.makedirs('kafaah/public/images', exist_ok=True)

# ==============================================================================
# 1. CALM, MINIMALIST & PRESTIGIOUS LOGO ICON (SVG)
# Concept: A serene circular seal. An elegant, continuous curved monogram of 
# the Arabic letter 'ك' (Kaf) intertwined with an academic graduation ring / seal.
# Colors: Calm Academic Emerald (#0d9488 / #059669) & Warm Champagne Gold (#d97706 / #f59e0b).
# Pure Quiet Luxury. No jagged stars, no rainbow noise.
# ==============================================================================
calm_icon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Soft Pearl Background -->
    <linearGradient id="bgPearl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- Calm Royal Emerald Gradient -->
    <linearGradient id="calmEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="40%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>

    <!-- Warm Champagne Gold Gradient -->
    <linearGradient id="warmGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Very Soft Minimalist Shadow -->
    <filter id="calmShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.06"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0d9488" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Base Smooth Squircle in Pure White -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgPearl)" stroke="#e2e8f0" stroke-width="1.5" filter="url(#calmShadow)"/>

  <!-- Calm Outer Ring of Accreditation (ختم الاعتماد) -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#f1f5f9" stroke-width="8"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="url(#calmEmerald)" stroke-width="3" stroke-linecap="round" stroke-dasharray="800 200"/>
  <circle cx="256" cy="256" r="162" fill="none" stroke="url(#warmGold)" stroke-width="1.5" opacity="0.6"/>

  <!-- THE ICONIC CALM MONOGRAM: HARMONIOUS ARABIC 'ك' (KAF) EMBLEM -->
  <!-- Upper Ascender & Arch of Kaf -->
  <path d="M 330 145 C 330 145, 230 145, 185 190 C 145 230, 145 285, 185 325 C 220 360, 310 365, 345 365" 
        fill="none" 
        stroke="url(#calmEmerald)" 
        stroke-width="26" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>

  <!-- Central Intersecting Golden Feather / S-Curve of Knowledge & Mastery -->
  <path d="M 210 256 C 245 220, 275 220, 310 256 C 340 288, 305 325, 260 325" 
        fill="none" 
        stroke="url(#warmGold)" 
        stroke-width="18" 
        stroke-linecap="round"/>

  <!-- Golden Diamond Star Diacritic (نقطة الكفاءة والتميز) -->
  <g transform="translate(325, 175) rotate(45)">
    <rect x="-14" y="-14" width="28" height="28" rx="6" fill="url(#warmGold)"/>
  </g>

  <!-- Subtle Laurel Leaves at the Base (هادئ ورمزي) -->
  <g fill="url(#warmGold)" opacity="0.85">
    <ellipse cx="230" cy="385" rx="5" ry="12" transform="rotate(-65 230 385)"/>
    <ellipse cx="256" cy="392" rx="5" ry="12" transform="rotate(0 256 392)"/>
    <ellipse cx="282" cy="385" rx="5" ry="12" transform="rotate(65 282 385)"/>
  </g>
</svg>
'''

with open('kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(calm_icon_svg)

with open('kafaah/public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(calm_icon_svg)

# ==============================================================================
# 2. CALM HORIZONTAL BRAND LOGO (SVG)
# ==============================================================================
calm_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 130" width="680" height="130">
  <defs>
    <!-- Calm Royal Emerald Gradient -->
    <linearGradient id="calmEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="50%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>

    <!-- Warm Champagne Gold Gradient -->
    <linearGradient id="warmGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- EMBLEM SYMBOL ON RIGHT (RTL First) -->
  <g transform="translate(560, 10) scale(0.21)">
    <!-- Base Squircle -->
    <rect x="24" y="24" width="464" height="464" rx="112" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
    <circle cx="256" cy="256" r="180" fill="none" stroke="url(#calmEmerald)" stroke-width="8"/>
    <circle cx="256" cy="256" r="162" fill="none" stroke="url(#warmGold)" stroke-width="3" opacity="0.6"/>

    <!-- Monogram Kaf -->
    <path d="M 330 145 C 330 145, 230 145, 185 190 C 145 230, 145 285, 185 325 C 220 360, 310 365, 345 365" 
          fill="none" 
          stroke="url(#calmEmerald)" 
          stroke-width="28" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>

    <path d="M 210 256 C 245 220, 275 220, 310 256 C 340 288, 305 325, 260 325" 
          fill="none" 
          stroke="url(#warmGold)" 
          stroke-width="20" 
          stroke-linecap="round"/>

    <!-- Diamond Star -->
    <g transform="translate(325, 175) rotate(45)">
      <rect x="-16" y="-16" width="32" height="32" rx="7" fill="url(#warmGold)"/>
    </g>

    <!-- Laurel Leaves -->
    <g fill="url(#warmGold)">
      <ellipse cx="230" cy="385" rx="6" ry="14" transform="rotate(-65 230 385)"/>
      <ellipse cx="256" cy="392" rx="6" ry="14" transform="rotate(0 256 392)"/>
      <ellipse cx="282" cy="385" rx="6" ry="14" transform="rotate(65 282 385)"/>
    </g>
  </g>

  <!-- ARABIC BRAND TITLE IN SERENE CHARCOAL SLATE -->
  <text x="540" y="62" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="44" 
        font-weight="900" 
        text-anchor="end" 
        fill="#0f172a" 
        letter-spacing="0.5">
    كـفـاءة
  </text>

  <!-- GOLDEN ACCENT DIAMOND ABOVE KAF -->
  <g transform="translate(548, 28) rotate(45)">
    <rect x="-4.5" y="-4.5" width="9" height="9" rx="2" fill="url(#warmGold)"/>
  </g>

  <!-- ACCREDITATION BADGE (SUBTLE, CALM, MINIMALIST) -->
  <rect x="235" y="36" width="135" height="24" rx="12" fill="#f0fdfa" stroke="#0d9488" stroke-width="1"/>
  <text x="302" y="52" 
        font-family="'Cairo', sans-serif" 
        font-size="11" 
        font-weight="800" 
        text-anchor="middle" 
        fill="#0f766e">
    الاعتماد والتأهيل المهني
  </text>

  <!-- ARABIC SUBTITLE (CALM & DIGNIFIED) -->
  <text x="540" y="94" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="13.5" 
        font-weight="700" 
        text-anchor="end" 
        fill="#475569">
    المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني
  </text>

  <!-- LATIN SUBTITLE -->
  <text x="540" y="112" 
        font-family="'Inter', sans-serif" 
        font-size="10" 
        font-weight="800" 
        text-anchor="end" 
        letter-spacing="2.2" 
        fill="#0d9488">
    KAFA'AH • PROFESSIONAL LICENSURE
  </text>
</svg>
'''

with open('kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(calm_logo_svg)

# ==============================================================================
# 3. RASTER ICONS VIA PILLOW (CALM MONOGRAM 512x512)
# ==============================================================================
S = 2048
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

pad = 120
rad = 440
# Pure White Squircle
draw.rounded_rectangle([pad, pad, S - pad, S - pad], radius=rad, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=12)

cx, cy = S // 2, S // 2

# Serene Emerald Ring
draw.ellipse([cx - 700, cy - 700, cx + 700, cy + 700], outline=(13, 148, 136, 255), width=32)
draw.ellipse([cx - 630, cy - 630, cx + 630, cy + 630], outline=(245, 158, 11, 140), width=10)

# Monogram Curved Arc (Kaf Upper)
draw.arc([cx - 500, cy - 500, cx + 200, cy + 300], start=135, end=360, fill=(13, 148, 136, 255), width=90)
# Kaf Base Line
draw.line([(cx - 280, cy + 380), (cx + 340, cy + 380)], fill=(13, 148, 136, 255), width=90)

# Central Golden Arch
draw.arc([cx - 200, cy - 150, cx + 300, cy + 250], start=45, end=270, fill=(245, 158, 11, 255), width=75)

# Diamond Dot
diamond_pts = [
    (cx + 280, cy - 300),
    (cx + 350, cy - 230),
    (cx + 280, cy - 160),
    (cx + 210, cy - 230),
]
draw.polygon(diamond_pts, fill=(245, 158, 11, 255))

# Laurel Leaves Base
draw.ellipse([cx - 160, cy + 480, cx - 80, cy + 540], fill=(245, 158, 11, 240))
draw.ellipse([cx - 40, cy + 500, cx + 40, cy + 560], fill=(245, 158, 11, 255))
draw.ellipse([cx + 80, cy + 480, cx + 160, cy + 540], fill=(245, 158, 11, 240))

icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('kafaah/public/kafaah-icon.png', 'PNG')

icon_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save('kafaah/public/apple-touch-icon.png', 'PNG')

icon_512.save('kafaah/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

print("Generated calm professional logo and icons successfully!")
