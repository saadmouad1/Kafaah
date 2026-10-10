'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions, shuffle, checkIsEnglish } from '../../../lib/useData';
import { CheckCircle2, XCircle, ArrowLeft, BrainCircuit } from 'lucide-react';

export default function PracticePage() {
  const { questions, loading } = useQuestions();
  const practiceQuestions = useMemo(() => {
    if (questions.length === 0) return [];
    return shuffle(questions).slice(0, 20);
  }, [questions]);

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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--emerald)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>جاري تحميل الأسئلة من قاعدة البيانات...</p>
      </div>
    </div>
  );

  if (!q) return <div style={{ padding: 40, textAlign: 'center' }}>لا توجد أسئلة متاحة.</div>;

  const isEngQuestion = checkIsEnglish(q.text);
  const correctIdx = q.correctIndex ?? q.correct_index ?? 0;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#fff', padding: '16px 24px', borderRadius: 20, boxShadow: 'var(--shadow-subtle)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--emerald-dark)', background: 'var(--emerald-light)', padding: '4px 12px', borderRadius: 999 }}>
            {q.sectorId || q.category || 'عام'}
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
          {(q.options || []).map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === correctIdx;
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
                  الشرح
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
