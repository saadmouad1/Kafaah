import os
from PIL import Image, ImageDraw

os.makedirs('kafaah/public/images', exist_ok=True)

# ==============================================================================
# 1. BRIGHT MULTI-COLOR LOGO (SVG) - NO DARK/PURPLE/NAVY
# Background: Crisp Pure White / Pearl
# Facets: Emerald (#10b981), Amber Gold (#f59e0b), Sunset Coral (#f97316),
#         Turquoise Teal (#0d9488), Ruby Rose (#f43f5e)
# ==============================================================================
bright_icon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Light Pearlescent Background Gradient -->
    <linearGradient id="whiteCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>

    <!-- 5 Vibrant Facet Gradients -->
    <linearGradient id="gEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <linearGradient id="gGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="gCoral" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>

    <linearGradient id="gTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>

    <linearGradient id="gRose" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>

    <!-- Soft Ambient Drop Shadow for Light Theme -->
    <filter id="softShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.12"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- iOS Squircle Base in Pure Pearl White -->
  <rect x="20" y="20" width="472" height="472" rx="108" fill="url(#whiteCardGrad)" stroke="#e2e8f0" stroke-width="2" filter="url(#softShadow)"/>
  
  <!-- Subtle Internal Gold Accent Rim -->
  <rect x="32" y="32" width="448" height="448" rx="96" fill="none" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1.5"/>

  <!-- Geometric Decorative Aura -->
  <circle cx="256" cy="256" r="185" fill="none" stroke="rgba(16, 185, 129, 0.12)" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="256" cy="256" r="215" fill="none" stroke="rgba(249, 115, 22, 0.1)" stroke-width="1.5"/>

  <!-- MULTI-COLOR PRISM STAR OF COMPETENCY (5 FACETS) -->
  <!-- 1. Top Facet: Accreditation & Honors (Amber Gold) -->
  <path d="M 256 75 L 295 190 L 256 256 L 217 190 Z" fill="url(#gGold)"/>

  <!-- 2. Right-Top Facet: Engineering & Technology (Sunset Coral) -->
  <path d="M 425 195 L 332 256 L 256 256 L 295 190 Z" fill="url(#gCoral)"/>

  <!-- 3. Right-Bottom Facet: Health & Life Sciences (Emerald Green) -->
  <path d="M 362 400 L 296 320 L 256 256 L 332 256 Z" fill="url(#gEmerald)"/>

  <!-- 4. Left-Bottom Facet: Education & Human Capital (Ruby Rose) -->
  <path d="M 150 400 L 216 320 L 256 256 L 296 320 Z" fill="url(#gRose)"/>

  <!-- 5. Left-Top Facet: Law & Legal Justice (Turquoise Teal) -->
  <path d="M 87 195 L 180 256 L 256 256 L 217 190 Z" fill="url(#gTeal)"/>

  <!-- Facet Left/Right Balance Fillers -->
  <path d="M 87 195 L 150 400 L 216 320 L 256 256 L 180 256 Z" fill="url(#gTeal)" opacity="0.85"/>
  <path d="M 425 195 L 362 400 L 296 320 L 256 256 L 332 256 Z" fill="url(#gCoral)" opacity="0.85"/>

  <!-- Crystal Facet Contour Lines -->
  <polygon points="256,150 320,220 296,305 216,305 192,220" fill="none" stroke="#ffffff" stroke-width="3.5"/>

  <!-- Radiant Golden Center Core (نواة الكفاءة) -->
  <circle cx="256" cy="256" r="34" fill="url(#gGold)" stroke="#ffffff" stroke-width="4"/>
  <circle cx="256" cy="256" r="16" fill="#ffffff"/>

  <!-- Golden Dynamic Progress Orbit -->
  <ellipse cx="256" cy="256" rx="165" ry="72" fill="none" stroke="url(#gGold)" stroke-width="5" transform="rotate(-25 256 256)" stroke-linecap="round" stroke-dasharray="150 30 80 20"/>
  <circle cx="395" cy="188" r="9" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
</svg>
'''

with open('kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(bright_icon_svg)

with open('kafaah/public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(bright_icon_svg)

# ==============================================================================
# 2. BRIGHT HORIZONTAL LOGO WITH TYPOGRAPHY (SVG)
# ==============================================================================
bright_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 140" width="720" height="140">
  <defs>
    <linearGradient id="gMultiBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="25%" stop-color="#0d9488" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="75%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>

    <linearGradient id="goldDot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <!-- EMBLEM SYMBOL ON RIGHT (RTL First) -->
  <g transform="translate(580, 10) scale(0.23)">
    <!-- White Squircle -->
    <rect x="20" y="20" width="472" height="472" rx="108" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
    <circle cx="256" cy="256" r="185" fill="none" stroke="rgba(16, 185, 129, 0.2)" stroke-width="3"/>
    
    <!-- 5 Facets -->
    <path d="M 256 75 L 295 190 L 256 256 L 217 190 Z" fill="#f59e0b"/>
    <path d="M 425 195 L 332 256 L 256 256 L 295 190 Z" fill="#f97316"/>
    <path d="M 362 400 L 296 320 L 256 256 L 332 256 Z" fill="#10b981"/>
    <path d="M 150 400 L 216 320 L 256 256 L 296 320 Z" fill="#f43f5e"/>
    <path d="M 87 195 L 180 256 L 256 256 L 217 190 Z" fill="#0d9488"/>
    <path d="M 87 195 L 150 400 L 216 320 L 256 256 L 180 256 Z" fill="#0d9488" opacity="0.85"/>
    <path d="M 425 195 L 362 400 L 296 320 L 256 256 L 332 256 Z" fill="#f97316" opacity="0.85"/>
    <!-- Core -->
    <circle cx="256" cy="256" r="34" fill="#f59e0b" stroke="#ffffff" stroke-width="4"/>
    <!-- Orbit -->
    <ellipse cx="256" cy="256" rx="165" ry="72" fill="none" stroke="#f59e0b" stroke-width="6" transform="rotate(-25 256 256)"/>
  </g>

  <!-- ARABIC BRAND TITLE IN RICH SLATE CHARCOAL -->
  <text x="560" y="68" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="46" 
        font-weight="900" 
        text-anchor="end" 
        fill="#0f172a" 
        letter-spacing="0.5">
    كـفـاءة
  </text>

  <!-- MULTI-COLOR ACCENT BAR -->
  <rect x="360" y="80" width="200" height="4" rx="2" fill="url(#gMultiBar)"/>

  <!-- GOLD DOT ACCENT -->
  <circle cx="566" cy="34" r="5" fill="url(#goldDot)"/>

  <!-- 3-MONTH FREE PROMO BADGE (Vibrant Amber) -->
  <rect x="180" y="38" width="155" height="26" rx="13" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
  <text x="257" y="55" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="11.5" 
        font-weight="800" 
        text-anchor="middle" 
        fill="#b45309">
    🎉 مجاناً 3 أشهر بمناسبة الانطلاق
  </text>

  <!-- ARABIC SUBTITLE (Charcoal Slate) -->
  <text x="560" y="104" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="14.5" 
        font-weight="700" 
        text-anchor="end" 
        fill="#475569">
    المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني
  </text>

  <!-- LATIN SUBTITLE -->
  <text x="560" y="124" 
        font-family="'Inter', sans-serif" 
        font-size="10.5" 
        font-weight="800" 
        text-anchor="end" 
        letter-spacing="2" 
        fill="#059669">
    KAFA'AH — NATIONAL PROFESSIONAL LICENSURE
  </text>
</svg>
'''

with open('kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(bright_logo_svg)

# ==============================================================================
# 3. HIGH-RESOLUTION RASTER ICONS VIA PILLOW (BRIGHT THEME)
# ==============================================================================
S = 2048
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

pad = 120
rad = 440
# Pure pearl white rounded square
draw.rounded_rectangle([pad, pad, S - pad, S - pad], radius=rad, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=12)
draw.rounded_rectangle([pad + 24, pad + 24, S - pad - 24, S - pad - 24], radius=rad - 20, outline=(245, 158, 11, 140), width=6)

cx, cy = S // 2, S // 2

# Draw 5 Petals / Facets of the Star in Vibrant Colors
# 1. Top Petal (Amber Gold)
draw.polygon([(cx, cy - 650), (cx + 160, cy - 200), (cx, cy), (cx - 160, cy - 200)], fill=(245, 158, 11, 255))
# 2. Right Top (Sunset Coral)
draw.polygon([(cx + 650, cy - 200), (cx + 250, cy + 50), (cx, cy), (cx + 160, cy - 200)], fill=(249, 115, 22, 255))
# 3. Right Bottom (Emerald Green)
draw.polygon([(cx + 400, cy + 550), (cx + 150, cy + 260), (cx, cy), (cx + 250, cy + 50)], fill=(16, 185, 129, 255))
# 4. Left Bottom (Ruby Rose)
draw.polygon([(cx - 400, cy + 550), (cx - 150, cy + 260), (cx, cy), (cx + 150, cy + 260)], fill=(244, 63, 94, 255))
# 5. Left Top (Turquoise Teal)
draw.polygon([(cx - 650, cy - 200), (cx - 160, cy - 200), (cx, cy), (cx - 250, cy + 50)], fill=(13, 148, 136, 255))

# Outer gold ring
draw.ellipse([cx - 720, cy - 720, cx + 720, cy + 720], outline=(245, 158, 11, 80), width=10)

# Central Golden Core
draw.ellipse([cx - 130, cy - 130, cx + 130, cy + 130], fill=(245, 158, 11, 255), outline=(255, 255, 255, 255), width=24)
draw.ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=(255, 255, 255, 255))

icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('kafaah/public/kafaah-icon.png', 'PNG')

icon_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save('kafaah/public/apple-touch-icon.png', 'PNG')

icon_512.save('kafaah/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

# ==============================================================================
# 4. HERO BRIGHT VISUAL ILLUSTRATION (SVG - AIRY, SUNLIT, MULTI-COLOR)
# ==============================================================================
hero_bright_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 540" width="100%" height="100%">
  <defs>
    <!-- Soft Background Gradients -->
    <linearGradient id="softDesk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <!-- Shadow filter -->
    <filter id="cardShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#0f172a" flood-opacity="0.08"/>
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#10b981" flood-opacity="0.06"/>
    </filter>

    <filter id="floatShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- SUNLIT MESH BACKGROUND -->
  <rect width="920" height="540" rx="28" fill="url(#softDesk)" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- Ambient Color Blobs -->
  <circle cx="200" cy="140" r="180" fill="#10b981" opacity="0.06" filter="blur(50px)"/>
  <circle cx="700" cy="180" r="200" fill="#f59e0b" opacity="0.07" filter="blur(60px)"/>
  <circle cx="450" cy="400" r="160" fill="#f97316" opacity="0.05" filter="blur(50px)"/>

  <!-- CENTRAL DIGITAL TESTING COCKPIT (WHITE IPAD / SURFACE) -->
  <g transform="translate(180, 50)" filter="url(#cardShadow)">
    <!-- Tablet Frame -->
    <rect x="0" y="0" width="560" height="380" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Screen Header -->
    <rect x="0" y="0" width="560" height="56" rx="28" fill="#f8fafc"/>
    <line x1="0" y1="56" x2="560" y2="56" stroke="#e2e8f0"/>

    <circle cx="36" cy="28" r="6" fill="#ef4444"/>
    <circle cx="56" cy="28" r="6" fill="#f59e0b"/>
    <circle cx="76" cy="28" r="6" fill="#10b981"/>

    <text x="520" y="34" font-family="'Cairo', sans-serif" font-size="14" font-weight="800" fill="#0f172a" text-anchor="end">
      اختبار مزاولة المهنة والاعتماد المهني — جلسة المحاكاة الرسمية
    </text>

    <!-- Timer Badge -->
    <rect x="110" y="16" width="90" height="24" rx="12" fill="#fef3c7" stroke="#f59e0b"/>
    <text x="155" y="32" font-family="sans-serif" font-size="12" font-weight="800" fill="#b45309" text-anchor="middle">
      ⏱ 02:44:19
    </text>

    <!-- Question Vignette Box -->
    <g transform="translate(30, 76)">
      <rect x="0" y="0" width="500" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="480" y="28" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" fill="#059669" text-anchor="end">
        السؤال 35 من 100 • حالة تطبيقية متكررة في امتحانات الترخيص
      </text>
      <text x="480" y="52" font-family="'Cairo', sans-serif" font-size="13.5" font-weight="600" fill="#1e293b" text-anchor="end">
        وفقاً لأحدث الإرشادات والمعايير الوطنية المعتمدة، ما هو الإجراء التنفيذي والمهني الأول
      </text>
      <text x="480" y="74" font-family="'Cairo', sans-serif" font-size="13.5" font-weight="600" fill="#1e293b" text-anchor="end">
        الواجب اتخاذه للحد من المخاطر وضمان الامتثال التام قبل بدء المرحلة التشغيلية؟
      </text>
    </g>

    <!-- Choices Inside Tablet -->
    <g transform="translate(30, 190)">
      <!-- Choice A -->
      <rect x="0" y="0" width="500" height="38" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="475" y="24" font-family="'Cairo', sans-serif" font-size="12.5" fill="#64748b" text-anchor="end">أ. المتابعة الدورية دون اتخاذ تدابير استباقية معتمدة</text>

      <!-- Choice B (Correct highlighted in Emerald) -->
      <rect x="0" y="48" width="500" height="38" rx="10" fill="#ecfdf5" stroke="#10b981" stroke-width="1.8"/>
      <text x="475" y="72" font-family="'Cairo', sans-serif" font-size="12.5" font-weight="800" fill="#059669" text-anchor="end">✓ ب. تطبيق مصفوفة تقييم المخاطر وتفعيل بروتوكول التدخل المعتمد فوراً</text>

      <!-- Choice C -->
      <rect x="0" y="96" width="500" height="38" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="475" y="120" font-family="'Cairo', sans-serif" font-size="12.5" fill="#64748b" text-anchor="end">ج. تفويض المسؤولية لطرف ثالث دون التحقق من رخصة المزاولة</text>
    </g>
  </g>

  <!-- FLOATING CARD 1: EMERALD HEALTH & READINESS (LEFT) -->
  <g transform="translate(40, 160)" filter="url(#floatShadow)">
    <rect x="0" y="0" width="180" height="150" rx="20" fill="#ffffff" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="45" cy="40" r="22" fill="#d1fae5"/>
    <text x="45" y="47" font-size="18" text-anchor="middle">🩺</text>
    <text x="160" y="36" font-family="'Cairo', sans-serif" font-size="12" font-weight="800" fill="#059669" text-anchor="end">مؤشر الجاهزية</text>
    <text x="160" y="52" font-family="'Cairo', sans-serif" font-size="10" fill="#64748b" text-anchor="end">القطاع الصحي</text>
    
    <text x="90" y="102" font-family="sans-serif" font-size="28" font-weight="900" fill="#059669" text-anchor="middle">98.2%</text>
    <rect x="25" y="118" width="130" height="8" rx="4" fill="#e2e8f0"/>
    <rect x="25" y="118" width="126" height="8" rx="4" fill="#10b981"/>
  </g>

  <!-- FLOATING CARD 2: AMBER ACCREDITATION SEAL (RIGHT) -->
  <g transform="translate(700, 110)" filter="url(#floatShadow)">
    <rect x="0" y="0" width="180" height="160" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="90" cy="50" r="28" fill="#fef3c7"/>
    <text x="90" y="58" font-size="24" text-anchor="middle">🏆</text>
    <text x="90" y="105" font-family="'Cairo', sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="middle">رخصة معتمدة</text>
    <text x="90" y="124" font-family="'Cairo', sans-serif" font-size="11" font-weight="700" fill="#d97706" text-anchor="middle">معايير البورد 2026</text>
    <text x="90" y="142" font-family="'Cairo', sans-serif" font-size="9.5" fill="#64748b" text-anchor="middle">اليمن • SMLE • DHA</text>
  </g>

  <!-- FLOATING CARD 3: CORAL & ROSE ENGINEERING & LAW (BOTTOM RIGHT) -->
  <g transform="translate(680, 310)" filter="url(#floatShadow)">
    <rect x="0" y="0" width="200" height="110" rx="18" fill="#ffffff" stroke="#f97316" stroke-width="1.5"/>
    <circle cx="36" cy="36" r="18" fill="#ffedd5"/>
    <text x="36" y="43" font-size="16" text-anchor="middle">📐</text>
    <text x="180" y="34" font-family="'Cairo', sans-serif" font-size="12" font-weight="800" fill="#ea580c" text-anchor="end">الهندسة والقانون</text>
    <text x="180" y="50" font-family="'Cairo', sans-serif" font-size="10" fill="#64748b" text-anchor="end">+7,300 سؤال تطبيقي</text>
    <rect x="18" y="72" width="164" height="26" rx="8" fill="#fef2f2"/>
    <text x="100" y="89" font-family="'Cairo', sans-serif" font-size="11" font-weight="800" fill="#e11d48" text-anchor="middle">✓ نماذج امتحانات محدثة</text>
  </g>

  <!-- LOWER MULTI-COLOR ACCREDITED BADGES DOCK -->
  <g transform="translate(240, 455)" filter="url(#floatShadow)">
    <rect x="0" y="0" width="440" height="60" rx="30" fill="#ffffff" stroke="#e2e8f0"/>
    
    <text x="375" y="26" font-family="sans-serif" font-size="16" font-weight="900" fill="#059669" text-anchor="middle">+26,500</text>
    <text x="375" y="44" font-family="'Cairo', sans-serif" font-size="11" fill="#64748b" text-anchor="middle">سؤال معتمد</text>

    <line x1="310" y1="12" x2="310" y2="48" stroke="#e2e8f0"/>

    <text x="220" y="26" font-family="sans-serif" font-size="16" font-weight="900" fill="#f59e0b" text-anchor="middle">5 مجالات</text>
    <text x="220" y="44" font-family="'Cairo', sans-serif" font-size="11" fill="#64748b" text-anchor="middle">كافة المهن الوطنية</text>

    <line x1="130" y1="12" x2="130" y2="48" stroke="#e2e8f0"/>

    <text x="65" y="26" font-family="sans-serif" font-size="16" font-weight="900" fill="#ea580c" text-anchor="middle">3 أشهر</text>
    <text x="65" y="44" font-family="'Cairo', sans-serif" font-size="11" fill="#64748b" text-anchor="middle">مجاناً بالكامل</text>
  </g>
</svg>
'''

with open('kafaah/public/images/hero-bright-visual.svg', 'w', encoding='utf-8') as f:
    f.write(hero_bright_svg)

# ==============================================================================
# 5. MOBILE APP TITANIUM MOCKUP (BRIGHT THEME)
# ==============================================================================
mobile_bright_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 620" width="100%" height="100%">
  <defs>
    <linearGradient id="titaniumEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>

    <filter id="phoneShadowLight" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="25" stdDeviation="35" flood-color="#0f172a" flood-opacity="0.15"/>
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#10b981" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- SMARTPHONE IN CRISP TITANIUM SILVER -->
  <g transform="translate(120, 25)" filter="url(#phoneShadowLight)">
    <!-- Outer Bezel -->
    <rect x="0" y="0" width="300" height="570" rx="46" fill="url(#titaniumEdge)" stroke="#ffffff" stroke-width="4"/>
    <!-- Inner Screen Canvas -->
    <rect x="10" y="10" width="280" height="550" rx="38" fill="#ffffff"/>
    
    <!-- Dynamic Island / Speaker Notch -->
    <rect x="95" y="22" width="110" height="24" rx="12" fill="#0f172a"/>
    <circle cx="185" cy="34" r="4" fill="#334155"/>

    <!-- App Content Inside Phone -->
    <!-- App Header -->
    <g transform="translate(24, 62)">
      <circle cx="20" cy="20" r="18" fill="#fef3c7"/>
      <text x="20" y="26" font-size="15" text-anchor="middle">👑</text>
      <text x="232" y="18" font-family="'Cairo', sans-serif" font-size="14" font-weight="900" fill="#0f172a" text-anchor="end">أهلاً بك يا بطل</text>
      <text x="232" y="32" font-family="'Cairo', sans-serif" font-size="10.5" font-weight="600" fill="#64748b" text-anchor="end">خطة البورد • متبقي 28 يوماً</text>
    </g>

    <!-- Quick Stats Emerald Banner Inside Screen -->
    <g transform="translate(24, 116)">
      <rect x="0" y="0" width="252" height="92" rx="16" fill="linear-gradient(135deg, #10b981 0%, #059669 100%)"/>
      <text x="232" y="26" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="end">جاهزية اجتياز الامتحان</text>
      <text x="232" y="60" font-family="sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="end">94.8%</text>
      <text x="232" y="78" font-family="'Cairo', sans-serif" font-size="10" font-weight="800" fill="#fef08a" text-anchor="end">مستوى متقدم • تدربت على 1,420 سؤالاً</text>
      <circle cx="48" cy="46" r="26" fill="rgba(255, 255, 255, 0.2)"/>
      <text x="48" y="54" font-size="22" text-anchor="middle">🎯</text>
    </g>

    <!-- Action Shortcuts -->
    <g transform="translate(24, 222)">
      <!-- Box 1 -->
      <rect x="0" y="0" width="120" height="74" rx="14" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="105" y="24" font-size="16">⏱</text>
      <text x="105" y="48" font-family="'Cairo', sans-serif" font-size="11.5" font-weight="900" fill="#0f172a" text-anchor="end">امتحان مؤقت</text>
      <text x="105" y="62" font-family="'Cairo', sans-serif" font-size="9.5" fill="#64748b" text-anchor="end">محاكاة فورية</text>

      <!-- Box 2 -->
      <rect x="132" y="0" width="120" height="74" rx="14" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="237" y="24" font-size="16">🤖</text>
      <text x="237" y="48" font-family="'Cairo', sans-serif" font-size="11.5" font-weight="900" fill="#0284c7" text-anchor="end">المعلم الذكي</text>
      <text x="237" y="62" font-family="'Cairo', sans-serif" font-size="9.5" fill="#64748b" text-anchor="end">مدعوم بـ Groq AI</text>
    </g>

    <!-- Today's Schedule Card -->
    <g transform="translate(24, 310)">
      <rect x="0" y="0" width="252" height="155" rx="16" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="232" y="24" font-family="'Cairo', sans-serif" font-size="11.5" font-weight="900" fill="#d97706" text-anchor="end">جلسة اليوم المقترحة من AI</text>
      
      <!-- item 1 -->
      <rect x="12" y="38" width="228" height="34" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="226" y="58" font-family="'Cairo', sans-serif" font-size="10.5" font-weight="700" fill="#1e293b" text-anchor="end">50 سؤال في الحالات الحرجة</text>
      <text x="28" y="58" font-size="10" font-weight="800" fill="#10b981">مكتمل ✓</text>

      <!-- item 2 -->
      <rect x="12" y="78" width="228" height="34" rx="10" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="226" y="98" font-family="'Cairo', sans-serif" font-size="10.5" font-weight="700" fill="#1e293b" text-anchor="end">مراجعة الأسئلة الخاطئة السابقة</text>
      <text x="28" y="98" font-size="10" font-weight="800" fill="#f59e0b">قيد المراجعة</text>

      <!-- item 3 button -->
      <rect x="12" y="120" width="228" height="26" rx="8" fill="#10b981"/>
      <text x="126" y="137" font-family="'Cairo', sans-serif" font-size="10.5" font-weight="900" fill="#ffffff" text-anchor="middle">بدء التدريب الآن</text>
    </g>

    <!-- App Bottom Nav in Phone -->
    <g transform="translate(24, 482)">
      <rect x="0" y="0" width="252" height="52" rx="22" fill="#ffffff" stroke="#e2e8f0" filter="url(#cardShadow)"/>
      <text x="35" y="30" font-size="16" text-anchor="middle">👤</text>
      <text x="85" y="30" font-size="16" text-anchor="middle">📊</text>
      <text x="135" y="30" font-size="16" text-anchor="middle">⚡</text>
      <text x="185" y="30" font-size="16" text-anchor="middle">📖</text>
      <text x="225" y="30" font-size="16" text-anchor="middle">🏠</text>
      <circle cx="225" cy="42" r="2.5" fill="#f59e0b"/>
    </g>

    <!-- Home indicator bar -->
    <rect x="95" y="546" width="110" height="4" rx="2" fill="#0f172a" opacity="0.3"/>
  </g>
</svg>
'''

with open('kafaah/public/images/app-mobile-mockup.svg', 'w', encoding='utf-8') as f:
    f.write(mobile_bright_svg)

print("Generated bright multi-color brand assets and illustrations!")
