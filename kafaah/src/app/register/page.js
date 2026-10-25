'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserPlus, Mail, Lock, UserRound, Phone, Loader2,
  ShieldCheck, CheckCircle2, Sparkles, Building2, Wallet,
  Copy, Check, Send, AlertCircle, RefreshCw, ChevronLeft,
  Flame, Clock, MessageCircle, Info, Stethoscope, Briefcase
} from 'lucide-react';
import { useKafaah } from '../../lib/context/KafaahProvider';
import { registerAccount } from '../../lib/accounts';
import { SECTORS } from '../../lib/content';
import { YEMEN_PAYMENT_CONFIG } from '../../lib/yemenPayConfig';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, profile, lang } = useKafaah();

  // query param plan: 'quarterly' | 'monthly'
  const initialPlan = searchParams?.get('plan') || 'quarterly';

  // Steps:
  // 1: Account Info & Package Selection
  // 2: Email OTP Verification
  // 3: Yemeni Payment Transfer
  // 4: Payment Confirmation Waiting Screen
  const [step, setStep] = useState(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('gms');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan === 'monthly' ? 'monthly' : 'quarterly');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const cellRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  // Payment Form Fields (Step 3)
  const [selectedMethod, setSelectedMethod] = useState('kuraimi');
  const [selectedAccount, setSelectedAccount] = useState('aden_usd');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Feedback states
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const plans = [
    {
      id: 'quarterly',
      name: 'باقة الـ 3 أشهر (المكثفة للامتحان)',
      price: 12,
      originalPrice: 20,
      badge: 'الأكثر طلباً للامتحان · وفر 40% 🔥',
      periodText: '90 يوماً متواصلة حتى موعد الامتحان',
      isPopular: true,
    },
    {
      id: 'monthly',
      name: 'الباقة الشهرية المرنة',
      price: 5,
      originalPrice: 10,
      badge: 'تجديد شهري',
      periodText: '30 يوماً لكافة بنوك التخصص',
      isPopular: false,
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus on OTP input when stepping into step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => cellRefs[0].current?.focus(), 150);
    }
  }, [step]);

  const copyToClipboard = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  // ── ١) الخطوة ١: إرسال الـ OTP للتحقق من البريد قبل إنشاء الحساب ─────────────
  async function handleStartVerification(e) {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      setErr('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErr('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (cleanPass.length < 6) {
      setErr('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      // إرسال رمز OTP للبريد الإلكتروني للتحقق من ملكيته
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: cleanEmail,
          name: cleanName,
          purpose: 'register',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'تعذّر إرسال رمز التحقق الأمني');
      }

      setSenderName(cleanName);
      setStep(2);
      setCountdown(45);
      setSuccessMsg('تم إرسال رمز التحقق الأمني إلى بريدك الإلكتروني بنجاح ✓');
    } catch (ex) {
      setErr(ex.message || 'حدث خطأ أثناء إرسال رمز التحقق');
    } finally {
      setBusy(false);
    }
  }

  // ── ٢) الخطوة ٢: التحقق من رمز OTP وحفظ الحساب على الخادم ──────────────────
  async function handleVerifyOtpAndCreateAccount(providedCode) {
    const fullCode = providedCode || otpDigits.join('');
    if (fullCode.length !== 6) return;

    setErr('');
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    try {
      // 1. التحقق من الرمز عبر OTP API
      const otpRes = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: cleanEmail,
          code: fullCode,
        }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.verified) {
        throw new Error(otpData.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
      }

      // 2. إنشاء الحساب على الخادم
      const accRes = await fetch('/api/auth/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: cleanName,
          email: cleanEmail,
          password: cleanPass,
          phone: phone.trim(),
          specId: selectedSpec,
        }),
      });
      const accData = await accRes.json();

      if (!accRes.ok || !accData.ok) {
        throw new Error(accData.error || 'تعذّر تسجيل الحساب');
      }

      // 3. حفظ الحساب محلياً في المتصفح وتسجيل الدخول في السياق
      registerAccount({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        phone: phone.trim(),
        specId: selectedSpec,
      });

      if (accData.token) {
        try { localStorage.setItem('kafaah_user_token', accData.token); } catch {}
      }

      login({
        ...profile,
        name: cleanName,
        email: cleanEmail,
        id: accData.user?.id || Date.now().toString(36),
        specId: selectedSpec,
      });

      // الانتقال مباشرة إلى مرحلة الدفع المحلي لإكمال الاشتراك
      setStep(3);
      setSuccessMsg('تم تأكيد بريدك وإنشاء حسابك بنجاح! الخطوة الأخيرة: إتمام التحويل المحلي لتفعيل باقتك ✨');
    } catch (ex) {
      setErr(ex.message || 'رمز التحقق غير صحيح');
      setOtpDigits(['', '', '', '', '', '']);
      cellRefs[0].current?.focus();
    } finally {
      setBusy(false);
    }
  }

  // ── ٣) الخطوة ٣: إرسال إشعار التحويل البنكي المحلي (الكريمي أو جيب) ───────────
  async function handleSubmitPayment(e) {
    if (e) e.preventDefault();
    const cleanTx = transactionNumber.trim();
    const cleanSender = senderName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanTx && !cleanSender) {
      setErr('يرجى إدخال رقم العملية أو اسم الشخص المحول منه لتأكيد الحوالة');
      return;
    }

    setErr('');
    setBusy(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          clientName: cleanSender || name.trim(),
          phone: phone.trim(),
          packageId: currentPlan.id,
          packageName: currentPlan.name,
          amount: currentPlan.price,
          method: selectedMethod,
          accountType: selectedMethod === 'kuraimi' ? selectedAccount : 'jeeb',
          transactionNumber: cleanTx,
          senderName: cleanSender,
          notes: paymentNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'تعذّر إرسال إشعار الدفع');
      }

      setPaymentResult(data.payment);
      setStep(4); // الانتقال لشاشة الانتظار الراقية والتطمين
    } catch (ex) {
      setErr(ex.message || 'حدث خطأ أثناء إرسال إشعار الدفع');
    } finally {
      setBusy(false);
    }
  }

  // التعامل مع إدخال كل خانة بالـ OTP مع الانتقال الذكي التلقائي
  function handleDigitChange(idx, val) {
    if (val.length > 1) {
      const pasteDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasteDigits.forEach((d, i) => { if (i < 6) newDigits[i] = d; });
      setOtpDigits(newDigits);
      if (pasteDigits.length === 6) {
        handleVerifyOtpAndCreateAccount(pasteDigits.join(''));
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
      if (full.length === 6) {
        handleVerifyOtpAndCreateAccount(full);
      }
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      cellRefs[idx - 1].current?.focus();
    }
  }

  // رابط واتساب مباشر
  const whatsappUrl = `https://wa.me/967772686817?text=${encodeURIComponent(
    `السلام عليكم، قمت بإنشاء حساب في منصة كفاءة وأود تأكيد حوالة الاشتراك.\nالاسم: ${name || senderName}\nالبريد: ${email}\nالباقة: ${currentPlan.name} ($${currentPlan.price})\nطريقة الدفع: ${selectedMethod === 'kuraimi' ? 'الكريمي' : 'محفظة جيب'}\nرقم العملية / اسم المحول: ${transactionNumber || senderName || 'سأرفق صورة السند هنا'}`
  )}`;

  return (
    <div className="container container-narrow page" style={{ maxWidth: 580 }}>
      <div
        className="card glass-card-pro card-pad-lg mt-4 fade-up"
        style={{
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 34px)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2)',
          border: '1.5px solid var(--border)',
        }}
      >
        {/* Top Header */}
        <div className="text-center">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src="/icon.svg"
              alt="Kafaah"
              width="64"
              height="64"
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

          <h1 className="mt-2" style={{ fontSize: 24, fontWeight: 900 }}>
            {step === 1 && 'إنشاء حساب واشتراك جديد'}
            {step === 2 && 'التحقق من بريدك الإلكتروني'}
            {step === 3 && 'سداد الاشتراك وتفعيل الحساب'}
            {step === 4 && 'تم استلام بيانات تحويلك بنجاح!'}
          </h1>

          <p className="text-muted mt-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
            {step === 1 && 'انضم إلى نخبة الممارسين واجتز امتحان مزاولة المهنة بأعلى معدل تفوق'}
            {step === 2 && 'نظام الحماية والتحقق بالرمز الأمني (OTP) نشط لضمان أمان حسابك'}
            {step === 3 && 'الدفع المحلي المباشر عبر بنك الكريمي أو محفظة جيب'}
            {step === 4 && 'سيتم مطابقة الحوالة وتفعيل باقتك فوراً'}
          </p>
        </div>

        {/* Steps Progress Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBlock: '16px 18px',
          }}
        >
          {[
            { num: 1, label: 'البيانات والباقة' },
            { num: 2, label: 'التحقق الأمني' },
            { num: 3, label: 'التحويل المحلي' },
            { num: 4, label: 'التفعيل' },
          ].map((st, i) => {
            const isCurrent = step === st.num;
            const isPassed = step > st.num;
            return (
              <div key={st.num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isPassed
                      ? '#10b981'
                      : isCurrent
                      ? 'var(--sector)'
                      : 'var(--surface-3)',
                    color: isPassed || isCurrent ? '#ffffff' : 'var(--text-muted)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {isPassed ? '✓' : st.num}
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  {st.label}
                </span>
                {i < 3 && (
                  <div
                    style={{
                      width: 14,
                      height: 2,
                      background: isPassed ? '#10b981' : 'var(--border)',
                      marginInline: 2,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {err && (
          <div
            className="card badge-danger mb-3 fade-up"
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

        {/* Success Alert */}
        {successMsg && (
          <div
            className="card badge-success mb-3 fade-up"
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
            الخطوة ١: البيانات الأساسية واختيار الباقة المدفوعة
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <form onSubmit={handleStartVerification} className="stack" style={{ gap: 14 }}>
            {/* بطاقات اختيار الباقة المدفوعة */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>
                  اختر باقة الاشتراك الخاصة بك:
                </span>
                <span className="badge badge-brand" style={{ fontSize: 11 }}>
                  منصة مدفوعة للجادين فقط
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
                {plans.map((p) => {
                  const active = p.id === selectedPlanId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      style={{
                        padding: '14px',
                        borderRadius: 14,
                        border: `2px solid ${active ? '#10b981' : 'var(--border)'}`,
                        background: active ? 'rgba(16, 185, 129, 0.06)' : 'var(--surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      {p.isPopular && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -10,
                            right: 12,
                            background: '#f59e0b',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          وفر 40% 🔥
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 13.5, color: active ? '#059669' : 'var(--text)' }}>
                          {p.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 18, fontWeight: 900, color: '#059669' }}>
                          ${p.price}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                        {p.periodText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الحقول الأساسية */}
            <div className="field">
              <label className="label">الاسم الكامل (كما في الشهادة أو البطاقة)</label>
              <div style={{ position: 'relative' }}>
                <UserRound
                  size={17}
                  style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }}
                />
                <input
                  className="input"
                  style={{ paddingInlineStart: 42 }}
                  placeholder="د. أحمد محمد أو م. علي خالد..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">البريد الإلكتروني (لتفعيل الحساب واستلام الإشعارات)</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field">
                <label className="label">رقم الهاتف / الواتساب</label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={17}
                    style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }}
                  />
                  <input
                    className="input"
                    style={{ paddingInlineStart: 42 }}
                    dir="ltr"
                    placeholder="772XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">التخصص الأساسي</label>
                <select
                  className="input"
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  <option value="gms">الطب البشري والجراحة العامة</option>
                  <option value="dentistry">طب وجراحة الفم والأسنان</option>
                  <option value="pharmacy">الصيدلة السريرية</option>
                  <option value="nursing">التمريض والرعاية الحرجة</option>
                  <option value="lab">المختبرات الطبية</option>
                  <option value="eng_civil">الهندسة المدنية والإنشائية</option>
                  <option value="eng_arch">الهندسة المعمارية</option>
                  <option value="eng_it">هندسة البرمجيات وتقنية المعلومات</option>
                  <option value="law_bar">نقابة المحامين وتراخيص القضاء</option>
                  <option value="cpa">المحاسبة والمالية (CPA / SOCPA)</option>
                  <option value="edu_general">الرخصة المهنية التعليمية</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label">كلمة المرور (6 أحرف أو أرقام على الأقل)</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }}
                />
                <input
                  className="input"
                  style={{ paddingInlineStart: 42 }}
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block mt-2"
              disabled={busy}
              style={{
                fontWeight: 900,
                fontSize: 15.5,
                boxShadow: 'var(--shadow-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {busy ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
              <span>{busy ? 'جاري التحقق...' : 'متابعة وتأكيد البريد بالرمز الأمني (OTP)'}</span>
            </button>
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            الخطوة ٢: التحقق من البريد الإلكتروني عبر OTP
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="stack fade-up" style={{ gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>
                أدخل رمز التحقق الأمني السري (OTP) المكون من 6 أرقام المرسل إلى:
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
                  setStep(1);
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
                تعديل البيانات أو البريد
              </button>
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

            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              onClick={() => handleVerifyOtpAndCreateAccount()}
              disabled={busy || otpDigits.join('').length !== 6}
              style={{ fontWeight: 900, fontSize: 15.5 }}
            >
              {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
              <span>{busy ? 'جاري تأكيد الرمز...' : 'تأكيد البريد والانتقال للسداد'}</span>
            </button>

            {/* إعادة الإرسال */}
            <div className="text-center" style={{ fontSize: 13 }}>
              {countdown > 0 ? (
                <span className="text-muted">
                  يمكنك إعادة إرسال الرمز بعد ({countdown} ثانية)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartVerification()}
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

        {/* ═══════════════════════════════════════════════════════════════════
            الخطوة ٣: تفاصيل التحويل المحلي (الكريمي أو جيب)
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="stack fade-up" style={{ gap: 16 }}>
            {/* ملخص الباقة المختارة */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 132, 199, 0.08) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 800, display: 'block' }}>
                  الباقة المختارة للتفعيل:
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>
                  {currentPlan.name}
                </span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 24, fontWeight: 900, color: '#059669' }}>
                  ${currentPlan.price}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
                  USD / {currentPlan.periodText}
                </span>
              </div>
            </div>

            {/* تنبيه اسم المستفيد المعتمد */}
            <div
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: 'var(--sector)', fontWeight: 800, display: 'block' }}>
                  اسم المستفيد المعتمد للحوالات:
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>
                  {YEMEN_PAYMENT_CONFIG.beneficiaryName}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(YEMEN_PAYMENT_CONFIG.beneficiaryName, 'beneficiary')}
                style={{ gap: 6, fontSize: 12 }}
              >
                {copiedKey === 'beneficiary' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copiedKey === 'beneficiary' ? 'تم نسخ الاسم' : 'نسخ الاسم'}
              </button>
            </div>

            {/* تبويب طرق الدفع (الكريمي / جيب) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedMethod('kuraimi')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'kuraimi' ? '#10b981' : 'var(--border)'}`,
                  background: selectedMethod === 'kuraimi' ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#10b981',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={19} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13.5, color: 'var(--text)' }}>بنك الكريمي</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>حسابات عدن وصنعاء</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('jeeb')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'jeeb' ? '#0284c7' : 'var(--border)'}`,
                  background: selectedMethod === 'jeeb' ? 'rgba(2, 132, 199, 0.08)' : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#0284c7',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Wallet size={19} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13.5, color: 'var(--text)' }}>محفظة جيب</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>تحويل فوري بالهاتف</div>
                </div>
              </button>
            </div>

            {/* تفاصيل حساب الكريمي */}
            {selectedMethod === 'kuraimi' && (
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  اختر حساب الكريمي المناسب لمنطقتك وعملتك:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 8 }}>
                  {YEMEN_PAYMENT_CONFIG.kuraimi.accounts.map((acc) => {
                    const isSelected = selectedAccount === acc.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setSelectedAccount(acc.id)}
                        style={{
                          border: `1.5px solid ${isSelected ? '#10b981' : 'var(--border)'}`,
                          borderRadius: 12,
                          padding: '10px 14px',
                          background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? '#10b981' : 'var(--text)' }}>
                            {acc.label}
                          </span>
                          <span className="badge badge-brand" style={{ fontSize: 10 }}>{acc.badge}</span>
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-numbers)',
                            fontSize: 16,
                            fontWeight: 900,
                            letterSpacing: '1px',
                            color: 'var(--text)',
                            marginTop: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{acc.accountNumber}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(acc.accountNumber, acc.id);
                            }}
                          >
                            {copiedKey === acc.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            {copiedKey === acc.id ? 'تم' : 'نسخ'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* تفاصيل محفظة جيب */}
            {selectedMethod === 'jeeb' && (
              <div
                style={{
                  border: '1.5px solid rgba(2, 132, 199, 0.3)',
                  borderRadius: 14,
                  padding: '16px',
                  background: 'rgba(2, 132, 199, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0369a1' }}>
                    رقم محفظة جيب المعتمد (تحويل مباشر):
                  </span>
                  <span className="badge badge-brand" style={{ background: '#0284c7', color: '#fff', fontSize: 11 }}>
                    فوري
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-numbers)',
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: '2px',
                      color: 'var(--text)',
                      direction: 'ltr',
                    }}
                  >
                    {YEMEN_PAYMENT_CONFIG.jeeb.walletNumber}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(YEMEN_PAYMENT_CONFIG.jeeb.walletNumber, 'jeeb_no')}
                    style={{ gap: 6 }}
                  >
                    {copiedKey === 'jeeb_no' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copiedKey === 'jeeb_no' ? 'تم نسخ الرقم' : 'نسخ رقم المحفظة'}
                  </button>
                </div>
              </div>
            )}

            {/* نموذج إشعار التحويل */}
            <form onSubmit={handleSubmitPayment} style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Info size={16} color="var(--sector)" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
                  بيانات إشعار التحويل (لتأكيد وتفعيل باقتك):
                </span>
              </div>

              <div
                style={{
                  background: 'var(--surface-3)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                💡 <strong>ملاحظة ميسّرة:</strong> يمكنك كتابة رقم العملية أو اسم الشخص الذي تم التحويل منه (أو كلاهما). سنتأكد من وصول الحوالة ومطابقتها فوراً.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                    رقم العملية (إن توفر في السند)
                  </label>
                  <input
                    className="input"
                    dir="ltr"
                    placeholder="مثال: 84920158"
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                    اسم المحول منه (كما في السند أو التطبيق)
                  </label>
                  <input
                    className="input"
                    placeholder="اسمك أو صاحب الحساب المحول منه..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  className="input"
                  placeholder="أي ملاحظة تود كتابتها..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-emerald btn-lg btn-block"
                disabled={busy}
                style={{
                  fontWeight: 900,
                  fontSize: 15.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px',
                }}
              >
                {busy ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                <span>إرسال إشعار الدفع لتأكيد وتفعيل الحساب</span>
              </button>
            </form>

            {/* زر واتساب السريع */}
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={16} color="#25D366" />
                <span>أو تواصل معنا عبر واتساب لإرسال صورة سند الحوالة مباشرة</span>
              </a>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            الخطوة ٤: شاشة الانتظار الراقية والتطمين الكامل
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }} className="fade-up">
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.35)',
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                fontSize: 12.5,
                fontWeight: 900,
                marginBottom: 12,
              }}
            >
              <Clock size={14} /> قيد المطابقة والتفعيل الفوري
            </span>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>
              تم استلام بيانات تحويلك بنجاح!
            </h3>

            <p
              style={{
                fontSize: 14.5,
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                maxWidth: 480,
                margin: '0 auto 18px',
                fontWeight: 600,
              }}
            >
              يرجى الانتظار إلى أن يتم تأكيد دفعك، <strong>لن نتأخر في ذلك بإذن الله</strong>. سيقوم المشرف بمطابقة الحوالة عبر كشف الحساب وتفعيل كامل خدمات ومميزات المنصة لحسابك فوراً.
            </p>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 12,
                padding: '12px 16px',
                maxWidth: 460,
                margin: '0 auto 18px',
                fontSize: 13,
                color: '#065f46',
                fontWeight: 700,
              }}
            >
              ✉️ تم إرسال إشعار تأكيد فوري إلى بريدك الإلكتروني ({email})، وستصلك رسالة التفعيل الرسمي فور المطابقة.
            </div>

            <div
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 18px',
                maxWidth: 460,
                margin: '0 auto 22px',
                textAlign: 'right',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>الباقة:</span>
                <span style={{ fontWeight: 800 }}>{currentPlan.name} (${currentPlan.price})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>طريقة الدفع:</span>
                <span style={{ fontWeight: 800 }}>
                  {paymentResult?.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>حالة الطلب:</span>
                <span className="badge badge-brand" style={{ background: '#f59e0b', color: '#fff' }}>
                  بانتظار موافقة الإدارة
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-emerald"
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  fontSize: 14.5,
                }}
              >
                <MessageCircle size={18} />
                تأكيد فوري عبر واتساب المشرف
              </a>

              <Link
                href="/dashboard"
                className="btn btn-ghost"
                style={{ padding: '10px', fontSize: 13.5 }}
              >
                الدخول إلى لوحة التحكم
              </Link>
            </div>
          </div>
        )}

        {/* Footer Link to Login */}
        {step === 1 && (
          <div
            className="row"
            style={{
              justifyContent: 'center',
              gap: 6,
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              fontSize: 13.5,
            }}
          >
            <span className="text-muted">لديك حساب بالفعل؟</span>
            <Link href="/login" style={{ color: 'var(--sector)', fontWeight: 800 }}>
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container page text-center py-5"><Loader2 size={32} className="spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
