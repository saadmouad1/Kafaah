'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BrainCircuit, Activity, BookOpen, BarChart3, AlertTriangle, Star,
  Flame, Target, TrendingUp, Sparkles, ArrowLeft, Repeat, Award, ListChecks,
} from 'lucide-react';
import { useKafaah } from '../../lib/context/KafaahProvider';
import { useBanks } from '../../lib/useData';
import { getStats, subscribe } from '../../lib/progress';

export default function DashboardHome() {
  const { profile, sector, spec, t, locale, sectorName, specName } = useKafaah();
  const { index } = useBanks();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getStats());
    return subscribe(() => setStats(getStats()));
  }, []);

  const specCount = useMemo(
    () => index?.items?.find((i) => i.specId === profile.specId)?.count || 0,
    [index, profile.specId],
  );
  const sectorCount = index?.bySector?.[profile.sectorId] || 0;

  const d = stats || { answered: 0, correct: 0, accuracy: 0, mistakes: 0, saved: 0, mocks: 0, bestMock: 0, avgMock: 0, streak: 0, last7: [] };
  const maxDaily = Math.max(1, ...d.last7.map((x) => x.a));

  const actions = [
    { href: '/dashboard/practice', icon: BrainCircuit, title: t('nav.practice'), desc: t('practice.sub'), tone: 'var(--sector)' },
    { href: '/dashboard/mock', icon: Activity, title: t('nav.mock'), desc: t('home.mockDesc', { pass: spec?.blueprint?.passScore || 60 }), tone: '#f59e0b' },
    { href: '/dashboard/bank', icon: BookOpen, title: t('nav.bank'), desc: t('home.bankDesc'), tone: '#3b82f6' },
    { href: '/dashboard/analytics', icon: BarChart3, title: t('nav.analytics'), desc: t('home.analyticsDesc'), tone: '#8b5cf6' },
    { href: '/dashboard/mistakes', icon: AlertTriangle, title: t('nav.mistakes'), desc: t('home.mistakesDesc', { n: d.mistakes }), tone: '#ef4444' },
    { href: '/dashboard/saved', icon: Star, title: t('nav.saved'), desc: t('home.savedDesc', { n: d.saved }), tone: '#eab308' },
  ];

  return (
    <div className="stack" style={{ gap: 20 }}>
      {/* Hero */}
      <div className="card card-pad-lg" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--sector) 12%, var(--surface)), var(--surface))' }}>
        <div className="row-between wrap" style={{ gap: 14 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span className="badge badge-brand">{sectorName(sector)}</span>
              <span className="badge badge-muted">{specName(spec)}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.9rem)', fontWeight: 900 }}>
              {t('home.hello', { name: profile.name?.split(' ')[0] || '' })}
            </h1>
            <p className="text-muted" style={{ fontWeight: 600, marginTop: 4 }}>
              {t('home.statsLine', {
                sector: sectorCount.toLocaleString(locale),
                spec: specCount.toLocaleString(locale),
                specName: specName(spec),
              })}
            </p>
          </div>
          <Link href="/onboarding" className="btn btn-ghost btn-sm">
            <Repeat size={14} /> {t('home.changeSpec')}
          </Link>
        </div>

        <div className="grid grid-4" style={{ marginTop: 18 }}>
          {[
            { icon: ListChecks, label: t('home.answered'), value: d.answered, color: 'var(--sector)' },
            { icon: Target, label: t('home.accuracy'), value: `${d.accuracy}%`, color: '#3b82f6' },
            { icon: Flame, label: t('home.streak'), value: d.streak, color: '#f59e0b' },
            { icon: Award, label: t('home.bestMock'), value: `${d.bestMock}%`, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="row-between">
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div className="stat-num mt-2" style={{ color: 'var(--text)' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic plan */}
      {profile.plan && (
        <div className="card">
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--gold-soft)', color: 'var(--gold-dark)', display: 'grid', placeItems: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16 }}>{t('home.yourPlan')}</h3>
              <p className="text-muted" style={{ fontSize: 12.5 }}>
                {t('home.planMeta')}{profile.planGeneratedAt ? ` · ${new Date(profile.planGeneratedAt).toLocaleDateString(locale)}` : ''}
              </p>
            </div>
          </div>
          {profile.plan.summary && <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{profile.plan.summary}</p>}
          {Array.isArray(profile.plan.focusAreas) && profile.plan.focusAreas.length > 0 && (
            <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
              {profile.plan.focusAreas.map((a, i) => (
                <span key={i} className="chip" style={{ cursor: 'default' }}>{typeof a === 'string' ? a : a.title || a.name}</span>
              ))}
            </div>
          )}
          {Array.isArray(profile.plan.weeks) && (
            <div className="stack mt-3" style={{ gap: 10 }}>
              {profile.plan.weeks.slice(0, 3).map((w, i) => (
                <div key={i} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <span className="badge badge-brand" style={{ marginTop: 2 }}>{t('home.week', { n: i + 1 })}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{w.title || w.focus}</div>
                    {w.tasks && <div className="text-muted" style={{ fontSize: 13 }}>{Array.isArray(w.tasks) ? w.tasks.join(' · ') : w.tasks}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/practice" className="btn btn-primary btn-sm mt-3">
            {t('home.startPractice')} <ArrowLeft size={14} />
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>{t('home.startNow')}</h2>
        <div className="grid grid-3">
          {actions.map(({ href, icon: Icon, title, desc, tone }) => (
            <Link key={href} href={href} className="card card-hover" style={{ display: 'block' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone, display: 'grid', placeItems: 'center', marginBottom: 10 }}>
                <Icon size={21} />
              </div>
              <h3 style={{ fontSize: 15.5 }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Weekly activity */}
      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }} className="row" style={{ gap: 8 }}>
            <TrendingUp size={17} style={{ color: 'var(--sector)' }} /> {t('home.weeklyActivity')}
          </h3>
          <Link href="/dashboard/analytics" className="btn btn-ghost btn-sm">{t('home.details')}</Link>
        </div>
        <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: 130 }}>
          {d.last7.map((x, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div
                  title={t('home.questionTooltip', { a: x.a, c: x.c })}
                  style={{
                    width: '70%', maxWidth: 34, borderRadius: 8,
                    height: `${Math.max(4, (x.a / maxDaily) * 100)}%`,
                    background: x.c > 0 ? 'linear-gradient(180deg, var(--sector-1), var(--sector-2))' : 'var(--surface-3)',
                    transition: 'height .4s ease',
                  }}
                />
              </div>
              <div className="text-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
                {new Date(x.date).toLocaleDateString(locale, { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
