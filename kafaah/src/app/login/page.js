'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { loginAccount } from '../../lib/accounts';
import { useKafaah } from '../../lib/context/KafaahProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, profile } = useKafaah();
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
          <h1 className="mt-2" style={{ fontSize: 23 }}>مرحبًا بعودتك</h1>
          <p className="text-muted mt-1">سجّل الدخول لمتابعة تدريبك.</p>
        </div>

        {err && <div className="card badge-danger mt-3" style={{ fontWeight: 800 }}>{err}</div>}

        <form onSubmit={submit} className="stack mt-3" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', right: 14, top: 15, color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingRight: 42 }} type="email" dir="ltr" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <label className="label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', right: 14, top: 15, color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingRight: 42 }} type="password" dir="ltr" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block mt-1" disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />} تسجيل الدخول
          </button>
        </form>

        <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 13.5 }}>
          <span className="text-muted">ليس لديك حساب؟</span>
          <Link href="/register" style={{ color: 'var(--sector)', fontWeight: 800 }}>أنشئ حسابًا</Link>
        </div>
      </div>
    </div>
  );
}
