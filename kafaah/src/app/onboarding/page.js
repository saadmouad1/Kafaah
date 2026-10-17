'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HeartPulse, HardHat, Scale, Landmark, GraduationCap, Check, ArrowLeft, ArrowRight,
  Sparkles, Loader2, CalendarDays, Building2, Target, UserRound,
} from 'lucide-react';
import { useKafaah } from '../../lib/context/KafaahProvider';
import { SECTORS } from '../../lib/content';

const ICONS = { health: HeartPulse, engineering: HardHat, law: Scale, finance: Landmark, education: GraduationCap };

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, sectors: ctxSectors, t, lang, sectorName, specName, sectorTagline, localize } = useKafaah();
  const sectors = ctxSectors || SECTORS;

  // إذا كان المستخدم قد اختار تخصصه مسبقاً، يُمنع من إعادة فتح صفحة التهيئة ويُوجّه مباشرة للوحة التحكم
  useEffect(() => {
    if (profile?.specId && profile?.sectorId) {
      router.replace('/dashboard');
    }
  }, [profile?.specId, profile?.sectorId, router]);

  const [step, setStep] = useState(0);
  const [sectorId, setSectorId] = useState(profile.sectorId || null);
  const [specId, setSpecId] = useState(profile.specId || null);
  const [level, setLevel] = useState(profile.level || 'graduate');
  const [examDate, setExamDate] = useState(profile.examDate || '');
  const [name, setName] = useState(profile.name || '');
  const [plan, setPlan] = useState(profile.plan || null);
  const [busy, setBusy] = useState(false);

  const sector = useMemo(() => sectors.find((s) => s.id === sectorId), [sectors, sectorId]);
  const spec = useMemo(() => sector?.specializations.find((sp) => sp.id === specId), [sector, specId]);

  async function generatePlan() {
    setBusy(true);
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnostic_plan',
          payload: {
            profession: sectorName(sector),
            specialty: specName(spec),
            country: localize(spec?.country),
            authority: localize(spec?.authority),
            exam_name: `${localize(spec?.authority)} — ${specName(spec)}`,
            level,
            examDate,
          },
        }),
      });
      const data = await res.json();
      setPlan(data.plan);
      return data.plan;
    } catch {
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const p = plan || (await generatePlan());
    setProfile({ name: name.trim() || profile.name, sectorId, specId, level, examDate: examDate || null, plan: p || profile.plan, planGeneratedAt: new Date().toISOString() });
    router.push('/dashboard');
  }

  const steps = [t('onb.step0'), t('onb.step1'), t('onb.step2')];
  const levels = [['student', t('onb.level.student')], ['graduate', t('onb.level.graduate')], ['practitioner', t('onb.level.practitioner')]];

  return (
    <div className="container container-narrow page" style={{ maxWidth: 760 }}>
      {/* stepper */}
      <div className="row" style={{ justifyContent: 'center', gap: 8, marginBottom: 22 }}>
        {steps.map((s, i) => (
          <div key={i} className="row" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{
                width: 30, height: 30, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13,
                background: i <= step ? 'linear-gradient(135deg,var(--sector-1),var(--sector-2))' : 'var(--surface-3)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
              }}>{i < step ? <Check size={15} /> : i + 1}</span>
              <span className="desktop-only" style={{ fontWeight: 700, fontSize: 13, color: i <= step ? 'var(--text)' : 'var(--text-muted)' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <span style={{ width: 24, height: 2, background: 'var(--border)' }} />}
          </div>
        ))}
      </div>

      {/* step 0: sector */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-3">
            <h1 style={{ fontSize: 23 }}>{t('onb.chooseField')}</h1>
            <p className="text-muted mt-1">{t('onb.chooseFieldSub')}</p>
          </div>
          <div className="grid grid-2">
            {sectors.map((s) => {
              const Icon = ICONS[s.icon] || HeartPulse;
              const active = sectorId === s.id;
              return (
                <button key={s.id} className="card card-hover" onClick={() => { setSectorId(s.id); setSpecId(null); }}
                  style={{ textAlign: 'start', cursor: 'pointer', borderColor: active ? s.color : 'var(--border)', background: active ? `color-mix(in srgb, ${s.color} 10%, var(--surface))` : 'var(--surface)' }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: `color-mix(in srgb, ${s.color} 16%, transparent)`, color: s.color, display: 'grid', placeItems: 'center' }}>
                      <Icon size={24} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{sectorName(s)}</div>
                      <div className="text-muted" style={{ fontSize: 12.5 }}>{t('onb.specCount', { n: s.specializations.length })} · {sectorTagline(s)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="btn btn-primary btn-lg btn-block mt-3" disabled={!sectorId} onClick={() => setStep(1)}>
            {t('onb.next')} <ArrowLeft size={17} />
          </button>
        </motion.div>
      )}

      {/* step 1: specialization */}
      {step === 1 && sector && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-3">
            <span className="badge badge-brand" style={{ background: `color-mix(in srgb, ${sector.color} 14%, transparent)`, color: sector.color }}>{sectorName(sector)}</span>
            <h1 className="mt-2" style={{ fontSize: 23 }}>{t('onb.chooseSpec')}</h1>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {sector.specializations.map((sp) => {
              const active = specId === sp.id;
              return (
                <button key={sp.id} className="card card-hover" onClick={() => setSpecId(sp.id)}
                  style={{ textAlign: 'start', cursor: 'pointer', borderColor: active ? sector.color : 'var(--border)', background: active ? `color-mix(in srgb, ${sector.color} 9%, var(--surface))` : 'var(--surface)' }}>
                  <div className="row-between">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{specName(sp)}</div>
                      <div className="text-muted row" style={{ fontSize: 12.5, gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                        <span className="row" style={{ gap: 4 }}><Building2 size={12} /> {localize(sp.authority)}</span>
                        <span>·</span>
                        <span>{localize(sp.country)}</span>
                      </div>
                    </div>
                    {active && <span style={{ color: sector.color }}><Check size={20} /></span>}
                  </div>
                  <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                    <span className="badge badge-muted"><Target size={11} /> {t('onb.questionBadge', { n: sp.blueprint?.questions })}</span>
                    <span className="badge badge-muted">{t('onb.minutesBadge', { n: sp.blueprint?.minutes })}</span>
                    <span className="badge badge-muted">{t('onb.passBadge', { n: sp.blueprint?.passScore })}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="row" style={{ gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}><ArrowRight size={16} /> {t('onb.back')}</button>
            <button className="btn btn-primary flex-1" disabled={!specId} onClick={() => setStep(2)}>{t('onb.next')} <ArrowLeft size={17} /></button>
          </div>
        </motion.div>
      )}

      {/* step 2: details + plan */}
      {step === 2 && spec && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack" style={{ gap: 16 }}>
          <div className="text-center">
            <h1 style={{ fontSize: 23 }}>{t('onb.lastStep')}</h1>
            <p className="text-muted mt-1">{t('onb.lastStepSub', { spec: specName(spec) })}</p>
          </div>

          <div className="card">
            <div className="stack" style={{ gap: 12 }}>
              <div className="field">
                <label className="label">{t('onb.yourName')}</label>
                <div style={{ position: 'relative' }}>
                  <UserRound size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
                  <input className="input" style={{ paddingInlineStart: 42 }} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onb.namePlaceholder')} />
                </div>
              </div>
              <div className="field">
                <label className="label">{t('onb.yourLevel')}</label>
                <div className="chip-row">
                  {levels.map(([v, l]) => (
                    <span key={v} className={`chip${level === v ? ' active' : ''}`} onClick={() => setLevel(v)}>{l}</span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">{t('onb.examDate')}</label>
                <div style={{ position: 'relative' }}>
                  <CalendarDays size={17} style={{ position: 'absolute', insetInlineStart: 14, top: 15, color: 'var(--text-muted)' }} />
                  <input type="date" className="input" style={{ paddingInlineStart: 42 }} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {plan && (
            <div className="card soft-sector fade-up">
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <Sparkles size={17} style={{ color: 'var(--gold-dark)' }} />
                <h3 style={{ fontSize: 16 }}>{t('onb.planReady')}</h3>
              </div>
              <div className="row" style={{ gap: 16, marginBottom: 8 }}>
                <div><div className="stat-label">{t('onb.readiness')}</div><div className="stat-num" style={{ color: 'var(--sector)' }}>{plan.readiness}%</div></div>
                <div><div className="stat-label">{t('onb.dailyTarget')}</div><div className="stat-num">{plan.dailyTarget}</div></div>
              </div>
              {plan.summary && <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>{plan.summary}</p>}
            </div>
          )}

          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={busy}>
              <ArrowRight size={16} /> {t('onb.back')}
            </button>
            <button
              className="btn btn-primary btn-lg flex-1"
              onClick={finish}
              disabled={busy}
              style={{ fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>{lang === 'en' ? 'Generating smart plan & preparing dashboard...' : 'جاري بناء خطتك الذكية وإعداد لوحة التحكم...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{plan ? t('onb.startTraining') : (lang === 'en' ? 'Generate Smart Plan & Start Training' : 'توليد الخطة الذكية وبدء التدريب')}</span>
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>
            ⚡ {lang === 'en'
              ? 'AI will tailor a diagnostic study plan for your exam date and level, then navigate directly to your dashboard.'
              : 'سيقوم المساعد الذكي بتوليد خطة مذاكرة مخصصة لاختبارك ومستواك المهني ونقلك فوراً للوحة التحكم.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
