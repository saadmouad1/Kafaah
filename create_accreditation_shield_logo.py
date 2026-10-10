import os
from PIL import Image, ImageDraw, ImageFont

# 1. Authoritative Institutional SVG Icon (NO HEART! Pure geometric shield & academic excellence)
svg_icon = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>

    <!-- Emerald Authority Gradient -->
    <linearGradient id="emeraldCrest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Warm Champagne Gold Gradient -->
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Ambient Shadow -->
    <filter id="crestShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.06"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#047857" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Base Squircle Container (Accreditation Seal) -->
  <rect x="28" y="28" width="456" height="456" rx="108" fill="url(#bgGrad)" stroke="#e2e8f0" stroke-width="2.5" filter="url(#crestShadow)"/>

  <!-- Outer Fine Geometric Rings (ختم الاعتماد المهني) -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="#f1f5f9" stroke-width="12"/>
  <circle cx="256" cy="256" r="182" fill="none" stroke="url(#emeraldCrest)" stroke-width="2" stroke-dasharray="6 6" opacity="0.45"/>
  <circle cx="256" cy="256" r="170" fill="none" stroke="url(#goldAccent)" stroke-width="1.5" opacity="0.75"/>

  <!-- 4 Accreditation Anchor Points -->
  <circle cx="256" cy="74" r="4" fill="url(#goldAccent)"/>
  <circle cx="256" cy="438" r="4" fill="url(#goldAccent)"/>
  <circle cx="74" cy="256" r="4" fill="url(#goldAccent)"/>
  <circle cx="438" cy="256" r="4" fill="url(#goldAccent)"/>

  <!-- ── CENTRAL EMBLEM: GEOMETRIC SHIELD OF COMPETENCE (درع الكفاءة والترخيص) ── -->
  <!-- Outer Dignified Shield Profile (Straight shoulders, pure geometric authority - NO HEART) -->
  <path d="M 256 128 L 362 170 C 362 278, 318 350, 256 388 C 194 350, 150 278, 150 170 Z"
        fill="none" stroke="url(#emeraldCrest)" stroke-width="12" stroke-linejoin="round"/>

  <!-- Inner Gold Inlay of Shield -->
  <path d="M 256 150 L 340 184 C 340 268, 304 326, 256 360 C 208 326, 172 268, 172 184 Z"
        fill="none" stroke="url(#goldAccent)" stroke-width="3" stroke-linejoin="round" opacity="0.85"/>

  <!-- Central Authority Spire / Pillar of Integrity -->
  <path d="M 256 170 L 256 295" stroke="url(#goldAccent)" stroke-width="7" stroke-linecap="round"/>

  <!-- Geometric Wings of Progress (صرح درجات الكفاءة) -->
  <!-- Upper Arch -->
  <path d="M 205 235 L 256 198 L 307 235" fill="none" stroke="url(#emeraldCrest)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Lower Arch -->
  <path d="M 195 275 L 256 238 L 317 275" fill="none" stroke="url(#emeraldCrest)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Foundation Pedestal (قاعدة المعايير الوطنية) -->
  <rect x="210" y="312" width="92" height="11" rx="5.5" fill="url(#emeraldCrest)"/>
  <rect x="232" y="329" width="48" height="5" rx="2.5" fill="url(#goldAccent)"/>

  <!-- Apex Accreditation Star (نجمة التميز الثمانية) -->
  <g transform="translate(256, 112)">
    <path d="M 0 -17 L 5 -5 L 17 0 L 5 5 L 0 17 L -5 5 L -17 0 L -5 -5 Z" fill="url(#goldAccent)"/>
    <circle cx="0" cy="0" r="3" fill="#ffffff"/>
  </g>

  <!-- Academic Laurel Leaves (غصنا الغار للتميز والاعتماد) -->
  <g fill="url(#emeraldCrest)" opacity="0.75">
    <path d="M 372 280 C 384 270, 396 275, 392 288 C 388 296, 378 294, 372 280 Z"/>
    <path d="M 382 312 C 394 306, 402 315, 396 325 C 390 332, 381 326, 382 312 Z"/>
    <path d="M 372 344 C 384 343, 388 355, 380 362 C 372 367, 366 357, 372 344 Z"/>

    <path d="M 140 280 C 128 270, 116 275, 120 288 C 124 296, 134 294, 140 280 Z"/>
    <path d="M 130 312 C 118 306, 110 315, 116 325 C 122 332, 131 326, 130 312 Z"/>
    <path d="M 140 344 C 128 343, 124 355, 132 362 C 140 367, 146 357, 140 344 Z"/>
  </g>
</svg>'''

# 2. Horizontal Logo SVG with crisp geometry (emblem on right in RTL)
svg_horizontal_logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 96" width="480" height="96">
  <defs>
    <linearGradient id="hEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="hGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Emblem Scaled on Right -->
  <g transform="translate(390, 8) scale(0.155)">
    <rect x="28" y="28" width="456" height="456" rx="108" fill="#ffffff" stroke="#e2e8f0" stroke-width="8"/>
    <circle cx="256" cy="256" r="195" fill="none" stroke="#f1f5f9" stroke-width="14"/>
    <circle cx="256" cy="256" r="182" fill="none" stroke="url(#hEmerald)" stroke-width="4" stroke-dasharray="8 8" opacity="0.5"/>
    <circle cx="256" cy="256" r="170" fill="none" stroke="url(#hGold)" stroke-width="3" opacity="0.8"/>
    <path d="M 256 128 L 362 170 C 362 278, 318 350, 256 388 C 194 350, 150 278, 150 170 Z"
          fill="none" stroke="url(#hEmerald)" stroke-width="24" stroke-linejoin="round"/>
    <path d="M 256 150 L 340 184 C 340 268, 304 326, 256 360 C 208 326, 172 268, 172 184 Z"
          fill="none" stroke="url(#hGold)" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 256 170 L 256 295" stroke="url(#hGold)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 205 235 L 256 198 L 307 235" fill="none" stroke="url(#hEmerald)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 195 275 L 256 238 L 317 275" fill="none" stroke="url(#hEmerald)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="210" y="312" width="92" height="22" rx="11" fill="url(#hEmerald)"/>
    <rect x="232" y="342" width="48" height="10" rx="5" fill="url(#hGold)"/>
    <g transform="translate(256, 112)">
      <path d="M 0 -28 L 8 -8 L 28 0 L 8 8 L 0 28 L -8 8 L -28 0 L -8 -8 Z" fill="url(#hGold)"/>
      <circle cx="0" cy="0" r="5" fill="#ffffff"/>
    </g>
  </g>

  <!-- Typography Right-to-Left Clean Layout -->
  <g>
    <!-- Brand Title: كـفـاءة -->
    <text x="375" y="44" 
          font-family="'Alexandria', 'Tajawal', 'IBM Plex Sans Arabic', system-ui, sans-serif" 
          font-size="30" 
          font-weight="900" 
          fill="#0f172a" 
          text-anchor="end">
      كـفـاءة
    </text>

    <!-- Calm Golden Accent Dot -->
    <circle cx="272" cy="26" r="4.5" fill="url(#hGold)"/>

    <!-- Subtle Tag Badge -->
    <rect x="156" y="20" width="105" height="23" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/>
    <text x="208" y="35.5" 
          font-family="'IBM Plex Sans Arabic', system-ui, sans-serif" 
          font-size="11" 
          font-weight="800" 
          fill="#047857" 
          text-anchor="middle">
      الاعتماد والترخيص
    </text>

    <!-- Subtitle: المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني -->
    <text x="375" y="68" 
          font-family="'IBM Plex Sans Arabic', 'Tajawal', system-ui, sans-serif" 
          font-size="12" 
          font-weight="700" 
          fill="#475569" 
          text-anchor="end">
      المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني
    </text>
  </g>
</svg>'''

# Save the SVG files to kafaah/public/
with open('kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

with open('kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_horizontal_logo)

print('SVG emblems written successfully!')

# Now let's rasterize to clean PNGs and favicon using PIL
# Draw 512x512 icon
img = Image.new('RGBA', (512, 512), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# Squircle background
draw.rounded_rectangle([28, 28, 484, 484], radius=108, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=3)

# Outer circles
draw.ellipse([56, 56, 456, 456], outline=(241, 245, 249, 255), width=10)
draw.ellipse([72, 72, 440, 440], outline=(16, 185, 129, 120), width=3)
draw.ellipse([84, 84, 428, 428], outline=(245, 158, 11, 200), width=2)

# Anchor dots
draw.ellipse([252, 70, 260, 78], fill=(245, 158, 11, 255))
draw.ellipse([252, 434, 260, 442], fill=(245, 158, 11, 255))
draw.ellipse([70, 252, 78, 260], fill=(245, 158, 11, 255))
draw.ellipse([434, 252, 442, 260], fill=(245, 158, 11, 255))

# Shield contour (pure geometric - NO HEART)
shield_pts = [(256, 128), (362, 170), (362, 278), (256, 388), (150, 278), (150, 170)]
draw.polygon(shield_pts, outline=(5, 150, 105, 255), width=12)

# Inner shield gold
inner_shield_pts = [(256, 150), (340, 184), (340, 268), (256, 360), (172, 268), (172, 184)]
draw.polygon(inner_shield_pts, outline=(245, 158, 11, 220), width=3)

# Vertical pillar
draw.line([(256, 170), (256, 295)], fill=(245, 158, 11, 255), width=7)

# Ascending Chevrons
draw.line([(205, 235), (256, 198)], fill=(5, 150, 105, 255), width=9)
draw.line([(256, 198), (307, 235)], fill=(5, 150, 105, 255), width=9)

draw.line([(195, 275), (256, 238)], fill=(5, 150, 105, 255), width=9)
draw.line([(256, 238), (317, 275)], fill=(5, 150, 105, 255), width=9)

# Foundation bar
draw.rounded_rectangle([210, 312, 302, 323], radius=6, fill=(5, 150, 105, 255))
draw.rounded_rectangle([232, 329, 280, 334], radius=3, fill=(245, 158, 11, 255))

# Apex 8-point star
star_pts = [
    (256, 95), (261, 107), (273, 112), (261, 117),
    (256, 129), (251, 117), (239, 112), (251, 107)
]
draw.polygon(star_pts, fill=(245, 158, 11, 255))
draw.ellipse([253, 109, 259, 115], fill=(255, 255, 255, 255))

# Save PNG assets
img.save('kafaah/public/kafaah-icon.png', 'PNG')
print('kafaah-icon.png 512x512 created!')

# Apple touch icon 180x180
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save('kafaah/public/apple-touch-icon.png', 'PNG')
print('apple-touch-icon.png 180x180 created!')

# Favicon 32x32
fav = img.resize((32, 32), Image.Resampling.LANCZOS)
fav.save('kafaah/public/favicon.ico', format='ICO')
print('favicon.ico 32x32 created!')
