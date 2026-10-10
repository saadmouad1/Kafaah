import os
import math
from PIL import Image, ImageDraw

os.makedirs('kafaah/public/images', exist_ok=True)

# ==============================================================================
# 1. UNIVERSAL MULTI-COLOR STAR & PRISM EMBLEM (SVG)
# Represents 5 Main Disciplines:
# 1. Health & Medicine (Emerald #10b981)
# 2. Engineering & Tech (Sapphire #0284c7)
# 3. Law & Justice (Royal Indigo #6366f1)
# 4. Finance & Business (Amber Gold #f59e0b)
# 5. Education & Leadership (Ruby Coral #f43f5e)
# ==============================================================================
universal_icon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Card Gradient -->
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>

    <!-- 5 Facet Gradients for the 5 Disciplines -->
    <!-- 1. Engineering / Tech (Sapphire) -->
    <linearGradient id="gBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <!-- 2. Health & Life Sciences (Emerald) -->
    <linearGradient id="gEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- 3. Finance & Accreditation (Amber Gold) -->
    <linearGradient id="gGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- 4. Education & Innovation (Coral) -->
    <linearGradient id="gCoral" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>

    <!-- 5. Law & Integrity (Indigo/Violet) -->
    <linearGradient id="gViolet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Central Gem Core -->
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </radialGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Squircle Base with Gold/Silver Rim -->
  <rect x="20" y="20" width="472" height="472" rx="108" fill="url(#iconBg)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" filter="url(#glow)"/>
  
  <!-- Outer Geometric Ring -->
  <circle cx="256" cy="256" r="185" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2"/>
  <circle cx="256" cy="256" r="215" fill="none" stroke="rgba(245, 158, 11, 0.15)" stroke-width="1.5" stroke-dasharray="8 8"/>

  <!-- UNIVERSAL PENTAGONAL CRYSTAL STAR (5 PETALS / FACETS OF COMPETENCY) -->
  <!-- Top Facet (Accreditation & Excellence - Gold) -->
  <path d="M 256 80 L 290 190 L 256 256 L 222 190 Z" fill="url(#gGold)"/>

  <!-- Top-Right Facet (Engineering & Tech - Sapphire) -->
  <path d="M 420 200 L 330 256 L 256 256 L 290 190 Z" fill="url(#gBlue)"/>

  <!-- Bottom-Right Facet (Health & Medicine - Emerald) -->
  <path d="M 358 395 L 295 315 L 256 256 L 330 256 Z" fill="url(#gEmerald)"/>

  <!-- Bottom-Left Facet (Education & Innovation - Coral) -->
  <path d="M 154 395 L 217 315 L 256 256 L 295 315 Z" fill="url(#gCoral)"/>

  <!-- Top-Left Facet (Law & Governance - Violet) -->
  <path d="M 92 200 L 182 256 L 256 256 L 222 190 Z" fill="url(#gViolet)"/>

  <!-- Facet Left Filler (Balanced Star Geometry) -->
  <path d="M 92 200 L 154 395 L 217 315 L 256 256 L 182 256 Z" fill="url(#gViolet)" opacity="0.85"/>
  <path d="M 420 200 L 358 395 L 295 315 L 256 256 L 330 256 Z" fill="url(#gBlue)" opacity="0.85"/>

  <!-- Inner Polished Diamond Bevels -->
  <polygon points="256,150 315,220 295,300 217,300 197,220" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="3"/>

  <!-- Central Glowing Seed of Competency (كـفـاءة) -->
  <circle cx="256" cy="256" r="32" fill="url(#coreGlow)" stroke="#ffffff" stroke-width="3"/>
  <circle cx="256" cy="256" r="16" fill="#ffffff"/>

  <!-- Dynamic Orbital Ring (Continuous Progression) -->
  <ellipse cx="256" cy="256" rx="160" ry="70" fill="none" stroke="url(#gGold)" stroke-width="4" transform="rotate(-25 256 256)" stroke-linecap="round" stroke-dasharray="140 30 70 20"/>
  <circle cx="390" cy="190" r="8" fill="#fef08a"/>
</svg>
'''

with open('kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(universal_icon_svg)

with open('kafaah/public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(universal_icon_svg)

# ==============================================================================
# 2. HORIZONTAL UNIVERSAL LOGO WITH BRAND TYPOGRAPHY (SVG)
# ==============================================================================
universal_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 140" width="720" height="140">
  <defs>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <linearGradient id="gMulti" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="25%" stop-color="#10b981" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="75%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <linearGradient id="gGoldDot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <!-- EMBLEM SYMBOL ON RIGHT (RTL First) -->
  <g transform="translate(580, 10) scale(0.23)">
    <!-- Base Squircle -->
    <rect x="20" y="20" width="472" height="472" rx="108" fill="#111827" stroke="rgba(255, 255, 255, 0.15)" stroke-width="4"/>
    <!-- Outer Ring -->
    <circle cx="256" cy="256" r="185" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="3"/>
    
    <!-- 5 Facets -->
    <path d="M 256 80 L 290 190 L 256 256 L 222 190 Z" fill="#f59e0b"/>
    <path d="M 420 200 L 330 256 L 256 256 L 290 190 Z" fill="#0284c7"/>
    <path d="M 358 395 L 295 315 L 256 256 L 330 256 Z" fill="#10b981"/>
    <path d="M 154 395 L 217 315 L 256 256 L 295 315 Z" fill="#f43f5e"/>
    <path d="M 92 200 L 182 256 L 256 256 L 222 190 Z" fill="#6366f1"/>
    <path d="M 92 200 L 154 395 L 217 315 L 256 256 L 182 256 Z" fill="#6366f1" opacity="0.8"/>
    <path d="M 420 200 L 358 395 L 295 315 L 256 256 L 330 256 Z" fill="#0284c7" opacity="0.8"/>
    <!-- Core -->
    <circle cx="256" cy="256" r="32" fill="#fef08a" stroke="#ffffff" stroke-width="4"/>
    <!-- Orbit -->
    <ellipse cx="256" cy="256" rx="160" ry="70" fill="none" stroke="#f59e0b" stroke-width="6" transform="rotate(-25 256 256)"/>
  </g>

  <!-- ARABIC BRAND TITLE -->
  <text x="560" y="68" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="46" 
        font-weight="900" 
        text-anchor="end" 
        fill="url(#goldText)" 
        letter-spacing="1">
    كـفـاءة
  </text>

  <!-- MULTI-COLOR ACCENT UNDERLINE -->
  <rect x="360" y="80" width="200" height="4" rx="2" fill="url(#gMulti)"/>

  <!-- GOLD STAR ACCENT -->
  <circle cx="566" cy="34" r="5" fill="url(#gGoldDot)"/>

  <!-- 3-MONTH FREE PROMO PILL -->
  <rect x="200" y="38" width="135" height="26" rx="13" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.5)" stroke-width="1.2"/>
  <text x="267" y="55" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="11.5" 
        font-weight="800" 
        text-anchor="middle" 
        fill="#f59e0b">
    🎉 مجاناً 3 أشهر بمناسبة الانطلاق
  </text>

  <!-- ARABIC SUBTITLE (UNIVERSAL ALL PROFESSIONS) -->
  <text x="560" y="104" 
        font-family="'Cairo', 'IBM Plex Sans Arabic', sans-serif" 
        font-size="14.5" 
        font-weight="700" 
        text-anchor="end" 
        fill="#94a3b8">
    المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني
  </text>

  <!-- LATIN SUBTITLE -->
  <text x="560" y="124" 
        font-family="'Inter', sans-serif" 
        font-size="10.5" 
        font-weight="700" 
        text-anchor="end" 
        letter-spacing="2" 
        fill="#38bdf8">
    KAFA'AH — PROFESSIONAL LICENSURE PLATFORM
  </text>
</svg>
'''

with open('kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(universal_logo_svg)

# ==============================================================================
# 3. MOBILE APP SHOWCASE GRAPHIC (FOR LANDING PAGE APP SECTION)
# ==============================================================================
mobile_app_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 600" width="100%" height="100%">
  <defs>
    <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>

    <linearGradient id="screenBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>

    <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#0284c7" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- SMARTPHONE FRAME -->
  <g transform="translate(120, 20)" filter="url(#phoneShadow)">
    <!-- Outer Bezel -->
    <rect x="0" y="0" width="300" height="560" rx="46" fill="url(#phoneBody)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="3"/>
    <!-- Screen -->
    <rect x="12" y="14" width="276" height="532" rx="36" fill="url(#screenBg)"/>
    
    <!-- Dynamic Island / Speaker Notch -->
    <rect x="95" y="24" width="110" height="24" rx="12" fill="#000000"/>
    <circle cx="185" cy="36" r="4.5" fill="#1e293b"/>

    <!-- App Content Inside Phone -->
    <!-- App Header -->
    <g transform="translate(24, 60)">
      <circle cx="20" cy="20" r="16" fill="rgba(245, 158, 11, 0.2)"/>
      <text x="20" y="25" font-size="14" text-anchor="middle">👑</text>
      <text x="230" y="18" font-family="'Cairo', sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="end">أهلاً د. محمد</text>
      <text x="230" y="32" font-family="'Cairo', sans-serif" font-size="10" fill="#94a3b8" text-anchor="end">خطة البورد • متبقي 28 يوماً</text>
    </g>

    <!-- Quick Stats Banner Inside Screen -->
    <g transform="translate(24, 112)">
      <rect x="0" y="0" width="252" height="90" rx="16" fill="url(#cardGrad1)"/>
      <text x="232" y="26" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="end">جاهزية اجتياز الامتحان</text>
      <text x="232" y="60" font-family="sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="end">94.8%</text>
      <text x="232" y="78" font-family="'Cairo', sans-serif" font-size="10" font-weight="700" fill="#fef08a" text-anchor="end">مستوى متقدم • تدربت على 1,420 سؤالاً</text>
      <circle cx="50" cy="45" r="28" fill="rgba(255, 255, 255, 0.15)"/>
      <text x="50" y="53" font-size="24" text-anchor="middle">🎯</text>
    </g>

    <!-- Action Shortcuts -->
    <g transform="translate(24, 216)">
      <!-- Box 1 -->
      <rect x="0" y="0" width="120" height="74" rx="12" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)"/>
      <text x="105" y="24" font-size="16">⏱</text>
      <text x="105" y="48" font-family="'Cairo', sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="end">امتحان مؤقت</text>
      <text x="105" y="62" font-family="'Cairo', sans-serif" font-size="9" fill="#94a3b8" text-anchor="end">محاكاة فورية</text>

      <!-- Box 2 -->
      <rect x="132" y="0" width="120" height="74" rx="12" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)"/>
      <text x="237" y="24" font-size="16">🤖</text>
      <text x="237" y="48" font-family="'Cairo', sans-serif" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="end">المعلم الذكي</text>
      <text x="237" y="62" font-family="'Cairo', sans-serif" font-size="9" fill="#94a3b8" text-anchor="end">مدعوم بـ Groq AI</text>
    </g>

    <!-- Today's Schedule Card -->
    <g transform="translate(24, 304)">
      <rect x="0" y="0" width="252" height="150" rx="14" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(56, 189, 248, 0.2)"/>
      <text x="232" y="24" font-family="'Cairo', sans-serif" font-size="11" font-weight="800" fill="#f59e0b" text-anchor="end">جلسة اليوم المقترحة من AI</text>
      
      <!-- item 1 -->
      <rect x="12" y="38" width="228" height="34" rx="8" fill="rgba(255, 255, 255, 0.03)"/>
      <text x="226" y="58" font-family="'Cairo', sans-serif" font-size="10.5" fill="#e2e8f0" text-anchor="end">50 سؤال في الحالات الحرجة</text>
      <text x="28" y="58" font-size="10" fill="#10b981">مكتمل ✓</text>

      <!-- item 2 -->
      <rect x="12" y="78" width="228" height="34" rx="8" fill="rgba(255, 255, 255, 0.03)"/>
      <text x="226" y="98" font-family="'Cairo', sans-serif" font-size="10.5" fill="#e2e8f0" text-anchor="end">مراجعة الأسئلة الخاطئة السابقة</text>
      <text x="28" y="98" font-size="10" fill="#f59e0b">قيد المراجعة</text>

      <!-- item 3 -->
      <rect x="12" y="118" width="228" height="24" rx="6" fill="rgba(2, 132, 199, 0.2)"/>
      <text x="126" y="134" font-family="'Cairo', sans-serif" font-size="10" font-weight="800" fill="#38bdf8" text-anchor="middle">بدء التدريب الآن</text>
    </g>

    <!-- App Bottom Nav in Phone -->
    <g transform="translate(24, 478)">
      <rect x="0" y="0" width="252" height="50" rx="20" fill="rgba(11, 17, 33, 0.95)" stroke="rgba(255, 255, 255, 0.1)"/>
      <text x="35" y="30" font-size="16" text-anchor="middle">👤</text>
      <text x="85" y="30" font-size="16" text-anchor="middle">📊</text>
      <text x="135" y="30" font-size="16" text-anchor="middle">⚡</text>
      <text x="185" y="30" font-size="16" text-anchor="middle">📖</text>
      <text x="225" y="30" font-size="16" text-anchor="middle">🏠</text>
      <circle cx="225" cy="42" r="2" fill="#f59e0b"/>
    </g>

    <!-- Home indicator bar -->
    <rect x="95" y="534" width="110" height="4" rx="2" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>
'''

with open('kafaah/public/images/app-mobile-mockup.svg', 'w', encoding='utf-8') as f:
    f.write(mobile_app_svg)

print("Generated universal brand assets and mobile app mockup successfully!")
