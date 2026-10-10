import os

project_dir = r"d:\professional_practice_exam\kafaah"
dashboard_dir = os.path.join(project_dir, 'src', 'app', 'dashboard')
os.makedirs(dashboard_dir, exist_ok=True)

# 1. Dashboard Layout
layout_content = """
import { Activity, BookOpen, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'white', borderLeft: '1px solid var(--line)', padding: '2rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--blue)', marginBottom: '3rem' }}>
          🛡️ كفاءة
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--blue)', fontWeight: 'bold', padding: '0.8rem', background: 'var(--mint)', borderRadius: '12px' }}>
            <Activity size={20} /> نظرة عامة
          </Link>
          <Link href="/dashboard/exams" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--muted)', fontWeight: '500', padding: '0.8rem' }}>
            <BookOpen size={20} /> اختباراتي
          </Link>
          <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--muted)', fontWeight: '500', padding: '0.8rem' }}>
            <User size={20} /> الملف الشخصي
          </Link>
          <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--muted)', fontWeight: '500', padding: '0.8rem' }}>
            <Settings size={20} /> الإعدادات
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem' }}>
        {children}
      </main>
    </div>
  );
}
"""
with open(os.path.join(dashboard_dir, 'layout.js'), 'w', encoding='utf-8') as f:
    f.write(layout_content)

# 2. Dashboard Page
page_content = """'use client';
import { localDB } from '../../lib/mockDb';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const user = localDB.currentUser;

  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '2rem', color: 'var(--navy-deep)', marginBottom: '0.5rem' }}
      >
        أهلاً بك، {user.name} 👋
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        style={{ color: 'var(--muted)', marginBottom: '3rem' }}
      >
        الباقة الحالية: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{user.subscription}</span>
      </motion.p>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--line)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--muted)', fontSize: '1rem' }}>الأسئلة المجابة</h3>
            <div style={{ background: 'var(--mint)', color: 'var(--blue)', padding: '0.5rem', borderRadius: '10px' }}><Target size={24} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--navy-deep)' }}>{user.stats.medical.total}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--line)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--muted)', fontSize: '1rem' }}>الإجابات الصحيحة</h3>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '10px' }}><TrendingUp size={24} /></div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--navy-deep)' }}>{user.stats.medical.correct}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--line)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--muted)', fontSize: '1rem' }}>نقاط الضعف</h3>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.5rem', borderRadius: '10px' }}><AlertTriangle size={24} /></div>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>أمراض القلب والأوعية</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>دقة الإجابة 40% فقط</p>
        </motion.div>
      </div>

      {/* Suggested Actions */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-deep)', marginBottom: '1.5rem' }}>اقتراحات الذكاء المهني</h2>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--line)' }}>
        <p style={{ color: 'var(--muted)', lineHeight: '1.8' }}>
          بناءً على تحليلاتنا، لاحظنا أنك تواجه صعوبة في أسئلة <strong>ضغط الدم وأمراض القلب</strong>.
          <br/>
          نقترح عليك إجراء اختبار محاكاة مصغر (10 أسئلة) مخصص لهذه الفئة لرفع كفاءتك.
        </p>
        <button style={{ background: 'var(--blue)', color: 'white', padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.5rem' }}>
          بدء الاختبار المخصص
        </button>
      </div>
    </div>
  );
}
"""
with open(os.path.join(dashboard_dir, 'page.js'), 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Dashboard with local mock DB is ready.")
