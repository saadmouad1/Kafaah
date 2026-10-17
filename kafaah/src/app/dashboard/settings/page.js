'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Upload, Trash2, LogOut, Moon, Sun, Repeat, Save, ShieldCheck } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { exportProgress, importProgress, resetProgress } from '../../../lib/progress';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, setProfile, sector, spec, logout, sectors } = useKafaah();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [savedMsg, setSavedMsg] = useState('');
  const [sid, setSid] = useState('');
  const [spid, setSpid] = useState('');

  useEffect(() => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setSid(profile.sectorId || '');
    setSpid(profile.specId || '');
    const t = localStorage.getItem('kafaah_theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(t);
  }, [profile]);

  function applyTheme(t) {
    setTheme(t);
    localStorage.setItem('kafaah_theme', t);
    document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light';
  }

  function saveIdentity() {
    setProfile({ name: name.trim(), email: email.trim() });
    setSavedMsg('تم الحفظ ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function saveDomain() {
    setProfile({ sectorId: sid, specId: spid });
    setSavedMsg('تم تحديث القسم والتخصص ✓');
    setTimeout(() => setSavedMsg(''), 2200);
  }

  function doExport() {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kafaah-progress-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try { importProgress(JSON.parse(r.result)); setSavedMsg('تم استيراد التقدّم ✓'); }
      catch { setSavedMsg('ملف غير صالح ✕'); }
      setTimeout(() => setSavedMsg(''), 2500);
    };
    r.readAsText(file);
  }

  const sub = profile.subscription;

  return (
    <div className="stack" style={{ gap: 18, maxWidth: 720 }}>
      <h1 className="page-title">الإعدادات</h1>

      {savedMsg && <div className="card badge-success" style={{ fontWeight: 800 }}>{savedMsg}</div>}

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>الحساب</h3>
        <div className="stack" style={{ gap: 12 }}>
          <div className="field"><label className="label">الاسم</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label className="label">البريد الإلكتروني</label><input className="input" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={saveIdentity}><Save size={15} /> حفظ</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>المجال والتخصص</h3>
        <div className="stack" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">القسم</label>
            <select className="input" value={sid} onChange={(e) => { setSid(e.target.value); setSpid(''); }}>
              <option value="">— اختر القسم —</option>
              {(sectors || []).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">التخصص الدقيق</label>
            <select className="input" value={spid} onChange={(e) => setSpid(e.target.value)} disabled={!sid}>
              <option value="">— اختر التخصص —</option>
              {((sectors || []).find((s) => s.id === sid)?.specializations || []).map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.label}</option>
              ))}
            </select>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={!sid || !spid} onClick={saveDomain}>
              <Save size={15} /> حفظ القسم والتخصص
            </button>
            <Link href="/onboarding" className="btn btn-ghost"><Repeat size={14} /> عبر معالج الإعداد</Link>
          </div>
          <div className="row-between card soft-sector" style={{ padding: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{sector?.label || '—'}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{spec?.label} · {spec?.authority}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>المظهر</h3>
        <div className="row" style={{ gap: 10 }}>
          <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => applyTheme('light')}><Sun size={15} /> فاتح</button>
          <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => applyTheme('dark')}><Moon size={15} /> ليلي</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }} className="row"><ShieldCheck size={17} style={{ color: 'var(--sector)' }} /> اشتراكي</h3>
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 800 }}>{!sub?.plan || sub.plan === 'trial' || sub.plan === 'active' ? 'اشتراك نشط' : sub.plan}</div>
            {sub?.expiresAt && <div className="text-muted" style={{ fontSize: 13 }}>تنتهي في {new Date(sub.expiresAt).toLocaleDateString('ar-EG')}</div>}
          </div>
          <span className="badge badge-success">نشط</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12 }}>بياناتي</h3>
        <div className="row wrap" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={doExport}><Download size={14} /> تصدير التقدّم</button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} /> استيراد التقدّم
            <input type="file" accept="application/json" hidden onChange={doImport} />
          </label>
          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('إعادة تعيين كل تقدّمك؟')) { resetProgress(); setSavedMsg('تمت إعادة التعيين'); setTimeout(() => setSavedMsg(''), 2000); } }}>
            <Trash2 size={14} /> إعادة تعيين
          </button>
        </div>
      </div>

      <button className="btn btn-danger btn-block" onClick={() => { logout(); router.replace('/'); }}>
        <LogOut size={16} /> تسجيل الخروج
      </button>
    </div>
  );
}
