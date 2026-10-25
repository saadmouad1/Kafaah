'use client';
import { useState, useEffect } from 'react';
import {
  CreditCard, Building2, Wallet, Save, RefreshCw, Check,
  Mail, Send, Loader2, AlertCircle, CheckCircle2, Copy
} from 'lucide-react';

export default function PaymentConfigManager({ onDone, onErr }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMail, setTestingMail] = useState(false);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [mailMsg, setMailMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Form states
  const [beneficiaryName, setBeneficiaryName] = useState('أحمد محمد حمود عبدالله');
  const [whatsappSupport, setWhatsappSupport] = useState('+967772686817');
  const [jeebWallet, setJeebWallet] = useState('772686817');
  const [accounts, setAccounts] = useState([
    { id: 'aden_usd', label: 'دولار أمريكي — حساب عدن', accountNumber: '3194548938', currency: 'USD', badge: 'USD عدن' },
    { id: 'aden_yer', label: 'ريال يمني قعيطي — حساب عدن', accountNumber: '3166374749', currency: 'YER', badge: 'قعيطي عدن' },
    { id: 'sanaa_usd', label: 'دولار أمريكي — حساب صنعاء', accountNumber: '3019159522', currency: 'USD', badge: 'USD صنعاء' },
    { id: 'sanaa_yer', label: 'ريال يمني قديم — حساب صنعاء', accountNumber: '3013426057', currency: 'YER', badge: 'قديم صنعاء' },
  ]);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payment-config');
      const data = await res.json();
      if (data.config) {
        setBeneficiaryName(data.config.beneficiaryName || 'أحمد محمد حمود عبدالله');
        setWhatsappSupport(data.config.whatsappSupport || '+967772686817');
        setJeebWallet(data.config.jeeb?.walletNumber || '772686817');
        if (Array.isArray(data.config.kuraimi?.accounts)) {
          setAccounts(data.config.kuraimi.accounts);
        }
      }
    } catch {
      if (onErr) onErr('تعذّر تحميل إعدادات الحسابات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  function updateAccountNo(idx, newNo) {
    const next = [...accounts];
    next[idx] = { ...next[idx], accountNumber: newNo.trim() };
    setAccounts(next);
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryName,
          whatsappSupport,
          jeebWallet,
          kuraimiAccounts: accounts,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'فشل حفظ الإعدادات');
      if (onDone) onDone('تم حفظ وتحديث بيانات حسابات الدفع بنجاح ✓');
    } catch (err) {
      if (onErr) onErr(err.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestEmail(e) {
    if (e) e.preventDefault();
    if (!testEmailAddr.trim()) return;
    setTestingMail(true);
    setMailMsg('');
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_email',
          email: testEmailAddr.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'فشل إرسال البريد');
      setMailMsg(data.message || 'تم إرسال بريد الاختبار بنجاح!');
    } catch (err) {
      setMailMsg('خطأ: ' + (err.message || 'تعذّر الإرسال'));
    } finally {
      setTestingMail(false);
    }
  }

  if (loading) {
    return <div className="skeleton" style={{ height: 350, borderRadius: 20 }} />;
  }

  return (
    <div className="stack fade-up" style={{ gap: 20 }}>
      {/* Test Email Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(3, 105, 161, 0.04) 100%)',
          border: '1.5px solid rgba(2, 132, 199, 0.3)',
          borderRadius: 20,
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: '#0284c7', color: '#fff' }}>
            <Mail size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>فحص واختبار قوالب البريد والشعار المعتمد</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
              أرسل بريداً تجريبياً فورياً إلى بريدك للتأكد من وصول رمز الـ OTP والشعار الرسمي 512px والتصميم الفاخر
            </p>
          </div>
        </div>

        <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            type="email"
            dir="ltr"
            placeholder="أدخل بريدك الإلكتروني للفحص..."
            value={testEmailAddr}
            onChange={(e) => setTestEmailAddr(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={testingMail || !testEmailAddr.trim()}
            style={{ fontWeight: 800, gap: 8, borderRadius: 12 }}
          >
            {testingMail ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            {testingMail ? 'جاري الإرسال...' : 'إرسال بريد فحص تجريبي 🚀'}
          </button>
        </form>

        {mailMsg && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              background: mailMsg.startsWith('خطأ') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: mailMsg.startsWith('خطأ') ? '#dc2626' : '#059669',
            }}
          >
            {mailMsg}
          </div>
        )}
      </div>

      {/* Payment Configuration Form */}
      <form onSubmit={handleSave} className="card" style={{ borderRadius: 20, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>إعدادات الحسابات البنكية ومحفظة جيب الرسمية</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
              تظهر هذه البيانات مباشرة للمشتركين عند تحويل الرسوم في شاشة السداد وبوابة الانتظار
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-emerald"
            disabled={saving}
            style={{ fontWeight: 900, fontSize: 14, gap: 8, padding: '10px 22px', borderRadius: 12 }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات في النظام 💾'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: 'block', marginBottom: 6 }}>
              اسم المستفيد المعتمد للحوالات:
            </label>
            <input
              className="input"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              placeholder="مثال: أحمد محمد حمود عبدالله"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: 'block', marginBottom: 6 }}>
              رقم واتساب المعتمد للمطابقة والدعم:
            </label>
            <input
              className="input"
              dir="ltr"
              value={whatsappSupport}
              onChange={(e) => setWhatsappSupport(e.target.value)}
              placeholder="مثال: +967772686817"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 800, display: 'block', marginBottom: 6 }}>
              رقم محفظة جيب الإلكترونية (Jeeb):
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                dir="ltr"
                value={jeebWallet}
                onChange={(e) => setJeebWallet(e.target.value)}
                placeholder="مثال: 772686817"
                required
              />
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

        <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={18} color="#10b981" />
          حسابات بنك الكريمي المعتمدة (صنعاء وعدن):
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {accounts.map((acc, idx) => (
            <div
              key={acc.id}
              style={{
                border: '1.5px solid var(--border)',
                borderRadius: 14,
                padding: '14px',
                background: 'var(--surface-3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>{acc.label}</span>
                <span className="badge badge-brand" style={{ fontSize: 10 }}>{acc.badge}</span>
              </div>
              <label style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                رقم الحساب ({acc.currency}):
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input"
                  dir="ltr"
                  value={acc.accountNumber}
                  onChange={(e) => updateAccountNo(idx, e.target.value)}
                  style={{ fontWeight: 900, fontFamily: 'var(--font-numbers)' }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyToClipboard(acc.accountNumber, acc.id)}
                >
                  {copiedKey === acc.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
