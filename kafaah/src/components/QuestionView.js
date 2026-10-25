'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle, Star, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { isEnglish } from '../lib/useData';
import { useKafaah } from '../lib/context/KafaahProvider';

const AR_KEYS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
const EN_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionView({ question, selected, onSelect, reveal = false, onToggleSave, saved = false }) {
  const { t } = useKafaah();
  const [tutor, setTutor] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(false);

  if (!question) return null;
  const q = question;
  const correct = q.correctIndex ?? q.correct_index ?? 0;
  const isQEn = isEnglish(q.text);
  const keys = isQEn ? EN_KEYS : AR_KEYS;

  async function askTutor() {
    setTutorLoading(true);
    setTutor(null);
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tutor_query',
          question: q.text,
          options: q.options,
          correctAnswer: q.options?.[correct],
          subject: q.subject,
        }),
      });
      const data = await res.json();
      setTutor(data.text || data.answer || t('q.tutorError'));
    } catch {
      setTutor(t('q.tutorErrorConn'));
    } finally {
      setTutorLoading(false);
    }
  }

  return (
    <div className="question-card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {q.subject && <span className="badge badge-brand">{q.subject}</span>}
          {q.difficulty && (
            <span className={`badge ${q.difficulty === 'hard' ? 'badge-danger' : q.difficulty === 'easy' ? 'badge-success' : 'badge-warning'}`}>
              {q.difficulty === 'hard' ? t('common.hard') : q.difficulty === 'easy' ? t('common.easy') : t('common.medium')}
            </span>
          )}
        </div>
        {onToggleSave && (
          <button className="icon-btn" onClick={() => onToggleSave(q)} aria-label={t('q.saveAria')} title={t('q.saveAria')}>
            <Star size={18} fill={saved ? 'var(--gold)' : 'none'} color={saved ? 'var(--gold)' : 'currentColor'} />
          </button>
        )}
      </div>

      <h2
        style={{
          fontSize: 'clamp(1.02rem, 3.6vw, 1.25rem)', fontWeight: 700, lineHeight: 1.7,
          direction: isQEn ? 'ltr' : 'rtl', textAlign: isQEn ? 'left' : 'right', marginBottom: 20,
        }}
      >
        {q.text}
      </h2>

      <div>
        {(q.options || []).map((opt, idx) => {
          const isSel = selected === idx;
          const isCorrect = idx === correct;
          let cls = 'option-btn';
          if (reveal && isSel) cls += isCorrect ? ' correct' : ' wrong';
          else if (reveal && isCorrect) cls += ' correct';
          const optEn = isEnglish(opt);
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => onSelect && onSelect(idx)}
              disabled={reveal}
              style={{ direction: optEn ? 'ltr' : 'rtl', textAlign: optEn ? 'left' : 'right', opacity: reveal && !isSel && !isCorrect ? 0.7 : 1 }}
            >
              <span className="opt-key">{keys[idx] || (idx + 1)}</span>
              <span style={{ flex: 1 }}>{opt}</span>
              {reveal && isCorrect && <CheckCircle2 size={19} color="var(--success)" />}
              {reveal && isSel && !isCorrect && <XCircle size={19} color="var(--danger)" />}
            </button>
          );
        })}
      </div>

      {reveal && (
        <div className="mt-3" style={{ background: 'var(--info-soft)', border: '1px solid color-mix(in srgb, var(--info) 25%, transparent)', borderRadius: 16, padding: 16 }}>
          <div className="row" style={{ gap: 8, color: '#1d4ed8', fontWeight: 800, marginBottom: 6 }}>
            <BookOpen size={17} /> {t('common.explanation')}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.75 }}>
            {q.explanation || t('q.noExplanation')}
          </p>
          <button className="btn btn-ghost btn-sm mt-2" onClick={askTutor} disabled={tutorLoading}>
            {tutorLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            {t('q.askTutor')}
          </button>
          {tutor && (
            <div className="mt-2" style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {tutor}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
