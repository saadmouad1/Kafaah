'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { loginAccount } from '../../lib/accounts';
import { useKafaah } from '../../lib/context/KafaahProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, profile, t } = useKafaah();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const acc = loginAccount(email, password);
      // مزامنة العميل مع الخادم ليظهر في لوحة المالك (غير معطِّل عند الفشل)
      fetch('/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'touch', email: acc.email, name: acc.name }),
      }).catch(() => {});
      const next = login({ ...profile, name: acc.name, email: acc.email, id: acc.id, sectorId: profile.sectorId, specId: profile.specId });
      router.push(next.specId ? '/dashboard' : '/onboarding');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container container-narrow page" style={{ maxWidth: 460 }}>
      <div className="card card-pad-lg mt-4 fade-up">
        <div className="text-center">
          <img src="/icon.svg" alt="" width="56" height="56" style={{ borderRadius: 16 }} />
          <h1 className="mt-2" style={{ fontSize: 23 }}>{t('auth.welcomeBack')}</h1>
          <p className="text-muted mt-1">{t('auth.loginSub')}</p>
        </div>

        {err && <div className="card badge-danger mt-3" style={{ fontWeight: 800 }}>{err}</div>}

        <form onSubmit={submit} className="stack mt-3" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingInlineStart: 42 }} type="email" dir="ltr" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label className="label">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingInlineStart: 42 }} type="password" dir="ltr" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block mt-1" disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />} {t('auth.login')}
          </button>
        </form>

        <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 13.5 }}>
          <span className="text-muted">{t('auth.noAccount')}</span>
          <Link href="/register" style={{ color: 'var(--sector)', fontWeight: 800 }}>{t('auth.createOne')}</Link>
        </div>
      </div>
    </div>
  );
}
