'use client';
import { motion } from 'framer-motion';
import { localDB } from '../../lib/mockDb';
import Link from 'next/link';
import {
  BrainCircuit, Activity, BookOpen, BarChart3, Search,
  AlertTriangle, Star, Repeat, Globe, Plus, Database,
  TrendingUp, Target, Zap, ArrowLeft, CheckCircle2, Award
} from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const quickLinks = [
  { label: 'التدريب الذكي', sub: 'سؤال تلو الآخر مع الشرح', href: '/dashboard/practice', icon: BrainCircuit, color: '#059669', bg: '#ecfdf5', border: '#10b981' },
  { label: 'الاختبار المحاكي', sub: 'موقوت بمحاكاة البورد', href: '/dashboard/mock', icon: Activity, color: '#0284c7', bg: '#e0f2fe', border: '#0284c7' },
  { label: 'بنك الأسئلة الشامل', sub: 'تصفح وفلترة حسب التخصص', href: '/dashboard/bank', icon: BookOpen, color: '#d97706', bg: '#fef3c7', border: '#f59e0b' },
  { label: 'التحليل والذكاء', sub: 'نقاط القوة والجاهزية', href: '/dashboard/analytics', icon: BarChart3, color: '#ea580c', bg: '#ffedd5', border: '#f97316' },
  { label: 'مراجعة الأخطاء', sub: 'الأسئلة التي أخطأت بها', href: '/dashboard/mistakes', icon: AlertTriangle, color: '#e11d48', bg: '#ffe4e6', border: '#f43f5e' },
  { label: 'الأسئلة المفضلة', sub: 'قائمتك للمراجعة السريعة', href: '/dashboard/saved', icon: Star, color: '#b45309', bg: '#fffbeb', border: '#fbbf24' },
  { label: 'البحث الشامل', sub: 'في بنوك الأسئلة المعتمدة', href: '/dashboard/search', icon: Search, color: '#0f766e', bg: '#ccfbf1', border: '#0d9488' },
  { label: 'الأسئلة المتكررة', sub: 'أسئلة الدورات الأخيرة', href: '/dashboard/frequency', icon: Repeat, color: '#4338ca', bg: '#e0e7ff', border: '#6366f1' },
];

export default function Dashboard() {
  const user = localDB.currentUser;
  const totalAnswered = user?.stats?.medical?.total || 120;
  const totalCorrect = user?.stats?.medical?.correct || 94;
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 78;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      {/* ── Welcome Header ── */}
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        
        <motion.div variants={fade} style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(226, 232, 240, 0.85)',
          borderRadius: 22,
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                مرحباً بك، د. {user.name} 👋
              </h1>
              <span style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#047857',
                padding: '3px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800
              }}>
                حساب نشط
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: 14.5, fontWeight: 600 }}>
              نوع الاشتراك: <strong style={{ color: '#b45309' }}>{user.subscription}</strong> — وصول غير محدود لجميع التخصصات والاختبارات
            </p>
          </div>

          <Link
            href="/dashboard/practice"
            className="btn btn-emerald"
            style={{ padding: '13px 26px', fontSize: 15 }}
          >
            <Zap size={18} />
            متابعة التدريب الذكي الآن
          </Link>
        </motion.div>

        {/* ── 4 KPI Stats Cards ── */}
        <motion.div variants={fade} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: '2rem' }}>
          {[
            { label: 'إجمالي الأسئلة المُجابة', val: totalAnswered, icon: <Target size={22} />, color: '#0284c7', bg: '#e0f2fe', border: '#0284c7' },
            { label: 'إجابات صحيحة', val: totalCorrect, icon: <TrendingUp size={22} />, color: '#059669', bg: '#ecfdf5', border: '#10b981' },
            { label: 'نسبة الدقة الحالية', val: accuracy + '%', icon: <Zap size={22} />, color: '#7c3aed', bg: '#f5f3ff', border: '#8b5cf6' },
            { label: 'جلسات مكتملة', val: '14', icon: <Activity size={22} />, color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={i} className="stat-card" whileHover={{ translateY: -3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 800 }}>{s.label}</span>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: s.bg,
                  border: `1.5px solid ${s.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-numbers)' }}>
                {s.val}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── AI Recommendation Card (High Contrast) ── */}
        <motion.div variants={fade} style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 22,
          padding: '24px 28px',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: '#ecfdf5',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0
            }}>
              <BrainCircuit size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
                  توصية الذكاء الاصطناعي التشخيصية
                </h3>
                <span style={{ fontSize: 11.5, background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: 999, fontWeight: 800 }}>
                  تحديث فوري
                </span>
              </div>
              <p style={{ color: '#334155', fontSize: 15, lineHeight: 1.8, fontWeight: 600 }}>
                أظهرت نتائج جلساتك الأخيرة تفوقاً ممتازاً في قسم <strong>طب الأطفال والجراحة العامة</strong> (دقة 88%)، بينما تحتاج إلى تعزيز الأداء في أسئلة <strong>أمراض القلب وتخطيط ECG</strong>.
              </p>
              <div style={{ marginTop: 14 }}>
                <Link
                  href="/dashboard/practice"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#047857',
                    fontSize: 14.5,
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  بدء جلسة تدريب مركزة على نقاط الضعف
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Launch Grid (High Contrast & Crisp) ── */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            أقسام التدريب والامتحانات
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            اختر المسار التدريبي أو الامتحان الذي ترغب في متابعته
          </p>
        </div>

        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 16, marginBottom: '2.5rem' }}>
          {quickLinks.map(({ label, sub, href, icon: Icon, color, bg, border }) => (
            <motion.div key={href} variants={fade} whileHover={{ translateY: -4 }}>
              <Link href={href} style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                borderRadius: 20,
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: bg,
                  border: `1.5px solid ${border}`,
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, lineHeight: 1.5 }}>
                    {sub}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
}
