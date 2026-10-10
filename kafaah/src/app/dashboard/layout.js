'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BrainCircuit, Activity, BookOpen,
  BarChart3, Search, AlertTriangle, Star, Repeat,
  Globe, Database, Plus, Settings, User
} from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
  { label: 'التدريب الذكي', path: '/dashboard/practice', icon: BrainCircuit },
  { label: 'الاختبار المحاكي', path: '/dashboard/mock', icon: Activity },
  { label: 'بنك الأسئلة', path: '/dashboard/bank', icon: BookOpen },
  { label: 'التحليل والذكاء', path: '/dashboard/analytics', icon: BarChart3 },
  { label: 'البحث الشامل', path: '/dashboard/search', icon: Search },
  { label: 'مراجعة الأخطاء', path: '/dashboard/mistakes', icon: AlertTriangle },
  { label: 'الأسئلة المحفوظة', path: '/dashboard/saved', icon: Star },
  { label: 'الأسئلة المتكررة', path: '/dashboard/frequency', icon: Repeat },
  { label: 'الذكاء التقاطعي', path: '/dashboard/cross', icon: Globe },
  { label: 'إنشاء اختبار', path: '/dashboard/create', icon: Plus },
  { label: 'قاعدة البيانات', path: '/dashboard/database', icon: Database },
  { label: 'الملف الشخصي', path: '/dashboard/profile', icon: User },
  { label: 'الإعدادات', path: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-wrap">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5, padding: '0 14px 12px' }}>
          القائمة الرئيسية
        </div>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = pathname === path || (path !== '/dashboard' && pathname?.startsWith(path));
          return (
            <Link key={path} href={path} style={{ textDecoration: 'none' }}>
              <motion.div
                className={`sidebar-link${isActive ? ' active' : ''}`}
                whileHover={{ x: -4 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={18} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </aside>

      {/* ── Main Content ── */}
      <motion.main
        className="main-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
