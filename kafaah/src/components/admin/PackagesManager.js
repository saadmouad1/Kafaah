'use client';
import { useEffect, useState } from 'react';
import { PlusCircle, Save, Trash2, Pencil, Loader2, Package, CheckCircle2 } from 'lucide-react';
import { Field, Modal } from './ContentManager';

const emptyPkg = () => ({ name: '', nameEn: '', price: 5, currency: 'USD', interval: 'month', features: [], featuresEn: [], active: true });

// ─── إدارة الباقات ────────────────────────────────────────────────────────────
export default function PackagesManager({ onDone, onErr }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/packages');
      const d = await r.json();
      if (d.error) { onErr(d.error); return; }
      setPackages(d.packages || []);
    } catch { onErr('تعذّر تحميل الباقات'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function call(body) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.error) { onErr(d.error); return false; }
      await load();
      return true;
    } catch { onErr('فشل الطلب'); return false; }
    finally { setBusy(false); }
  }

  async function save() {
    if (!edit.name?.trim()) return onErr('اسم الباقة مطلوب');
    if (await call({ action: 'update', id: edit.id, patch: { name: edit.name, nameEn: edit.nameEn, price: edit.price, currency: edit.currency, interval: edit.interval, features: edit.features, featuresEn: edit.featuresEn, active: edit.active } })) {
      setEdit(null); onDone('حُدّثت الباقة');
    }
  }
  async function create() {
    if (!creating.name?.trim()) return onErr('اسم الباقة مطلوب');
    if (await call({ action: 'create', package: creating })) { setCreating(null); onDone('أُضيفت الباقة'); }
  }
  async function remove(p) {
    if (!confirm(`حذف الباقة «${p.name}»؟`)) return;
    if (await call({ action: 'delete', id: p.id })) onDone('حُذفت الباقة');
  }
  async function toggle(p) {
    await call({ action: 'update', id: p.id, patch: { active: p.active === false } });
  }

  if (loading) return <div className="skeleton" style={{ height: 220 }} />;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row-between wrap">
        <div>
          <h3 style={{ fontSize: 16 }} className="row"><Package size={17} style={{ color: 'var(--sector)' }} /> الباقات والاشتراكات</h3>
          <p className="text-muted" style={{ fontSize: 12.5 }}>أضف/عدّل/احذف الباقات. لا توجد بوابات دفع مفعّلة حاليًا.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(emptyPkg())}><PlusCircle size={14} /> باقة جديدة</button>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {packages.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14 }}>
            <div className="row-between wrap" style={{ gap: 10 }}>
              <div style={{ minWidth: 200 }}>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-brand">{p.id}</span>
                  {p.active === false ? <span className="badge badge-muted">معطّلة</span> : <span className="badge badge-success">نشطة</span>}
                  <span className="badge badge-info">{p.price} {p.currency} / {p.interval === 'month' ? 'شهر' : p.interval === 'year' ? 'سنة' : 'مرة'}</span>
                </div>
                <div style={{ fontWeight: 800, marginTop: 4 }}>{p.name}{p.nameEn ? ` — ${p.nameEn}` : ''}</div>
                {p.features?.length > 0 && <div className="text-muted" style={{ fontSize: 12 }}>{p.features.join(' · ')}</div>}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggle(p)}>{p.active === false ? 'تفعيل' : 'تعطيل'}</button>
                <button className="icon-btn" onClick={() => setEdit({ ...p, features: p.features || [], featuresEn: p.featuresEn || [] })}><Pencil size={15} /></button>
                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => remove(p)}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <div className="card text-center text-muted" style={{ padding: 30 }}>لا توجد باقات — أضف باقة.</div>}
      </div>

      {edit && (
        <Modal title="تعديل الباقة" onClose={() => setEdit(null)}>
          <PkgForm pkg={edit} set={setEdit} />
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ</button>
        </Modal>
      )}
      {creating && (
        <Modal title="باقة جديدة" onClose={() => setCreating(null)}>
          <PkgForm pkg={creating} set={setCreating} />
          <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} إنشاء</button>
        </Modal>
      )}
    </div>
  );
}

function PkgForm({ pkg, set }) {
  const upd = (patch) => set({ ...pkg, ...patch });
  return (
    <>
      <div className="grid grid-2">
        <Field label="الاسم (عربي)"><input className="input" value={pkg.name} onChange={(e) => upd({ name: e.target.value })} /></Field>
        <Field label="الاسم (إنجليزي)"><input className="input" dir="ltr" value={pkg.nameEn || ''} onChange={(e) => upd({ nameEn: e.target.value })} /></Field>
      </div>
      <div className="grid grid-3">
        <Field label="السعر"><input type="number" className="input" value={pkg.price} onChange={(e) => upd({ price: e.target.value })} /></Field>
        <Field label="العملة"><input className="input" dir="ltr" value={pkg.currency} onChange={(e) => upd({ currency: e.target.value })} /></Field>
        <Field label="الدورة">
          <select className="select" value={pkg.interval} onChange={(e) => upd({ interval: e.target.value })}>
            <option value="month">شهري</option><option value="year">سنوي</option><option value="once">مرة واحدة</option>
          </select>
        </Field>
      </div>
      <Field label="المميزات (سطر لكل ميزة)"><textarea className="textarea" value={(pkg.features || []).join('\n')} onChange={(e) => upd({ features: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} /></Field>
      <label className="row" style={{ gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13.5 }}>
        <input type="checkbox" checked={pkg.active !== false} onChange={(e) => upd({ active: e.target.checked })} /> <CheckCircle2 size={14} /> باقة نشطة
      </label>
    </>
  );
}
