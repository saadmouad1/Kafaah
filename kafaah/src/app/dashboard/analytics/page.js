'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Clock, BookOpen, Zap, Award, AlertCircle } from 'lucide-react';
import questionsData from '../../../data/questions.json';

const STORAGE_KEY = 'kafaah_session';

function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null;
  } catch { return null; }
}

export default function AnalyticsPage() {
  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
  }, []);

  const totalQuestions = questionsData.length;
  const catCounts = questionsData.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {});

  const categories = [
    { id: 'medical', label: 'القطاع الصحي والطبي', color: 'var(--emerald)', bg: 'var(--emerald-light)' },
    { id: 'engineering', label: 'الهندسة والتقنية', color: 'var(--blue-sky)', bg: 'var(--blue-light)' },
    { id: 'law', label: 'القانون', color: 'var(--gold)', bg: 'var(--gold-light)' },
    { id: 'finance', label: 'المحاسبة والمالية', color: 'var(--rose)', bg: 'var(--rose-light)' },
  ];

  if (!mounted) return null;

  if (!session) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            تحليل الأداء
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            تتبع أداءك ونتائجك في التدريب والاختبارات
          </p>
        </div>

        {/* Empty state */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '60px 32px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <BarChart3 size={56} style={{ color: 'var(--text-dim)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>لا توجد بيانات أداء بعد</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            ابدأ بالتدريب أو إجراء اختبار محاكاة ليتم تسجيل نتائجك وعرض تحليل مفصل لأدائك هنا.
          </p>
          <a href="/dashboard/practice" style={{
            display: 'inline-block', marginTop: 24, padding: '14px 32px', borderRadius: 12,
            background: 'var(--emerald)', color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: 15
          }}>
            ابدأ التدريب الآن
          </a>
        </div>

        {/* Bank statistics */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>إحصائيات بنك كفاءة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>إجمالي الأسئلة</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>{totalQuestions.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--blue-light)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={24} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>التخصصات</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>
                  {Object.keys(catCounts).length}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories.map(cat => {
              const count = catCounts[cat.id] || 0;
              const pct = Math.round((count / totalQuestions) * 100);
              return (
                <div key={cat.id} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 15 }}>{cat.label}</span>
                    <span style={{ fontFamily: 'var(--font-numbers)', fontWeight: 800, color: cat.color }}>{count} سؤال</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      style={{ height: '100%', background: cat.color, borderRadius: 999 }}
                    />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{pct}% من البنك</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
