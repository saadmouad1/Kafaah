'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, SlidersHorizontal, CheckCircle2, XCircle, Trophy, Play } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { useQuestions, useSpecBanks, shuffle } from '../../../lib/useData';
import { recordAnswer, getProgress, subscribe, toggleSaved, isSaved } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';

export default function PracticePage() {
  const { profile, spec, t, locale, specName, bankName } = useKafaah();
  const { banks } = useSpecBanks(profile?.specId);
  const [bank, setBank] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);

  // نجلب دائمًا (حتى قبل البدء) لمعرفة العدد المتاح
  const { questions, total, loading } = useQuestions({
    bank, difficulty, limit: 100, offset: seed, enabled: true,
  });

  const deck = useMemo(() => shuffle(questions).slice(0, 25), [questions]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [savedIds, setSavedIds] = useState({});
  const [score, setScore] = useState({ c: 0, w: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    setSavedIds(getProgress().saved);
    return subscribe((s) => setSavedIds({ ...s.saved }));
  }, []);

  const q = deck[idx];
  const reveal = selected !== null;

  function choose(i) {
    if (reveal) return;
    setSelected(i);
    const correct = i === (q.correctIndex ?? q.correct_index ?? 0);
    setScore((s) => ({ c: s.c + (correct ? 1 : 0), w: s.w + (correct ? 0 : 1) }));
    recordAnswer(q, correct, i);
  }

  function next() {
    if (idx < deck.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function begin() {
    // عيّنة عشوائية من كامل البنك
    const maxOff = Math.max(0, total - 100);
    setSeed(maxOff > 0 ? Math.floor(Math.random() * maxOff) : 0);
    setStarted(true);
    setIdx(0);
    setSelected(null);
    setScore({ c: 0, w: 0 });
    setDone(false);
  }

  function restart() {
    setStarted(false); setDone(false); setIdx(0); setSelected(null); setScore({ c: 0, w: 0 });
  }

  if (!started) {
    return (
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <h1 className="page-title">{t('nav.practice')}</h1>
          <p className="text-muted mt-1">{t('practice.sub')}</p>
        </div>

        <div className="card">
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            <SlidersHorizontal size={17} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5 }}>{t('practice.setup')}</h3>
          </div>

          <div className="field mb-3">
            <label className="label">{t('practice.chooseBank')}</label>
            <div className="chip-row">
              <span className={`chip${bank === 'all' ? ' active' : ''}`} onClick={() => setBank('all')}>{t('practice.allBanks')}</span>
              {banks.map((b) => (
                <span key={b.id} className={`chip${bank === b.id ? ' active' : ''}`} onClick={() => setBank(b.id)}>{bankName(b)}</span>
              ))}
            </div>
          </div>

          <div className="field mb-3">
            <label className="label">{t('common.difficulty')}</label>
            <div className="chip-row">
              {[['all', t('common.all')], ['easy', t('common.easy')], ['medium', t('common.medium')], ['hard', t('common.hard')]].map(([v, l]) => (
                <span key={v} className={`chip${difficulty === v ? ' active' : ''}`} onClick={() => setDifficulty(v)}>{l}</span>
              ))}
            </div>
          </div>

          <div className="row-between card soft-sector" style={{ padding: 14 }}>
            <div className="row" style={{ gap: 10 }}>
              <Trophy size={18} style={{ color: 'var(--sector)' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{specName(spec)}</div>
                <div className="text-muted" style={{ fontSize: 12.5 }}>{t('practice.sessionInfo')}</div>
              </div>
            </div>
            <span className="badge badge-brand">{t('practice.available', { n: total.toLocaleString(locale) })}</span>
          </div>

          <button className="btn btn-primary btn-lg btn-block mt-3" onClick={begin} disabled={total === 0}>
            <Play size={17} /> {t('practice.start')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="stack" style={{ gap: 14 }}>
      <div className="skeleton" style={{ height: 60 }} />
      <div className="skeleton" style={{ height: 300 }} />
    </div>;
  }

  if (done || !q) {
    const totalQ = score.c + score.w;
    const pct = totalQ ? Math.round((score.c / totalQ) * 100) : 0;
    return (
      <div className="card card-pad-lg text-center" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 56 }}>{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="mt-2">{t('practice.finished')}</h2>
        <p className="text-muted">{t('practice.sessionScore')}</p>
        <div className="stat-num mt-3" style={{ fontSize: '2.6rem', color: 'var(--sector)' }}>{pct}%</div>
        <div className="row" style={{ justifyContent: 'center', gap: 18, marginTop: 12 }}>
          <div className="row" style={{ gap: 6, color: 'var(--success)', fontWeight: 800 }}><CheckCircle2 size={17} /> {t('practice.correct', { n: score.c })}</div>
          <div className="row" style={{ gap: 6, color: 'var(--danger)', fontWeight: 800 }}><XCircle size={17} /> {t('practice.wrong', { n: score.w })}</div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 22, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={restart}><RefreshCw size={15} /> {t('practice.newSession')}</button>
          <Link href="/dashboard/mistakes" className="btn btn-ghost">{t('practice.reviewMistakes')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 760, margin: '0 auto' }}>
      <div className="card" style={{ padding: 12 }}>
        <div className="row-between mb-2">
          <span className="badge badge-brand">{t('practice.questionOf', { i: idx + 1, n: deck.length })}</span>
          <span className="row" style={{ gap: 10, fontWeight: 800, fontSize: 13 }}>
            <span style={{ color: 'var(--success)' }}>{score.c}✓</span>
            <span style={{ color: 'var(--danger)' }}>{score.w}✕</span>
          </span>
        </div>
        <div className="progress"><span style={{ width: `${((idx + (reveal ? 1 : 0)) / deck.length) * 100}%` }} /></div>
      </div>

      <QuestionView
        question={q}
        selected={selected}
        onSelect={choose}
        reveal={reveal}
        saved={!!savedIds[q.id]}
        onToggleSave={(qq) => toggleSaved(qq)}
      />

      {reveal && (
        <button className="btn btn-primary btn-lg btn-block" onClick={next}>
          {idx < deck.length - 1 ? t('practice.nextQuestion') : t('practice.endSession')} <ArrowLeft size={17} />
        </button>
      )}
    </div>
  );
}
