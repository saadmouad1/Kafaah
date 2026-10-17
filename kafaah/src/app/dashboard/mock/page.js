'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Timer, Play, Flag, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { useQuestions, useSpecBanks, shuffle } from '../../../lib/useData';
import { recordMock } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function MockPage() {
  const { profile, spec, t, locale, bankName } = useKafaah();
  const { banks } = useSpecBanks(profile?.specId);
  const bp = spec?.blueprint || { questions: 40, minutes: 60, passScore: 60 };

  const [bank, setBank] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [count, setCount] = useState(Math.min(bp.questions, 60));
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seed, setSeed] = useState(0);

  const { questions, total, loading } = useQuestions({ bank, difficulty, limit: 100, offset: seed, enabled: true });
  const deck = useMemo(() => shuffle(questions).slice(0, count), [questions, count]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(bp.minutes * 60);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!started || submitted) return;
    if (secondsLeft <= 0) { setSubmitted(true); return; }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, submitted, secondsLeft]);

  const answeredCount = Object.keys(answers).length;

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    setIdx(0);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const result = useMemo(() => {
    if (!submitted) return null;
    let c = 0;
    const byBank = {};
    deck.forEach((q) => {
      const correct = q.correctIndex ?? q.correct_index ?? 0;
      const ok = answers[q.id] === correct;
      if (ok) c++;
      const key = bankName({ specId: q.specId, title: q.bankTitle, auto: q.bankAuto }) || t('common.general');
      byBank[key] = byBank[key] || { c: 0, t: 0 };
      byBank[key].t++;
      if (ok) byBank[key].c++;
    });
    const pct = deck.length ? Math.round((c / deck.length) * 100) : 0;
    return { correct: c, total: deck.length, pct, passed: pct >= bp.passScore, byBank };
  }, [submitted, deck, answers, bp.passScore]);

  useEffect(() => {
    if (submitted && result && result.total) {
      recordMock({ total: result.total, correct: result.correct, specId: spec?.id, minutes: Math.round((bp.minutes * 60 - secondsLeft) / 60), passScore: bp.passScore, passed: result.passed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function begin() {
    const eff = total > 0 ? Math.min(count, total) : count;
    setCount(eff);
    const maxOff = Math.max(0, total - 100);
    setSeed(maxOff > 0 ? Math.floor(Math.random() * maxOff) : 0);
    setSecondsLeft((Math.round((eff / bp.questions) * bp.minutes) || bp.minutes) * 60);
    setStarted(true);
  }

  function restart() {
    setStarted(false); setSubmitted(false); setAnswers({}); setFlags({}); setIdx(0); setSecondsLeft(bp.minutes * 60);
  }

  // ── شاشة الإعداد ──
  if (!started) {
    return (
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <h1 className="page-title">{t('nav.mock')}</h1>
          <p className="text-muted mt-1">{t('mock.sub')}</p>
        </div>
        <div className="card">
          <div className="grid grid-3">
            <div className="stat-card"><div className="stat-label">{t('mock.questionCount')}</div><div className="stat-num">{count}</div></div>
            <div className="stat-card"><div className="stat-label">{t('mock.duration')}</div><div className="stat-num">{bp.minutes}<span style={{ fontSize: 14 }}> {t('common.minutesShort')}</span></div></div>
            <div className="stat-card"><div className="stat-label">{t('mock.passScore')}</div><div className="stat-num">{bp.passScore}%</div></div>
          </div>

          <div className="field mt-4">
            <label className="label">{t('mock.questionCount')} <span className="text-muted" style={{ fontWeight: 600 }}>({t('mock.available', { n: loading ? '…' : total.toLocaleString(locale) })})</span></label>
            <input type="range" min={10} max={Math.max(10, Math.min(80, total || bp.questions))} step={5} value={Math.min(count, total || count || 10)} onChange={(e) => setCount(+e.target.value)} style={{ width: '100%', accentColor: 'var(--sector)' }} />
            <div className="text-muted" style={{ fontSize: 12.5 }}>{t('mock.selectCount', { n: Math.min(count, total || count), m: Math.round((Math.min(count, total || count) / bp.questions) * bp.minutes) || bp.minutes })}</div>
          </div>

          <div className="field mt-3">
            <label className="label">{t('mock.bankOptional')}</label>
            <div className="chip-row">
              <span className={`chip${bank === 'all' ? ' active' : ''}`} onClick={() => setBank('all')}>{t('mock.allBanks')}</span>
              {banks.map((b) => <span key={b.id} className={`chip${bank === b.id ? ' active' : ''}`} onClick={() => setBank(b.id)}>{bankName(b)}</span>)}
            </div>
          </div>

          <div className="field mt-3">
            <label className="label">{t('mock.difficultyOptional')}</label>
            <div className="chip-row">
              {[['all', t('common.allDifficulties')], ['easy', t('common.easy')], ['medium', t('common.medium')], ['hard', t('common.hard')]].map(([v, l]) => (
                <span key={v} className={`chip${difficulty === v ? ' active' : ''}`} onClick={() => setDifficulty(v)}>{l}</span>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block mt-4" onClick={begin} disabled={loading || total === 0}>
            <Play size={17} /> {t('mock.start')}
          </button>
          {total === 0 && !loading && <p className="text-muted text-center mt-2" style={{ fontSize: 13 }}>{bank !== 'all' ? t('mock.notEnoughBank') : t('mock.notEnough', { subject: '' })}</p>}
        </div>
      </div>
    );
  }

  if (loading) return <div className="skeleton" style={{ height: 380 }} />;

  // ── شاشة النتائج ──
  if (submitted && result) {
    return (
      <div className="stack" ref={resultsRef} style={{ gap: 16 }}>
        <div className="card card-pad-lg text-center">
          <div style={{ fontSize: 54 }}>{result.passed ? '🏆' : '📚'}</div>
          <h2 className="mt-2">{result.passed ? t('mock.passed') : t('mock.failed')}</h2>
          <div className="stat-num" style={{ fontSize: '3rem', color: result.passed ? 'var(--success)' : 'var(--danger)' }}>{result.pct}%</div>
          <p className="text-muted">{t('mock.resultLine', { c: result.correct, t: result.total, p: bp.passScore })}</p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 18 }}>
            <button className="btn btn-primary" onClick={restart}><RotateCcw size={15} /> {t('mock.newExam')}</button>
            <Link href="/dashboard/analytics" className="btn btn-ghost"><Award size={15} /> {t('mock.analytics')}</Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>{t('mock.byBank')}</h3>
          <div className="stack" style={{ gap: 12 }}>
            {Object.entries(result.byBank).map(([s, v]) => (
              <div key={s}>
                <div className="row-between" style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>
                  <span>{s}</span><span>{v.c}/{v.t}</span>
                </div>
                <div className="progress"><span style={{ width: `${(v.c / v.t) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 16 }}>{t('mock.reviewAnswers')}</h3>
        {deck.map((q, i) => (
          <div key={q.id}>
            <div className="text-muted mb-1" style={{ fontSize: 12.5, fontWeight: 700 }}>{t('mock.questionN', { n: i + 1 })}</div>
            <QuestionView question={q} selected={answers[q.id] ?? null} reveal />
          </div>
        ))}
      </div>
    );
  }

  // ── شاشة الامتحان ──
  const q = deck[idx];
  if (!q) return <div className="card">{t('mock.notEnoughExam')}</div>;

  return (
    <div className="stack" style={{ gap: 14, maxWidth: 780, margin: '0 auto' }}>
      <div className="card" style={{ padding: 12, position: 'sticky', top: 70, zIndex: 20 }}>
        <div className="row-between">
          <span className={`badge ${secondsLeft < 60 ? 'badge-danger' : 'badge-brand'}`} style={{ fontFamily: 'var(--font-numbers)', fontSize: 14 }}>
            <Timer size={14} /> {fmt(secondsLeft)}
          </span>
          <span className="text-muted" style={{ fontWeight: 700, fontSize: 13 }}>{t('mock.answered', { a: answeredCount, t: deck.length })}</span>
          <button className="btn btn-danger btn-sm" onClick={submit}>{t('mock.submit')}</button>
        </div>
      </div>

      <QuestionView
        question={q}
        selected={answers[q.id] ?? null}
        onSelect={(i) => setAnswers((a) => ({ ...a, [q.id]: i }))}
        reveal={false}
        saved={false}
      />

      <div className="row-between">
        <button className="btn btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          <ChevronRight size={16} /> {t('mock.prev')}
        </button>
        <button className={`btn ${flags[q.id] ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}>
          <Flag size={15} /> {flags[q.id] ? t('mock.flagged') : t('mock.flag')}
        </button>
        {idx < deck.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>{t('mock.next')} <ChevronLeft size={16} /></button>
        ) : (
          <button className="btn btn-primary" onClick={submit}>{t('mock.submit')} <CheckCircle2 size={16} /></button>
        )}
      </div>

      {/* ورقة الإجابات */}
      <div className="card">
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {deck.map((qq, i) => {
            const st = answers[qq.id] !== undefined ? 'answered' : flags[qq.id] ? 'flag' : 'idle';
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                style={{
                  width: 34, height: 34, borderRadius: 9, fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
                  border: i === idx ? '2px solid var(--sector)' : '1px solid var(--border)',
                  background: st === 'answered' ? 'color-mix(in srgb, var(--sector) 16%, transparent)' : st === 'flag' ? 'var(--warning-soft)' : 'var(--surface)',
                  color: 'var(--text)',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
