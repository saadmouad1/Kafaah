'use client';
import { useEffect, useState } from 'react';
import { Save, Trash2, Loader2, CreditCard, PlusCircle } from 'lucide-react';
import { Field, Modal } from './ContentManager';

// ─── إدارة الاشتراكات ─────────────────────────────────────────────────────────
export default function SubscriptionsManager({ onDone, onErr }) {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/subscriptions');
      const d = await r.json();
      if (d.error) { onErr(d.error); return; }
      setSubs(d.subscriptions || []);
      setStats(d.stats || null);
      setPackages(d.packages || []);
    } catch { onErr('تعذّر تحميل الاشتراكات'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function call(body) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.error) { onErr(d.error); return false; }
      await load();
      return true;
    } catch { onErr('فشل الطلب'); return false; }
    finally { setBusy(false); }
  }

  async function assign() {
    if (!creating.email?.trim()) return onErr('بريد العميل مطلوب');
    if (!creating.packageId) return onErr('اختر الباقة');
    if (await call({ action: 'assign', email: creating.email, clientName: creating.clientName, packageId: creating.packageId })) { setCreating(null); onDone('سُجّل الاشتراك'); }
  }
  async function setStatus(s, status) {
    await call({ action: 'update', id: s.id, patch: { status } });
  }
  async function remove(s) {
    if (!confirm(`حذف اشتراك «${s.email}»؟`)) return;
    if (await call({ action: 'delete', id: s.id })) onDone('حُذف الاشتراك');
  }

  if (loading) return <div className="skeleton" style={{ height: 240 }} />;

  const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('ar-EG') : '—');

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="grid grid-4">
        <div className="stat-card"><div className="stat-num">{(stats?.total || 0).toLocaleString('ar-EG')}</div><div className="stat-label">إجمالي الاشتراكات</div></div>
        <div className="stat-card"><div className="stat-num text-success">{(stats?.active || 0).toLocaleString('ar-EG')}</div><div className="stat-label">نشطة</div></div>
        <div className="stat-card"><div className="stat-num">{(stats?.canceled || 0).toLocaleString('ar-EG')}</div><div className="stat-label">ملغاة</div></div>
        <div className="stat-card"><div className="stat-num">${stats?.mrr ?? 0}</div><div className="stat-label">الإيراد الشهري المتكرر</div></div>
      </div>

      <div className="row-between wrap">
        <h3 style={{ fontSize: 16 }} className="row"><CreditCard size={17} style={{ color: 'var(--sector)' }} /> الاشتراكات</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating({ email: '', clientName: '', packageId: packages[0]?.id || '' })} disabled={!packages.length}>
          <PlusCircle size={14} /> تسجيل اشتراك
        </button>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {subs.map((s) => {
          const statusBadge = s.status === 'active' ? 'badge-success' : s.status === 'canceled' ? 'badge-danger' : 'badge-muted';
          return (
            <div key={s.id} className="card" style={{ padding: 12 }}>
              <div className="row-between wrap" style={{ gap: 10 }}>
                <div style={{ minWidth: 200 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800 }}>{s.clientName || s.email}</span>
                    <span className={`badge ${statusBadge}`}>{s.status === 'active' ? 'نشط' : s.status === 'canceled' ? 'ملغى' : s.status}</span>
                    <span className="badge badge-brand">{s.packageName || s.packageId}</span>
                    {s.price != null && <span className="badge badge-muted">{s.price} {s.currency}</span>}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{s.email} · ينتهي: {fmt(s.expiresAt)}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {s.status !== 'active' && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(s, 'active')}>تفعيل</button>}
                  {s.status === 'active' && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(s, 'canceled')}>إلغاء</button>}
                  <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => remove(s)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {subs.length === 0 && <div className="card text-center text-muted" style={{ padding: 30 }}>لا توجد اشتراكات بعد.</div>}
      </div>

      {creating && (
        <Modal title="تسجيل اشتراك" onClose={() => setCreating(null)}>
          <Field label="بريد العميل"><input className="input" dir="ltr" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} /></Field>
          <Field label="اسم العميل (اختياري)"><input className="input" value={creating.clientName} onChange={(e) => setCreating({ ...creating, clientName: e.target.value })} /></Field>
          <Field label="الباقة">
            <select className="select" value={creating.packageId} onChange={(e) => setCreating({ ...creating, packageId: e.target.value })}>
              {packages.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price} {p.currency}/{p.interval}</option>)}
            </select>
          </Field>
          <button className="btn btn-primary" onClick={assign} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} تسجيل</button>
        </Modal>
      )}
    </div>
  );
}
