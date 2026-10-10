import os

project_dir = r"d:\professional_practice_exam\kafaah"

css_content = """
:root {
  --navy: #3c4a5c;
  --navy-deep: #1e293b;
  --blue: #1da1f2;
  --teal: #38bdf8;
  --cyan: #a3d8f4;
  --mint: #f0f9ff;
  --gold: #f59e0b;
  --purple: #818cf8;
  --ink: #0f172a;
  --muted: #64748b;
  --bg: #f8fafc;
  --line: #e2e8f0;
  
  --shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.05);
  --shadow-glow: 0 0 40px rgba(56, 189, 248, 0.3);
  --shadow-card: 0 20px 40px -10px rgba(15, 23, 42, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  color: var(--ink);
  background: var(--bg);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  direction: rtl;
  overflow-x: hidden;
}

/* Glassmorphism Topbar */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 4rem;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--navy-deep), var(--blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.auth-buttons {
  display: flex;
  gap: 1.2rem;
}

.btn {
  background: linear-gradient(135deg, var(--blue), var(--teal));
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 99px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(29, 161, 242, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--navy);
  border: 2px solid var(--line);
  box-shadow: none;
}

.btn-outline:hover {
  background: var(--mint);
  border-color: var(--blue);
  color: var(--blue);
  box-shadow: none;
}

/* Modern Hero Section */
.hero-wrapper {
  position: relative;
  overflow: hidden;
  background: var(--navy-deep);
  border-radius: 0 0 4rem 4rem;
  padding: 8rem 2rem;
}

/* Abstract Background Shapes */
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
}
.shape-1 {
  background: var(--blue);
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  opacity: 0.4;
}
.shape-2 {
  background: var(--purple);
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  opacity: 0.3;
}
.shape-3 {
  background: var(--teal);
  width: 250px;
  height: 250px;
  top: 40%;
  left: 30%;
  opacity: 0.2;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  max-width: 900px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.5rem;
  border-radius: 99px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 2rem;
  backdrop-filter: blur(5px);
}

.hero h1 {
  font-size: 4.5rem;
  margin-bottom: 1.5rem;
  font-weight: 900;
  line-height: 1.2;
  background: linear-gradient(to right, #ffffff, var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.4rem;
  color: var(--line);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.8;
}

/* Feature Cards with Hover Effects */
.features-section {
  padding: 6rem 2rem;
  background: var(--bg);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: var(--navy-deep);
  margin-bottom: 4rem;
  font-weight: 800;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent, var(--mint));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 70px;
  height: 70px;
  background: var(--mint);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--blue);
  transition: transform 0.3s ease;
}

.card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  background: var(--blue);
  color: white;
  box-shadow: var(--shadow-glow);
}

.card h3 {
  color: var(--navy-deep);
  font-size: 1.6rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.card p {
  color: var(--muted);
  line-height: 1.7;
  font-size: 1.05rem;
}

/* Stats Section */
.stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  padding: 4rem 2rem;
  background: white;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  color: var(--blue);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--muted);
  font-size: 1.1rem;
  font-weight: 500;
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'globals.css'), 'w', encoding='utf-8') as f:
    f.write(css_content)

page_content = """'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, BrainCircuit, Activity, BarChart3, ArrowLeft, Trophy, Users, Star } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-wrapper">
        {/* Animated Background Shapes */}
        <motion.div 
          className="shape shape-1"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="shape shape-2"
          animate={{ scale: [1, 1.5, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="shape shape-3"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div 
          className="hero-content hero"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="badge">
            الإصدار الاحترافي 2027
          </motion.div>
          <motion.h1 variants={itemVariants}>
            ارتقِ بمستقبلك المهني مع <br/>منصة كفاءة
          </motion.h1>
          <motion.p variants={itemVariants}>
            أقوى منصة تدريبية مدعومة بالذكاء الاصطناعي لاجتياز اختبارات رخص مزاولة المهن بكفاءة عالية وفي جميع التخصصات.
          </motion.p>
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/register" className="btn" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem' }}>
              ابدأ تجربتك المجانية <ArrowLeft size={20} />
            </a>
            <a href="#features" className="btn btn-outline" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              اكتشف المميزات
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <motion.div className="stat-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="stat-number">+10,000</div>
          <div className="stat-label">سؤال تدريبي</div>
        </motion.div>
        <motion.div className="stat-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <div className="stat-number">6</div>
          <div className="stat-label">تخصصات شاملة</div>
        </motion.div>
        <motion.div className="stat-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
          <div className="stat-number">99%</div>
          <div className="stat-label">نسبة الاجتياز</div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          لماذا تختار كفاءة؟
        </motion.h2>
        
        <motion.div 
          className="features"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="card" variants={itemVariants} whileHover={{ y: -10 }}>
            <div className="card-icon"><ShieldCheck size={36} /></div>
            <h3>اعتماد وموثوقية</h3>
            <p>أسئلة محدثة ومطابقة لمعايير الهيئات المتخصصة تضمن لك التدريب على أحدث الأنماط لعام 2027.</p>
          </motion.div>
          
          <motion.div className="card" variants={itemVariants} whileHover={{ y: -10 }}>
            <div className="card-icon"><BrainCircuit size={36} /></div>
            <h3>الذكاء المهني (AI)</h3>
            <p>نحلل إجاباتك ونحدد نقاط ضعفك بدقة متناهية لتوجيه مسار دراستك وتوفير وقتك وجهدك.</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -10 }}>
            <div className="card-icon"><Activity size={36} /></div>
            <h3>محاكاة واقعية</h3>
            <p>اختبارات تجريبية موقوتة تضعك في بيئة الاختبار الحقيقي لتكسر حاجز الرهبة.</p>
          </motion.div>

          <motion.div className="card" variants={itemVariants} whileHover={{ y: -10 }}>
            <div className="card-icon"><BarChart3 size={36} /></div>
            <h3>تقارير تفصيلية</h3>
            <p>لوحة تحكم متقدمة تتبع تقدمك وتمنحك تقارير شاملة عن أدائك في كل تخصص فرعي.</p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'page.js'), 'w', encoding='utf-8') as f:
    f.write(page_content)

layout_content = """
import './globals.css'
import { Shield } from 'lucide-react';

export const metadata = {
  title: "Kafa'ah | Professional Licensure Exams",
  description: "Advanced Professional Licensure Question Bank & Exam Intelligence",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1da1f2" />
      </head>
      <body>
        <header className="topbar">
          <div className="brand">
            <span style={{ fontSize: '2rem' }}>🛡️</span> كفاءة
          </div>
          <div className="auth-buttons">
            <a href="/login" className="btn btn-outline">تسجيل الدخول</a>
            <a href="/register" className="btn">إنشاء حساب حقيقي</a>
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

print("Advanced UI Script execution complete.")
