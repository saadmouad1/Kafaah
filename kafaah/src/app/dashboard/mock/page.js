'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle, RotateCcw, ChevronRight, ChevronLeft, AlertTriangle, Flag, Award } from 'lucide-react';
import { useQuestions, shuffle, checkIsEnglish } from '../../../lib/useData';

const EXAM_SIZE = 40;
const EXAM_MINUTES = 60;

export default function MockExamPage() {
  const [phase, setPhase] = useState('setup'); // setup | exam | review
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { questions: allQuestions, loading } = useQuestions();

  const categories = [
    { id: 'all', label: 'جميع التخصصات' },
    { id: 'medical', label: 'القطاع الصحي والطبي' },
    { id: 'engineering', label: 'الهندسة والتقنية' },
    { id: 'law', label: 'القانون' },
    { id: 'finance', label: 'المحاسبة والمالية' },
  ];

  const startExam = useCallback(() => {
    const pool = selectedCategory === 'all'
      ? allQuestions
      : allQuestions.filter(q => (q.sectorId || q.category) === selectedCategory);
    const selected = shuffle(pool).slice(0, Math.min(EXAM_SIZE, pool.length));
    setExamQuestions(selected);
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setTimeLeft(EXAM_MINUTES * 60);
    setPhase('exam');
  }, [selectedCategory, allQuestions]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    if (timeLeft <= 0) { setPhase('review'); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ─── SETUP PHASE ───────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 40 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 28, padding: 40, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={34} color="#fff" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>الاختبار التجريبي الشامل</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.6 }}>
              {loading ? 'جاري تحميل الأسئلة...' : `${allQuestions.length} سؤال متاح • سيتم اختيار ${EXAM_SIZE} سؤال عشوائياً`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>عدد الأسئلة</span>
              <span style={{ fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>{Math.min(EXAM_SIZE, allQuestions.length)} سؤال</span>
            </div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>الوقت المحدد</span>
              <span style={{ fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>{EXAM_MINUTES} دقيقة</span>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 10, fontSize: 14 }}>اختر القسم</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff' }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <button onClick={startExam} disabled={loading || allQuestions.length === 0}
            style={{ width: '100%', padding: '18px 0', borderRadius: 14, background: loading ? '#94a3b8' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', fontSize: 18, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}>
            {loading ? 'جاري التحميل...' : 'ابدأ الاختبار الآن'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── EXAM PHASE ────────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const q = examQuestions[currentIdx];
    if (!q) return null;
    const isEng = checkIsEnglish(q.text);
    const correctIdx = q.correctIndex ?? q.correct_index ?? 0;
    const answered = answers[currentIdx];
    const isFlagged = flagged[currentIdx];

    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Timer + progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#fff', borderRadius: 20, padding: '14px 24px', boxShadow: 'var(--shadow-subtle)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeLeft < 300 ? '#ef4444' : 'var(--text-secondary)', fontWeight: 900, fontFamily: 'var(--font-numbers)', fontSize: 18 }}>
            <Timer size={20} /> {formatTime(timeLeft)}
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: 14 }}>{currentIdx + 1} / {examQuestions.length}</div>
          <button onClick={() => setFlagged(f => ({ ...f, [currentIdx]: !isFlagged }))}
            style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${isFlagged ? '#f59e0b' : 'var(--border)'}`, background: isFlagged ? '#fef3c7' : 'transparent', color: isFlagged ? '#d97706' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flag size={15} /> {isFlagged ? 'مُعلَّم' : 'تعليم'}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, marginBottom: 24, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((currentIdx + 1) / examQuestions.length) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 999 }} />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 28, lineHeight: 1.7, direction: isEng ? 'ltr' : 'rtl', textAlign: isEng ? 'left' : 'right' }}>
              {q.text}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(q.options || []).map((opt, idx) => {
                const isSelected = answered === idx;
                const isEngOpt = checkIsEnglish(opt);
                return (
                  <button key={idx} onClick={() => setAnswers(a => ({ ...a, [currentIdx]: idx }))}
                    style={{
                      width: '100%', padding: '15px 20px', borderRadius: 14, textAlign: isEngOpt ? 'left' : 'right', direction: isEngOpt ? 'ltr' : 'rtl',
                      background: isSelected ? 'linear-gradient(135deg,#dbeafe,#eff6ff)' : 'var(--bg-subtle)',
                      border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                      color: isSelected ? '#1d4ed8' : 'var(--text)', fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer', fontSize: 15, transition: 'all 0.18s',
                      fontFamily: isEngOpt ? 'system-ui' : 'var(--font-body)'
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
            style={{ padding: '13px 24px', borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChevronRight size={18} /> السابق
          </button>
          {currentIdx === examQuestions.length - 1 ? (
            <button onClick={() => setPhase('review')}
              style={{ padding: '13px 28px', borderRadius: 12, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 15, boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
              إنهاء وعرض النتائج
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(i => Math.min(examQuestions.length - 1, i + 1))}
              style={{ padding: '13px 24px', borderRadius: 12, background: 'var(--text)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              التالي <ChevronLeft size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── REVIEW PHASE ──────────────────────────────────────────────────────────
  if (phase === 'review') {
    const correct = examQuestions.filter((q, i) => answers[i] === (q.correctIndex ?? q.correct_index ?? 0)).length;
    const total = examQuestions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60;

    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#fff', borderRadius: 28, padding: 48, boxShadow: 'var(--shadow-float)', border: '1px solid var(--border-subtle)', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 88, height: 88, borderRadius: 26, background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: passed ? '0 8px 28px rgba(16,185,129,0.35)' : '0 8px 28px rgba(239,68,68,0.35)' }}>
            <Award size={44} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{passed ? 'أحسنت! اجتزت الاختبار' : 'لم تجتز الاختبار هذه المرة'}</h1>
          <div style={{ fontSize: 64, fontWeight: 900, color: passed ? '#10b981' : '#ef4444', fontFamily: 'var(--font-numbers)', lineHeight: 1, marginBottom: 8 }}>{pct}%</div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{correct} صحيح من {total} سؤال</p>
          <button onClick={() => setPhase('setup')} style={{ marginTop: 28, padding: '14px 32px', borderRadius: 14, background: 'var(--text)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={18} /> اختبار جديد
          </button>
        </motion.div>

        {/* Review list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {examQuestions.map((q, i) => {
            const userAns = answers[i];
            const correctIdx = q.correctIndex ?? q.correct_index ?? 0;
            const isRight = userAns === correctIdx;
            const isEng = checkIsEnglish(q.text);
            return (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 24, border: `1.5px solid ${isRight ? '#10b98140' : '#ef444440'}`, boxShadow: 'var(--shadow-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: isRight ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isRight ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 12, direction: isEng ? 'ltr' : 'rtl', textAlign: isEng ? 'left' : 'right' }}>{q.text}</p>
                    {!isRight && userAns !== undefined && (
                      <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, marginBottom: 6 }}>إجابتك: {q.options?.[userAns]}</p>
                    )}
                    <p style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>الصحيحة: {q.options?.[correctIdx]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
