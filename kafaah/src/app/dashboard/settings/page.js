'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Download, Upload, Trash2, LogOut, Moon, Sun, Repeat, Save,
  ShieldCheck, Sparkles, CheckCircle2, Clock, Calendar, AlertCircle,
  CreditCard, Check, RefreshCw, Languages, Laptop, ChevronRight, X, Building2,
  MapPin, Loader2,
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { exportProgress, importProgress, resetProgress, getStats } from '../../../lib/progress';
import YemeniPaymentModal from '../../../components/payment/YemeniPaymentModal';

export default function SettingsPage() {
  const router = useRouter();
  const {
    profile, setProfile, sector, spec, logout, sectors, t, locale,
    sectorName, specName, localize, lang, setLang
  } = useKafaah();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [savedMsg, setSavedMsg] = useState('');
  const [packages, setPackages] = useState([]);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [targetLocation, setTargetLocation] = useState(profile.targetLocation || 'all');
  const [busyPlan, setBusyPlan] = useState(false);

  useEffect(() => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    if (profile.targetLocation) setTargetLocation(profile.targetLocation);
    const th = localStorage.getItem('kafaah_theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(th);
  }, [profile]);

  async function regeneratePlan() {
    setBusyPlan(true);
    try {
      const locLabel = targetLocation === 'صنعاء' ? 'المجلس الطبي بصنعاء'
        : targetLocation === 'عدن' ? 'المجلس الطبي بعدن'
        : targetLocation === 'السعودية' ? 'الهيئة السعودية للتخصصات الصحية (SCFHS) / برومترك'
        : (spec?.authority ? localize(spec.authority) : 'مجلس مزاولة المهنة المعتمد');

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnostic_plan',
          payload: {
            profession: sectorName(sector),
            specialty: specName(spec),
            country: localize(spec?.country),
            authority: locLabel,
            exam_name: `${locLabel} — ${specName(spec)}`,
            level: profile.level || 'خريج',
            examDate: profile.examDate || '',
            location: targetLocation,
            examLocation: targetLocation,
            lang,
          },
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setProfile({ targetLocation, plan: data.plan, planGeneratedAt: new Date().toISOString() });
        flash(lang === 'en' ? 'New smart study plan generated successfully ✓' : 'تم توليد خطة دراسية ذكية مخصصة بنجاح ✓', 3500);
      } else {
        flash(lang === 'en' ? 'Unable to generate plan right now' : 'تعذر توليد الخطة حالياً');
      }
    } catch {
      flash(lang === 'en' ? 'Could not reach AI server. Try again.' : 'تعذر الاتصال بخادم الذكاء الاصطناعي');
    } finally {
      setBusyPlan(false);
    }
  }

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => {
        const pkgs = (d.packages || []).filter((p) => p.active !== false);
        setPackages(pkgs);
        if (pkgs.length > 0 && !selectedPkg) {
          setSelectedPkg(pkgs[0]);
        }
      })
      .catch(() => {});
  }, []);

  function applyTheme(th) {
    setTheme(th);
    localStorage.setItem('kafaah_theme', th);
    if (th === 'auto') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.documentElement.dataset.theme = th === 'dark' ? 'dark' : 'light';
    }
    flash(lang === 'en' ? 'Theme updated ✓' : 'تم تحديث المظهر ✓');
  }

  function handleLanguageChange(newLang) {
    if (newLang === lang) return;
    setLang(newLang);
    flash(newLang === 'en' ? 'Language switched to English ✓' : 'تم تغيير اللغة إلى العربية ✓');
  }

  function flash(msg, ms = 2500) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), ms);
  }

  function saveIdentity() {
    setProfile({ name: name.trim(), email: email.trim() });
    if (email.trim()) {
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'touch',
          email: email.trim(),
          name: name.trim(),
          sectorId: profile.sectorId,
          specId: profile.specId
        }),
      }).catch(() => {});
    }
    flash(t('settings.savedIdentity'));
  }

  function doExport() {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kafaah-progress-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        importProgress(JSON.parse(r.result));
        flash(t('settings.imported'), 2500);
      } catch {
        flash(t('settings.invalidFile'), 2500);
      }
    };
    r.readAsText(file);
  }

  // تجديد / تفعيل الاشتراك مع ضمان الحفاظ التام على مستوى المستخدم وتقدمه
  function handleRenewSubscription(pkgToSubscribe) {
    const targetPkg = pkgToSubscribe || selectedPkg || packages[0];
    if (!targetPkg) return;

    setIsRenewing(true);

    const now = new Date();
    const currentExpires = profile.subscription?.expiresAt ? new Date(profile.subscription.expiresAt) : null;
    
    // إذا كان الاشتراك سارياً ومتبقي فيه أيام، نمدد من تاريخ الانتهاء الحالي، وإن كان منتهياً أو جديداً نبدأ من الآن
    const baseDate = (currentExpires && currentExpires > now) ? new Date(currentExpires) : new Date(now);
    baseDate.setMonth(baseDate.getMonth() + 1);

    const updatedSub = {
      plan: targetPkg.id,
      planName: (lang === 'en' && targetPkg.nameEn) ? targetPkg.nameEn : targetPkg.name,
      startedAt: profile.subscription?.startedAt || now.toISOString(),
      expiresAt: baseDate.toISOString(),
      renewedAt: now.toISOString(),
      price: targetPkg.price,
      currency: targetPkg.currency || 'USD',
    };

    // نحدث فقط بيانات الاشتراك في البروفايل، ولا نلمس بيانات التدريب نهائياً
    setProfile({ subscription: updatedSub });

    // مزامنة مع الخادم
    if (profile.email) {
      fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          packageId: targetPkg.id
        }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setIsRenewing(false);
      setShowRenewModal(false);
      flash(lang === 'en' 
        ? 'Subscription renewed successfully! All your progress and answers are fully preserved.'
        : 'تم تجديد الاشتراك بنجاح! جميع بياناتك ومستواك التدريبي محفوظ بنسبة 100% ✓', 3500);
    }, 600);
  }

  const sub = profile.subscription;
  const now = new Date();
  const expiresDate = sub?.expiresAt ? new Date(sub.expiresAt) : null;
  const isExpired = expiresDate ? expiresDate.getTime() < now.getTime() : false;
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // نسبة الفترة الزمنية المتبقية
  const periodProgress = useMemo(() => {
    if (!expiresDate) return 0;
    const started = sub?.startedAt ? new Date(sub.startedAt) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const totalMs = expiresDate.getTime() - started.getTime();
    if (totalMs <= 0) return 0;
    const remainingMs = expiresDate.getTime() - now.getTime();
    return Math.max(0, Math.min(100, Math.round((remainingMs / totalMs) * 100)));
  }, [expiresDate, sub, now]);

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 740, marginInline: 'auto' }}>
      <div className="row-between wrap" style={{ gap: 10 }}>
        <div>
          <h1 className="page-title">{t('nav.settings')}</h1>
          <p className="text-muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            {lang === 'en'
              ? 'Manage your account, preferences, appearance, and subscription.'
              : 'إدارة حسابك، وتفضيلات اللغة والمظهر، وبيانات اشتراكك.'}
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="card badge-success fade-up" style={{ fontWeight: 800, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* ── بطاقة الاشتراك (مطورة بالكامل مع الأيام المتبقية وإعادة الاشتراك) ── */}
      <div className="card" style={{ border: isExpired ? '1px solid var(--danger)' : '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="row-between wrap" style={{ marginBottom: 14, gap: 10 }}>
          <div className="row" style={{ gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold-soft)', color: 'var(--gold-dark)', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900 }}>{t('settings.subscription')}</h3>
              <p className="text-muted" style={{ fontSize: 12 }}>
                {lang === 'en' ? 'Your active plan & license status' : 'بيانات خطة اشتراكك وصلاحية الحساب'}
              </p>
            </div>
          </div>
          <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`} style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 800 }}>
            {isExpired
              ? (lang === 'en' ? 'Expired' : 'منتهي')
              : (lang === 'en' ? 'Active' : 'نشط')}
          </span>
        </div>

        {/* ملخص الاشتراك الحالي */}
        <div className="card soft-sector" style={{ padding: 16, borderRadius: 14, marginBottom: 14 }}>
          <div className="row-between wrap" style={{ gap: 12 }}>
            <div>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <Sparkles size={16} style={{ color: 'var(--gold-dark)' }} />
                <span style={{ fontWeight: 900, fontSize: 16 }}>
                  {sub?.planName || (lang === 'en' ? 'Kafaah Comprehensive Plan' : 'باقة كفاءة الشاملة')}
                </span>
                <span className="badge badge-gold" style={{ fontSize: 11 }}>
                  {lang === 'en' ? '50% OFF Applied' : 'خصم 50% مطبّق'}
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                {expiresDate ? (
                  <span className="row" style={{ gap: 6, display: 'inline-flex', alignItems: 'center' }}>
                    <Calendar size={14} />
                    <span>
                      {isExpired
                        ? (lang === 'en' ? `Expired on ${expiresDate.toLocaleDateString(locale)}` : `انتهى في ${expiresDate.toLocaleDateString(locale)}`)
                        : (lang === 'en' ? `Expires on ${expiresDate.toLocaleDateString(locale)}` : `ينتهي في ${expiresDate.toLocaleDateString(locale)}`)}
                    </span>
                  </span>
                ) : (
                  <span>{lang === 'en' ? 'No expiration set' : 'لم يتم تحديد تاريخ انتهاء'}</span>
                )}
              </div>
            </div>

            {/* الأيام المتبقية */}
            <div style={{ textAlign: lang === 'en' ? 'left' : 'right' }}>
              <div className="row" style={{ gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Clock size={16} style={{ color: isExpired ? 'var(--danger)' : 'var(--sector)' }} />
                <span style={{ fontSize: 17, fontWeight: 900, color: isExpired ? 'var(--danger)' : 'var(--sector)' }}>
                  {isExpired
                    ? (lang === 'en' ? 'Expired' : 'انتهى الاشتراك')
                    : (lang === 'en' ? `${daysLeft} Days Left` : `متبقي ${daysLeft} يومًا`)}
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                {isExpired
                  ? (lang === 'en' ? 'Renew now to restore full access' : 'جدّد الآن لاستعادة الوصول الكامل')
                  : (lang === 'en' ? 'Full access to all question banks & mocks' : 'وصول كامل لجميع بنوك الأسئلة والمحاكاة')}
              </div>
            </div>
          </div>

          {/* شريط التقدم الزمني للاشتراك */}
          {!isExpired && expiresDate && (
            <div style={{ marginTop: 14 }}>
              <div className="row-between" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>{lang === 'en' ? 'Remaining time in current cycle' : 'المدة المتبقية في الدورة الحالية'}</span>
                <span style={{ fontWeight: 800 }}>{periodProgress}%</span>
              </div>
              <div className="progress" style={{ height: 8, borderRadius: 99, background: 'var(--surface-3)' }}>
                <span style={{ width: `${periodProgress}%`, background: periodProgress > 25 ? 'var(--sector)' : 'var(--warning, #f59e0b)' }} />
              </div>
            </div>
          )}
        </div>

        {/* ضمان حفظ المستوى وعدم الحذف */}
        <div style={{ background: 'color-mix(in srgb, var(--sector) 8%, var(--surface))', border: '1px solid color-mix(in srgb, var(--sector) 25%, transparent)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--sector)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <strong>{lang === 'en' ? 'Progress Protection Guarantee: ' : 'ضمان حفظ المستوى: '}</strong>
              {lang === 'en'
                ? 'Renewing or extending your subscription will never reset your progress. All your answered questions, mistake logs, saved items, and performance stats are permanently preserved.'
                : 'تجديد أو تمديد الاشتراك يمدد فترة الصلاحية فقط، وجميع إجاباتك، ومحاكاتك السابقة، وبنك أخطائك، ومستواك التدريبي محفوظ بنسبة 100% ولن يتأثر إطلاقاً.'}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات الخاصة بالاشتراك */}
        <div className="row-between wrap" style={{ gap: 10 }}>
          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'Exclusive Plans:' : 'الباقات المخفضة:'}
            </span>
            <span className="badge badge-gold" style={{ fontSize: 12, fontWeight: 900 }}>
              {lang === 'en' ? '3 Months: $12 (Save 40% 🔥)' : '3 أشهر بـ 12$ (وفر 40% 🔥)'}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 700 }}>
              {lang === 'en' ? 'or $5 / month' : 'أو 5$ شهرياً'}
            </span>
          </div>

          <button
            className={`btn ${isExpired ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setShowRenewModal(true)}
            style={{ fontWeight: 800 }}
          >
            <RefreshCw size={15} />
            {isExpired
              ? (lang === 'en' ? 'Renew / Choose Plan' : 'تجديد أو اختيار الباقة (الكريمي / جيب)')
              : (lang === 'en' ? 'Upgrade / Extend Plan' : 'ترقية أو تمديد الاشتراك (الكريمي / جيب)')}
          </button>
        </div>
      </div>

      {/* ── قسم اللغة والاتجاه (Language & Direction) ── */}
      <div className="card">
        <div className="row-between wrap" style={{ marginBottom: 12, gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Languages size={18} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>
              {lang === 'en' ? 'Language & Direction' : 'اللغة واتجاه العرض'}
            </h3>
          </div>
          <span className="badge badge-muted" style={{ fontSize: 11 }}>
            {lang === 'en' ? 'Instant Switch' : 'تطبيق فوري'}
          </span>
        </div>

        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          {lang === 'en'
            ? 'Choose your interface language. The layout direction adjusts automatically (RTL for Arabic, LTR for English).'
            : 'اختر لغة واجهة التطبيق. يتم ضبط اتجاه النصوص والقوائم تلقائياً (من اليمين لليسار للعربية، ومن اليسار لليمين للإنجليزية).'}
        </p>

        <div className="grid grid-2" style={{ gap: 12 }}>
          <button
            type="button"
            className={`card ${lang === 'ar' ? 'soft-sector' : ''}`}
            onClick={() => handleLanguageChange('ar')}
            style={{
              padding: '14px 16px',
              border: lang === 'ar' ? '2px solid var(--sector)' : '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'start',
              background: lang === 'ar' ? 'color-mix(in srgb, var(--sector) 10%, var(--surface))' : 'var(--surface)',
              borderRadius: 12,
              transition: 'all 0.2s ease',
            }}
          >
            <div className="row-between">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 18 }}>🇸🇦</span>
                <span style={{ fontWeight: 900, fontSize: 14.5 }}>العربية (Arabic)</span>
              </div>
              {lang === 'ar' && <CheckCircle2 size={18} style={{ color: 'var(--sector)' }} />}
            </div>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              واجهة كاملة باللغة العربية مع اتجاه من اليمين إلى اليسار (RTL)
            </p>
          </button>

          <button
            type="button"
            className={`card ${lang === 'en' ? 'soft-sector' : ''}`}
            onClick={() => handleLanguageChange('en')}
            style={{
              padding: '14px 16px',
              border: lang === 'en' ? '2px solid var(--sector)' : '1px solid var(--border)',
              cursor: 'pointer',
              textAlign: 'start',
              background: lang === 'en' ? 'color-mix(in srgb, var(--sector) 10%, var(--surface))' : 'var(--surface)',
              borderRadius: 12,
              transition: 'all 0.2s ease',
            }}
          >
            <div className="row-between">
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 18 }}>🇬🇧</span>
                <span style={{ fontWeight: 900, fontSize: 14.5 }}>English</span>
              </div>
              {lang === 'en' && <CheckCircle2 size={18} style={{ color: 'var(--sector)' }} />}
            </div>
            <p className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              English interface with Left-to-Right (LTR) layout
            </p>
          </button>
        </div>
      </div>

      {/* ── قسم المظهر والسمة (Appearance & Theme) ── */}
      <div className="card">
        <div className="row-between wrap" style={{ marginBottom: 12, gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Sun size={18} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>{t('settings.appearance')}</h3>
          </div>
          <span className="badge badge-muted" style={{ fontSize: 11 }}>
            {lang === 'en' ? 'Theme Mode' : 'وضع السمة'}
          </span>
        </div>

        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          {lang === 'en'
            ? 'Select your preferred visual theme for reading questions and taking mock exams comfortably.'
            : 'اختر المظهر المريح لعينيك أثناء قراءة الأسئلة وحل الامتحانات التجريبية.'}
        </p>

        <div className="grid grid-3" style={{ gap: 10 }}>
          <button
            type="button"
            className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => applyTheme('light')}
            style={{ padding: '12px 14px', borderRadius: 12, justifyContent: 'center' }}
          >
            <Sun size={16} />
            <span>{t('settings.light')}</span>
          </button>

          <button
            type="button"
            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => applyTheme('dark')}
            style={{ padding: '12px 14px', borderRadius: 12, justifyContent: 'center' }}
          >
            <Moon size={16} />
            <span>{t('settings.dark')}</span>
          </button>

          <button
            type="button"
            className={`btn ${theme === 'auto' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => applyTheme('auto')}
            style={{ padding: '12px 14px', borderRadius: 12, justifyContent: 'center' }}
          >
            <Laptop size={16} />
            <span>{lang === 'en' ? 'System' : 'تلقائي'}</span>
          </button>
        </div>
      </div>

      {/* ── الحساب والهوية ── */}
      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12, fontWeight: 800 }}>{t('settings.account')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">{t('settings.name')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">{t('settings.email')}</label>
            <input className="input" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={saveIdentity} style={{ width: 'fit-content' }}>
            <Save size={15} /> {t('common.save')}
          </button>
        </div>
      </div>

      {/* ── المجال والتخصص المعتمد (ثابت ومحمي) ── */}
      <div className="card">
        <div className="row-between wrap" style={{ marginBottom: 12, gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>
              {lang === 'en' ? 'Accredited Specialization' : 'المجال والتخصص المعتمد'}
            </h3>
          </div>
          <span className="badge badge-brand" style={{ fontSize: 11 }}>
            {lang === 'en' ? 'Certified & Fixed' : 'معتمد وثابت'}
          </span>
        </div>

        <div className="card soft-sector" style={{ padding: 16, borderRadius: 14 }}>
          <div className="row-between wrap" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
                {lang === 'en' ? 'Sector & Discipline' : 'القسم والمجال المهني'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                {sectorName(sector) || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
                {lang === 'en' ? 'Exact Specialty' : 'التخصص الدقيق'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2, color: 'var(--sector)' }}>
                {specName(spec) || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
                {lang === 'en' ? 'Exam Blueprint' : 'نموذج التدريب والامتحان'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>
                {spec?.blueprint ? `${spec.blueprint.questions} سؤال · ${spec.blueprint.minutes} دقيقة` : (lang === 'en' ? 'Comprehensive Banks' : 'شامل لجميع بنوك التخصص')}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid color-mix(in srgb, var(--sector) 20%, transparent)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔒</span>
            <span>
              {lang === 'en'
                ? 'Your professional specialization is linked to your question banks and training track, and is fixed for your account.'
                : 'التخصص المهني مرتبط بنماذج الأسئلة وبنوك التدريب الخاصة بك، وهو ثابت للحساب لضمان دقة التقييم والمحاكاة.'}
            </span>
          </div>
        </div>
      </div>

      {/* ── جهة ومركز الاختبار وخطة الذكاء الاصطناعي ── */}
      <div className="card">
        <div className="row-between wrap" style={{ marginBottom: 12, gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <MapPin size={18} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>
              {lang === 'en' ? 'Target Exam Center & AI Study Plan' : 'مركز الاختبار المستهدف وخطة المذاكرة الذكية'}
            </h3>
          </div>
          <span className="badge badge-brand" style={{ fontSize: 11 }}>
            {lang === 'en' ? 'Customized Plan' : 'خطة مخصصة'}
          </span>
        </div>

        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          {lang === 'en'
            ? 'Choose your target exam center. The AI will customize high-yield blueprint priorities and tailored weekly milestones for you.'
            : 'اختر المركز أو الهيئة التي ستختبر فيها (صنعاء، عدن، أو السعودية). سيقوم الذكاء الاصطناعي بتخصيص خطة المذاكرة وفق أحدث نماذج ذلك المركز.'}
        </p>

        <div className="field mb-3">
          <label className="label">{lang === 'en' ? 'Target Exam Authority / Center' : 'جهة / مركز الامتحان المستهدف'}</label>
          <div className="chip-row">
            {[
              ['all', lang === 'en' ? 'General / All Centers' : 'عام / كل المراكز'],
              ['صنعاء', lang === 'en' ? "Sana'a (Medical Council)" : 'صنعاء (المجلس الطبي)'],
              ['عدن', lang === 'en' ? 'Aden (Medical Council)' : 'عدن (المجلس الطبي)'],
              ['السعودية', lang === 'en' ? 'Saudi Arabia (Prometric / SCFHS)' : 'السعودية (برومترك / الهيئة)'],
            ].map(([v, l]) => (
              <span
                key={v}
                className={`chip${targetLocation === v ? ' active' : ''}`}
                onClick={() => {
                  setTargetLocation(v);
                  setProfile({ targetLocation: v });
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="row wrap" style={{ gap: 10, marginTop: 14 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={regeneratePlan}
            disabled={busyPlan}
            style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {busyPlan ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            <span>
              {busyPlan
                ? (lang === 'en' ? 'Generating Custom AI Plan...' : 'جاري بناء الخطة الذكية المخصصة...')
                : (lang === 'en' ? 'Regenerate Custom AI Study Plan' : 'توليد / تحديث خطة المذاكرة الذكية للمركز المختار')}
            </span>
          </button>
        </div>
      </div>

      {/* ── إدارة البيانات والنسخ الاحتياطي ── */}
      <div className="card">
        <h3 style={{ fontSize: 15.5, marginBottom: 12, fontWeight: 800 }}>{t('settings.myData')}</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          {lang === 'en'
            ? 'Export your questions progress, answers history, and mock results to a local file, or restore from a backup.'
            : 'تصدير سجلك التدريبي وأجوبتك ونتائج المحاكاة في ملف محلي، أو استعادة سجلك في أي وقت.'}
        </p>
        <div className="row wrap" style={{ gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={doExport}>
            <Download size={14} /> {t('settings.export')}
          </button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={14} /> {t('settings.import')}
            <input type="file" accept="application/json" hidden onChange={doImport} />
          </label>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm(t('settings.resetConfirm'))) {
                resetProgress();
                flash(t('settings.resetDone'));
              }
            }}
          >
            <Trash2 size={14} /> {t('settings.reset')}
          </button>
        </div>
      </div>

      <button className="btn btn-danger btn-block" onClick={() => { logout(); router.replace('/'); }} style={{ marginTop: 8 }}>
        <LogOut size={16} /> {t('nav.logout')}
      </button>

      {/* ── نافذة الدفع والتجديد المحلية (الكريمي وجيب) ── */}
      <YemeniPaymentModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        packageInfo={selectedPkg || packages[0] || { id: 'monthly', name: 'باقة كفاءة الشاملة', price: 5, currency: 'USD' }}
        userProfile={profile}
        onSuccess={() => {
          flash(
            lang === 'en'
              ? 'Payment request sent! Your account will be activated once confirmed by administration.'
              : 'تم إرسال إشعار الدفع بنجاح! سيتم تفعيل حسابك فور مطابقة الحوالة من قبل الإدارة.',
            5000
          );
        }}
      />
    </div>
  );
}
