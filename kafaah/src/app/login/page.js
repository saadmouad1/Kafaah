'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn, Mail, Lock, Loader2, KeyRound, ShieldCheck,
  ArrowRight, RefreshCw, Sparkles, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { loginAccount } from '../../lib/accounts';
import { useKafaah } from '../../lib/context/KafaahProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, profile, t, lang } = useKafaah();

  // 'otp' or 'password'
  const [authMode, setAuthMode] = useState('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP State
  const [otpStep, setOtpStep] = useState(1); // 1: enter email, 2: enter code
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const cellRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  // عداد تنازلي لإعادة إرسال الرمز
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // التركيز التلقائي على أول خانة عند الانتقال للمرحلة 2
  useEffect(() => {
    if (otpStep === 2) {
      setTimeout(() => cellRefs[0].current?.focus(), 150);
    }
  }, [otpStep]);

  // ── ١) إرسال رمز OTP ─────────────────────────────────────────────────────
  async function requestOtp(e) {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErr(lang === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال رمز التحقق');
      }

      setOtpStep(2);
      setCountdown(45);
      setSuccessMsg(lang === 'en' ? 'Verification code sent to your email ✓' : 'تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني بنجاح ✓');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  // ── ٢) التحقق من رمز OTP وإتمام الدخول ─────────────────────────────────────
  async function verifyOtpAndLogin(providedCode) {
    const fullCode = providedCode || otpDigits.join('');
    if (fullCode.length !== 6) return;

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: email.trim().toLowerCase(), code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
      }

      // استخراج الاسم من الإيميل أو الحساب
      const name = email.split('@')[0];

      // مزامنة العميل في الخلفية
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'touch', email: email.trim().toLowerCase(), name }),
      }).catch(() => {});

      // تسجيل الدخول في الـ Context
      const next = login({
        ...profile,
        name: profile.name || name,
        email: email.trim().toLowerCase(),
        id: profile.id || Date.now().toString(36),
        sectorId: profile.sectorId,
        specId: profile.specId,
      });

      setSuccessMsg(lang === 'en' ? 'Verified! Redirecting...' : 'تم التحقق بنجاح! جاري تحويلك...');
      setTimeout(() => {
        router.push(next.specId ? '/dashboard' : '/onboarding');
      }, 400);
    } catch (ex) {
      setErr(ex.message);
      // مسح الخانات وإعادة التركيز
      setOtpDigits(['', '', '', '', '', '']);
      cellRefs[0].current?.focus();
    } finally {
      setBusy(false);
    }
  }

  // التعامل مع إدخال كل خانة بالـ OTP مع الانتقال الذكي التلقائي
  function handleDigitChange(idx, val) {
    // التعامل مع النسخ واللصق الكامل للرمز
    if (val.length > 1) {
      const pasteDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteDigits.forEach((d, i) => { if (i < 6) newDigits[i] = d; });
      setOtpDigits(newDigits);
      if (pasteDigits.length === 6) {
        verifyOtpAndLogin(pasteDigits.join(''));
      } else {
        const nextIdx = Math.min(pasteDigits.length, 5);
        cellRefs[nextIdx].current?.focus();
      }
      return;
    }

    const digit = val.slice(-1).replace(/\D/g, '');
    const updated = [...otpDigits];
    updated[idx] = digit;
    setOtpDigits(updated);

    if (digit && idx < 5) {
      cellRefs[idx + 1].current?.focus();
    }

    // إذا اكتملت الخانات الستة، تحقق فوراً
    if (digit && idx === 5) {
      const full = updated.join('');
      if (full.length === 6) {
        verifyOtpAndLogin(full);
      }
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      cellRefs[idx - 1].current?.focus();
    }
  }

  // ── ٣) الدخول التقليدي بكلمة المرور ───────────────────────────────────────
  function submitPassword(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const acc = loginAccount(email, password);
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'touch', email: acc.email, name: acc.name }),
      }).catch(() => {});
      const next = login({
        ...profile,
        name: acc.name,
        email: acc.email,
        id: acc.id,
        sectorId: profile.sectorId,
        specId: profile.specId,
      });
      router.push(next.specId ? '/dashboard' : '/onboarding');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container container-narrow page" style={{ maxWidth: 480 }}>
      <div className="card glass-card-pro card-pad-lg mt-4 fade-up" style={{ borderRadius: 24, padding: 30 }}>
        
        {/* Top Floating Logo & Security Badge */}
        <div className="text-center">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src="/icon.svg"
              alt="Kafaah"
              width="62"
              height="62"
              className="float-icon"
              style={{ borderRadius: 18, boxShadow: '0 12px 24px -6px color-mix(in srgb, var(--sector) 40%, transparent)' }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'var(--success)',
                border: '2.5px solid var(--surface)',
                boxShadow: '0 0 8px var(--success)',
              }}
            />
          </div>

          <h1 className="mt-2" style={{ fontSize: 24, fontWeight: 900 }}>
            {lang === 'en' ? 'Welcome to Kafaah' : 'مرحباً بك في منصة كفاءة'}
          </h1>

          <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--sector)' }}>
              {lang === 'en' ? 'Secure OTP Authentication Protected' : 'نظام الحماية والتحقق بالرمز الأمني (OTP) نشط'}
            </span>
          </div>
        </div>

        {/* Mode Switcher (OTP vs Password) */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface-3)',
            padding: 4,
            borderRadius: 14,
            marginBlock: '18px 14px',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            className="flex-1"
            onClick={() => { setAuthMode('otp'); setErr(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: authMode === 'otp' ? 'var(--surface)' : 'transparent',
              color: authMode === 'otp' ? 'var(--sector)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: authMode === 'otp' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <KeyRound size={15} />
            <span>{lang === 'en' ? 'Quick OTP Code (Recommended)' : 'رمز الأمان السريع OTP (الموصى به)'}</span>
          </button>

          <button
            type="button"
            className="flex-1"
            onClick={() => { setAuthMode('password'); setErr(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: authMode === 'password' ? 'var(--surface)' : 'transparent',
              color: authMode === 'password' ? 'var(--sector)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: authMode === 'password' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Lock size={15} />
            <span>{lang === 'en' ? 'Password' : 'كلمة المرور'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="card badge-danger mb-3 fade-up" style={{ fontWeight: 800, padding: '10px 14px', fontSize: 13.5 }}>
            {err}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="card badge-success mb-3 fade-up" style={{ fontWeight: 800, padding: '10px 14px', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── حالة ١: تسجيل الدخول برمز OTP السريع ── */}
        {authMode === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={requestOtp} className="stack" style={{ gap: 14 }}>
                <div className="field">
                  <label className="label">{t('auth.email')}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
                    <input
                      className="input"
                      style={{ paddingInlineStart: 42 }}
                      type="email"
                      dir="ltr"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {lang === 'en'
                      ? 'We will send a 6-digit one-time security code to your email.'
                      : 'سنرسل لك رمز تحقق سرياً مكوناً من 6 أرقام لتسجيل دخولك فوراً دون الحاجة لتذكر كلمة مرور.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={busy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 900,
                    boxShadow: 'var(--shadow-brand)',
                  }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                  <span>{busy ? (lang === 'en' ? 'Sending Code...' : 'جاري إرسال الرمز...') : (lang === 'en' ? 'Send Secure OTP Code' : 'إرسال رمز الدخول الآمن')}</span>
                </button>
              </form>
            ) : (
              /* المرحلة ٢: إدخال الـ 6 خانات للـ OTP */
              <div className="stack fade-up" style={{ gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    {lang === 'en' ? 'Enter the 6-digit code sent to:' : 'أدخل رمز التحقق الأمني المرسل إلى:'}
                  </p>
                  <strong style={{ color: 'var(--text)', fontSize: 14.5, direction: 'ltr', display: 'inline-block' }}>
                    {email}
                  </strong>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(1); setOtpDigits(['', '', '', '', '', '']); setErr(''); }}
                    style={{
                      display: 'block',
                      margin: '4px auto 0',
                      background: 'none',
                      border: 'none',
                      color: 'var(--sector)',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {lang === 'en' ? 'Change Email Address' : 'تغيير البريد الإلكتروني'}
                  </button>
                </div>

                {/* 6-box OTP Grid */}
                <div className="otp-grid">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={cellRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`otp-cell${digit ? ' filled' : ''}`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={() => verifyOtpAndLogin()}
                  disabled={busy || otpDigits.join('').length !== 6}
                  style={{ fontWeight: 900 }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                  <span>{busy ? (lang === 'en' ? 'Verifying...' : 'جاري التحقق...') : (lang === 'en' ? 'Verify & Sign In' : 'تأكيد الرمز والدخول')}</span>
                </button>

                {/* Resend Timer */}
                <div className="text-center" style={{ fontSize: 13 }}>
                  {countdown > 0 ? (
                    <span className="text-muted">
                      {lang === 'en' ? `Resend code in (${countdown}s)` : `يمكنك إعادة إرسال الرمز بعد (${countdown} ثانية)`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestOtp()}
                      disabled={busy}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--sector)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>{lang === 'en' ? 'Resend verification code' : 'إعادة إرسال رمز التحقق الآن'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── حالة ٢: تسجيل الدخول التقليدي بكلمة المرور ── */}
        {authMode === 'password' && (
          <form onSubmit={submitPassword} className="stack fade-up" style={{ gap: 14 }}>
            <div className="field">
              <label className="label">{t('auth.email')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  style={{ paddingInlineStart: 42 }}
                  type="email"
                  dir="ltr"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">{t('auth.password')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  style={{ paddingInlineStart: 42 }}
                  type="password"
                  dir="ltr"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-block mt-1" disabled={busy} style={{ fontWeight: 900 }}>
              {busy ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />} {t('auth.login')}
            </button>
          </form>
        )}

        {/* Footer Link to Register */}
        <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 18, fontSize: 13.5 }}>
          <span className="text-muted">{t('auth.noAccount')}</span>
          <Link href="/register" style={{ color: 'var(--sector)', fontWeight: 800 }}>
            {t('auth.createOne')}
          </Link>
        </div>
      </div>
    </div>
  );
}
