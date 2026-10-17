'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Flame, Target, BookOpen, Building2, CalendarDays, Repeat, GraduationCap } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { getStats, subscribe } from '../../../lib/progress';

export default function ProfilePage() {
  const { profile, sector, spec, t, sectorName, specName, localize } = useKafaah();
  const [s, setS] = useState(null);
  useEffect(() => { setS(getStats()); return subscribe(() => setS(getStats())); }, []);
  const stats = s || { answered: 0, accuracy: 0, streak: 0, saved: 0, bestMock: 0 };
  const initials = (profile.name || t('nav.user')).trim().charAt(0);

  const bp = spec?.blueprint
    ? t('profile.blueprintFmt', { q: spec.blueprint.questions, m: spec.blueprint.minutes, p: spec.blueprint.passScore })
    : '—';

  return (
    <div className="stack" style={{ gap: 18, maxWidth: 720 }}>
      <div className="card card-pad-lg text-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--sector) 12%, var(--surface)), var(--surface))' }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, margin: '0 auto', background: 'linear-gradient(135deg, var(--sector-1), var(--sector-2))', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 34, fontWeight: 900 }}>{initials}</div>
        <h1 className="mt-3" style={{ fontSize: 22 }}>{profile.name || t('profile.defaultName')}</h1>
        <p className="text-muted">{profile.email}</p>
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-brand">{sectorName(sector)}</span>
          <span className="badge badge-muted">{specName(spec)}</span>
        </div>
      </div>

      <div className="grid grid-4">
        {[
          { icon: BookOpen, label: t('home.answered'), value: stats.answered },
          { icon: Target, label: t('home.accuracy'), value: `${stats.accuracy}%` },
          { icon: Flame, label: t('home.streak'), value: stats.streak },
          { icon: Award, label: t('home.bestMock'), value: `${stats.bestMock}%` },
        ].map((x, i) => (
          <div key={i} className="stat-card"><x.icon size={19} style={{ color: 'var(--sector)' }} /><div className="stat-num mt-2">{x.value}</div><div className="stat-label">{x.label}</div></div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{t('profile.details')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          {[
            { icon: GraduationCap, label: t('profile.spec'), value: specName(spec) },
            { icon: Target, label: t('profile.blueprint'), value: bp },
            { icon: BookOpen, label: 'الهدف والمسار', value: 'التدريب المكثف والمحاكاة لاجتياز امتحان المزاولة بنجاح' },
          ].map((r, i) => (
            <div key={i} className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--sector)' }}><r.icon size={17} /></div>
              <div><div className="text-muted" style={{ fontSize: 12 }}>{r.label}</div><div style={{ fontWeight: 700, fontSize: 14 }}>{r.value || '—'}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
