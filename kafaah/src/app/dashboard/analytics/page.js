'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Target, Flame, Award, AlertTriangle, BookOpen, BarChart3 } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { getProgress, subscribe, getStats } from '../../../lib/progress';

export default function AnalyticsPage() {
  const { spec, t, locale, specName } = useKafaah();
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(getStats());
    return subscribe(() => setState(getStats()));
  }, []);

  const s = state || { answered: 0, correct: 0, accuracy: 0, mistakes: 0, saved: 0, mocks: 0, bestMock: 0, avgMock: 0, streak: 0, last7: [] };
  const p = getProgress();
  const maxDaily = Math.max(1, ...s.last7.map((x) => x.a));

  const bySubject = useMemo(() => {
    const map = {};
    Object.entries(p.mistakes || {}).forEach(([id, m]) => {
      const k = m.subject || t('common.general');
      map[k] = map[k] || { wrong: 0 };
      map[k].wrong += m.count || 1;
    });
    return Object.entries(map).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 6);
  }, [state]);

  const readiness = Math.round(s.accuracy * 0.6 + Math.min(100, s.answered / 2) * 0.2 + Math.min(100, s.bestMock) * 0.2);
  const nf = (n) => Number(n || 0).toLocaleString(locale);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div>
        <h1 className="page-title">{t('nav.analytics')}</h1>
        <p className="text-muted mt-1">{t('analytics.sub', { spec: specName(spec) })}</p>
      </div>

      {/* readiness */}
      <div className="card card-pad-lg soft-sector">
        <div className="row-between wrap" style={{ gap: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <Target size={18} style={{ color: 'var(--sector)' }} />
              <h3 style={{ fontSize: 16 }}>{t('analytics.readiness')}</h3>
            </div>
            <div className="stat-num" style={{ fontSize: '2.6rem', color: 'var(--sector)' }}>{readiness}%</div>
            <p className="text-muted" style={{ fontSize: 13 }}>{t('analytics.readinessDesc')}</p>
            <div className="progress mt-2"><span style={{ width: `${readiness}%` }} /></div>
          </div>
          <Link href="/dashboard/mock" className="btn btn-primary">{t('analytics.startMock')} <Award size={15} /></Link>
        </div>
      </div>

      <div className="grid grid-4">
        {[
          { icon: BookOpen, label: t('home.answered'), value: nf(s.answered), color: 'var(--sector)' },
          { icon: Target, label: t('home.accuracy'), value: `${s.accuracy}%`, color: '#3b82f6' },
          { icon: Flame, label: t('home.streak'), value: nf(s.streak), color: '#f59e0b' },
          { icon: AlertTriangle, label: t('analytics.mistakesForReview'), value: nf(s.mistakes), color: '#ef4444' },
        ].map((x, i) => (
          <div key={i} className="stat-card">
            <x.icon size={20} style={{ color: x.color }} />
            <div className="stat-num mt-2">{x.value}</div>
            <div className="stat-label">{x.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }} className="row"><TrendingUp size={17} style={{ color: 'var(--sector)' }} /> {t('analytics.last7')}</h3>
          <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: 150 }}>
            {s.last7.map((x, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: '68%', borderRadius: 8, height: `${Math.max(4, (x.a / maxDaily) * 100)}%`, background: x.c > 0 ? 'linear-gradient(180deg, var(--sector-1), var(--sector-2))' : 'var(--surface-3)' }} />
                </div>
                <div className="text-dim" style={{ fontSize: 10.5, marginTop: 6 }}>{new Date(x.date).toLocaleDateString(locale, { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }} className="row"><BarChart3 size={17} style={{ color: 'var(--danger)' }} /> {t('analytics.topWrong')}</h3>
          {bySubject.length === 0 ? (
            <p className="text-muted">{t('analytics.noMistakes')}</p>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {bySubject.map(([k, v]) => {
                const max = bySubject[0][1].wrong;
                return (
                  <div key={k}>
                    <div className="row-between" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}><span>{k}</span><span>{nf(v.wrong)}</span></div>
                    <div className="progress"><span style={{ width: `${(v.wrong / max) * 100}%`, background: 'linear-gradient(90deg,#f87171,#ef4444)' }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{t('analytics.mockLog')}</h3>
        {(p.mocks || []).length === 0 ? (
          <p className="text-muted">{t('analytics.noMocks')}</p>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {p.mocks.slice(0, 8).map((m, i) => {
              const pct = m.total ? Math.round((m.correct / m.total) * 100) : 0;
              return (
                <div key={i} className="row-between card" style={{ padding: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{new Date(m.at).toLocaleDateString(locale, { dateStyle: 'medium' })}</div>
                    <div className="text-muted" style={{ fontSize: 12.5 }}>{nf(m.correct)}/{nf(m.total)} · {nf(m.minutes)} {t('common.minutesShort')}</div>
                  </div>
                  <span className={`badge ${m.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 13 }}>{pct}% {m.passed ? t('analytics.pass') : t('analytics.fail')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
