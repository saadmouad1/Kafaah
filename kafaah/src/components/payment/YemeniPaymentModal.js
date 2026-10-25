'use client';
import { useState } from 'react';
import {
  X, Check, Copy, ShieldCheck, Sparkles, AlertCircle, Clock,
  ArrowRight, CheckCircle2, MessageCircle, CreditCard, Building2,
  Wallet, Send, Loader2, ChevronDown, Info
} from 'lucide-react';
import { YEMEN_PAYMENT_CONFIG } from '../../lib/yemenPayConfig';

export default function YemeniPaymentModal({
  isOpen,
  onClose,
  packageInfo = { id: 'monthly', name: 'باقة كفاءة الشاملة', price: 5, currency: 'USD' },
  userProfile = {},
  onSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState('kuraimi'); // 'kuraimi' | 'jeeb'
  const [selectedAccount, setSelectedAccount] = useState('aden_usd');
  const [copiedKey, setCopiedKey] = useState(null);

  // Form Fields
  const [transactionNumber, setTransactionNumber] = useState('');
  const [senderName, setSenderName] = useState(userProfile.name || '');
  const [clientEmail, setClientEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  if (!isOpen) return null;

  const [selectedPlanId, setSelectedPlanId] = useState(packageInfo?.id || 'quarterly');

  const plans = [
    {
      id: 'quarterly',
      name: 'باقة الـ 3 أشهر (المكثفة للامتحان)',
      price: 12,
      originalPrice: 20,
      badge: 'الأكثر اختياراً للامتحان · وفر 40% 🔥',
      periodText: '90 يوماً كاملة حتى موعد الامتحان',
    },
    {
      id: 'monthly',
      name: 'الباقة الشهرية المرنة',
      price: 5,
      originalPrice: 10,
      badge: 'تجديد شهري',
      periodText: '30 يوماً كاملة لجميع البنوك',
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTx = transactionNumber.trim();
    const cleanSender = senderName.trim();
    const cleanEmail = (clientEmail || userProfile.email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('يرجى إدخال بريدك الإلكتروني لاستلام إشعار التأكيد وإيصال تفعيل الحساب');
      return;
    }

    if (!cleanTx && !cleanSender) {
      setErrorMsg('يرجى إدخال رقم العملية أو اسم الشخص المحول منه لتأكيد الحوالة');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          clientName: cleanSender || userProfile.name || 'عميل كفاءة',
          phone: phone.trim(),
          packageId: currentPlan.id,
          packageName: currentPlan.name,
          amount: currentPlan.price,
          method: selectedMethod,
          accountType: selectedMethod === 'kuraimi' ? selectedAccount : 'jeeb',
          transactionNumber: cleanTx,
          senderName: cleanSender,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'تعذّر إرسال إشعار الدفع');
      }

      setPaymentResult(data.payment);
      setSubmitted(true);
      if (onSuccess) onSuccess(data.payment);
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال البيانات');
    } finally {
      setLoading(false);
    }
  };

  // رابط واتساب مباشر مع رسالة جاهزة
  const whatsappUrl = `https://wa.me/967772686817?text=${encodeURIComponent(
    `السلام عليكم، أود المساعدة أو إرسال سند التحويل للاشتراك في منصة كفاءة.\nالاسم: ${senderName || userProfile.name || 'عميل كفاءة'}\nالإيميل: ${clientEmail || userProfile.email || 'غير مسجل'}\nالباقة: ${currentPlan.name} ($${currentPlan.price})\nطريقة الدفع: ${
      selectedMethod === 'kuraimi' ? 'الكريمي' : 'محفظة جيب'
    }\nرقم العملية / اسم المحول: ${transactionNumber || senderName || 'سأرفق صورة السند هنا'}`
  )}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        className="card fade-up"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 32px)',
          background: 'var(--surface, #ffffff)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            insetInlineEnd: 20,
            background: 'var(--card-subtle, #f1f5f9)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20, paddingInline: 24 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CreditCard size={26} />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
                  fontWeight: 900,
                  color: 'var(--text)',
                  marginBottom: 6,
                }}
              >
                الاشتراك وتفعيل الحساب — الدفع المحلي
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13.5,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                اختر الحساب البنكي أو المحفظة المناسبة وحوّل المبلغ، ثم أرسل إشعار الدفع لتفعيل حسابك فوراً.
              </p>
            </div>

            {/* اختيار باقة الاشتراك (3 أشهر المخفضة vs الشهرية) */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                اختر مدة ونوع الاشتراك:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {plans.map((p) => {
                  const active = p.id === selectedPlanId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: `2px solid ${active ? 'var(--sector)' : 'var(--border)'}`,
                        background: active ? 'color-mix(in srgb, var(--sector) 10%, var(--surface))' : 'var(--surface)',
                        textAlign: 'right',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 900, fontSize: 14, color: active ? 'var(--sector)' : 'var(--text)' }}>
                          {p.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 18, fontWeight: 900, color: 'var(--sector)' }}>
                          ${p.price}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.periodText}</span>
                        <span className="badge badge-gold" style={{ fontSize: 10, padding: '2px 6px' }}>{p.badge}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* شريط الدعم الفني السريع عبر واتساب */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                marginBottom: 16,
                fontSize: 12.5,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#065f46', fontWeight: 800 }}>
                <MessageCircle size={18} color="#25D366" />
                <span>تحتاج مساعدة أو تود إرسال صورة سند الحوالة مباشرة للمشرف؟</span>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontWeight: 900,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                }}
              >
                تواصل واتساب فوراً 💬
              </a>
            </div>

            {/* تنبيه اسم المستفيد المعتمد */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: '#0369a1', fontWeight: 800, display: 'block' }}>
                  اسم المستفيد المعتمد للحوالات:
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 18,
              }}
            >
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
                  transition: 'all 0.2s',
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
                  <div style={{ fontWeight: 900, fontSize: 13.5, color: 'var(--text)' }}>
                    بنك الكريمي
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>4 حسابات (عدن وصنعاء)</div>
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
                  transition: 'all 0.2s',
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
                  <div style={{ fontWeight: 900, fontSize: 13.5, color: 'var(--text)' }}>
                    محفظة جيب
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>تحويل فوري برقم الهاتف</div>
                </div>
              </button>
            </div>

            {/* تفاصيل حساب الكريمي */}
            {selectedMethod === 'kuraimi' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  اختر حساب الكريمي المناسب لمنطقتك وعملتك:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
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
                          position: 'relative',
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
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0369a1' }}>
                    رقم المحفظة (رقم الهاتف المباشر):
                  </span>
                  <span className="badge badge-brand" style={{ background: '#0284c7', color: '#fff', fontSize: 11 }}>
                    دفع فوري
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-numbers)',
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: '2px',
                      color: '#0f172a',
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
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginInlineEnd: 0 }}>
                  افتح تطبيق «جيب» واختر تحويل إلى مستفيد، ثم أدخل رقم الهاتف أعلاه مع التأكد من اسم المستفيد (أحمد محمد حمود عبدالله).
                </p>
              </div>
            )}

            {/* نموذج تأكيد العملية */}
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Info size={16} color="var(--sector)" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
                  بيانات إشعار التحويل (لتأكيد دفعتك):
                </span>
              </div>

              <div
                style={{
                  background: 'color-mix(in srgb, var(--surface) 90%, var(--card-subtle))',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 14,
                  lineHeight: 1.6,
                }}
              >
                💡 <strong>ملاحظة ميسّرة:</strong> يمكنك كتابة رقم العملية أو اسم الشخص الذي تم التحويل منه (أو كلاهما). سنتأكد من وصول الحوالة ومطابقتها فوراً.
              </div>

              {errorMsg && (
                <div
                  className="card badge-danger mb-3"
                  style={{ fontWeight: 800, fontSize: 13, padding: '10px 14px' }}
                >
                  <AlertCircle size={15} /> {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                    رقم العملية (إن توفر)
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
                    placeholder="اسمك أو اسم صاحب الحساب..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                    البريد الإلكتروني (لاستلام إشعار التأكيد وإيصال التفعيل) *
                  </label>
                  <input
                    className="input"
                    dir="ltr"
                    type="email"
                    placeholder="you@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                    رقم الهاتف / الواتساب للتواصل
                  </label>
                  <input
                    className="input"
                    dir="ltr"
                    placeholder="77XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  className="input"
                  placeholder="أي ملاحظة أو توقيت التحويل..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-emerald btn-lg"
                disabled={loading}
                style={{
                  width: '100%',
                  fontWeight: 900,
                  fontSize: 15.5,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px',
                }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                إرسال إشعار الدفع لتأكيد وتفعيل الحساب
              </button>
            </form>
          </div>
        ) : (
          /* شاشة الانتظار الراقية والمؤكدة */
          <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 40px) 10px' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.35)',
              }}
            >
              <CheckCircle2 size={40} />
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
              <Clock size={14} /> قيد المراجعة الفورية
            </span>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.3rem, 4vw, 1.7rem)',
                fontWeight: 900,
                color: 'var(--text)',
                marginBottom: 12,
              }}
            >
              تم استلام بيانات تحويلك بنجاح!
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
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
                padding: '10px 16px',
                maxWidth: 440,
                margin: '0 auto 20px',
                fontSize: 13,
                color: '#065f46',
                fontWeight: 700,
              }}
            >
              ✉️ تم إرسال إشعار تأكيد فوري إلى بريدك الإلكتروني ({paymentResult?.email || clientEmail})، وسيصلك إيصال التفعيل الرسمي فور المطابقة.
            </div>

            <div
              style={{
                background: 'var(--card-subtle, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '14px 18px',
                maxWidth: 440,
                margin: '0 auto 24px',
                textAlign: 'right',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>طريقة الدفع:</span>
                <span style={{ fontWeight: 800 }}>
                  {paymentResult?.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>بيانات الإشعار:</span>
                <span style={{ fontWeight: 800 }}>
                  {paymentResult?.transactionNumber || paymentResult?.senderName}
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
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} />
                تأكيد فوري عبر واتساب الدعم
              </a>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                style={{ padding: '10px', fontSize: 13.5 }}
              >
                إغلاق والعودة إلى المنصة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
