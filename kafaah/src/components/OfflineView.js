'use client';
import Link from 'next/link';
import { useKafaah } from '../lib/context/KafaahProvider';

export default function OfflineView() {
  const { t } = useKafaah();
  return (
    <main className="container" style={{ maxWidth: 520, paddingBlock: 64, textAlign: 'center' }}>
      <div
        className="card"
        style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
      >
        <div
          aria-hidden
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            display: 'grid',
            placeItems: 'center',
            background: 'color-mix(in srgb, var(--sector) 14%, transparent)',
            color: 'var(--sector)',
            fontSize: 40,
          }}
        >
          📡
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{t('offline.title')}</h1>
        <p className="text-muted" style={{ margin: 0, lineHeight: 1.9 }}>{t('offline.desc')}</p>
        <div className="row" style={{ gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link className="btn btn-primary" href="/dashboard">{t('offline.backHome')}</Link>
          <Link className="btn btn-ghost" href="/dashboard/practice">{t('offline.continue')}</Link>
        </div>
      </div>
    </main>
  );
}
