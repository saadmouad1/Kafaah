import os, json

BASE = r"d:\professional_practice_exam\kafaah\src\app\dashboard"

pages_data = {
  "analytics": ("📊", "التحليل والذكاء", "تحليل دقيق لأدائك حسب كل تخصص ومستوى — قريباً", "#ec4899"),
  "bank": ("📚", "بنك الأسئلة", "تصفح الآلاف من الأسئلة مع فلاتر متعددة — قريباً", "#f59e0b"),
  "mock": ("⏱️", "الاختبار المحاكي", "اختبار موقوت بمحاكاة كاملة لبيئة الاختبار الحقيقي — قريباً", "#06b6d4"),
  "mistakes": ("⚠️", "مراجعة الأخطاء", "راجع كل الأسئلة التي أخطأت فيها — قريباً", "#f97316"),
  "saved": ("⭐", "الأسئلة المحفوظة", "قائمتك الشخصية من الأسئلة المهمة — قريباً", "#eab308"),
  "frequency": ("🔁", "الأسئلة المتكررة", "الأسئلة الأكثر تكراراً والمواضيع الأهم — قريباً", "#6366f1"),
  "search": ("🔎", "البحث الاحترافي الشامل", "ابحث في كل قاعدة البيانات والأسئلة والتفسيرات — قريباً", "#10b981"),
  "cross": ("🌐", "الذكاء التقاطعي", "أسئلة متشابهة عبر قواعد البيانات المختلفة — قريباً", "#8b5cf6"),
  "create": ("🛠️", "إنشاء اختبار خاص", "أنشئ اختبارك المخصص بأسئلتك الخاصة — قريباً", "#f97316"),
  "database": ("🗃️", "إدارة قاعدة البيانات", "استورد وأدر ملفات JSON الخاصة بك — قريباً", "#64748b"),
  "profile": ("👤", "الملف الشخصي", "تعديل بياناتك ومعلومات تخصصك — قريباً", "#3b82f6"),
  "settings": ("⚙️", "الإعدادات", "إعدادات الصوت، الاحتفالات، وقاعدة البيانات — قريباً", "#94a3b8"),
}

template = """'use client';
export default function {Name}Page() {{
  return (
    <div style={{{{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}}}>
      <div style={{{{ fontSize: 72, marginBottom: 24 }}}}>{emoji}</div>
      <h1 style={{{{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 12 }}}}>
        {title}
      </h1>
      <p style={{{{ color: '#64748b', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}}}>
        {desc}
      </p>
      <div style={{{{ display: 'inline-block', background: '{color}22', border: '1px solid {color}44', color: '{color}', padding: '10px 28px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}}}>
        🚧 قيد التطوير — سيكون جاهزاً قريباً
      </div>
    </div>
  );
}}
"""

for key, (emoji, title, desc, color) in pages_data.items():
    name = key.capitalize()
    content = template.format(Name=name, emoji=emoji, title=title, desc=desc, color=color)
    path = os.path.join(BASE, key, 'page.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created: {path}")

print("All placeholder pages created.")
