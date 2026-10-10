import os
import math
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('kafaah/public/images', exist_ok=True)

# ==============================================================================
# 1. KAFA'AH EMBLEM & APP ICON (SVG)
# ==============================================================================
svg_icon = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b172a" />
      <stop offset="50%" stop-color="#060e1d" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <!-- Metallic Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="30%" stop-color="#f59e0b" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>

    <!-- Medical Sapphire to Teal Gradient -->
    <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>

    <!-- Emerald Glow Gradient -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Shield Face Gradient -->
    <linearGradient id="shieldFacetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <linearGradient id="shieldFacetRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Ambient Shadow Filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- iOS Squircle Base -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="rgba(56, 189, 248, 0.2)" stroke-width="3" filter="url(#shadow)"/>
  
  <!-- Subtle Internal Grid Pattern -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="rgba(14, 165, 233, 0.08)" stroke-width="1.5" stroke-dasharray="6 6"/>
  <circle cx="256" cy="256" r="220" fill="none" stroke="rgba(245, 158, 11, 0.06)" stroke-width="1.5"/>

  <!-- THE HERALDIC MEDICAL SHIELD -->
  <!-- Left Shield Half -->
  <path d="M 256 90 L 130 145 C 130 270, 190 365, 256 415 Z" fill="url(#shieldFacetLeft)" stroke="url(#goldGrad)" stroke-width="4"/>
  <!-- Right Shield Half -->
  <path d="M 256 90 L 382 145 C 382 270, 322 365, 256 415 Z" fill="url(#shieldFacetRight)" stroke="url(#goldGrad)" stroke-width="4"/>

  <!-- Inner Inset Shield Rim -->
  <path d="M 256 112 L 152 158 C 152 260, 202 344, 256 388 C 310 344, 360 260, 360 158 Z" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2"/>

  <!-- LAUREL WREATH (Left Branch) -->
  <g fill="url(#goldGrad)" opacity="0.95">
    <ellipse cx="140" cy="230" rx="8" ry="18" transform="rotate(-35 140 230)" />
    <ellipse cx="132" cy="265" rx="8" ry="18" transform="rotate(-20 132 265)" />
    <ellipse cx="136" cy="300" rx="8" ry="18" transform="rotate(-5 136 300)" />
    <ellipse cx="150" cy="335" rx="8" ry="18" transform="rotate(15 150 335)" />
    <ellipse cx="175" cy="365" rx="8" ry="18" transform="rotate(35 175 365)" />
    <ellipse cx="210" cy="390" rx="8" ry="18" transform="rotate(55 210 390)" />
  </g>

  <!-- LAUREL WREATH (Right Branch) -->
  <g fill="url(#goldGrad)" opacity="0.95">
    <ellipse cx="372" cy="230" rx="8" ry="18" transform="rotate(35 372 230)" />
    <ellipse cx="380" cy="265" rx="8" ry="18" transform="rotate(20 380 265)" />
    <ellipse cx="376" cy="300" rx="8" ry="18" transform="rotate(5 376 300)" />
    <ellipse cx="362" cy="335" rx="8" ry="18" transform="rotate(-15 362 335)" />
    <ellipse cx="337" cy="365" rx="8" ry="18" transform="rotate(-35 337 365)" />
    <ellipse cx="302" cy="390" rx="8" ry="18" transform="rotate(-55 302 390)" />
  </g>

  <!-- MEDICAL CADUCEUS / ASCLEPIUS STAFF -->
  <!-- Central Gold Staff -->
  <rect x="251" y="125" width="10" height="235" rx="5" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
  <!-- Top Finial Orb -->
  <circle cx="256" cy="120" r="14" fill="url(#goldGrad)"/>
  <!-- Top Academic Star / Crown -->
  <polygon points="256,76 261,90 276,90 264,99 268,114 256,104 244,114 248,99 236,90 251,90" fill="url(#goldGrad)"/>

  <!-- TWIN SERPENTS / DNA HELIX (Emerald & Sky Blue ribbons) -->
  <!-- Loop 1 (Upper) -->
  <path d="M 220 160 C 235 140, 277 140, 292 160 C 305 178, 275 205, 256 215 C 237 205, 207 178, 220 160 Z" fill="none" stroke="url(#medGrad)" stroke-width="7" stroke-linecap="round"/>
  <!-- Loop 2 (Middle) -->
  <path d="M 210 225 C 225 205, 287 205, 302 225 C 315 245, 280 275, 256 285 C 232 275, 197 245, 210 225 Z" fill="none" stroke="url(#emeraldGrad)" stroke-width="7" stroke-linecap="round"/>
  <!-- Loop 3 (Lower) -->
  <path d="M 220 295 C 235 280, 277 280, 292 295 C 305 312, 275 335, 256 345 C 237 335, 207 312, 220 295 Z" fill="none" stroke="url(#medGrad)" stroke-width="6" stroke-linecap="round"/>

  <!-- CARDIOGRAM ECG PULSE OVERLAY -->
  <path d="M 160 256 L 210 256 L 225 235 L 240 275 L 256 210 L 272 295 L 285 245 L 298 262 L 308 256 L 352 256" 
        fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />

  <!-- Lower Gold Seal Banner Knot -->
  <circle cx="256" cy="402" r="12" fill="url(#goldGrad)"/>
  <circle cx="256" cy="402" r="7" fill="#0b172a"/>
  <circle cx="256" cy="402" r="4" fill="url(#goldGrad)"/>
</svg>
'''

with open('kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

with open('kafaah/public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

# ==============================================================================
# 2. FULL HORIZONTAL LOGO WITH TYPOGRAPHY (SVG)
# ==============================================================================
svg_full_logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 140" width="680" height="140">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="35%" stop-color="#f59e0b" />
      <stop offset="75%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>

    <linearGradient id="shieldDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090e1a" />
    </linearGradient>

    <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0284c7" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- EMBLEM SYMBOL ON THE RIGHT (RTL First) -->
  <g transform="translate(540, 5) scale(0.24)">
    <!-- Base Squircle -->
    <rect x="20" y="20" width="472" height="472" rx="110" fill="#0b1329" stroke="url(#goldGrad)" stroke-width="6"/>
    <!-- Heraldic Shield -->
    <path d="M 256 80 L 120 140 C 120 280, 185 380, 256 430 C 327 380, 392 280, 392 140 Z" fill="url(#shieldDark)" stroke="url(#goldGrad)" stroke-width="6"/>
    <!-- Asclepius Staff -->
    <rect x="250" y="110" width="12" height="260" rx="6" fill="url(#goldGrad)"/>
    <circle cx="256" cy="100" r="16" fill="url(#goldGrad)"/>
    <!-- Star -->
    <polygon points="256,52 262,68 278,68 265,78 269,94 256,84 243,94 247,78 234,68 250,68" fill="url(#goldGrad)"/>
    <!-- DNA / Serpent Ribbons -->
    <path d="M 205 180 C 225 155, 285 155, 305 180 C 320 200, 280 230, 256 240 C 230 230, 190 200, 205 180 Z" fill="none" stroke="url(#blueGlow)" stroke-width="8" stroke-linecap="round"/>
    <path d="M 195 250 C 220 225, 290 225, 315 250 C 330 270, 280 305, 256 315 C 230 305, 180 270, 195 250 Z" fill="none" stroke="url(#tealGrad)" stroke-width="8" stroke-linecap="round"/>
    <!-- ECG pulse line -->
    <path d="M 140 256 L 205 256 L 225 230 L 242 275 L 256 205 L 270 295 L 285 242 L 305 256 L 370 256" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
    <!-- Laurel Wreath accents -->
    <ellipse cx="140" cy="270" rx="9" ry="20" transform="rotate(-30 140 270)" fill="url(#goldGrad)"/>
    <ellipse cx="155" cy="330" rx="9" ry="20" transform="rotate(20 155 330)" fill="url(#goldGrad)"/>
    <ellipse cx="372" cy="270" rx="9" ry="20" transform="rotate(30 372 270)" fill="url(#goldGrad)"/>
    <ellipse cx="357" cy="330" rx="9" ry="20" transform="rotate(-20 357 330)" fill="url(#goldGrad)"/>
  </g>

  <!-- ARABIC BRAND TYPOGRAPHY -->
  <text x="510" y="68" 
        font-family="'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif" 
        font-size="44" 
        font-weight="900" 
        text-anchor="end" 
        fill="#ffffff" 
        letter-spacing="1">
    كـفـاءة
  </text>

  <!-- GOLD DOT ACCENT -->
  <circle cx="516" cy="36" r="4.5" fill="url(#goldGrad)" />

  <!-- BADGE PILL: المجلس الطبي ورخص المزاولة -->
  <rect x="290" y="38" width="80" height="24" rx="12" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.2"/>
  <text x="330" y="54" 
        font-family="'IBM Plex Sans Arabic', 'Cairo', sans-serif" 
        font-size="11" 
        font-weight="700" 
        text-anchor="middle" 
        fill="#f59e0b">
    بورد معتمد
  </text>

  <!-- ARABIC SUBTITLE -->
  <text x="510" y="98" 
        font-family="'IBM Plex Sans Arabic', 'Cairo', system-ui, sans-serif" 
        font-size="14" 
        font-weight="600" 
        text-anchor="end" 
        fill="#94a3b8">
    المركز الاحترافي لتراخيص مزاولة المهن الطبية والصحية
  </text>

  <!-- ENGLISH OFFICIAL BRAND SUBTITLE -->
  <text x="510" y="118" 
        font-family="'Inter', 'Segoe UI', system-ui, sans-serif" 
        font-size="11" 
        font-weight="700" 
        text-anchor="end" 
        letter-spacing="2.5" 
        fill="#38bdf8">
    KAFA'AH MEDICAL LICENSURE CENTER
  </text>
</svg>
'''

with open('kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_full_logo)


# ==============================================================================
# 3. HIGH FIDELITY MEDICAL HERO ILLUSTRATION (SVG + CSS 3D VIBE)
# ==============================================================================
svg_hero_illustration = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="100%" height="100%">
  <defs>
    <linearGradient id="bgBox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b172a" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#030712" stop-opacity="0.95" />
    </linearGradient>

    <linearGradient id="glowTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>

    <linearGradient id="goldHolo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- BACKDROP GRID -->
  <g stroke="rgba(56, 189, 248, 0.05)" stroke-width="1">
    <line x1="0" y1="80" x2="900" y2="80"/>
    <line x1="0" y1="160" x2="900" y2="160"/>
    <line x1="0" y1="240" x2="900" y2="240"/>
    <line x1="0" y1="320" x2="900" y2="320"/>
    <line x1="0" y1="400" x2="900" y2="400"/>
    <line x1="0" y1="480" x2="900" y2="480"/>
    <line x1="150" y1="0" x2="150" y2="560"/>
    <line x1="300" y1="0" x2="300" y2="560"/>
    <line x1="450" y1="0" x2="450" y2="560"/>
    <line x1="600" y1="0" x2="600" y2="560"/>
    <line x1="750" y1="0" x2="750" y2="560"/>
  </g>

  <!-- AMBIENT CIRCULAR RAYS -->
  <circle cx="450" cy="280" r="240" fill="none" stroke="rgba(14, 165, 233, 0.12)" stroke-width="1" stroke-dasharray="8 8"/>
  <circle cx="450" cy="280" r="180" fill="none" stroke="rgba(245, 158, 11, 0.12)" stroke-width="1"/>

  <!-- CENTRAL DIGITAL EXAMINATION COCKPIT TABLET -->
  <rect x="220" y="80" width="460" height="360" rx="24" fill="url(#bgBox)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" filter="url(#hudGlow)"/>

  <!-- TABLET HEADER -->
  <rect x="220" y="80" width="460" height="52" rx="24" fill="rgba(15, 23, 42, 0.9)" />
  <circle cx="250" cy="106" r="6" fill="#ef4444"/>
  <circle cx="268" cy="106" r="6" fill="#f59e0b"/>
  <circle cx="286" cy="106" r="6" fill="#10b981"/>
  <text x="650" y="112" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="14" font-weight="700" fill="#e2e8f0" text-anchor="end">
    امتحان مزاولة المهنة التجريبي — المجلس الطبي
  </text>
  <rect x="320" y="96" width="70" height="20" rx="10" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1"/>
  <text x="355" y="110" font-family="monospace" font-size="11" font-weight="700" fill="#fef08a" text-anchor="middle">
    ⏱ 02:45:18
  </text>

  <!-- TABLET BODY: QUESTION VIGNETTE -->
  <g transform="translate(240, 148)">
    <!-- Vignette Box -->
    <rect x="0" y="0" width="420" height="90" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
    <text x="405" y="24" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="800" fill="#38bdf8" text-anchor="end">
      السؤال 42 من 150 (طب باطني — Clinical Cardiology)
    </text>
    <text x="405" y="46" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#cbd5e1" text-anchor="end">
      مريض يبلغ 58 عاماً يعاني من ألم صدري مفاجئ مع تغيرات ST-elevation.
    </text>
    <text x="405" y="68" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#cbd5e1" text-anchor="end">
      ما هو الإجراء الدوائي والتدخلي الأول الموصى به فوراً وفقاً للإرشادات المعتمدة؟
    </text>

    <!-- ANSWER CHOICES -->
    <!-- Option A -->
    <rect x="0" y="105" width="420" height="34" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>
    <text x="400" y="127" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">أ. الملاحظة السريرية وإعادة الفحص بعد 6 ساعات</text>
    
    <!-- Option B (Correct highlighted) -->
    <rect x="0" y="146" width="420" height="34" rx="8" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="1.5"/>
    <text x="400" y="168" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#34d399" text-anchor="end">✓ ب. تحميل الأسبرين وكلوبيدوغريل مع التجهيز الفوري للقسطرة (PCI)</text>

    <!-- Option C -->
    <rect x="0" y="187" width="420" height="34" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>
    <text x="400" y="209" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">ج. إعطاء مسكنات أفيونية فقط بدون مضادات تخثر</text>

    <!-- Option D -->
    <rect x="0" y="228" width="420" height="34" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>
    <text x="400" y="250" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">د. إجراء تصوير مقطعي محوسب بالصبغة قبل التدخل</text>
  </g>

  <!-- FLOATING CARD 1 (LEFT): REAL-TIME ECG MONITOR -->
  <g transform="translate(60, 160)" filter="url(#hudGlow)">
    <rect x="0" y="0" width="190" height="150" rx="16" fill="rgba(11, 23, 42, 0.95)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5"/>
    <text x="170" y="28" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="end">مؤشر الإتقان والجاهزية</text>
    <path d="M 20 75 L 50 75 L 60 55 L 75 95 L 90 35 L 105 110 L 120 65 L 135 80 L 170 75" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>
    <text x="95" y="125" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">98.4%</text>
    <text x="95" y="140" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" font-weight="600" fill="#10b981" text-anchor="middle">فرصة اجتياز البورد مؤكدة</text>
  </g>

  <!-- FLOATING CARD 2 (RIGHT): ACCREDITED BOARD BADGE -->
  <g transform="translate(650, 220)" filter="url(#hudGlow)">
    <rect x="0" y="0" width="200" height="160" rx="16" fill="rgba(11, 23, 42, 0.95)" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1.5"/>
    <circle cx="100" cy="55" r="30" fill="url(#goldHolo)"/>
    <polygon points="100,32 105,44 117,44 107,52 110,64 100,56 90,64 93,52 83,44 95,44" fill="#0b172a"/>
    <text x="100" y="112" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">رخصة مزاولة معتمدة</text>
    <text x="100" y="132" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11" font-weight="600" fill="#f59e0b" text-anchor="middle">معايير المجلس الطبي الدولي</text>
    <text x="100" y="148" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">YEMEN • SMLE • DHA • PROMETRIC</text>
  </g>

  <!-- LOWER STATS DOCK -->
  <g transform="translate(260, 460)">
    <rect x="0" y="0" width="380" height="60" rx="30" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
    <!-- Stat 1 -->
    <text x="320" y="28" font-family="sans-serif" font-size="16" font-weight="900" fill="#38bdf8" text-anchor="middle">+12,500</text>
    <text x="320" y="46" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">سؤال بورد</text>
    <!-- Divider -->
    <line x1="250" y1="12" x2="250" y2="48" stroke="rgba(255, 255, 255, 0.1)"/>
    <!-- Stat 2 -->
    <text x="190" y="28" font-family="sans-serif" font-size="16" font-weight="900" fill="#f59e0b" text-anchor="middle">16</text>
    <text x="190" y="46" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">تخصص صحي</text>
    <!-- Divider -->
    <line x1="130" y1="12" x2="130" y2="48" stroke="rgba(255, 255, 255, 0.1)"/>
    <!-- Stat 3 -->
    <text x="65" y="28" font-family="sans-serif" font-size="16" font-weight="900" fill="#10b981" text-anchor="middle">99.2%</text>
    <text x="65" y="46" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">معدل النجاح</text>
  </g>
</svg>
'''

with open('kafaah/public/images/medical-hero-crest.svg', 'w', encoding='utf-8') as f:
    f.write(svg_hero_illustration)

print("Generated vector assets successfully!")
