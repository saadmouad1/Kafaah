'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Upload, Trash2, LogOut, Moon, Sun, Repeat, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { exportProgress, importProgress, resetProgress } from '../../../lib/progress';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, setProfile, sector, spec, logout, sectors, t, locale, sectorName, specName, localize, lang } = useKafaah();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [savedMsg, setSavedMsg] = useState('');
  const [sid, setSid] = useState('');
  const [spid, setSpid] = useState('');
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setSid(profile.sectorId || '');
    setSpid(profile.specId || '');
    const th = localStorage.getItem('kafaah_theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(th);
  }, [profile]);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => setPackages((d.packages || []).filter((p) => p.active !== false)))
      .catch(() => {});
  }, []);

  function applyTheme(th) {
    setTheme(th);
    localStorage.setItem('kafaah_theme', th);
    document.documentElement.dataset.theme = th === 'dark' ? 'dark' : 'light';
  }

  function flash(msg, ms = 2000) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), ms);
  }

  function saveIdentity() {
    setProfile({ name: name.trim(), email: email.trim() });
    flash(t('settings.savedIdentity'));
  }

  function saveDomain() {
    setProfile({ sectorId: sid, specId: spid });
    flash(t('settings.savedDomain'), 2200);
  }

  function doExport() {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kafaah-progress-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try { importProgress(JSON.parse(r.result)); flash(t('settings.imported'), 2500); }
      catch { flash(t('settings.invalidFile'), 2500); }
    };
    r.readAsText(file);
  }

  function subscribe(pkg) {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setProfile({ subscription: { plan: pkg.id, planName: pkg.name, startedAt: new Date().toISOString(), expiresAt: d.toISOString() } });
    if (profile.email) {
      fetch('/api/subscriptions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, name: profile.name, packageId: pkg.id }),
      }).catch(() => {});
    }
    flash(t('settings.savedIdentity'));
  }

  const sub = profile.subscription;

  return (
    <div className="stack" style={{ gap: 18, maxWidth: 720 }}>
      <h1 className="page-title">{t('nav.settings')}</h1>

      {savedMsg && <div className="card badge-success" style={{ fontWeight: 800 }}>{savedMsg}</div>}

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{t('settings.account')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          <div className="field"><label className="label">{t('settings.name')}</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label className="label">{t('settings.email')}</label><input className="input" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={saveIdentity}><Save size={15} /> {t('common.save')}</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{t('settings.domain')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">{t('settings.section')}</label>
            <select className="input" value={sid} onChange={(e) => { setSid(e.target.value); setSpid(''); }}>
              <option value="">{t('settings.chooseSection')}</option>
              {(sectors || []).map((s) => <option key={s.id} value={s.id}>{sectorName(s)}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">{t('settings.spec')}</label>
            <select className="input" value={spid} onChange={(e) => setSpid(e.target.value)} disabled={!sid}>
              <option value="">{t('settings.chooseSpec')}</option>
              {((sectors || []).find((s) => s.id === sid)?.specializations || []).map((sp) => (
                <option key={sp.id} value={sp.id}>{specName(sp)}</option>
              ))}
            </select>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={!sid || !spid} onClick={saveDomain}>
              <Save size={15} /> {t('settings.saveDomain')}
            </button>
            <Link href="/onboarding" className="btn btn-ghost"><Repeat size={14} /> {t('settings.viaWizard')}</Link>
          </div>
          <div className="row-between card soft-sector" style={{ padding: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{sectorName(sector) || '—'}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{specName(spec)} · {localize(spec?.authority)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{t('settings.appearance')}</h3>
        <div className="row" style={{ gap: 10 }}>
          <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => applyTheme('light')}><Sun size={15} /> {t('settings.light')}</button>
          <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => applyTheme('dark')}><Moon size={15} /> {t('settings.dark')}</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }} className="row"><ShieldCheck size={17} style={{ color: 'var(--sector)' }} /> {t('settings.subscription')}</h3>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800 }}>{sub?.planName || (sub?.plan && sub.plan !== 'active' ? sub.plan : t('settings.activeSub'))}</div>
            {sub?.expiresAt && <div className="text-muted" style={{ fontSize: 13 }}>{t('settings.expires', { date: new Date(sub.expiresAt).toLocaleDateString(locale) })}</div>}
          </div>
          <span className="badge badge-success">{t('settings.active')}</span>
        </div>

        {packages.length > 0 && (
          <div className="stack" style={{ gap: 10 }}>
            {packages.map((p) => (
              <div key={p.id} className="card soft-sector row-between" style={{ padding: 14, gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 180 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <Sparkles size={15} style={{ color: 'var(--sector)' }} />
                    <span style={{ fontWeight: 800 }}>{(lang === 'en' && p.nameEn) ? p.nameEn : p.name}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 12.5 }}>
                    {(p.price ?? 0)} {p.currency || 'USD'} {t('pkg.perMonth')}
                    {(() => {
                      const feats = (lang === 'en' && p.featuresEn?.length) ? p.featuresEn : (p.features || []);
                      return feats.length ? ` · ${feats.join(' · ')}` : '';
                    })()}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => subscribe(p)}>{t('pkg.subscribe')}</button>
              </div>
            ))}
            <p className="text-dim" style={{ fontSize: 12 }}>{t('pkg.comingSoon')}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>{t('settings.myData')}</h3>
        <div className="row wrap" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={doExport}><Download size={14} /> {t('settings.export')}</button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} /> {t('settings.import')}
            <input type="file" accept="application/json" hidden onChange={doImport} />
          </label>
          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(t('settings.resetConfirm'))) { resetProgress(); flash(t('settings.resetDone')); } }}>
            <Trash2 size={14} /> {t('settings.reset')}
          </button>
        </div>
      </div>

      <button className="btn btn-danger btn-block" onClick={() => { logout(); router.replace('/'); }}>
        <LogOut size={16} /> {t('nav.logout')}
      </button>
    </div>
  );
}
