import os
import shutil

project_dir = r"d:\professional_practice_exam\kafaah"

# Ensure public dir exists
os.makedirs(os.path.join(project_dir, 'public'), exist_ok=True)

# 1. globals.css
css_content = """
:root {
  --navy: #3c4a5c;
  --navy-deep: #2b3744;
  --blue: #1da1f2;
  --teal: #6fb9e6;
  --cyan: #a3d8f4;
  --mint: #f0f5f8;
  --gold: #f2b84b;
  --purple: #8c9eff;
  --ink: #2c3e50;
  --muted: #7f8c8d;
  --bg: #f5f7fa;
  --line: #e1e8ed;
  --shadow-soft: 0 10px 30px rgba(60, 74, 92, 0.07);
  --shadow-card: 0 14px 34px rgba(60, 74, 92, 0.09);
  --foreground-rgb: 44, 62, 80;
  --background-start-rgb: 245, 247, 250;
  --background-end-rgb: 255, 255, 255;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  color: var(--ink);
  background: var(--bg);
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
  direction: rtl;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--navy);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  background: var(--blue);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  text-decoration: none;
}
.btn:hover {
  transform: translateY(-2px);
  background: var(--navy);
}
.btn-outline {
  background: transparent;
  color: var(--navy);
  border: 2px solid var(--navy);
}
.btn-outline:hover {
  background: var(--navy);
  color: white;
}

.hero {
  background: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 58%, var(--blue) 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  border-radius: 0 0 3rem 3rem;
  box-shadow: var(--shadow-card);
}

.hero h1 {
  font-size: 3.2rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.hero p {
  font-size: 1.4rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  text-align: center;
  border: 1px solid var(--line);
  transition: transform 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
}

.card h3 {
  color: var(--navy);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.card p {
  color: var(--muted);
  line-height: 1.6;
}
"""
os.makedirs(os.path.join(project_dir, 'src', 'app'), exist_ok=True)
with open(os.path.join(project_dir, 'src', 'app', 'globals.css'), 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. layout.js
layout_content = """
import './globals.css'

export const metadata = {
  title: "Kafa'ah | Professional Licensure Exams",
  description: "Advanced Professional Licensure Question Bank & Exam Intelligence",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="topbar">
          <div className="brand">
            <span style={{fontSize: '2rem'}}>🛡️</span> منصة كفاءة
          </div>
          <div className="auth-buttons">
            <a href="/login" className="btn btn-outline">تسجيل الدخول</a>
            <a href="/register" className="btn">إنشاء حساب</a>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'layout.js'), 'w', encoding='utf-8') as f:
    f.write(layout_content)

# 3. page.js
page_content = """
export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>كفاءة (Kafa'ah)</h1>
        <p>المنصة الاحترافية الأولى للتدريب على رخص مزاولة المهن لجميع التخصصات. اختبر جاهزيتك، حلل أداءك، وانطلق نحو التميز المهني.</p>
        <div style={{marginTop: '2rem'}}>
          <a href="/register" className="btn" style={{marginLeft: '1rem', background: 'white', color: 'var(--navy)'}}>ابدأ تدريبك مجاناً</a>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>جميع التخصصات المهنية</h3>
          <p>أسئلة واختبارات شاملة لجميع المسارات: الطب، الهندسة، المحاماة، التعليم، المحاسبة، وتقنية المعلومات.</p>
        </div>
        <div className="card">
          <h3>الذكاء المهني والتحليل</h3>
          <p>خوارزميات ذكية تحلل مستواك ونقاط ضعفك بدقة لتوجيه مسار تعلمك وتجهيزك للاختبار الحقيقي.</p>
        </div>
        <div className="card">
          <h3>اختبارات محاكاة واقعية</h3>
          <p>أجرِ اختبارات تجريبية بوقت محدد تحاكي بيئة الاختبار الفعلي مع تقارير أداء مفصلة.</p>
        </div>
        <div className="card">
          <h3>لوحة تحكم وتتبع شامل</h3>
          <p>تابع تقدمك، راجع أخطاءك، وقم بإدارة اشتراكك بكل سهولة من خلال واجهة حديثة وسهلة الاستخدام.</p>
        </div>
      </section>
    </main>
  );
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'page.js'), 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Setup script for basic Next.js files is ready.")
