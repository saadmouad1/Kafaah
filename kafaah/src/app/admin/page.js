'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, PlusCircle, Upload, ListChecks, Search, Trash2, Save,
  Loader2, LogOut, Database, CheckCircle2, AlertTriangle, FileJson, FileSpreadsheet,
  X, Pencil, Layers, FolderPlus, Users, Package, CreditCard, Building2,
  ShieldCheck, Settings,
} from 'lucide-react';
import { useSpecBanks } from '../../lib/useData';
import ContentManager from '../../components/admin/ContentManager';
import ClientsManager from '../../components/admin/ClientsManager';
import PackagesManager from '../../components/admin/PackagesManager';
import SubscriptionsManager from '../../components/admin/SubscriptionsManager';
import PaymentsManager from '../../components/admin/PaymentsManager';
import SecurityVaultManager from '../../components/admin/SecurityVaultManager';
import PaymentConfigManager from '../../components/admin/PaymentConfigManager';

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'security', label: 'مركز الأمان ومكافحة الكشط 🛡️', icon: ShieldCheck },
  { id: 'payment_settings', label: 'إعدادات الحسابات والبريد ⚙️', icon: Settings },
  { id: 'payments', label: 'طلبات الدفع (الكريمي وجيب)', icon: CreditCard },
  { id: 'subscriptions', label: 'الاشتراكات المفعلة', icon: CheckCircle2 },
  { id: 'content', label: 'الأقسام والتخصصات', icon: Building2 },
  { id: 'banks', label: 'إدارة البنوك', icon: Layers },
  { id: 'manual', label: 'إضافة يدوية', icon: PlusCircle },
  { id: 'bulk', label: 'استيراد جماعي', icon: Upload },
  { id: 'manage', label: 'إدارة الأسئلة', icon: ListChecks },
  { id: 'clients', label: 'العملاء', icon: Users },
  { id: 'packages', label: 'الباقات', icon: Package },
];

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [content, setContent] = useState({ sectors: [], specs: [] });
  const [msg, setMsg] = useState(null);
  const [specId, setSpecId] = useState('');
  const [bankId, setBankId] = useState('');

  useEffect(() => {
    if (!document.cookie.includes('kafaah_admin_session=authenticated')) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      const r = await fetch('/api/admin/banks');
      const d = await r.json();
      if (d.error) { setMsg({ type: 'err', text: d.error }); return; }
      setStats(d.stats);
      setContent(d.content || { sectors: [], specs: [] });
      if (!specId) setSpecId(d.content?.specs?.[0]?.id || '');
    } catch {
      setMsg({ type: 'err', text: 'تعذّر الاتصال بالخادم' });
    }
  }

  function flash(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  if (!ready) return <div className="container page"><div className="skeleton" style={{ height: 300, marginTop: 20 }} /></div>;

  const childProps = {
    specs: content.specs,
    specId,
    setSpecId: (v) => { setSpecId(v); setBankId(''); },
    bankId,
    setBankId,
    onDone: (m) => { flash('ok', m); load(); },
    onErr: (m) => flash('err', m),
  };

  return (
    <div className="container page" style={{ maxWidth: 1100 }}>
      <div className="row-between wrap mb-3">
        <div className="row" style={{ gap: 10 }}>
          <img src="/icon.svg" alt="" width="38" height="38" style={{ borderRadius: 11 }} />
          <div>
            <h1 style={{ fontSize: 20 }}>لوحة المالك</h1>
            <p className="text-muted" style={{ fontSize: 12.5 }}>إدارة الأقسام والتخصصات والبنوك والعملاء والباقات والاشتراكات</p>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">عرض المنصة</Link>
          <button className="btn btn-danger btn-sm" onClick={async () => { await fetch('/api/admin-logout', { method: 'POST' }); router.replace('/admin/login'); }}>
            <LogOut size={14} /> خروج
          </button>
        </div>
      </div>

      {msg && (
        <div className={`card ${msg.type === 'err' ? 'badge-danger' : 'badge-success'}`} style={{ marginBottom: 14, fontWeight: 800 }}>
          <span className="row" style={{ gap: 8 }}>
            {msg.type === 'err' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />} {msg.text}
          </span>
        </div>
      )}

      <div className="chip-row mb-3">
        {TABS.map((t) => (
          <span key={t.id} className={`chip${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={14} /> {t.label}
          </span>
        ))}
      </div>

      {tab === 'overview' && <Overview stats={stats} onRefresh={load} />}
      {tab === 'security' && <SecurityVaultManager />}
      {tab === 'payment_settings' && <PaymentConfigManager onDone={(m) => flash('ok', m)} onErr={(m) => flash('err', m)} />}
      {tab === 'content' && <ContentManager onDone={(m) => { flash('ok', m); load(); }} onErr={(m) => flash('err', m)} />}
      {tab === 'banks' && <BanksManager {...childProps} />}
      {tab === 'manual' && <ManualAdd {...childProps} />}
      {tab === 'bulk' && <BulkImport {...childProps} />}
      {tab === 'manage' && <Manage {...childProps} />}
      {tab === 'clients' && <ClientsManager onDone={(m) => flash('ok', m)} onErr={(m) => flash('err', m)} />}
      {tab === 'packages' && <PackagesManager onDone={(m) => flash('ok', m)} onErr={(m) => flash('err', m)} />}
      {tab === 'payments' && <PaymentsManager onDone={(m) => { flash('ok', m); load(); }} onErr={(m) => flash('err', m)} />}
      {tab === 'subscriptions' && <SubscriptionsManager onDone={(m) => flash('ok', m)} onErr={(m) => flash('err', m)} />}
    </div>
  );
}

// ─── نظرة عامة ────────────────────────────────────────────────────────────────
function Overview({ stats, onRefresh }) {
  if (!stats) return <div className="skeleton" style={{ height: 240 }} />;
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="grid grid-4">
        {[
          { l: 'إجمالي الأسئلة', v: stats.total },
          { l: 'بنوك الأسئلة', v: stats.banks ?? 0 },
          { l: 'تخصصات مفعّلة', v: stats.specs },
          { l: 'قطاعات', v: Object.keys(stats.bySector || {}).length },
        ].map((x, i) => (
          <div key={i} className="stat-card"><div className="stat-num">{x.v.toLocaleString('ar-EG')}</div><div className="stat-label">{x.l}</div></div>
        ))}
      </div>

      <div className="card">
        <div className="row-between mb-3">
          <h3 style={{ fontSize: 16 }} className="row"><Database size={17} style={{ color: 'var(--sector)' }} /> البنوك حسب التخصص</h3>
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>تحديث</button>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {(stats.items || []).map((it) => (
            <div key={it.specId} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.label}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{it.sectorLabel} · {it.specId} · {it.bankCount || 0} بنك</div>
              </div>
              <span className={`badge ${it.count > 5 ? 'badge-success' : 'badge-warning'}`}>{it.count.toLocaleString('ar-EG')} سؤال</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── اختيار البنك (مشترك) ────────────────────────────────────────────────────
function BankPicker({ specId, bankId, setBankId, allowAll = false, onErr, onCreated }) {
  const { banks, refetch } = useSpecBanks(specId);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  // اختيار أول بنك تلقائيًا إن لم يُحدّد (إلا في وضع «كل البنوك»)
  useEffect(() => {
    if (allowAll) return;
    if (!bankId && banks.length) setBankId(banks[0].id);
    else if (bankId && banks.length && !banks.some((b) => b.id === bankId)) setBankId(banks[0].id);
  }, [banks, bankId, allowAll, setBankId]);

  async function create() {
    if (!specId) return onErr?.('اختر التخصص أولًا');
    if (!title.trim()) return onErr?.('اكتب عنوان البنك');
    setBusy(true);
    try {
      const r = await fetch('/api/admin/banks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createBank', specId, title }),
      });
      const d = await r.json();
      if (d.error) return onErr?.(d.error);
      setTitle(''); setCreating(false);
      await refetch();
      setBankId(d.bank.id);
      onCreated?.(d.bank);
    } catch { onErr?.('فشل إنشاء البنك'); }
    finally { setBusy(false); }
  }

  return (
    <div className="field">
      <label className="label">بنك الأسئلة</label>
      <div className="row" style={{ gap: 8 }}>
        <select className="select" value={bankId} onChange={(e) => setBankId(e.target.value)} style={{ flex: 1 }}>
          {allowAll && <option value="">— كل البنوك —</option>}
          {!allowAll && !banks.length && <option value="">— لا توجد بنوك —</option>}
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.auto ? `${b.specId} — البنك الرئيسي` : b.title} ({b.count} سؤال)
            </option>
          ))}
        </select>
        <button className="btn btn-ghost" onClick={() => setCreating((v) => !v)} title="بنك جديد"><FolderPlus size={15} /> بنك جديد</button>
      </div>
      {creating && (
        <div className="row mt-2" style={{ gap: 8 }}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان البنك، مثال: الأحياء الدقيقة" autoFocus />
          <button className="btn btn-primary btn-sm" onClick={create} disabled={busy}>{busy ? <Loader2 size={14} className="spin" /> : <Save size={14} />} إنشاء</button>
        </div>
      )}
      {!banks.length && !creating && (
        <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>لا يوجد بنك لهذا التخصص بعد — أنشئ بنكًا أولًا.</p>
      )}
    </div>
  );
}

// ─── إدارة البنوك ─────────────────────────────────────────────────────────────
function BanksManager({ specs, specId, setSpecId, onDone, onErr }) {
  const { banks, loading, refetch } = useSpecBanks(specId);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(null);

  async function call(body) {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/banks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specId, ...body }),
      });
      const d = await r.json();
      if (d.error) { onErr(d.error); return false; }
      await refetch();
      return true;
    } catch { onErr('فشل الطلب'); return false; }
    finally { setBusy(false); }
  }

  async function create() {
    if (!specId) return onErr('اختر التخصص أولًا');
    if (!title.trim()) return onErr('اكتب عنوان البنك');
    if (await call({ action: 'createBank', title, description: desc })) {
      setTitle(''); setDesc('');
      onDone('أُنشئ البنك بنجاح');
    }
  }

  async function saveEdit() {
    if (!edit.title.trim()) return onErr('عنوان البنك مطلوب');
    if (await call({ action: 'updateBank', bankId: edit.id, title: edit.title, description: edit.description })) {
      setEdit(null);
      onDone('حُدّث البنك');
    }
  }

  async function remove(b) {
    if (!confirm(`حذف البنك «${b.title || b.specId}» وكل أسئلته؟ لا يمكن التراجع.`)) return;
    if (await call({ action: 'deleteBank', bankId: b.id })) onDone('حُذف البنك');
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="card">
        <SpecPicker specs={specs} specId={specId} setSpecId={setSpecId} />
        <div className="grid grid-2 mt-3">
          <div className="field"><label className="label">عنوان البنك الجديد</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: الأحياء الدقيقة" /></div>
          <div className="field"><label className="label">وصف مختصر (اختياري)</label><input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="نطاق البنك…" /></div>
        </div>
        <button className="btn btn-primary mt-2" onClick={create} disabled={busy}><FolderPlus size={16} /> إنشاء بنك</button>
      </div>

      {loading ? <div className="skeleton" style={{ height: 160 }} /> : (
        <div className="stack" style={{ gap: 10 }}>
          {banks.length === 0 && <div className="card text-center text-muted" style={{ padding: 30 }}>لا توجد بنوك لهذا التخصص بعد.</div>}
          {banks.map((b) => (
            <div key={b.id} className="card" style={{ padding: 14 }}>
              <div className="row-between" style={{ gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span className="badge badge-brand"><Layers size={11} /> {b.id}</span>
                    {b.auto && <span className="badge badge-muted">رئيسي (بعنوان التخصص)</span>}
                    <span className="badge badge-info">{b.count} سؤال</span>
                  </div>
                  <div style={{ fontWeight: 800 }}>{b.title || b.specId}</div>
                  {b.description && <div className="text-muted" style={{ fontSize: 12.5 }}>{b.description}</div>}
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="icon-btn" onClick={() => setEdit({ id: b.id, title: b.title || b.specId, description: b.description || '' })}><Pencil size={15} /></button>
                  <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => remove(b)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,.5)', zIndex: 500, display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setEdit(null)}>
          <div className="card" style={{ maxWidth: 560, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="row-between mb-3"><h3 style={{ fontSize: 16 }}>تعديل البنك</h3><button className="icon-btn" onClick={() => setEdit(null)}><X size={16} /></button></div>
            <div className="stack" style={{ gap: 10 }}>
              <div className="field"><label className="label">العنوان</label><input className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div className="field"><label className="label">الوصف</label><input className="input" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={saveEdit} disabled={busy}><Save size={16} /> حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── إضافة يدوية ──────────────────────────────────────────────────────────────
function emptyQ() {
  return { subject: '', difficulty: 'medium', text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', source: '', tags: '' };
}

function ManualAdd({ specs, specId, setSpecId, bankId, setBankId, onDone, onErr }) {
  const [q, setQ] = useState(emptyQ());
  const [busy, setBusy] = useState(false);

  function setOpt(i, v) { const o = [...q.options]; o[i] = v; setQ({ ...q, options: o }); }

  async function save(addAnother) {
    if (!specId) return onErr('اختر التخصص أولًا');
    if (!bankId) return onErr('أنشئ بنكًا أو اختر بنكًا أولًا');
    if (!q.text.trim()) return onErr('نص السؤال مطلوب');
    const options = q.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) return onErr('أدخل خيارين على الأقل');
    if (q.correctIndex >= options.length) return onErr('حدّد الإجابة الصحيحة');
    setBusy(true);
    try {
      const r = await fetch('/api/admin/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', specId, bankId, questions: [{ ...q, options, tags: q.tags ? q.tags.split(',').map((t) => t.trim()) : [] }] }),
      });
      const d = await r.json();
      if (d.error) return onErr(d.error);
      onDone(`أُضيف السؤال إلى البنك — إجمالي البنك ${d.total}`);
      if (addAnother) setQ(emptyQ());
    } catch { onErr('فشل الحفظ'); }
    finally { setBusy(false); }
  }

  return (
    <div className="card">
      <SpecPicker specs={specs} specId={specId} setSpecId={setSpecId} />
      <div className="mt-3">
        <BankPicker specId={specId} bankId={bankId} setBankId={setBankId} onErr={onErr} />
      </div>
      <div className="stack mt-3" style={{ gap: 12 }}>
        <div className="grid grid-2">
          <div className="field"><label className="label">المادة</label><input className="input" value={q.subject} onChange={(e) => setQ({ ...q, subject: e.target.value })} placeholder="مثال: باطنة" /></div>
          <div className="field"><label className="label">الصعوبة</label>
            <select className="select" value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value })}>
              <option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option>
            </select>
          </div>
        </div>
        <div className="field"><label className="label">نص السؤال</label><textarea className="textarea" value={q.text} onChange={(e) => setQ({ ...q, text: e.target.value })} placeholder="اكتب السؤال…" /></div>
        <div className="field">
          <label className="label">الخيارات (اختر الصحيح)</label>
          {q.options.map((o, i) => (
            <div className="row" key={i} style={{ gap: 8, marginBottom: 6 }}>
              <button className="icon-btn" style={{ borderColor: q.correctIndex === i ? 'var(--success)' : 'var(--border)', background: q.correctIndex === i ? 'var(--success-soft)' : 'var(--surface)', color: q.correctIndex === i ? '#047857' : 'inherit' }} onClick={() => setQ({ ...q, correctIndex: i })}>
                <CheckCircle2 size={17} />
              </button>
              <input className="input" value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`الخيار ${i + 1}`} />
              {q.options.length > 2 && <button className="icon-btn" onClick={() => { const o = q.options.filter((_, x) => x !== i); setQ({ ...q, options: o, correctIndex: q.correctIndex >= o.length ? 0 : q.correctIndex }); }}><X size={15} /></button>}
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => setQ({ ...q, options: [...q.options, ''] })}><PlusCircle size={14} /> إضافة خيار</button>
        </div>
        <div className="field"><label className="label">الشرح</label><textarea className="textarea" value={q.explanation} onChange={(e) => setQ({ ...q, explanation: e.target.value })} placeholder="شرح الإجابة الصحيحة…" /></div>
        <div className="grid grid-2">
          <div className="field"><label className="label">المصدر (اختياري)</label><input className="input" value={q.source} onChange={(e) => setQ({ ...q, source: e.target.value })} /></div>
          <div className="field"><label className="label">الوسوم (فاصلة)</label><input className="input" value={q.tags} onChange={(e) => setQ({ ...q, tags: e.target.value })} placeholder="قلب, طوارئ" /></div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-primary" onClick={() => save(true)} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ وإضافة آخر</button>
          <button className="btn btn-ghost" onClick={() => save(false)} disabled={busy}>حفظ</button>
        </div>
      </div>
    </div>
  );
}

// ─── استيراد جماعي ────────────────────────────────────────────────────────────
function BulkImport({ specs, specId, setSpecId, bankId, setBankId, onDone, onErr }) {
  const [mode, setMode] = useState('json');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [replace, setReplace] = useState(false);

  function parseJSON(t) {
    const data = JSON.parse(t);
    return Array.isArray(data) ? data : data.questions || [];
  }
  function parseCSV(t) {
    const lines = t.split(/\r?\n/).filter((l) => l.trim());
    return lines.map((line) => {
      const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const [question, ...rest] = cells;
      const explanation = '';
      let ci = 0; let opts = rest;
      if (/^\d+$/.test(rest[rest.length - 1])) { ci = parseInt(rest[rest.length - 1], 10); opts = rest.slice(0, -1); }
      return { text: question, options: opts, correctIndex: ci, explanation };
    });
  }

  async function importData() {
    if (!specId) return onErr('اختر التخصص');
    if (!bankId) return onErr('أنشئ بنكًا أو اختر بنكًا أولًا');
    if (!text.trim()) return onErr('الصق البيانات أو ارفع ملفًا');
    if (replace && !confirm('سيتم حذف كل أسئلة هذا البنك واستبدالها بالبيانات الجديدة. متابعة؟')) return;
    setBusy(true);
    try {
      let list;
      try { list = mode === 'json' ? parseJSON(text) : parseCSV(text); }
      catch { return onErr('تعذّر تحليل البيانات — تحقّق من الصيغة'); }
      if (!list.length) return onErr('لا توجد أسئلة في البيانات');
      const r = await fetch('/api/admin/banks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: replace ? 'replace' : 'add', specId, bankId, questions: list }),
      });
      const d = await r.json();
      if (d.error) return onErr(d.error);
      if (replace) onDone(`تم استبدال البنك بالكامل — الإجمالي الآن ${d.total} سؤال`);
      else onDone(`تم الاستيراد: أُضيف ${d.added} وتم تخطّي ${d.skipped || 0} — إجمالي البنك ${d.total}`);
      setText('');
    } catch { onErr('فشل الاستيراد'); }
    finally { setBusy(false); }
  }

  function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setText(String(r.result)); setMode(f.name.endsWith('.csv') ? 'csv' : 'json'); };
    r.readAsText(f);
  }

  const sample = mode === 'json'
    ? '[{"subject":"باطنة","text":"...","options":["أ","ب","ج","د"],"correctIndex":1,"explanation":"...","difficulty":"medium"}]'
    : 'ما هي عاصمة اليمن؟,صنعاء,عدن,تعز,الحديدة,0';

  return (
    <div className="card">
      <SpecPicker specs={specs} specId={specId} setSpecId={setSpecId} />
      <div className="mt-3">
        <BankPicker specId={specId} bankId={bankId} setBankId={setBankId} onErr={onErr} />
      </div>
      <div className="row wrap mt-3" style={{ gap: 8 }}>
        <span className={`chip${mode === 'json' ? ' active' : ''}`} onClick={() => setMode('json')}><FileJson size={14} /> JSON</span>
        <span className={`chip${mode === 'csv' ? ' active' : ''}`} onClick={() => setMode('csv')}><FileSpreadsheet size={14} /> CSV</span>
        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}><Upload size={14} /> رفع ملف<input type="file" accept=".json,.csv" hidden onChange={onFile} /></label>
      </div>
      <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>
        {mode === 'json' ? 'مصفوفة JSON من الأسئلة (أو كائن يحتوي على questions).' : 'كل سطر: نص السؤال, خيار1, خيار2, ..., رقم الإجابة الصحيحة (يبدأ من 0).'}
      </p>
      <textarea className="textarea mt-2" style={{ minHeight: 200, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }} value={text} onChange={(e) => setText(e.target.value)} placeholder={sample} />
      <label className="row mt-2" style={{ gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13.5, color: replace ? 'var(--danger)' : 'var(--text-muted)' }}>
        <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
        استبدال بنك الأسئلة المحدّد بالكامل (حذف الأسئلة الحالية في هذا البنك)
      </label>
      <button className={`btn mt-3 ${replace ? 'btn-danger' : 'btn-primary'}`} onClick={importData} disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} {replace ? 'استبدال البنك' : 'استيراد وإضافة'}
      </button>
    </div>
  );
}

// ─── إدارة الأسئلة ────────────────────────────────────────────────────────────
function Manage({ specs, specId, setSpecId, bankId, setBankId, onDone, onErr }) {
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ questions: [], total: 0, hasMore: false, banks: [] });
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState(null);

  const load = async (off = 0, term = search, bank = bankId) => {
    if (!specId) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ spec: specId, limit: 30, offset: off });
      if (term) p.set('search', term);
      if (bank) p.set('bank', bank);
      const r = await fetch(`/api/admin/banks?${p}`);
      const d = await r.json();
      setData(d);
      setOffset(off);
    } catch { onErr('تعذّر التحميل'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (specId) load(0, '', ''); /* eslint-disable-next-line */ }, [specId]);
  useEffect(() => { if (specId) load(0, search, bankId); /* eslint-disable-next-line */ }, [bankId]);

  async function del(id) {
    if (!confirm('حذف هذا السؤال نهائيًا؟')) return;
    const r = await fetch('/api/admin/banks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', specId, id }) });
    const d = await r.json();
    if (d.error) return onErr(d.error);
    onDone('حُذف السؤال');
    load(offset, search, bankId);
  }

  async function saveEdit() {
    const r = await fetch('/api/admin/banks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', specId, bankId: editing.bankId, id: editing.id, patch: editing }) });
    const d = await r.json();
    if (d.error) return onErr(d.error);
    onDone('تم التحديث');
    setEditing(null);
    load(offset, search, bankId);
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="card">
        <SpecPicker specs={specs} specId={specId} setSpecId={setSpecId} />
        <div className="mt-3">
          <BankPicker specId={specId} bankId={bankId} setBankId={setBankId} allowAll onErr={onErr} />
        </div>
        <div className="row mt-3" style={{ gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={17} style={{ position: 'absolute', insetInlineStart: 13, top: 14, color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingInlineStart: 40 }} placeholder="ابحث في أسئلة البنك…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(0, search, bankId)} />
          </div>
          <button className="btn btn-primary" onClick={() => load(0, search, bankId)}>بحث</button>
        </div>
        <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>{data.total?.toLocaleString('ar-EG')} سؤال في النطاق المحدّد</p>
      </div>

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
        <div className="stack" style={{ gap: 10 }}>
          {(data.questions || []).map((q) => (
            <div key={q.id} className="card" style={{ padding: 14 }}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-brand">{q.bankTitle || q.bankId}</span>
                  <span className="badge badge-muted">{q.subject}</span>
                  <span className="badge badge-muted">{q.id}</span>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="icon-btn" onClick={() => setEditing({ ...q })}><Pencil size={15} /></button>
                  <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => del(q.id)}><Trash2 size={15} /></button>
                </div>
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.6 }}>{q.text}</p>
            </div>
          ))}
          <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" disabled={offset === 0} onClick={() => load(Math.max(0, offset - 30), search, bankId)}>السابق</button>
            <button className="btn btn-ghost btn-sm" disabled={!data.hasMore} onClick={() => load(offset + 30, search, bankId)}>التالي</button>
          </div>
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,18,32,.5)', zIndex: 500, display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div className="card" style={{ maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="row-between mb-3"><h3 style={{ fontSize: 16 }}>تعديل السؤال</h3><button className="icon-btn" onClick={() => setEditing(null)}><X size={16} /></button></div>
            <div className="stack" style={{ gap: 10 }}>
              <div className="field"><label className="label">المادة</label><input className="input" value={editing.subject || ''} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></div>
              <div className="field"><label className="label">النص</label><textarea className="textarea" value={editing.text || ''} onChange={(e) => setEditing({ ...editing, text: e.target.value })} /></div>
              {(editing.options || []).map((o, i) => (
                <div className="row" key={i} style={{ gap: 8 }}>
                  <button className="icon-btn" style={{ borderColor: editing.correctIndex === i ? 'var(--success)' : 'var(--border)' }} onClick={() => setEditing({ ...editing, correctIndex: i })}><CheckCircle2 size={16} /></button>
                  <input className="input" value={o} onChange={(e) => { const opts = [...editing.options]; opts[i] = e.target.value; setEditing({ ...editing, options: opts }); }} />
                </div>
              ))}
              <div className="field"><label className="label">الشرح</label><textarea className="textarea" value={editing.explanation || ''} onChange={(e) => setEditing({ ...editing, explanation: e.target.value })} /></div>
              <button className="btn btn-primary" onClick={saveEdit}><Save size={16} /> حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecPicker({ specs, specId, setSpecId }) {
  const grouped = useMemo(() => {
    const g = {};
    (specs || []).forEach((s) => { g[s.sectorLabel] = g[s.sectorLabel] || []; g[s.sectorLabel].push(s); });
    return g;
  }, [specs]);
  return (
    <div className="field">
      <label className="label">التخصص المستهدف</label>
      <select className="select" value={specId} onChange={(e) => setSpecId(e.target.value)}>
        <option value="">— اختر التخصص —</option>
        {Object.entries(grouped).map(([sector, list]) => (
          <optgroup key={sector} label={sector}>
            {list.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.count} سؤال)</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
