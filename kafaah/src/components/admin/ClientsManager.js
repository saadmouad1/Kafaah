'use client';
import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Save, Trash2, Pencil, Loader2, Users, Mail, Search } from 'lucide-react';
import { Field, Modal } from './ContentManager';

// ─── إدارة العملاء ────────────────────────────────────────────────────────────
export default function ClientsManager({ onDone, onErr }) {
  const [clients, setClients] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/clients');
      const d = await r.json();
      if (d.error) { onErr(d.error); return; }
      setClients(d.clients || []);
      setSubs(d.subscriptions || []);
    } catch { onErr('تعذّر تحميل العملاء'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function call(body) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.error) { onErr(d.error); return false; }
      await load();
      return true;
    } catch { onErr('فشل الطلب'); return false; }
    finally { setBusy(false); }
  }

  const subByEmail = useMemo(() => Object.fromEntries(subs.map((s) => [s.email, s])), [subs]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => `${c.name} ${c.email} ${c.phone || ''}`.toLowerCase().includes(term));
  }, [clients, q]);

  async function save() {
    if (!edit.name?.trim()) return onErr('اسم العميل مطلوب');
    if (await call({ action: 'update', id: edit.id, patch: { name: edit.name, phone: edit.phone, plan: edit.plan } })) {
      setEdit(null); onDone('حُدّث العميل');
    }
  }
  async function create() {
    if (!creating.email?.trim()) return onErr('البريد الإلكتروني مطلوب');
    if (await call({ action: 'create', email: creating.email, name: creating.name, phone: creating.phone })) { setCreating(null); onDone('أُضيف العميل'); }
  }
  async function remove(c) {
    if (!confirm(`حذف العميل «${c.name}»؟`)) return;
    if (await call({ action: 'delete', id: c.id })) onDone('حُذف العميل');
  }

  if (loading) return <div className="skeleton" style={{ height: 240 }} />;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="grid grid-3">
        <div className="stat-card"><div className="stat-num">{clients.length.toLocaleString('ar-EG')}</div><div className="stat-label">إجمالي العملاء</div></div>
        <div className="stat-card"><div className="stat-num">{subs.filter((s) => s.status === 'active').length.toLocaleString('ar-EG')}</div><div className="stat-label">اشتراكات نشطة</div></div>
        <div className="stat-card"><div className="stat-num">{clients.filter((c) => !subByEmail[c.email]).length.toLocaleString('ar-EG')}</div><div className="stat-label">بدون اشتراك</div></div>
      </div>

      <div className="card">
        <div className="row wrap" style={{ gap: 8 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={17} style={{ position: 'absolute', insetInlineStart: 13, top: 14, color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingInlineStart: 40 }} placeholder="ابحث بالاسم أو البريد…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCreating({ email: '', name: '', phone: '' })}><PlusCircle size={14} /> عميل جديد</button>
          <button className="btn btn-ghost btn-sm" onClick={load}>تحديث</button>
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {filtered.map((c) => {
          const sub = subByEmail[c.email];
          return (
            <div key={c.id} className="card" style={{ padding: 12 }}>
              <div className="row-between wrap" style={{ gap: 10 }}>
                <div style={{ minWidth: 200 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800 }}>{c.name}</span>
                    {sub ? <span className="badge badge-success">{sub.packageName || sub.packageId}</span> : <span className="badge badge-muted">بدون اشتراك</span>}
                  </div>
                  <div className="text-muted row" style={{ fontSize: 12, gap: 4 }}><Mail size={11} /> {c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                  {c.lastSeenAt && <div className="text-dim" style={{ fontSize: 11 }}>آخر ظهور: {new Date(c.lastSeenAt).toLocaleDateString('ar-EG')}</div>}
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="icon-btn" onClick={() => setEdit({ ...c })}><Pencil size={15} /></button>
                  <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => remove(c)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="card text-center text-muted" style={{ padding: 30 }}>لا يوجد عملاء مطابقون.</div>}
      </div>

      {edit && (
        <Modal title="تعديل العميل" onClose={() => setEdit(null)}>
          <Field label="الاسم"><input className="input" value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="الجوال"><input className="input" value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
          <Field label="الباقة/الخطة"><input className="input" value={edit.plan || ''} onChange={(e) => setEdit({ ...edit, plan: e.target.value })} placeholder="trial / monthly …" /></Field>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ</button>
        </Modal>
      )}
      {creating && (
        <Modal title="عميل جديد" onClose={() => setCreating(null)}>
          <Field label="البريد الإلكتروني"><input className="input" dir="ltr" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} /></Field>
          <Field label="الاسم"><input className="input" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} /></Field>
          <Field label="الجوال"><input className="input" value={creating.phone} onChange={(e) => setCreating({ ...creating, phone: e.target.value })} /></Field>
          <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} إنشاء</button>
        </Modal>
      )}
    </div>
  );
}
