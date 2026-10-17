'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, BookOpen, Trash2 } from 'lucide-react';
import { getProgress, subscribe, toggleSaved } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';

export default function SavedPage() {
  const [saved, setSaved] = useState({});
  const [reveal, setReveal] = useState({});

  useEffect(() => {
    setSaved({ ...getProgress().saved });
    return subscribe((p) => setSaved({ ...p.saved }));
  }, []);

  const list = Object.entries(saved).map(([id, s]) => ({ id, ...s })).sort((a, b) => new Date(b.at) - new Date(a.at));

  if (list.length === 0) {
    return (
      <div className="card text-center card-pad-lg" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 50 }}>⭐</div>
        <h2 className="mt-2">لا توجد أسئلة محفوظة</h2>
        <p className="text-muted">احفظ الأسئلة المهمة أثناء التدريب لتجدها هنا.</p>
        <Link href="/dashboard/bank" className="btn btn-primary mt-3"><BookOpen size={15} /> تصفّح بنك الأسئلة</Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <h1 className="page-title">المفضلة</h1>
        <p className="text-muted mt-1">{list.length} سؤال محفوظ</p>
      </div>
      {list.map((s) => (
        <div key={s.id} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="badge badge-warning"><Star size={12} fill="var(--warning)" /> محفوظ</span>
            <button className="btn btn-ghost btn-sm" onClick={() => toggleSaved(s.q)}><Trash2 size={13} /> إزالة</button>
          </div>
          <QuestionView question={s.q} selected={null} onSelect={() => {}} reveal={!!reveal[s.id]} />
          {!reveal[s.id] && (
            <button className="btn btn-soft btn-block mt-2" onClick={() => setReveal((r) => ({ ...r, [s.id]: true }))}>إظهار الإجابة والشرح</button>
          )}
        </div>
      ))}
    </div>
  );
}
