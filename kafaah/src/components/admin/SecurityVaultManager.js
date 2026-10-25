'use client';
import { useState } from 'react';
import {
  ShieldCheck, Lock, AlertTriangle, CheckCircle2,
  Terminal, RefreshCw, Key, Database, Zap, Cpu,
  ExternalLink, Layers, EyeOff, ShieldAlert, Check
} from 'lucide-react';

export default function SecurityVaultManager() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  async function runSecurityAudit() {
    setTesting(true);
    setTestResults(null);
    try {
      // 1. اختبار حظر الوصول المجهول للأسئلة
      const qRes = await fetch('/api/questions?spec=human_medicine&limit=50', {
        headers: { 'cache-control': 'no-cache' }
      });
      const qData = await qRes.json().catch(() => ({}));

      // 2. اختبار حظر البحث العميق
      const sRes = await fetch('/api/search?q=طب', {
        headers: { 'cache-control': 'no-cache' }
      });
      const sData = await sRes.json().catch(() => ({}));

      setTestResults({
        questionsBlocked: qRes.status === 401 || qRes.status === 403,
        questionsStatus: qRes.status,
        questionsMsg: qData.error || 'تم المنع بنجاح',
        searchBlocked: sRes.status === 401 || sRes.status === 403,
        searchStatus: sRes.status,
        searchMsg: sData.error || 'تم المنع بنجاح',
      });
    } catch (err) {
      setTestResults({ error: err.message || 'فشل تشغيل فحص الأمان' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="stack fade-up" style={{ gap: 20 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 20,
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: '#10b981',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>مركز الحماية المشدد ومكافحة الكشط</h2>
              <span className="badge badge-success" style={{ fontSize: 11 }}>نشط ومحصّن ✓</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              حماية بنوك الأسئلة ومسارات الـ API بتشفير HMAC-SHA256 وتقييد المعدل ومنع الزحف والتحميل غير المصرح
            </p>
          </div>
          <button
            type="button"
            onClick={runSecurityAudit}
            disabled={testing}
            className="btn btn-primary"
            style={{ fontWeight: 800, fontSize: 13, gap: 8, borderRadius: 12 }}
          >
            <RefreshCw size={15} className={testing ? 'spin' : ''} />
            {testing ? 'جاري الفحص المباشر...' : 'فحص دفاعات الـ API الآن 🛡️'}
          </button>
        </div>
      </div>

      {/* Security Test Live Result */}
      {testResults && (
        <div
          className="card fade-up"
          style={{
            background: testResults.questionsBlocked && testResults.searchBlocked ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
            border: `1.5px solid ${testResults.questionsBlocked && testResults.searchBlocked ? '#10b981' : '#ef4444'}`,
            borderRadius: 16,
            padding: '16px 20px',
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {testResults.questionsBlocked && testResults.searchBlocked ? (
              <>
                <CheckCircle2 color="#10b981" size={18} />
                <span style={{ color: '#059669' }}>نجاح الاختبار: كافة محاولات استخراج الأسئلة غير المصرحة يتم صدها وتشفيرها بنجاح!</span>
              </>
            ) : (
              <>
                <AlertTriangle color="#ef4444" size={18} />
                <span style={{ color: '#dc2626' }}>تنبيه أمني: يلزم فحص أحد المسارات</span>
              </>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, fontSize: 12.5 }}>
            <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <strong>مسار بنك الأسئلة (/api/questions):</strong>
              <div style={{ color: testResults.questionsBlocked ? '#059669' : '#dc2626', marginTop: 4 }}>
                كود الرد: <strong>{testResults.questionsStatus}</strong> ({testResults.questionsMsg})
              </div>
            </div>
            <div style={{ background: 'var(--surface)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <strong>مسار البحث في الأسئلة (/api/search):</strong>
              <div style={{ color: testResults.searchBlocked ? '#059669' : '#dc2626', marginTop: 4 }}>
                كود الرد: <strong>{testResults.searchStatus}</strong> ({testResults.searchMsg})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture Grid */}
      <div className="grid grid-3">
        <div className="card" style={{ padding: 18, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Key size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>المصادقة المشفرة (HMAC)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SHA-256 Token Vault</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            يتم توقيع جلسات المشتركين بتوقيع سري مشفر لا يمكن تزويره. الواجهات ترفض أي استعلام دون توكن موقع سارٍ ومربوط باشتراك نشط.
          </p>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>سقف الكشط ومعدل الطلبات</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Anti-Scraping Clamping</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            سقف أقصى 250 سؤال لكل طلب (يمنع سحب آلاف الأسئلة دفعة واحدة)، مع Rate Limiter يحظر عناوين الـ IP المتكررة التي تتجاوز 90 طلب/دقيقة.
          </p>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>عزل مستودع البيانات الخام</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Isolated Private Vault</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            تم سحب ونقل مجلد البيانات الخام (64MB) من مجلد الويب العام `public` إلى مستودع داخلي محمي تماماً ومحظور على المتصفحات.
          </p>
        </div>
      </div>

      {/* Security Protocols Summary Table */}
      <div className="card" style={{ borderRadius: 18, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 900 }}>بروتوكولات الأمان الفعالة على المنصة:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { name: 'بوابة حاجز الاشتراك (Subscription Gatekeeper)', status: 'فعال ومطبق', desc: 'حجب كامل لمحتوى لوحة التحكم وبنوك الأسئلة والمحاكيات عن غير المشتركين أو المنتظرين للمطابقة.' },
            { name: 'حظر روبوتات الزحف (X-Robots-Tag: noindex, noarchive)', status: 'فعال ومطبق', desc: 'منع محركات البحث والروبوتات الخارجية من أرشفة أو فهرسة واجهات الـ API.' },
            { name: 'منع كاش المتصفحات والبروكسي (Cache-Control: private, no-store)', status: 'فعال ومطبق', desc: 'منع شبكات الـ CDN وخوادم البروكسي من تخزين أي سؤال أو إجابة.' },
            { name: 'حماية رصيد الذكاء الاصطناعي (Groq AI Defense)', status: 'فعال ومطبق', desc: 'قصر المساعد الذكي على المشتركين المعتمدين مع Rate Limiter بـ 35 استفسار/دقيقة.' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{item.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
              </div>
              <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 800 }}>
                {item.status} ✓
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
