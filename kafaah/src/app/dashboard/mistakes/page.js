'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Trash2, RotateCcw, BrainCircuit, Check } from 'lucide-react';
import { getProgress, subscribe, removeMistake, clearMistakes } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState({});
  const [reveal, setReveal] = useState({});

  useEffect(() => {
    const load = (p) => setMistakes({ ...p.mistakes });
    setMistakes({ ...getProgress().mistakes });
    return subscribe(load);
  }, []);

  const list = Object.entries(mistakes).map(([id, m]) => ({ id, ...m })).sort((a, b) => (b.count - a.count) || (new Date(b.lastAt) - new Date(a.lastAt)));

  if (list.length === 0) {
    return (
      <div className="card text-center card-pad-lg" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 50 }}>🎯</div>
        <h2 className="mt-2">لا توجد أخطاء مسجّلة</h2>
        <p className="text-muted">رائع! كل إجاباتك صحيحة حتى الآن. استمر.</p>
        <Link href="/dashboard/practice" className="btn btn-primary mt-3"><BrainCircuit size={15} /> ابدأ التدريب</Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row-between wrap">
        <div>
          <h1 className="page-title">سجل الأخطاء</h1>
          <p className="text-muted mt-1">{list.length} سؤالًا يحتاج مراجعة — راجعها لتثبيت المعلومة.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('مسح كل سجل الأخطاء؟')) clearMistakes(); }}>
          <Trash2 size={14} /> مسح الكل
        </button>
      </div>

      {list.map((m) => (
        <div key={m.id} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="badge badge-danger"><AlertTriangle size={12} /> أخطأت {m.count} مرة</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeMistake(m.id)}><Check size={13} /> أتقنته</button>
          </div>
          <QuestionView
            question={m.q}
            selected={null}
            onSelect={() => {}}
            reveal={!!reveal[m.id]}
          />
          {!reveal[m.id] && (
            <button className="btn btn-soft btn-block mt-2" onClick={() => setReveal((r) => ({ ...r, [m.id]: true }))}>
              <RotateCcw size={14} /> إظهار الإجابة والشرح
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
