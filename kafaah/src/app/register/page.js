'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, UserRound, Loader2, ShieldCheck } from 'lucide-react';
import { registerAccount } from '../../lib/accounts';
import { useKafaah } from '../../lib/context/KafaahProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { login, t } = useKafaah();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const acc = registerAccount({ name, email, password });
      // تسجيل العميل على الخادم ليظهر في لوحة المالك
      fetch('/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email: acc.email, name: acc.name }),
      }).catch(() => {});
      login({ name: acc.name, email: acc.email, id: acc.id });
      router.push('/onboarding');
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
          <h1 className="mt-2" style={{ fontSize: 23 }}>{t('register.title')}</h1>
          <p className="text-muted mt-1">{t('register.sub')}</p>
        </div>

        {err && <div className="card badge-danger mt-3" style={{ fontWeight: 800 }}>{err}</div>}

        <form onSubmit={submit} className="stack mt-3" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">{t('register.fullName')}</label>
            <div style={{ position: 'relative' }}>
              <UserRound size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingInlineStart: 42 }} placeholder={t('register.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
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
              <input className="input" style={{ paddingInlineStart: 42 }} type="password" dir="ltr" placeholder={t('register.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block mt-1" disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : <UserPlus size={17} />} {t('register.create')}
          </button>
        </form>

        <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 13.5 }}>
          <span className="text-muted">{t('auth.haveAccount')}</span>
          <Link href="/login" style={{ color: 'var(--sector)', fontWeight: 800 }}>{t('auth.loginLink')}</Link>
        </div>

        <div className="row card soft-sector mt-3" style={{ padding: 12, gap: 8 }}>
          <ShieldCheck size={18} style={{ color: 'var(--sector)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t('register.privacy')}</span>
        </div>
      </div>
    </div>
  );
}
