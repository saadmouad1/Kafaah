'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, BookOpen, Trash2 } from 'lucide-react';
import { getProgress, subscribe, toggleSaved } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';
import { useKafaah } from '../../../lib/context/KafaahProvider';

export default function SavedPage() {
  const { t } = useKafaah();
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
        <h2 className="mt-2">{t('saved.empty')}</h2>
        <p className="text-muted">{t('saved.emptyDesc')}</p>
        <Link href="/dashboard/bank" className="btn btn-primary mt-3"><BookOpen size={15} /> {t('saved.browse')}</Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <h1 className="page-title">{t('nav.saved')}</h1>
        <p className="text-muted mt-1">{t('saved.count', { n: list.length })}</p>
      </div>
      {list.map((s) => (
        <div key={s.id} className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="badge badge-warning"><Star size={12} fill="var(--warning)" /> {t('saved.badge')}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => toggleSaved(s.q)}><Trash2 size={13} /> {t('saved.remove')}</button>
          </div>
          <QuestionView question={s.q} selected={null} onSelect={() => {}} reveal={!!reveal[s.id]} />
          {!reveal[s.id] && (
            <button className="btn btn-soft btn-block mt-2" onClick={() => setReveal((r) => ({ ...r, [s.id]: true }))}>{t('common.showAnswerExplanation')}</button>
          )}
        </div>
      ))}
    </div>
  );
}
