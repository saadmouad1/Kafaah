import os

project_dir = r"d:\professional_practice_exam\kafaah"

css_content = """
:root {
  --navy: #0f172a;
  --navy-light: #1e293b;
  --blue: #3b82f6;
  --teal: #06b6d4;
  --cyan: #22d3ee;
  --mint: #f0fdfa;
  --gold: #f59e0b;
  --purple: #8b5cf6;
  --pink: #ec4899;
  --bg: #f8fafc;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --line: #e2e8f0;
  
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --shadow-float: 0 20px 40px -15px rgba(0,0,0,0.15);
  --shadow-glow: 0 0 30px rgba(59, 130, 246, 0.4);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  color: var(--text-main);
  background: var(--bg);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  direction: rtl;
  overflow-x: hidden;
  padding-bottom: 80px; /* Space for Mobile Bottom Nav */
}

/* Glassmorphism Topbar */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}
@media (max-width: 768px) {
  .auth-buttons {
    display: none;
  }
}

.btn {
  background: linear-gradient(135deg, var(--blue), var(--teal));
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 99px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modern Mobile Bottom Nav */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 0.8rem 1rem;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: var(--shadow-float);
}
@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
  .topbar { padding: 1rem; }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
}
.nav-item.active {
  color: var(--blue);
}

/* Dashboard Grid (Desktop + Mobile) */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 280px;
  background: white;
  border-left: 1px solid var(--line);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (max-width: 768px) {
  .sidebar { display: none; }
}
.main-content {
  flex: 1;
  padding: 2rem;
  padding-bottom: 6rem;
}
@media (max-width: 768px) {
  .main-content { padding: 1rem; padding-bottom: 6rem; }
}

/* 3D Cards */
.card-3d {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 10px 30px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.5);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-3d:hover {
  box-shadow: var(--shadow-float);
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'globals.css'), 'w', encoding='utf-8') as f:
    f.write(css_content)

layout_content = """'use client';
import './globals.css';
import { Home, Compass, User, BrainCircuit, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body>
        <header className="topbar">
          <div className="brand">
            🛡️ كفاءة
          </div>
          <div className="auth-buttons">
            <Link href="/dashboard" className="btn">لوحة التحكم</Link>
          </div>
        </header>

        {children}

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <Home size={24} />
            <span>الرئيسية</span>
          </Link>
          <Link href="/dashboard/practice" className={`nav-item ${pathname?.includes('/practice') ? 'active' : ''}`}>
            <Compass size={24} />
            <span>تدريب</span>
          </Link>
          <Link href="/dashboard/analytics" className={`nav-item ${pathname?.includes('/analytics') ? 'active' : ''}`}>
            <BrainCircuit size={24} />
            <span>الذكاء</span>
          </Link>
          <Link href="/dashboard/profile" className={`nav-item ${pathname?.includes('/profile') ? 'active' : ''}`}>
            <User size={24} />
            <span>حسابي</span>
          </Link>
        </nav>
      </body>
    </html>
  )
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'layout.js'), 'w', encoding='utf-8') as f:
    f.write(layout_content)

dashboard_layout = """'use client';
import { BrainCircuit, BookOpen, Settings, LayoutDashboard, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'الملخص العالمي', path: '/dashboard', icon: LayoutDashboard },
    { name: 'التدريب الذكي', path: '/dashboard/practice', icon: BrainCircuit },
    { name: 'الاختبارات المحاكية', path: '/dashboard/exams', icon: Target },
    { name: 'التحليل المتقدم', path: '/dashboard/analytics', icon: Zap },
    { name: 'مراجعة المناهج', path: '/dashboard/subjects', icon: BookOpen },
    { name: 'الإعدادات', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          القائمة الرئيسية
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.path} style={{ textDecoration: 'none' }}>
                <motion.div 
                  whileHover={{ scale: 1.02, x: -5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem', borderRadius: '16px',
                    background: isActive ? 'var(--blue)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    fontWeight: isActive ? 'bold' : '600',
                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                  }}
                >
                  <Icon size={20} /> {item.name}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
"""
with open(os.path.join(project_dir, 'src', 'app', 'dashboard', 'layout.js'), 'w', encoding='utf-8') as f:
    f.write(dashboard_layout)

print("Mobile-first architecture and 3D base updated.")
