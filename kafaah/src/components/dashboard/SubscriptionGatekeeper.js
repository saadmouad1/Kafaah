'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Lock, Clock, CheckCircle2, AlertCircle,
  Copy, Check, Send, Loader2, RefreshCw, MessageCircle,
  Building2, Wallet, LogOut, ArrowRight, Info, Sparkles
} from 'lucide-react';
import { YEMEN_PAYMENT_CONFIG } from '../../lib/yemenPayConfig';

export default function SubscriptionGatekeeper({
  profile = {},
  subStatus = 'none', // 'pending' | 'none' | 'expired'
  onRefresh,
  logout,
}) {
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState('');

  // Payment form states (in case status === 'none')
  const [selectedPlanId, setSelectedPlanId] = useState('quarterly');
  const [selectedMethod, setSelectedMethod] = useState('kuraimi');
  const [selectedAccount, setSelectedAccount] = useState('aden_usd');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [senderName, setSenderName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [notes, setNotes] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const plans = [
    {
      id: 'quarterly',
      name: 'باقة الـ 3 أشهر (المكثفة للامتحان)',
      price: 12,
      originalPrice: 20,
      badge: 'الأكثر طلباً للامتحان · وفر 40% 🔥',
      periodText: '90 يوماً متواصلة حتى موعد الامتحان',
    },
    {
      id: 'monthly',
      name: 'الباقة الشهرية المرنة',
      price: 5,
      originalPrice: 10,
      badge: 'تجديد شهري',
      periodText: '30 يوماً لكافة بنوك التخصص',
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const copyToClipboard = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  async function handleCheckStatus() {
    setChecking(true);
    setCheckMsg('');
    setErrorMsg('');
    try {
      if (onRefresh) {
        const res = await onRefresh();
        if (res?.isSubscribed) {
          setCheckMsg('تهانينا! تم تفعيل اشتراكك بنجاح ✓ جاري فتح لوحة التحكم...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
      }
      setCheckMsg('طلبك لا يزال قيد المطابقة مع كشف الحساب. شكراً لصبرك 🙏');
    } catch {
      setCheckMsg('تعذّر فحص الحالة حالياً، يرجى المحاولة بعد قليل.');
    } finally {
      setChecking(false);
    }
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    const cleanTx = transactionNumber.trim();
    const cleanSender = senderName.trim();
    const cleanEmail = (profile.email || '').trim().toLowerCase();

    if (!cleanTx && !cleanSender) {
      setErrorMsg('يرجى إدخال رقم العملية أو اسم الشخص المحول منه لتأكيد الحوالة');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          clientName: cleanSender || profile.name || 'مشترك كفاءة',
          phone: phone.trim() || profile.phone || '',
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

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال البيانات');
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappUrl = `https://wa.me/967772686817?text=${encodeURIComponent(
    `السلام عليكم، أود المساعدة أو تأكيد حوالة اشتراكي في منصة كفاءة.\nالاسم: ${profile.name || senderName}\nالبريد: ${profile.email}\nالباقة: ${currentPlan.name} ($${currentPlan.price})`
  )}`;

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="card glass-card-pro fade-up"
        style={{
          width: '100%',
          maxWidth: 620,
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 36px)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid var(--border)',
          background: 'var(--surface, #ffffff)',
          textAlign: 'center',
        }}
      >
        {/* حالة ١: طلب التحويل قيد المراجعة الفورية */}
        {subStatus === 'pending' ? (
          <div>
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 12px 30px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Clock size={44} />
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 16px',
                borderRadius: 999,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#b45309',
                fontSize: 13,
                fontWeight: 900,
                marginBottom: 12,
              }}
            >
              <Clock size={15} /> قيد المراجعة والمطابقة الفورية
            </span>

            <h2
              style={{
                fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
                fontWeight: 900,
                color: 'var(--text)',
                marginBottom: 10,
              }}
            >
              حسابك قيد المراجعة ومطابقة الحوالة
            </h2>

            <p
              style={{
                fontSize: 14.5,
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                maxWidth: 480,
                margin: '0 auto 20px',
                fontWeight: 600,
              }}
            >
              مرحباً بك يا <strong>{profile.name || 'زميلنا الممارس'}</strong>. لقد تم استلام إشعار سدادك بنجاح، وطلبك الآن بانتظار مطابقة الحوالة من قبل المشرف وتفعيل الحساب. لضمان الأمان والعدالة، <strong>تبقى بنوك الأسئلة والمحاكيات مقفلة حتى يتم اعتماد السداد</strong> عبر كشف الحساب.
            </p>

            {checkMsg && (
              <div
                className="card badge-brand mb-3"
                style={{
                  padding: '10px 16px',
                  fontWeight: 800,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Info size={16} />
                <span>{checkMsg}</span>
              </div>
            )}

            {/* تفاصيل الحوالة المسجلة */}
            <div
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '16px 20px',
                maxWidth: 480,
                margin: '0 auto 24px',
                textAlign: 'right',
                fontSize: 13.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>المشترك:</span>
                <span style={{ fontWeight: 800 }}>{profile.name} ({profile.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>الباقة المطلوبة:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>
                  {profile.pendingPayment?.packageName || 'باقة كفاءة الشاملة'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>طريقة التحويل:</span>
                <span style={{ fontWeight: 800 }}>
                  {profile.pendingPayment?.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>بيانات الإشعار:</span>
                <span style={{ fontWeight: 800 }}>
                  {profile.pendingPayment?.transactionNumber || profile.pendingPayment?.senderName || 'بانتظار المطابقة'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>حالة الوصول:</span>
                <span className="badge badge-brand" style={{ background: '#f59e0b', color: '#fff', fontSize: 11 }}>
                  مغلق مؤقتاً لحين الاعتماد 🔒
                </span>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, margin: '0 auto' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleCheckStatus}
                disabled={checking}
                style={{
                  fontWeight: 900,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px',
                  borderRadius: 14,
                }}
              >
                {checking ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
                <span>{checking ? 'جاري الفحص...' : 'فحص وتحديث حالة التفعيل الآن 🔄'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-emerald"
                style={{
                  fontWeight: 900,
                  fontSize: 14.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 14,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} />
                <span>تواصل مع المشرف عبر واتساب للتسريع</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (logout) logout();
                  window.location.href = '/';
                }}
                className="btn btn-ghost"
                style={{ color: 'var(--danger)', fontSize: 13 }}
              >
                <LogOut size={15} /> تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          /* حالة ٢: الحساب غير مشترك أو منتهي الصلاحية */
          <div style={{ textAlign: 'right' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#fbbf24',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 14px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Lock size={38} />
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                  fontWeight: 900,
                  color: 'var(--text)',
                  marginBottom: 8,
                }}
              >
                الاشتراك مطلوب للوصول إلى لوحة التحكم
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  maxWidth: 480,
                  margin: '0 auto',
                  fontWeight: 600,
                }}
              >
                مرحباً بك يا <strong>{profile.name}</strong>. منصة كفاءة منصة تدريبية مدفوعة ومخصصة للجادين فقط. للوصول إلى بنوك الأسئلة والمحاكيات والمساعد الذكي، يرجى سداد الاشتراك المحلي عبر الكريمي أو جيب:
              </p>
            </div>

            {errorMsg && (
              <div
                className="card badge-danger mb-3"
                style={{ fontWeight: 800, fontSize: 13, padding: '10px 14px' }}
              >
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            {/* بطاقات الباقات */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                اختر الباقة المناسبة لك:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
                {plans.map((p) => {
                  const active = p.id === selectedPlanId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: `2px solid ${active ? '#10b981' : 'var(--border)'}`,
                        background: active ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'right',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, fontSize: 13.5, color: active ? '#059669' : 'var(--text)' }}>
                          {p.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 18, fontWeight: 900, color: '#059669' }}>
                          ${p.price}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {p.periodText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* اسم المستفيد */}
            <div
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: 11.5, color: 'var(--sector)', fontWeight: 800, display: 'block' }}>
                  اسم المستفيد المعتمد للحوالات:
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>
                  {YEMEN_PAYMENT_CONFIG.beneficiaryName}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(YEMEN_PAYMENT_CONFIG.beneficiaryName, 'beneficiary')}
              >
                {copiedKey === 'beneficiary' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                {copiedKey === 'beneficiary' ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>

            {/* طرق الدفع */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedMethod('kuraimi')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `2px solid ${selectedMethod === 'kuraimi' ? '#10b981' : 'var(--border)'}`,
                  background: selectedMethod === 'kuraimi' ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'right',
                }}
              >
                <Building2 size={18} color="#10b981" />
                <span style={{ fontWeight: 800, fontSize: 13 }}>بنك الكريمي</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('jeeb')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `2px solid ${selectedMethod === 'jeeb' ? '#0284c7' : 'var(--border)'}`,
                  background: selectedMethod === 'jeeb' ? 'rgba(2, 132, 199, 0.08)' : 'var(--surface-3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'right',
                }}
              >
                <Wallet size={18} color="#0284c7" />
                <span style={{ fontWeight: 800, fontSize: 13 }}>محفظة جيب</span>
              </button>
            </div>

            {/* تفاصيل حساب الكريمي */}
            {selectedMethod === 'kuraimi' && (
              <div style={{ marginBottom: 16 }}>
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
                          padding: '8px 12px',
                          background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800 }}>
                          <span>{acc.label}</span>
                          <span className="badge badge-brand" style={{ fontSize: 9 }}>{acc.badge}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 15, fontWeight: 900 }}>
                            {acc.accountNumber}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '2px 6px', fontSize: 10 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(acc.accountNumber, acc.id);
                            }}
                          >
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
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: 'rgba(2, 132, 199, 0.04)',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', display: 'block' }}>
                    رقم محفظة جيب المعتمد:
                  </span>
                  <span style={{ fontFamily: 'var(--font-numbers)', fontSize: 18, fontWeight: 900 }}>
                    {YEMEN_PAYMENT_CONFIG.jeeb.walletNumber}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyToClipboard(YEMEN_PAYMENT_CONFIG.jeeb.walletNumber, 'jeeb_no')}
                >
                  {copiedKey === 'jeeb_no' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  {copiedKey === 'jeeb_no' ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
            )}

            {/* نموذج السداد */}
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    رقم العملية (إن توفر بالسند)
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
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    اسم المحول منه (كما في السند)
                  </label>
                  <input
                    className="input"
                    placeholder="اسم المحول..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-emerald btn-lg btn-block"
                disabled={submitting}
                style={{
                  fontWeight: 900,
                  fontSize: 15,
                  padding: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 14,
                }}
              >
                {submitting ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                <span>إرسال إشعار السداد لتفعيل الحساب</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
