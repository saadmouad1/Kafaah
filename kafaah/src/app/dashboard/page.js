'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuestions } from '../../lib/useData';
import Link from 'next/link';
import {
  BrainCircuit, Activity, BookOpen, BarChart3,
  TrendingUp, Target, Zap, ArrowLeft, Clock
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState({
    name: 'طالب كفاءة',
    stats: {
      medical: { total: 0, correct: 0 },
      overall: { level: 'مبتدئ', nextExam: 'غير محدد' }
    }
  });

  const { questions, loading } = useQuestions();
  const totalQuestions = questions.length;

  useEffect(() => {
    const session = localStorage.getItem('kafaah_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        setUser({
          name: data.name || 'طالب كفاءة',
          stats: {
            medical: { total: 120, correct: 85 },
            overall: { level: 'متوسط', nextExam: '2026-11-15' }
          }
        });
      } catch (e) {}
    }
  }, []);

  const answered = user.stats.medical.total;
  const correct = user.stats.medical.correct;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
          أهلاً بك، {user.name} 👋
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>
          مستعد لمواصلة التعلم؟ {loading ? 'جاري تحميل الأسئلة...' : `${totalQuestions.toLocaleString()} سؤال بانتظارك.`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {[
          { label: 'الأسئلة المجابة', val: answered + ' / ' + totalQuestions, icon: Target, color: 'var(--blue-sky)', bg: 'var(--blue-light)' },
          { label: 'الإجابات الصحيحة', val: correct, icon: TrendingUp, color: 'var(--emerald)', bg: 'var(--emerald-light)' },
          { label: 'نسبة الدقة', val: accuracy + '%', icon: Zap, color: 'var(--gold)', bg: 'var(--gold-light)' },
          { label: 'وقت المذاكرة', val: '24 ساعة', icon: Clock, color: 'var(--rose)', bg: 'var(--rose-light)' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>{s.val}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <Link href="/dashboard/practice" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-dark) 100%)',
            borderRadius: 24, padding: 32, color: '#fff',
            boxShadow: '0 12px 24px var(--emerald-glow)', height: '100%'
          }}>
            <BrainCircuit size={40} style={{ marginBottom: 16, opacity: 0.9 }} />
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>التدريب الذكي</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>
              تدرب على أسئلة حقيقية من البورد مع شروحات تفصيلية فورية لكل سؤال.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 999, width: 'fit-content' }}>
              ابدأ الآن <ArrowLeft size={16} />
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/mock" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            background: 'linear-gradient(135deg, var(--blue-sky) 0%, #0369a1 100%)',
            borderRadius: 24, padding: 32, color: '#fff',
            boxShadow: '0 12px 24px rgba(2, 132, 199, 0.25)', height: '100%'
          }}>
            <Activity size={40} style={{ marginBottom: 16, opacity: 0.9 }} />
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>محاكاة الاختبار</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>
              اختبر نفسك في بيئة مطابقة لامتحان الهيئة السعودية والتصنيف المهني.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 999, width: 'fit-content' }}>
              اختبر جاهزيتك <ArrowLeft size={16} />
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/bank" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            borderRadius: 24, padding: 32, color: '#fff',
            boxShadow: '0 12px 24px var(--gold-glow)', height: '100%'
          }}>
            <BookOpen size={40} style={{ marginBottom: 16, opacity: 0.9 }} />
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>بنك الأسئلة الشامل</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>
              تصفح جميع الأسئلة البالغ عددها {loading ? '...' : totalQuestions.toLocaleString()} سؤالاً مع الفلاتر المتقدمة.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 999, width: 'fit-content' }}>
              تصفح البنك <ArrowLeft size={16} />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
