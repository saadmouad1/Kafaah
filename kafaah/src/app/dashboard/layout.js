'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BrainCircuit, Activity, BookOpen,
  BarChart3, Search, AlertTriangle, Star, Repeat,
  Globe, Plus, Settings, User, LogOut, ChevronRight, ChevronLeft
} from 'lucide-react';
import { localDB } from '../../lib/mockDb';

const navItems = [
  { label: 'الرئيسية', path: '/dashboard', icon: LayoutDashboard },
  { label: 'التدريب الذكي', path: '/dashboard/practice', icon: BrainCircuit },
  { label: 'محاكاة الاختبار', path: '/dashboard/mock', icon: Activity },
  { label: 'بنك الأسئلة', path: '/dashboard/bank', icon: BookOpen },
  { label: 'تحليل الأداء', path: '/dashboard/analytics', icon: BarChart3 },
  { label: 'البحث الشامل', path: '/dashboard/search', icon: Search },
  { label: 'سجل الأخطاء', path: '/dashboard/mistakes', icon: AlertTriangle },
  { label: 'المفضلة', path: '/dashboard/saved', icon: Star },
  { label: 'الإعدادات', path: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState({
    name: 'طالب كفاءة',
    subscription: 'الباقة الشاملة',
  });

  useEffect(() => {
    const session = localStorage.getItem('kafaah_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        setUser({
          name: data.name || 'طالب كفاءة',
          subscription: 'الباقة الشاملة',
        });
      } catch (e) {}
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 280,
        background: '#ffffff',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: 'var(--shadow-subtle)',
        zIndex: 10
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{user.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--emerald-dark)', fontWeight: 700, background: 'var(--emerald-light)', padding: '2px 8px', borderRadius: 999, display: 'inline-block' }}>
                {user.subscription}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, paddingRight: 8 }}>القائمة الرئيسية</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive = pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
              return (
                <Link key={path} href={path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: -4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: isActive ? 'var(--emerald-light)' : 'transparent',
                      color: isActive ? 'var(--emerald-dark)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 800 : 600,
                      transition: 'all 0.2s ease',
                      border: isActive ? '1px solid var(--emerald-glow)' : '1px solid transparent'
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {isActive && <ChevronLeft size={16} />}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(1rem, 4vw, 3rem)' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: 1100, margin: '0 auto' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
