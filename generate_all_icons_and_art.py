import os
import math
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('kafaah/public/images', exist_ok=True)

# -------------------------------------------------------------------------
# Supersampled App Icon (2048 -> 512, 180, 64, 32)
# -------------------------------------------------------------------------
S = 2048
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background squircle
pad = 120
rad = 440
# Dark Royal Slate Gradient simulation
for y in range(pad, S - pad):
    prog = (y - pad) / (S - 2 * pad)
    r = int(11 * (1 - prog) + 3 * prog)
    g = int(23 * (1 - prog) + 7 * prog)
    b = int(42 * (1 - prog) + 18 * prog)
    draw.line([(pad, y), (S - pad, y)], fill=(r, g, b, 255))

# Mask with squircle
mask = Image.new('L', (S, S), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([pad, pad, S - pad, S - pad], radius=rad, fill=255)
img.putalpha(mask)

# Add gold border to squircle
border_img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
border_draw = ImageDraw.Draw(border_img)
border_draw.rounded_rectangle([pad, pad, S - pad, S - pad], radius=rad, outline=(245, 158, 11, 240), width=18)
border_draw.rounded_rectangle([pad + 24, pad + 24, S - pad - 24, S - pad - 24], radius=rad - 20, outline=(56, 189, 248, 80), width=8)

img = Image.alpha_composite(img, border_img)
draw = ImageDraw.Draw(img)

# Concentric geometric circles
cx, cy = S // 2, S // 2
draw.ellipse([cx - 700, cy - 700, cx + 700, cy + 700], outline=(14, 165, 233, 40), width=6)
draw.ellipse([cx - 850, cy - 850, cx + 850, cy + 850], outline=(245, 158, 11, 25), width=6)

# Central Heraldic Shield
shield_pts = [
    (cx, cy - 580),
    (cx - 500, cy - 350),
    (cx - 480, cy + 150),
    (cx, cy + 620),
    (cx + 480, cy + 150),
    (cx + 500, cy - 350),
]
draw.polygon(shield_pts, fill=(15, 23, 42, 230), outline=(245, 158, 11, 255))

# Draw inner shield facet
draw.line([(cx, cy - 580), (cx, cy + 620)], fill=(245, 158, 11, 200), width=14)

# Asclepius Gold Staff
draw.rounded_rectangle([cx - 24, cy - 420, cx + 24, cy + 420], radius=12, fill=(245, 158, 11, 255))
draw.ellipse([cx - 65, cy - 490, cx + 65, cy - 360], fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=8)

# Star of Excellence on top
star_pts = []
for i in range(10):
    angle = i * (math.pi / 5) - math.pi / 2
    dist = 110 if i % 2 == 0 else 45
    star_pts.append((cx + dist * math.cos(angle), cy - 600 + dist * math.sin(angle)))
draw.polygon(star_pts, fill=(254, 240, 138, 255), outline=(245, 158, 11, 255))

# Medical Pulse Line (Cardiogram in Cyan)
ecg_pts = [
    (cx - 420, cy),
    (cx - 220, cy),
    (cx - 150, cy - 120),
    (cx - 90, cy + 140),
    (cx, cy - 240),
    (cx + 90, cy + 260),
    (cx + 150, cy - 100),
    (cx + 220, cy),
    (cx + 420, cy)
]
for i in range(len(ecg_pts) - 1):
    draw.line([ecg_pts[i], ecg_pts[i+1]], fill=(56, 189, 248, 255), width=24)

# Laurel Wreath Leaves (Gold)
for side in [-1, 1]:
    for i in range(7):
        prog = i / 6.0
        angle = math.radians(side * (30 + prog * 110))
        dist = 520
        leaf_x = cx + math.sin(angle) * dist
        leaf_y = cy + 120 + math.cos(prog * math.pi) * 200
        # Draw leaf oval
        draw.ellipse([leaf_x - 35, leaf_y - 70, leaf_x + 35, leaf_y + 70], fill=(245, 158, 11, 240), outline=(254, 240, 138, 255), width=4)

# Downsample to master icons
icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('kafaah/public/kafaah-icon.png', 'PNG')

icon_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save('kafaah/public/apple-touch-icon.png', 'PNG')

icon_64 = img.resize((64, 64), Image.Resampling.LANCZOS)
icon_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
icon_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
icon_512.save('kafaah/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

print("Saved raster icons: kafaah-icon.png, apple-touch-icon.png, favicon.ico")

# -------------------------------------------------------------------------
# Feature Illustrative Cards (SVG)
# -------------------------------------------------------------------------

# 1. Exam Simulator Cockpit Card (card-exam.svg)
exam_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="cBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#060e1e" />
    </linearGradient>
    <linearGradient id="accBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>

  <rect width="600" height="360" rx="20" fill="url(#cBg)" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1.5"/>
  
  <!-- Window top bar -->
  <rect width="600" height="44" rx="20" fill="rgba(30, 41, 59, 0.6)"/>
  <circle cx="28" cy="22" r="5" fill="#ef4444"/>
  <circle cx="44" cy="22" r="5" fill="#f59e0b"/>
  <circle cx="60" cy="22" r="5" fill="#10b981"/>
  
  <text x="560" y="27" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="end">
    المحاكاة الرسمية لاختبار رخصة البورد الطبي
  </text>
  <rect x="85" y="12" width="70" height="20" rx="10" fill="rgba(14, 165, 233, 0.15)"/>
  <text x="120" y="26" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">
    100 سؤال
  </text>

  <!-- Question Content Box -->
  <rect x="25" y="60" width="550" height="85" rx="14" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.07)"/>
  <text x="555" y="85" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="800" fill="#f59e0b" text-anchor="end">
    حالة سريرية (Clinical Vignette) — طب وجراحة عامة
  </text>
  <text x="555" y="108" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="13" fill="#e2e8f0" text-anchor="end">
    رجل 62 سنة مع تاريخ ارتفاع ضغط الدم يشكو من ألم صدري حاد ينتشر إلى الظهر.
  </text>
  <text x="555" y="128" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">
    الضغط بالذراع الأيمن 180/100 وبالأيسر 120/70. ما هو الفحص التشخيصي الأكثر حساسية ودقة؟
  </text>

  <!-- Choices -->
  <g transform="translate(25, 160)">
    <!-- Choice 1 -->
    <rect x="0" y="0" width="550" height="38" rx="10" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)"/>
    <text x="530" y="24" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">أ. تخطيط كهربائية القلب القياسي (12-Lead ECG)</text>
    
    <!-- Choice 2 (Selected - Correct) -->
    <rect x="0" y="46" width="550" height="38" rx="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5"/>
    <text x="530" y="70" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="800" fill="#34d399" text-anchor="end">✓ ب. أشعة مقطعية مع الصبغة للشريان الأورطي (CT Aortography) — تشخيص تمزق الأورطي</text>

    <!-- Choice 3 -->
    <rect x="0" y="92" width="550" height="38" rx="10" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)"/>
    <text x="530" y="116" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">ج. تحليل إنزيمات التروبونين القلبية بعد 8 ساعات فقط</text>

    <!-- Choice 4 -->
    <rect x="0" y="138" width="550" height="38" rx="10" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)"/>
    <text x="530" y="162" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">د. منظار الجهاز الهضمي العلوي لاستبعاد قرحة المعدة</text>
  </g>
</svg>
'''

with open('kafaah/public/images/card-exam.svg', 'w', encoding='utf-8') as f:
    f.write(exam_svg)

# 2. Osmosis High-Yield QBank Card (card-osmosis.svg)
osmosis_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="oBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <rect width="600" height="360" rx="20" fill="url(#oBg)" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1.5"/>

  <!-- Header -->
  <g transform="translate(25, 24)">
    <rect x="0" y="0" width="550" height="50" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(245, 158, 11, 0.2)"/>
    <circle cx="30" cy="25" r="16" fill="url(#gold)"/>
    <text x="30" y="30" font-family="sans-serif" font-size="14" font-weight="900" fill="#0b132b" text-anchor="middle">O</text>
    <text x="520" y="26" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="14" font-weight="900" fill="#f8fafc" text-anchor="end">بنك أوزموسيس الشامل (OSMOSIS Q-BANK &amp; High-Yield)</text>
    <text x="520" y="42" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">+64 ميجابايت من الأسئلة والرسوم التوضيحية الصيدلانية والتشريحية الدقيقة</text>
  </g>

  <!-- 3 Mini Feature Panels -->
  <g transform="translate(25, 95)">
    <!-- Box 1 -->
    <rect x="0" y="0" width="170" height="235" rx="14" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(56, 189, 248, 0.15)"/>
    <rect x="15" y="16" width="40" height="40" rx="10" fill="rgba(56, 189, 248, 0.15)"/>
    <text x="35" y="42" font-size="20" text-anchor="middle">🧬</text>
    <text x="155" y="80" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="13" font-weight="800" fill="#f1f5f9" text-anchor="end">علم الأمراض والأدوية</text>
    <text x="155" y="105" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">تغطية تامة لميكانيكية عمل</text>
    <text x="155" y="122" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">الأدوية والتأثيرات الجانبية</text>
    <text x="155" y="180" font-family="sans-serif" font-size="18" font-weight="900" fill="#38bdf8" text-anchor="end">+3,200</text>
    <text x="155" y="200" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="end">سؤال سريري وتفسير</text>

    <!-- Box 2 -->
    <rect x="190" y="0" width="170" height="235" rx="14" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(245, 158, 11, 0.25)"/>
    <rect x="205" y="16" width="40" height="40" rx="10" fill="rgba(245, 158, 11, 0.15)"/>
    <text x="225" y="42" font-size="20" text-anchor="middle">⚡</text>
    <text x="345" y="80" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="end">تكرار متباعد ذكي</text>
    <text x="345" y="105" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#cbd5e1" text-anchor="end">نظام Spaced Repetition</text>
    <text x="345" y="122" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#cbd5e1" text-anchor="end">لتثبيت المفاهيم الصعبة</text>
    <text x="345" y="180" font-family="sans-serif" font-size="18" font-weight="900" fill="#f59e0b" text-anchor="end">99.4%</text>
    <text x="345" y="200" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="end">نسبة الاسترجاع في الامتحان</text>

    <!-- Box 3 -->
    <rect x="380" y="0" width="170" height="235" rx="14" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(16, 185, 129, 0.15)"/>
    <rect x="395" y="16" width="40" height="40" rx="10" fill="rgba(16, 185, 129, 0.15)"/>
    <text x="415" y="42" font-size="20" text-anchor="middle">🎯</text>
    <text x="535" y="80" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="13" font-weight="800" fill="#f1f5f9" text-anchor="end">فلترة النقاط الحرجة</text>
    <text x="535" y="105" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">الأسئلة الأكثر تكراراً</text>
    <text x="535" y="122" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" fill="#94a3b8" text-anchor="end">في دورات البورد السابقة</text>
    <text x="535" y="180" font-family="sans-serif" font-size="18" font-weight="900" fill="#10b981" text-anchor="end">100%</text>
    <text x="535" y="200" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="end">مطابقة للمعايير المعتمدة</text>
  </g>
</svg>
'''

with open('kafaah/public/images/card-osmosis.svg', 'w', encoding='utf-8') as f:
    f.write(osmosis_svg)

# 3. Analytics Gauge Card (card-analytics.svg)
analytics_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="aBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#060e1d" />
    </linearGradient>
    <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="60%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <rect width="600" height="360" rx="20" fill="url(#aBg)" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1.5"/>

  <!-- Title -->
  <text x="560" y="45" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="end">
    رادار الكفاءة والجاهزية التنبؤية (Predictive Readiness)
  </text>
  <text x="560" y="68" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">
    تقييم دقيق لنقاط القوة والمواضيع التي تتطلب تعزيزاً قبل خوض الامتحان الفعلي
  </text>

  <!-- Circular Gauge (Left) -->
  <g transform="translate(140, 195)">
    <!-- Background Track -->
    <path d="M -90 0 A 90 90 0 1 1 90 0" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="18" stroke-linecap="round"/>
    <!-- Value Arc -->
    <path d="M -90 0 A 90 90 0 1 1 70 -56" fill="none" stroke="url(#progGrad)" stroke-width="18" stroke-linecap="round"/>
    
    <text x="0" y="-10" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">94%</text>
    <text x="0" y="16" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="middle">فرصة اجتياز البورد</text>
    <text x="0" y="34" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">فوق معدل النجاح بـ +24 نقطة</text>
  </g>

  <!-- Subject Mastery Bars (Right) -->
  <g transform="translate(280, 110)">
    <!-- Bar 1: Internal Medicine -->
    <text x="280" y="15" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" text-anchor="end">الباطنية العامة (Internal Medicine)</text>
    <text x="0" y="15" font-family="sans-serif" font-size="12" font-weight="700" fill="#38bdf8">92%</text>
    <rect x="0" y="24" width="280" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="22" y="24" width="258" height="8" rx="4" fill="#38bdf8"/>

    <!-- Bar 2: General Surgery -->
    <text x="280" y="60" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" text-anchor="end">الجراحة العامة (General Surgery)</text>
    <text x="0" y="60" font-family="sans-serif" font-size="12" font-weight="700" fill="#10b981">88%</text>
    <rect x="0" y="69" width="280" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="34" y="69" width="246" height="8" rx="4" fill="#10b981"/>

    <!-- Bar 3: Pediatrics -->
    <text x="280" y="105" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" text-anchor="end">طب الأطفال (Pediatrics)</text>
    <text x="0" y="105" font-family="sans-serif" font-size="12" font-weight="700" fill="#f59e0b">85%</text>
    <rect x="0" y="114" width="280" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="42" y="114" width="238" height="8" rx="4" fill="#f59e0b"/>

    <!-- Bar 4: Obstetrics & Gynecology -->
    <text x="280" y="150" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" text-anchor="end">النساء والولادة (Obstetrics &amp; Gyn)</text>
    <text x="0" y="150" font-family="sans-serif" font-size="12" font-weight="700" fill="#22d3ee">96%</text>
    <rect x="0" y="159" width="280" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="11" y="159" width="269" height="8" rx="4" fill="#22d3ee"/>

    <!-- Bar 5: Pharmacology & Toxicology -->
    <text x="280" y="195" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#e2e8f0" text-anchor="end">علم الأدوية والسموم (Pharmacology)</text>
    <text x="0" y="195" font-family="sans-serif" font-size="12" font-weight="700" fill="#ec4899">79%</text>
    <rect x="0" y="204" width="280" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="58" y="204" width="222" height="8" rx="4" fill="#ec4899"/>
  </g>
</svg>
'''

with open('kafaah/public/images/card-analytics.svg', 'w', encoding='utf-8') as f:
    f.write(analytics_svg)

print("Generated card-exam.svg, card-osmosis.svg, card-analytics.svg!")
