'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn, Mail, Lock, Loader2, KeyRound, ShieldCheck,
  ArrowRight, RefreshCw, Sparkles, CheckCircle2, ChevronLeft,
  HelpCircle, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useKafaah } from '../../lib/context/KafaahProvider';
import { loginAccount, updateLocalPassword } from '../../lib/accounts';

export default function LoginPage() {
  const router = useRouter();
  const { login, profile, lang } = useKafaah();

  // views: 'login' | 'forgot'
  const [view, setView] = useState('login');

  // Login steps: 1: Enter Email & Password, 2: Enter 6-digit OTP
  const [loginStep, setLoginStep] = useState(1);

  // Forgot steps: 1: Enter Email, 2: Enter OTP & New Password
  const [forgotStep, setForgotStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const cellRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  // Feedback states
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto focus first OTP cell
  useEffect(() => {
    if (loginStep === 2 || forgotStep === 2) {
      setTimeout(() => cellRefs[0].current?.focus(), 150);
    }
  }, [loginStep, forgotStep]);

  // ── ١) الخطوة الأولى للدخول: إدخال الإيميل وكلمة السر والتحقق منهما أولاً ────
  async function handleVerifyCredentialsAndSendOtp(e) {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErr('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (!cleanPass) {
      setErr('يرجى إدخال كلمة المرور');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      // 1. التحقق من البريد وكلمة المرور عبر واجهة الخادم
      let user = null;
      try {
        const checkRes = await fetch('/api/auth/account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_credentials', email: cleanEmail, password: cleanPass }),
        });
        const checkData = await checkRes.json();
        if (!checkRes.ok || !checkData.ok) {
          throw new Error(checkData.error || 'البريد أو كلمة المرور غير صحيحة');
        }
        user = checkData.user;
      } catch (srvErr) {
        // فحص في الحسابات المحلية إن تعذر الاتصال أو كان مسجلاً بالجهاز
        const localAcc = loginAccount(cleanEmail, cleanPass);
        if (localAcc) {
          user = localAcc;
        } else {
          throw srvErr;
        }
      }

      setVerifiedUser(user);

      // 2. بعد ثبوت صحة كلمة المرور، نرسل رمز الـ OTP للتحقق من هوية البريد
      const otpRes = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: cleanEmail, name: user?.name, purpose: 'login' }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        throw new Error(otpData.error || 'تعذّر إرسال رمز التحقق الأمني');
      }

      setLoginStep(2);
      setCountdown(45);
      setSuccessMsg('كلمة المرور صحيحة ✓ تم إرسال رمز الأمان السري (OTP) إلى بريدك الإلكتروني.');
    } catch (ex) {
      setErr(ex.message || 'حدث خطأ أثناء التحقق من البيانات');
    } finally {
      setBusy(false);
    }
  }

  // ── ٢) الخطوة الثانية للدخول: إدخال رمز OTP وتأكيد الدخول ─────────────────
  async function handleVerifyOtpAndCompleteLogin(providedCode) {
    const fullCode = providedCode || otpDigits.join('');
    if (fullCode.length !== 6) return;

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: email.trim().toLowerCase(),
          code: fullCode,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
      }

      const clientName = verifiedUser?.name || email.split('@')[0];

      // مزامنة العميل في الخلفية
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'touch', email: email.trim().toLowerCase(), name: clientName }),
      }).catch(() => {});

      if (data.token) {
        try { localStorage.setItem('kafaah_user_token', data.token); } catch {}
      }

      // تسجيل الدخول في السياق الكلي للمنصة
      const next = login({
        ...profile,
        name: clientName,
        email: email.trim().toLowerCase(),
        id: verifiedUser?.id || profile.id || Date.now().toString(36),
        sectorId: profile.sectorId,
        specId: profile.specId,
      });

      setSuccessMsg('تم تأكيد الرمز بنجاح! جاري توجيهك إلى منصتك التدريبية...');
      setTimeout(() => {
        router.push(next.specId ? '/dashboard' : '/onboarding');
      }, 500);
    } catch (ex) {
      setErr(ex.message || 'رمز التحقق غير صحيح');
      setOtpDigits(['', '', '', '', '', '']);
      cellRefs[0].current?.focus();
    } finally {
      setBusy(false);
    }
  }

  // ── ٣) مسار نسيت كلمة المرور: الخطوة ١ (طلب رمز استعادة) ───────────────────
  async function handleRequestPasswordReset(e) {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErr('يرجى إدخال بريدك الإلكتروني المسجل');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: cleanEmail, purpose: 'reset' }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال رمز استعادة كلمة المرور');
      }

      setForgotStep(2);
      setCountdown(45);
      setSuccessMsg('تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح ✓');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  // ── ٤) مسار نسيت كلمة المرور: الخطوة ٢ (تأكيد الرمز وتعيين كلمة السر الجديدة) ─
  async function handleConfirmResetPassword(e) {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('');
    const cleanPass = newPassword.trim();

    if (fullCode.length !== 6) {
      setErr('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    if (cleanPass.length < 6) {
      setErr('كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل');
      return;
    }
    if (cleanPass !== confirmPassword.trim()) {
      setErr('كلمتا المرور غير متطابقتين');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: email.trim().toLowerCase(),
          code: fullCode,
          newPassword: cleanPass,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'تعذّر تعيين كلمة المرور الجديدة');
      }

      // تحديث محلي
      updateLocalPassword(email.trim().toLowerCase(), cleanPass);

      setSuccessMsg('تم تعيين كلمة المرور بنجاح! جاري تسجيل دخولك تلقائياً...');

      // تسجيل الدخول
      const next = login({
        ...profile,
        name: data.user?.name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        id: data.user?.id || Date.now().toString(36),
      });

      setTimeout(() => {
        router.push(next.specId ? '/dashboard' : '/onboarding');
      }, 700);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  // التعامل مع إدخال كل خانة بالـ OTP مع الانتقال الذكي
  function handleDigitChange(idx, val) {
    if (val.length > 1) {
      const pasteDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteDigits.forEach((d, i) => { if (i < 6) newDigits[i] = d; });
      setOtpDigits(newDigits);
      if (pasteDigits.length === 6) {
        if (view === 'login') {
          handleVerifyOtpAndCompleteLogin(pasteDigits.join(''));
        }
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

    if (digit && idx === 5) {
      const full = updated.join('');
      if (full.length === 6 && view === 'login') {
        handleVerifyOtpAndCompleteLogin(full);
      }
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      cellRefs[idx - 1].current?.focus();
    }
  }

  return (
    <div className="container container-narrow page" style={{ maxWidth: 490 }}>
      <div
        className="card glass-card-pro card-pad-lg mt-4 fade-up"
        style={{
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.15)',
          border: '1.5px solid var(--border)',
        }}
      >
        {/* Top Logo & Header */}
        <div className="text-center">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src="/icon.svg"
              alt="Kafaah"
              width="62"
              height="62"
              className="float-icon"
              style={{
                borderRadius: 18,
                boxShadow: '0 12px 24px -6px color-mix(in srgb, var(--sector) 40%, transparent)',
              }}
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

          <h1 className="mt-2" style={{ fontSize: 23, fontWeight: 900 }}>
            {view === 'forgot'
              ? 'استعادة كلمة المرور'
              : 'تسجيل الدخول إلى منصة كفاءة'}
          </h1>

          <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--sector)' }}>
              {view === 'forgot'
                ? 'التحقق الأمني عبر البريد الإلكتروني'
                : 'نظام الحماية الثنائي بالرمز الأمني (OTP) نشط'}
            </span>
          </div>
        </div>

        {/* تنبيه الخطأ */}
        {err && (
          <div
            className="card badge-danger mt-3 fade-up"
            style={{
              fontWeight: 800,
              padding: '10px 14px',
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{err}</span>
          </div>
        )}

        {/* تنبيه النجاح */}
        {successMsg && (
          <div
            className="card badge-success mt-3 fade-up"
            style={{
              fontWeight: 800,
              padding: '10px 14px',
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            الواجهة ١: تسجيل الدخول (Email + Password أولاً ثم OTP)
        ══════════════════════════════════════════════════════════════════════ */}
        {view === 'login' && (
          <div className="mt-3">
            {loginStep === 1 ? (
              /* المرحلة ١: إدخال البريد الإلكتروني وكلمة المرور */
              <form onSubmit={handleVerifyCredentialsAndSendOtp} className="stack" style={{ gap: 14 }}>
                <div className="field">
                  <label className="label">البريد الإلكتروني</label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={17}
                      style={{
                        position: 'absolute',
                        insetInlineStart: 14,
                        top: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label">كلمة المرور</label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setForgotStep(1);
                        setErr('');
                        setSuccessMsg('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--sector)',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={17}
                      style={{
                        position: 'absolute',
                        insetInlineStart: 14,
                        top: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      className="input"
                      style={{ paddingInlineStart: 42, paddingInlineEnd: 42 }}
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        insetInlineEnd: 12,
                        top: 12,
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                    لحماية حسابك وبياناتك التدريبية، سيتم التحقق من ملكية البريد عبر رمز أمني سري (OTP) فور إدخال كلمة المرور.
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
                    fontSize: 15,
                  }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                  <span>
                    {busy
                      ? 'جاري التحقق من البيانات...'
                      : 'متابعة والتحقق بالرمز الأمني (OTP)'}
                  </span>
                  {!busy && <ArrowRight size={16} />}
                </button>
              </form>
            ) : (
              /* المرحلة ٢: إدخال رمز التحقق الأمني المكون من 6 أرقام */
              <div className="stack fade-up" style={{ gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>
                    أدخل رمز التحقق الأمني السري (OTP) المرسل إلى:
                  </p>
                  <strong
                    style={{
                      color: 'var(--text)',
                      fontSize: 15,
                      direction: 'ltr',
                      display: 'inline-block',
                      background: 'var(--surface-3)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {email}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep(1);
                      setOtpDigits(['', '', '', '', '', '']);
                      setErr('');
                      setSuccessMsg('');
                    }}
                    style={{
                      display: 'block',
                      margin: '6px auto 0',
                      background: 'none',
                      border: 'none',
                      color: 'var(--sector)',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    تغيير البريد أو كلمة المرور
                  </button>
                </div>

                {/* شبكة إدخال الـ 6 خانات */}
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
                  onClick={() => handleVerifyOtpAndCompleteLogin()}
                  disabled={busy || otpDigits.join('').length !== 6}
                  style={{ fontWeight: 900, fontSize: 15 }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                  <span>{busy ? 'جاري التحقق...' : 'تأكيد الرمز وتسجيل الدخول'}</span>
                </button>

                {/* إعادة الإرسال */}
                <div className="text-center" style={{ fontSize: 13 }}>
                  {countdown > 0 ? (
                    <span className="text-muted">
                      يمكنك طلب رمز جديد بعد ({countdown} ثانية)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyCredentialsAndSendOtp()}
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
                      <span>إعادة إرسال رمز التحقق الآن</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            الواجهة ٢: نسيت كلمة المرور (طلب OTP وتعيين كلمة مرور جديدة)
        ══════════════════════════════════════════════════════════════════════ */}
        {view === 'forgot' && (
          <div className="mt-3 fade-up">
            {forgotStep === 1 ? (
              <form onSubmit={handleRequestPasswordReset} className="stack" style={{ gap: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز تحقق سرياً لتعيين كلمة مرور جديدة لحسابك.
                </p>

                <div className="field">
                  <label className="label">البريد الإلكتروني</label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={17}
                      style={{
                        position: 'absolute',
                        insetInlineStart: 14,
                        top: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
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

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={busy}
                  style={{ fontWeight: 900 }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <KeyRound size={18} />}
                  <span>{busy ? 'جاري الإرسال...' : 'إرسال رمز إعادة التعيين'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setErr('');
                    setSuccessMsg('');
                  }}
                  className="btn btn-ghost btn-block"
                  style={{ fontSize: 13 }}
                >
                  العودة لتسجيل الدخول
                </button>
              </form>
            ) : (
              /* المرحلة ٢: إدخال رمز التحقق وكلمة المرور الجديدة */
              <form onSubmit={handleConfirmResetPassword} className="stack fade-up" style={{ gap: 14 }}>
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    أدخل رمز التحقق المرسل إلى: <strong>{email}</strong>
                  </p>
                </div>

                {/* OTP Digits Grid */}
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

                <div className="field mt-2">
                  <label className="label">كلمة المرور الجديدة (6 أحرف على الأقل)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={17}
                      style={{
                        position: 'absolute',
                        insetInlineStart: 14,
                        top: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      className="input"
                      style={{ paddingInlineStart: 42, paddingInlineEnd: 42 }}
                      type={showNewPassword ? 'text' : 'password'}
                      dir="ltr"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        insetInlineEnd: 12,
                        top: 12,
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="label">تأكيد كلمة المرور الجديدة</label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={17}
                      style={{
                        position: 'absolute',
                        insetInlineStart: 14,
                        top: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      className="input"
                      style={{ paddingInlineStart: 42 }}
                      type="password"
                      dir="ltr"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-emerald btn-lg btn-block"
                  disabled={busy || otpDigits.join('').length !== 6}
                  style={{ fontWeight: 900 }}
                >
                  {busy ? <Loader2 size={18} className="spin" /> : <CheckCircle2 size={18} />}
                  <span>{busy ? 'جاري الحفظ...' : 'تأكيد كلمة المرور الجديدة والدخول'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setForgotStep(1);
                    setOtpDigits(['', '', '', '', '', '']);
                    setErr('');
                    setSuccessMsg('');
                  }}
                  className="btn btn-ghost btn-block"
                  style={{ fontSize: 13 }}
                >
                  إلغاء والعودة لتسجيل الدخول
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Link to Register */}
        <div
          className="row"
          style={{
            justifyContent: 'center',
            gap: 6,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: 13.5,
          }}
        >
          <span className="text-muted">ليس لديك حساب؟</span>
          <Link href="/register" style={{ color: 'var(--sector)', fontWeight: 800 }}>
            أنشئ حسابك واشترك الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
