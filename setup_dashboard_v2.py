import os

BASE_DIR = r"d:\professional_practice_exam\kafaah\src"

MOCKDB_JS = """
import questionsData from '../data/questions.json';

export const localDB = {
  currentUser: {
    name: "د. أحمد عبدالله",
    role: "student",
    subscription: "العضوية الشاملة (بريميوم)",
    stats: {
      medical: { total: questionsData.length, correct: Math.floor(questionsData.length * 0.85) },
      engineering: { total: 0, correct: 0 },
    }
  },
  questions: questionsData
};
"""

LAYOUT_JS = """'use client';
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
  const user = localDB.currentUser;

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
"""

PAGE_JS = """'use client';
import { motion } from 'framer-motion';
import { localDB } from '../../lib/mockDb';
import Link from 'next/link';
import {
  BrainCircuit, Activity, BookOpen, BarChart3,
  TrendingUp, Target, Zap, ArrowLeft, Clock
} from 'lucide-react';

export default function Dashboard() {
  const user = localDB.currentUser;
  const totalQuestions = localDB.questions.length;
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
          مستعد لمواصلة التعلم؟ لقد أنجزت التدريب على جميع الأسئلة المتوفرة.
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
            borderRadius: 24,
            padding: 32,
            color: '#fff',
            boxShadow: '0 12px 24px var(--emerald-glow)',
            height: '100%'
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
            borderRadius: 24,
            padding: 32,
            color: '#fff',
            boxShadow: '0 12px 24px rgba(2, 132, 199, 0.25)',
            height: '100%'
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
            borderRadius: 24,
            padding: 32,
            color: '#fff',
            boxShadow: '0 12px 24px var(--gold-glow)',
            height: '100%'
          }}>
            <BookOpen size={40} style={{ marginBottom: 16, opacity: 0.9 }} />
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>بنك الأسئلة الشامل</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>
              تصفح جميع الأسئلة البالغ عددها {totalQuestions} سؤالاً مع الفلاتر المتقدمة.
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
"""

BANK_JS = """'use client';
import { useState, useMemo } from 'react';
import { localDB } from '../../../lib/mockDb';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const checkIsEnglish = (text) => {
  if (!text) return false;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return englishChars > arabicChars;
};

export default function BankPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const questions = localDB.questions;
  
  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCat === 'all' || q.category === filterCat;
      return matchSearch && matchCat;
    }).slice(0, 50); // Show max 50 for performance in preview
  }, [questions, searchTerm, filterCat]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 24, fontFamily: 'var(--font-display)' }}>بنك الأسئلة الشامل</h1>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث في الأسئلة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '14px 20px 14px 44px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'جميع التخصصات' : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((q, idx) => {
          const isEng = checkIsEnglish(q.text);
          return (
            <motion.div key={q.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: 'var(--shadow-subtle)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, background: 'var(--blue-light)', color: 'var(--blue-sky)', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
                  {q.category || 'عام'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-numbers)' }}>{q.id}</span>
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 16,
                direction: isEng ? 'ltr' : 'rtl',
                textAlign: isEng ? 'left' : 'right',
                fontFamily: isEng ? 'system-ui' : 'var(--font-heading)'
              }}>{q.text}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options?.map((opt, oIdx) => {
                  const isEngOpt = checkIsEnglish(opt);
                  return (
                  <div key={oIdx} style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: oIdx === q.correct_index ? 'var(--emerald-light)' : 'var(--bg-subtle)',
                    border: oIdx === q.correct_index ? '1px solid var(--emerald-glow)' : '1px solid transparent',
                    color: oIdx === q.correct_index ? 'var(--emerald-dark)' : 'var(--text-secondary)',
                    fontWeight: oIdx === q.correct_index ? 700 : 500,
                    direction: isEngOpt ? 'ltr' : 'rtl',
                    textAlign: isEngOpt ? 'left' : 'right',
                    fontFamily: isEngOpt ? 'system-ui' : 'var(--font-body)'
                  }}>
                    {opt}
                  </div>
                )})}
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontWeight: 600 }}>
            لا توجد أسئلة تطابق بحثك.
          </div>
        )}
      </div>
    </div>
  );
}
"""

PRACTICE_JS = """'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { localDB } from '../../../lib/mockDb';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, BrainCircuit, RefreshCw } from 'lucide-react';

const checkIsEnglish = (text) => {
  if (!text) return false;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return englishChars > arabicChars;
};

export default function PracticePage() {
  const allQuestions = localDB.questions;
  const practiceQuestions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);
  }, [allQuestions]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = practiceQuestions[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  if(!q) return <div style={{padding: 40, textAlign: 'center'}}>جاري التحميل...</div>;

  const isEngQuestion = checkIsEnglish(q.text);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#fff', padding: '16px 24px', borderRadius: 20, boxShadow: 'var(--shadow-subtle)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--emerald-dark)', background: 'var(--emerald-light)', padding: '4px 12px', borderRadius: 999 }}>
            {q.category || 'عام'}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'var(--font-numbers)' }}>
          سؤال {currentIdx + 1} / {practiceQuestions.length}
        </div>
      </div>

      <motion.div
        key={q.id || currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24
        }}
      >
        <h2 style={{
          fontSize: 'clamp(18px, 3vw, 22px)',
          fontWeight: 800,
          color: 'var(--text)',
          marginBottom: 32,
          lineHeight: 1.6,
          direction: isEngQuestion ? 'ltr' : 'rtl',
          textAlign: isEngQuestion ? 'left' : 'right',
          fontFamily: isEngQuestion ? 'system-ui' : 'var(--font-heading)'
        }}>
          {q.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options?.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.correct_index;
            const isEngOpt = checkIsEnglish(opt);
            
            let bg = 'var(--bg-subtle)';
            let borderColor = 'var(--border)';
            let icon = null;

            if (selectedOption !== null) {
              if (isCorrect) {
                bg = 'var(--emerald-light)';
                borderColor = 'var(--emerald)';
                icon = <CheckCircle2 color="var(--emerald)" size={20} />;
              } else if (isSelected) {
                bg = 'var(--danger-light)';
                borderColor = 'var(--danger)';
                icon = <XCircle color="var(--danger)" size={20} />;
              } else {
                bg = '#fff';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedOption !== null}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  cursor: selectedOption !== null ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  direction: isEngOpt ? 'ltr' : 'rtl',
                  textAlign: isEngOpt ? 'left' : 'right',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text)',
                  fontFamily: isEngOpt ? 'system-ui' : 'var(--font-body)'
                }}
              >
                <span style={{ flex: 1 }}>{opt}</span>
                {icon && <span style={{ marginRight: isEngOpt ? 0 : 12, marginLeft: isEngOpt ? 12 : 0 }}>{icon}</span>}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ overflow: 'hidden', marginTop: 24 }}
            >
              <div style={{
                padding: 20,
                borderRadius: 16,
                background: 'var(--blue-light)',
                border: '1px solid rgba(2, 132, 199, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue-sky)', fontWeight: 800, marginBottom: 8 }}>
                  <BrainCircuit size={20} />
                  الشرح الطبي
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  lineHeight: 1.6,
                  direction: checkIsEnglish(q.explanation) ? 'ltr' : 'rtl',
                  textAlign: checkIsEnglish(q.explanation) ? 'left' : 'right'
                }}>
                  {q.explanation || 'لا يوجد شرح متوفر لهذا السؤال.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {selectedOption !== null && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 999,
              background: 'var(--text)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 800
            }}
          >
            السؤال التالي <ArrowLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
"""

EMPTY_PAGE = """'use client';
export default function EmptyPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>هذه الصفحة قيد التطوير</h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>سيتم إضافة الميزات قريباً في التحديث القادم.</p>
      </div>
    </div>
  )
}
"""

def write_file(rel_path, content):
    path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

write_file('lib/mockDb.js', MOCKDB_JS)
write_file('app/dashboard/layout.js', LAYOUT_JS)
write_file('app/dashboard/page.js', PAGE_JS)
write_file('app/dashboard/bank/page.js', BANK_JS)
write_file('app/dashboard/practice/page.js', PRACTICE_JS)

empty_pages = [
    'analytics/page.js', 'create/page.js', 'cross/page.js',
    'database/page.js', 'frequency/page.js', 'mistakes/page.js',
    'mock/page.js', 'profile/page.js', 'saved/page.js',
    'search/page.js', 'settings/page.js'
]

for ep in empty_pages:
    write_file('app/dashboard/' + ep, EMPTY_PAGE)

print("Dashboard rewritten successfully!")
