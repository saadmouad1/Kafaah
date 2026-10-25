'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award, Flame, Target, BookOpen, Building2, CalendarDays,
  Repeat, GraduationCap, ShieldCheck, CheckCircle2, ArrowLeft,
  Sparkles, Settings, Activity, AlertTriangle, MapPin
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { getStats, subscribe } from '../../../lib/progress';

export default function ProfilePage() {
  const { profile, sector, spec, t, sectorName, specName, locale, lang } = useKafaah();
  const [s, setS] = useState(null);

  useEffect(() => {
    setS(getStats());
    return subscribe(() => setS(getStats()));
  }, []);

  const stats = s || { answered: 0, accuracy: 0, streak: 0, saved: 0, bestMock: 0, mocks: 0 };
  const initials = (profile.name || t('nav.user')).trim().charAt(0);

  const bp = spec?.blueprint
    ? t('profile.blueprintFmt', {
        q: spec.blueprint.questions,
        m: spec.blueprint.minutes,
        p: spec.blueprint.passScore,
      })
    : '—';

  const readinessScore = Math.min(100, Math.round(
    ((stats.accuracy || 0) * 0.5) +
    (Math.min(stats.answered, 500) / 500 * 30) +
    (Math.min(stats.mocks || 0, 10) / 10 * 20)
  ));

  const targetLocationLabel =
    profile.targetLocation === 'صنعاء' ? 'صنعاء — المجلس الطبي اليمني' :
    profile.targetLocation === 'عدن' ? 'عدن — المجلس الطبي ووزارة الصحة' :
    profile.targetLocation === 'السعودية' ? 'المملكة العربية السعودية — الهيئة SCFHS / برومترك' :
    'كافة المراكز المعتمدة (اليمن والسعودية)';

  const isSubscribed = profile.subscription?.expiresAt && new Date(profile.subscription.expiresAt) > new Date();

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 840, marginInline: 'auto' }}>
      {/* ── الرأس الأكاديمي والبطاقة التعريفية ── */}
      <div
        className="card card-pad-lg"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--sector) 14%, var(--surface)), var(--surface))',
          border: '1.5px solid color-mix(in srgb, var(--sector) 25%, var(--border))',
          borderRadius: 22,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="row-between wrap" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 16 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 22,
                background: 'linear-gradient(135deg, var(--sector-1), var(--sector-2))',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 32,
                fontWeight: 900,
                boxShadow: '0 8px 24px color-mix(in srgb, var(--sector) 35%, transparent)',
              }}
            >
              {initials}
            </div>
            <div>
              <div className="row wrap" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', fontWeight: 900, margin: 0 }}>
                  {profile.name || t('profile.defaultName')}
                </h1>
                {isSubscribed ? (
                  <span className="badge badge-success" style={{ fontSize: 11.5, fontWeight: 800 }}>
                    <ShieldCheck size={13} /> حساب مفعل معتمد
                  </span>
                ) : (
                  <Link href="/dashboard/settings" className="badge badge-gold" style={{ fontSize: 11.5, fontWeight: 800, textDecoration: 'none' }}>
                    ⚡ ترقية الاشتراك
                  </Link>
                )}
              </div>
              <p className="text-muted" style={{ fontSize: 13.5, margin: '2px 0 8px' }}>
                {profile.email || 'حساب تدريب محلي'}
              </p>
              <div className="row wrap" style={{ gap: 6 }}>
                <span className="badge badge-brand">{sectorName(sector)}</span>
                <span className="badge badge-muted">{specName(spec)}</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard/settings" className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)', gap: 6 }}>
            <Settings size={14} /> تعديل البيانات
          </Link>
        </div>
      </div>

      {/* ── مؤشر الجاهزية لاجتياز الامتحان ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 20,
          padding: 20,
        }}
      >
        <div className="row-between wrap" style={{ gap: 12, marginBottom: 12 }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sector)', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                مؤشر الجاهزية لاجتياز الاختبار الرسمي
              </h3>
              <p className="text-muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                محسوب بناءً على دقة إجاباتك، وعدد الأسئلة المنجزة، واختبارات المحاكاة المكتملة
              </p>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--sector)', fontFamily: 'var(--font-numbers)' }}>
            {readinessScore}%
          </div>
        </div>

        <div className="progress" style={{ height: 10, borderRadius: 99, background: 'var(--surface-3)' }}>
          <span style={{ width: `${readinessScore}%`, background: 'linear-gradient(90deg, #3b82f6, var(--sector))' }} />
        </div>

        <div className="row-between" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>المستوى الحالي: {readinessScore >= 80 ? 'جاهز للامتحان بتفوق 🏆' : readinessScore >= 60 ? 'في مسار التقدم الجيد 📈' : 'يحتاج مزيداً من حل النماذج 📚'}</span>
          <span>الهدف الموصى به: 85%+</span>
        </div>
      </div>

      {/* ── إحصائيات الأداء السريع ── */}
      <div className="grid grid-4">
        {[
          { icon: BookOpen, label: t('home.answered'), value: stats.answered, color: 'var(--sector)' },
          { icon: Target, label: t('home.accuracy'), value: `${stats.accuracy}%`, color: '#3b82f6' },
          { icon: Flame, label: t('home.streak'), value: stats.streak, color: '#f59e0b' },
          { icon: Award, label: t('home.bestMock'), value: `${stats.bestMock}%`, color: '#8b5cf6' },
        ].map((x, i) => (
          <div key={i} className="stat-card">
            <x.icon size={20} style={{ color: x.color }} />
            <div className="stat-num mt-2" style={{ color: 'var(--text)' }}>{x.value}</div>
            <div className="stat-label">{x.label}</div>
          </div>
        ))}
      </div>

      {/* ── بيانات الاعتماد والمركز الامتحاني المستهدف ── */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
          بيانات الاعتماد والجهة الامتحانية المستهدفة
        </h3>
        <div className="stack" style={{ gap: 12 }}>
          {[
            { icon: GraduationCap, label: 'التخصص المعتمد', value: specName(spec) },
            { icon: MapPin, label: 'المركز / الهيئة الامتحانية المستهدفة', value: targetLocationLabel },
            { icon: Target, label: 'مخطط الامتحان المعتمد (Blueprint)', value: bp },
            { icon: ShieldCheck, label: 'صلاحية الحساب والتراخيص', value: isSubscribed ? `نشط حتى ${new Date(profile.subscription.expiresAt).toLocaleDateString(locale)}` : 'حساب تجريبي — انقر للترقية' },
          ].map((r, i) => (
            <div key={i} className="row" style={{ gap: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--sector)', flexShrink: 0 }}>
                <r.icon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-muted" style={{ fontSize: 12 }}>{r.label}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{r.value || '—'}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row wrap" style={{ gap: 10, marginTop: 18 }}>
          <Link href="/dashboard/mock" className="btn btn-primary">
            <Activity size={16} /> بدء محاكاة اختبار جديدة
          </Link>
          <Link href="/dashboard/mistakes" className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} /> مراجعة بنك أخطائي ({stats.mistakes || 0})
          </Link>
        </div>
      </div>
    </div>
  );
}
