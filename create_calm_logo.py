import os
from PIL import Image, ImageDraw, ImageFont

# Let's create an ultra-clean, serene, prestigious SVG emblem for Kafa'ah
svg_icon = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Soft pearl white background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>

    <!-- Deep noble emerald gradient (calm, institutional, trustworthy) -->
    <linearGradient id="nobleEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="50%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>

    <!-- Refined champagne gold gradient -->
    <linearGradient id="champagneGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <!-- Slate soft accent -->
    <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Very subtle ambient shadow for the card -->
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.05"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#047857" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Base Squircle Container (Light, Pristine, Architectural) -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" stroke="#e2e8f0" stroke-width="2" filter="url(#softGlow)"/>

  <!-- Official Accreditation Concentric Rings (ختم الاعتماد الهادئ) -->
  <circle cx="256" cy="256" r="196" fill="none" stroke="#f1f5f9" stroke-width="12"/>
  <circle cx="256" cy="256" r="184" fill="none" stroke="url(#nobleEmerald)" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.4"/>
  <circle cx="256" cy="256" r="172" fill="none" stroke="url(#champagneGold)" stroke-width="1.5" opacity="0.8"/>

  <!-- 4 Cardinal Accreditation Dots -->
  <circle cx="256" cy="72" r="3.5" fill="url(#champagneGold)"/>
  <circle cx="256" cy="440" r="3.5" fill="url(#champagneGold)"/>
  <circle cx="72" cy="256" r="3.5" fill="url(#champagneGold)"/>
  <circle cx="440" cy="256" r="3.5" fill="url(#champagneGold)"/>

  <!-- ── CENTRAL EMBLEM: THE CALM WINGS OF COMPETENCE & OPEN BOOK OF KNOWLEDGE ── -->
  <!-- Foundation Pedestal (قاعدة المعرفة والترخيص) -->
  <path d="M 170 365 C 220 375, 292 375, 342 365 C 348 364, 350 358, 345 354 C 310 330, 275 324, 256 324 C 237 324, 202 330, 167 354 C 162 358, 164 364, 170 365 Z"
        fill="url(#nobleEmerald)" opacity="0.95"/>

  <!-- Inner Gold Arc of Foundation -->
  <path d="M 195 348 C 230 338, 282 338, 317 348"
        fill="none" stroke="url(#champagneGold)" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Right Wing / Arch of the Letter 'Kaf' (ك) - Smooth, Authoritative & Balanced -->
  <path d="M 334 186 C 334 140, 280 140, 256 168 C 232 140, 178 140, 178 186 C 178 250, 240 295, 256 308 C 272 295, 334 250, 334 186 Z"
        fill="none" stroke="url(#nobleEmerald)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Left Inner Wing / Ascent of Progress -->
  <path d="M 214 200 C 214 235, 242 264, 256 274 C 270 264, 298 235, 298 200"
        fill="none" stroke="url(#champagneGold)" stroke-width="7" stroke-linecap="round"/>

  <!-- Center Golden Quill / Torch of Enlightenment (شعلة الكفاءة) -->
  <path d="M 256 160 L 256 244"
        stroke="url(#champagneGold)" stroke-width="6" stroke-linecap="round"/>

  <!-- Golden Diamond Star of National Accreditation (نجمة الاعتماد الخماسية الملكية) -->
  <g transform="translate(256, 120)">
    <!-- 8-point geometric star -->
    <path d="M 0 -22 L 6 -7 L 21 0 L 6 7 L 0 22 L -6 7 L -21 0 L -6 -7 Z"
          fill="url(#champagneGold)"/>
    <circle cx="0" cy="0" r="3.5" fill="#ffffff"/>
  </g>

  <!-- Dual Subtle Laurel Branches (غصنا الغار الأكاديمي والمهني) -->
  <g fill="url(#nobleEmerald)" opacity="0.8">
    <!-- Right side leaves -->
    <path d="M 358 280 C 370 270, 385 275, 382 288 C 378 296, 366 295, 358 280 Z"/>
    <path d="M 370 310 C 382 305, 392 314, 386 325 C 380 332, 370 326, 370 310 Z"/>
    <path d="M 360 340 C 372 340, 378 352, 370 360 C 362 366, 355 356, 360 340 Z"/>
    
    <!-- Left side leaves -->
    <path d="M 154 280 C 142 270, 127 275, 130 288 C 134 296, 146 295, 154 280 Z"/>
    <path d="M 142 310 C 130 305, 120 314, 126 325 C 132 332, 142 326, 142 310 Z"/>
    <path d="M 152 340 C 140 340, 134 352, 142 360 C 150 366, 157 356, 152 340 Z"/>
  </g>
</svg>
'''

# Let's also create the full horizontal logo SVG
svg_logo = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 90" width="460" height="90">
  <defs>
    <linearGradient id="hEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="hGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Right-aligned Emblem (in RTL layout, logo mark on right) -->
  <g transform="translate(375, 6) scale(0.15)">
    <!-- Base Squircle -->
    <rect x="0" y="0" width="512" height="512" rx="112" fill="#ffffff" stroke="#e2e8f0" stroke-width="8"/>
    <circle cx="256" cy="256" r="200" fill="none" stroke="#f1f5f9" stroke-width="14"/>
    <circle cx="256" cy="256" r="184" fill="none" stroke="url(#hEmerald)" stroke-width="4" stroke-dasharray="8 8" opacity="0.4"/>
    <circle cx="256" cy="256" r="172" fill="none" stroke="url(#hGold)" stroke-width="3" opacity="0.8"/>
    
    <!-- Base -->
    <path d="M 170 365 C 220 375, 292 375, 342 365 C 348 364, 350 358, 345 354 C 310 330, 275 324, 256 324 C 237 324, 202 330, 167 354 C 162 358, 164 364, 170 365 Z"
          fill="url(#hEmerald)"/>
    <path d="M 195 348 C 230 338, 282 338, 317 348" fill="none" stroke="url(#hGold)" stroke-width="5" stroke-linecap="round"/>
    
    <!-- Arch & Wings -->
    <path d="M 334 186 C 334 140, 280 140, 256 168 C 232 140, 178 140, 178 186 C 178 250, 240 295, 256 308 C 272 295, 334 250, 334 186 Z"
          fill="none" stroke="url(#hEmerald)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 214 200 C 214 235, 242 264, 256 274 C 270 264, 298 235, 298 200"
          fill="none" stroke="url(#hGold)" stroke-width="14" stroke-linecap="round"/>
    <path d="M 256 160 L 256 244" stroke="url(#hGold)" stroke-width="12" stroke-linecap="round"/>
    
    <!-- Star -->
    <g transform="translate(256, 120)">
      <path d="M 0 -30 L 8 -10 L 28 0 L 8 10 L 0 30 L -8 10 L -28 0 L -8 -10 Z" fill="url(#hGold)"/>
      <circle cx="0" cy="0" r="5" fill="#ffffff"/>
    </g>
  </g>

  <!-- Typography: Wordmark and Subtitle in Arabic -->
  <g direction="rtl">
    <!-- Brand Title: كـفـاءة -->
    <text x="360" y="44" 
          font-family="'Alexandria', 'Tajawal', 'IBM Plex Sans Arabic', system-ui, sans-serif" 
          font-size="32" 
          font-weight="900" 
          fill="#0f172a" 
          text-anchor="end">
      كـفـاءة
    </text>

    <!-- Calm Golden Accent Dot -->
    <circle cx="258" cy="24" r="4.5" fill="url(#hGold)"/>

    <!-- Subtle Premium Badge on the left of title -->
    <rect x="135" y="18" width="112" height="24" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="1"/>
    <text x="191" y="34.5" 
          font-family="'IBM Plex Sans Arabic', system-ui, sans-serif" 
          font-size="11" 
          font-weight="800" 
          fill="#047857" 
          text-anchor="middle">
      الاعتماد والترخيص
    </text>

    <!-- Subtitle: المنصة الوطنية لتراخيص المهن والاعتماد المهني -->
    <text x="360" y="66" 
          font-family="'IBM Plex Sans Arabic', 'Tajawal', system-ui, sans-serif" 
          font-size="12.5" 
          font-weight="700" 
          fill="#475569" 
          text-anchor="end"
          letter-spacing="0.2">
      المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني
    </text>
  </g>
</svg>
'''

with open('d:/professional_practice_exam/kafaah/public/kafaah-icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

with open('d:/professional_practice_exam/kafaah/public/icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

with open('d:/professional_practice_exam/kafaah/public/kafaah-logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_logo)

print("Saved SVG files successfully!")
