'use client';
import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Save, Trash2, Pencil, X, Loader2, Layers, Building2, FolderPlus } from 'lucide-react';

const ICONS = ['health', 'engineering', 'law', 'finance', 'education'];

// ─── إدارة الأقسام والتخصصات ─────────────────────────────────────────────────
export default function ContentManager({ onDone, onErr }) {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editSector, setEditSector] = useState(null);
  const [editSpec, setEditSpec] = useState(null);
  const [newSector, setNewSector] = useState(null);
  const [newSpec, setNewSpec] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/content');
      const d = await r.json();
      if (d.error) { onErr(d.error); return; }
      setSectors(d.sectors || []);
    } catch { onErr('تعذّر تحميل المحتوى'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function call(body) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.error) { onErr(d.error); return false; }
      await load();
      return true;
    } catch { onErr('فشل الطلب'); return false; }
    finally { setBusy(false); }
  }

  const totalSpecs = useMemo(() => sectors.reduce((n, s) => n + (s.specializations?.length || 0), 0), [sectors]);

  async function saveSector() {
    if (!editSector.label?.trim()) return onErr('اسم القسم مطلوب');
    if (await call({ action: 'updateSector', id: editSector.id, patch: { label: editSector.label, short: editSector.short, tagline: editSector.tagline, color: editSector.color, icon: editSector.icon } })) {
      setEditSector(null); onDone('حُدّث القسم');
    }
  }
  async function createSector() {
    if (!newSector.label?.trim()) return onErr('اسم القسم مطلوب');
    if (await call({ action: 'addSector', sector: newSector })) { setNewSector(null); onDone('أُضيف القسم'); }
  }
  async function removeSector(s) {
    if (!confirm(`حذف القسم «${s.label}» وكل تخصصاته؟ لن تُحذف أسئلة البنوك.`)) return;
    if (await call({ action: 'deleteSector', id: s.id })) onDone('حُذف القسم');
  }
  async function saveSpec() {
    if (!editSpec.label?.trim()) return onErr('اسم التخصص مطلوب');
    if (await call({ action: 'updateSpec', id: editSpec.id, patch: {
      label: editSpec.label, country: editSpec.country, authority: editSpec.authority,
      blueprint: editSpec.blueprint, moveToSector: editSpec.moveToSector,
    } })) { setEditSpec(null); onDone('حُدّث التخصص'); }
  }
  async function createSpec() {
    if (!newSpec.sectorId) return onErr('اختر القسم');
    if (!newSpec.label?.trim()) return onErr('اسم التخصص مطلوب');
    if (await call({ action: 'addSpec', sectorId: newSpec.sectorId, spec: newSpec })) { setNewSpec(null); onDone('أُضيف التخصص'); }
  }
  async function removeSpec(sp) {
    if (!confirm(`حذف التخصص «${sp.label}»؟`)) return;
    if (await call({ action: 'deleteSpec', id: sp.id })) onDone('حُذف التخصص');
  }

  if (loading) return <div className="skeleton" style={{ height: 260 }} />;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="grid grid-3">
        <div className="stat-card"><div className="stat-num">{sectors.length.toLocaleString('ar-EG')}</div><div className="stat-label">الأقسام</div></div>
        <div className="stat-card"><div className="stat-num">{totalSpecs.toLocaleString('ar-EG')}</div><div className="stat-label">التخصصات</div></div>
        <div className="stat-card"><div className="stat-num">{sectors.reduce((n, s) => n + (s.count || 0), 0).toLocaleString('ar-EG')}</div><div className="stat-label">إجمالي الأسئلة</div></div>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setNewSector({ label: '', short: '', tagline: '', color: '#0ea5a4', icon: 'health' })}><PlusCircle size={14} /> قسم جديد</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setNewSpec({ sectorId: sectors[0]?.id || '', label: '', country: '', authority: '', questions: 100, minutes: 120, passScore: 60 })}><FolderPlus size={14} /> تخصص جديد</button>
        <button className="btn btn-ghost btn-sm" onClick={load}>تحديث</button>
      </div>

      {sectors.map((s) => (
        <div key={s.id} className="card" style={{ padding: 14 }}>
          <div className="row-between wrap" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: s.color, display: 'grid', placeItems: 'center' }}><Layers size={17} /></span>
              <div>
                <div style={{ fontWeight: 800 }}>{s.label} <span className="text-dim" style={{ fontSize: 11 }}>({s.id})</span></div>
                <div className="text-muted" style={{ fontSize: 12 }}>{s.tagline || '—'} · {s.specializations?.length || 0} تخصص · {(s.count || 0).toLocaleString('ar-EG')} سؤال</div>
              </div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="icon-btn" onClick={() => setEditSector({ ...s })}><Pencil size={15} /></button>
              <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => removeSector(s)}><Trash2 size={15} /></button>
            </div>
          </div>

          <div className="stack mt-3" style={{ gap: 8 }}>
            {(s.specializations || []).map((sp) => (
              <div key={sp.id} className="row-between card" style={{ padding: 10, background: 'var(--surface-2)' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{sp.label}</span>
                    <span className="badge badge-info">{(sp.count || 0).toLocaleString('ar-EG')} سؤال</span>
                    {sp.blueprint && <span className="badge badge-muted">{sp.blueprint.questions}q / {sp.blueprint.minutes}m / {sp.blueprint.passScore}%</span>}
                  </div>
                  <div className="text-muted row" style={{ fontSize: 12, gap: 4 }}><Building2 size={11} /> {sp.authority || '—'} · {sp.country || '—'} · {sp.id}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="icon-btn" onClick={() => setEditSpec({ ...sp, moveToSector: s.id })}><Pencil size={15} /></button>
                  <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => removeSpec(sp)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {(!s.specializations || s.specializations.length === 0) && <p className="text-muted" style={{ fontSize: 12.5 }}>لا توجد تخصصات — أضف تخصصًا.</p>}
          </div>
        </div>
      ))}

      {/* sector modal */}
      {editSector && (
        <Modal title="تعديل القسم" onClose={() => setEditSector(null)}>
          <Field label="الاسم"><input className="input" value={editSector.label} onChange={(e) => setEditSector({ ...editSector, label: e.target.value })} /></Field>
          <Field label="الاسم المختصر"><input className="input" value={editSector.short || ''} onChange={(e) => setEditSector({ ...editSector, short: e.target.value })} /></Field>
          <Field label="الوصف المختصر"><input className="input" value={editSector.tagline || ''} onChange={(e) => setEditSector({ ...editSector, tagline: e.target.value })} /></Field>
          <div className="grid grid-2">
            <Field label="اللون"><input type="color" className="input" value={editSector.color || '#0ea5a4'} onChange={(e) => setEditSector({ ...editSector, color: e.target.value })} /></Field>
            <Field label="الأيقونة"><select className="select" value={editSector.icon || 'health'} onChange={(e) => setEditSector({ ...editSector, icon: e.target.value })}>{ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select></Field>
          </div>
          <button className="btn btn-primary" onClick={saveSector} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ</button>
        </Modal>
      )}

      {newSector && (
        <Modal title="قسم جديد" onClose={() => setNewSector(null)}>
          <Field label="الاسم"><input className="input" value={newSector.label} onChange={(e) => setNewSector({ ...newSector, label: e.target.value })} /></Field>
          <Field label="الاسم المختصر"><input className="input" value={newSector.short} onChange={(e) => setNewSector({ ...newSector, short: e.target.value })} /></Field>
          <Field label="الوصف المختصر"><input className="input" value={newSector.tagline} onChange={(e) => setNewSector({ ...newSector, tagline: e.target.value })} /></Field>
          <div className="grid grid-2">
            <Field label="اللون"><input type="color" className="input" value={newSector.color} onChange={(e) => setNewSector({ ...newSector, color: e.target.value })} /></Field>
            <Field label="الأيقونة"><select className="select" value={newSector.icon} onChange={(e) => setNewSector({ ...newSector, icon: e.target.value })}>{ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select></Field>
          </div>
          <button className="btn btn-primary" onClick={createSector} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} إنشاء</button>
        </Modal>
      )}

      {editSpec && (
        <Modal title="تعديل التخصص" onClose={() => setEditSpec(null)}>
          <Field label="الاسم"><input className="input" value={editSpec.label} onChange={(e) => setEditSpec({ ...editSpec, label: e.target.value })} /></Field>
          <div className="grid grid-2">
            <Field label="جهة الترخيص"><input className="input" value={editSpec.authority || ''} onChange={(e) => setEditSpec({ ...editSpec, authority: e.target.value })} /></Field>
            <Field label="الدولة"><input className="input" value={editSpec.country || ''} onChange={(e) => setEditSpec({ ...editSpec, country: e.target.value })} /></Field>
          </div>
          <div className="grid grid-3">
            <Field label="عدد الأسئلة"><input type="number" className="input" value={editSpec.blueprint?.questions ?? 100} onChange={(e) => setEditSpec({ ...editSpec, blueprint: { ...editSpec.blueprint, questions: e.target.value } })} /></Field>
            <Field label="المدة (دقيقة)"><input type="number" className="input" value={editSpec.blueprint?.minutes ?? 120} onChange={(e) => setEditSpec({ ...editSpec, blueprint: { ...editSpec.blueprint, minutes: e.target.value } })} /></Field>
            <Field label="نسبة النجاح %"><input type="number" className="input" value={editSpec.blueprint?.passScore ?? 60} onChange={(e) => setEditSpec({ ...editSpec, blueprint: { ...editSpec.blueprint, passScore: e.target.value } })} /></Field>
          </div>
          <Field label="نقل إلى قسم">
            <select className="select" value={editSpec.moveToSector} onChange={(e) => setEditSpec({ ...editSpec, moveToSector: e.target.value })}>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <button className="btn btn-primary" onClick={saveSpec} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ</button>
        </Modal>
      )}

      {newSpec && (
        <Modal title="تخصص جديد" onClose={() => setNewSpec(null)}>
          <Field label="القسم">
            <select className="select" value={newSpec.sectorId} onChange={(e) => setNewSpec({ ...newSpec, sectorId: e.target.value })}>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="الاسم"><input className="input" value={newSpec.label} onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })} /></Field>
          <div className="grid grid-2">
            <Field label="جهة الترخيص"><input className="input" value={newSpec.authority} onChange={(e) => setNewSpec({ ...newSpec, authority: e.target.value })} /></Field>
            <Field label="الدولة"><input className="input" value={newSpec.country} onChange={(e) => setNewSpec({ ...newSpec, country: e.target.value })} /></Field>
          </div>
          <div className="grid grid-3">
            <Field label="عدد الأسئلة"><input type="number" className="input" value={newSpec.questions} onChange={(e) => setNewSpec({ ...newSpec, questions: e.target.value })} /></Field>
            <Field label="المدة (دقيقة)"><input type="number" className="input" value={newSpec.minutes} onChange={(e) => setNewSpec({ ...newSpec, minutes: e.target.value })} /></Field>
            <Field label="نسبة النجاح %"><input type="number" className="input" value={newSpec.passScore} onChange={(e) => setNewSpec({ ...newSpec, passScore: e.target.value })} /></Field>
          </div>
          <button className="btn btn-primary" onClick={createSpec} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} إنشاء</button>
        </Modal>
      )}
    </div>
  );
}

export function Field({ label, children }) {
  return <div className="field"><label className="label">{label}</label>{children}</div>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,.5)', zIndex: 500, display: 'grid', placeItems: 'center', padding: 16 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="row-between mb-3"><h3 style={{ fontSize: 16 }}>{title}</h3><button className="icon-btn" onClick={onClose}><X size={16} /></button></div>
        <div className="stack" style={{ gap: 10 }}>{children}</div>
      </div>
    </div>
  );
}
