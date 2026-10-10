'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ArrowLeft, ArrowRight, Award,
  BrainCircuit, ShieldCheck, Stethoscope, Compass, Scale,
  Calculator, GraduationCap, Clock, Calendar, BarChart3,
  Flame, Target, AlertCircle
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loadingAi, setLoadingAi] = useState(false);
  const [diagnosticPlan, setDiagnosticPlan] = useState(null);

  // Form selections
  const [profession, setProfession] = useState('القطاع الصحي والطبي');
  const [specialty, setSpecialty] = useState('الطب البشري والجراحة العامة');
  const [country, setCountry] = useState('المملكة العربية السعودية (SMLE / SCFHS)');
  const [goal, setGoal] = useState('اجتياز امتحان رخصة المزاولة من المحاولة الأولى');
  const [targetDate, setTargetDate] = useState('خلال شهر إلى 3 أشهر');
  const [currentLevel, setCurrentLevel] = useState('متوسط (لدي الأساسيات وأحتاج تدريباً مكثفاً على الأسئلة)');

  const disciplines = [
    { id: 'health', name: 'القطاع الصحي والطبي', icon: Stethoscope, color: '#10b981', desc: 'بشري، أسنان، صيدلة، تمريض، مختبرات...' },
    { id: 'eng', name: 'الهندسة والتقنية', icon: Compass, color: '#0284c7', desc: 'مدني، معماري، كهرباء، حاسوب وبرمجيات...' },
    { id: 'law', name: 'القانون والمحاماة', icon: Scale, color: '#6366f1', desc: 'رخصة المحاماة، القضاء، الاستشارات القانونية...' },
    { id: 'finance', name: 'المحاسبة والمالية', icon: Calculator, color: '#f59e0b', desc: 'CPA، محاسب قانوني، إدارة استثمار وبنوك...' },
    { id: 'edu', name: 'التربية والتعليم', icon: GraduationCap, color: '#f43f5e', desc: 'رخصة المعلم المهنية، القيادة التربوية...' },
  ];

  const specialtiesMap = {
    'القطاع الصحي والطبي': [
      'الطب البشري والجراحة العامة',
      'طب وجراحة الفم والأسنان',
      'الصيدلة السريرية والصناعية',
      'التمريض والرعاية الحرجة',
      'علوم المختبرات الطبية والتحاليل',
      'العلاج الطبيعي والتأهيل الطبي',
      'طب الطوارئ والعناية المركزة',
      'التصوير الطبي والأشعة'
    ],
    'الهندسة والتقنية': [
      'الهندسة المدنية والإنشائية',
      'الهندسة المعمارية والتخطيط',
      'الهندسة الكهربائية والإلكترونية',
      'الهندسة الميكانيكية والصناعية',
      'هندسة البرمجيات وعلوم الحاسوب',
      'الأمن السيبراني والشبكات'
    ],
    'القانون والمحاماة': [
      'اختبار مزاولة مهنة المحاماة',
      'القانون التجاري والشركات',
      'القانون الجنائي والمرافعات',
      'القضاء والنيابة العامة',
      'التحكيم الدولي والوساطة'
    ],
    'المحاسبة والمالية': [
      'المحاسب القانوني المعتمد (CPA / SOCPA)',
      'المحاسبة المالية والتدقيق',
      'المحاسب الإداري المعتمد (CMA)',
      'التحليل المالي وإدارة المخاطر',
      'الضرائب والزكاة المعتمدة'
    ],
    'التربية والتعليم': [
      'رخصة المعلم المهنية (المستوى العام)',
      'رخصة المعلم التخصصية (رياضيات/علوم/لغة)',
      'الإدارة والقيادة المدرسية',
      'الإرشاد الطلابي والتوجيه التربوي'
    ]
  };

  const countries = [
    { name: 'المملكة العربية السعودية (SMLE / SCFHS)', flag: '🇸🇦' },
    { name: 'الجمهورية اليمنية (المجلس الطبي والنقابات المهنية)', flag: '🇾🇪' },
    { name: 'الإمارات العربية المتحدة (DHA / MOH / DOH)', flag: '🇦🇪' },
    { name: 'دولة قطر (DHP / QCHP)', flag: '🇶🇦' },
    { name: 'دولة الكويت (وزارة الصحة والجهات المهنية)', flag: '🇰🇼' },
    { name: 'سلطنة عمان (OMSB والترخيص العماني)', flag: '🇴🇲' },
    { name: 'جمهورية مصر العربية (امتحانات مزاولة المهنة)', flag: '🇪🇬' },
    { name: 'امتحانات البرومترك والبورد الدولي (Prometric / International)', flag: '🌐' }
  ];

  // Request AI Diagnostic from Groq
  const generatePlanWithGroq = async () => {
    setLoadingAi(true);
    setStep(4);

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnostic_plan',
          payload: {
            profession,
            specialty,
            country,
            goal,
            target_date: targetDate,
            current_level: currentLevel
          }
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setDiagnosticPlan(data.plan);
        // Persist to localStorage for dashboard personalization
        localStorage.setItem('kafaah_user_profile', JSON.stringify({
          profession,
          specialty,
          country,
          goal,
          targetDate,
          diagnosticPlan: data.plan,
          completedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error('Diagnostic error:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const completeOnboardingAndGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090e1a 0%, #030712 100%)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem 5rem'
    }}>
      <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        
        {/* Header Progress Tracker */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            borderRadius: 999,
            background: 'rgba(2, 132, 199, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 12
          }}>
            <BrainCircuit size={16} style={{ color: 'var(--gold)' }} />
            معالج التقييم التشخيصي الذكي (مدعوم بـ Groq AI)
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)', fontWeight: 900, color: '#ffffff' }}>
            تخصيص مسار رخصة المزاولة والاعتماد المهني
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
            أجب عن الأسئلة التالية ليقوم محرك الذكاء الاصطناعي ببناء خطتك التدريبية وتجهيز بنك الأسئلة المعتمد
          </p>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  width: s === step ? 36 : 12,
                  height: 10,
                  borderRadius: 999,
                  background: s === step ? 'var(--gold)' : s < step ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: DISCIPLINE & SPECIALTY */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid var(--border)' }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--gold)', color: '#0b132b', width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>1</span>
              اختر مجالك المهني العام
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              منصة كفاءة تغطي تراخيص كافة المهن المعتمدة في المجالس والهيئات الوطنية
            </p>

            {/* Disciplines Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
              gap: 12,
              marginBottom: 28
            }}>
              {disciplines.map((d) => {
                const Icon = d.icon;
                const isSelected = profession === d.name;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setProfession(d.name);
                      setSpecialty(specialtiesMap[d.name][0]);
                    }}
                    style={{
                      background: isSelected ? 'rgba(2, 132, 199, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isSelected ? d.color : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: 16,
                      padding: 16,
                      textAlign: 'right',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${d.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={20} style={{ color: d.color }} />
                      </div>
                      {isSelected && <CheckCircle2 size={18} style={{ color: d.color }} />}
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 800, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
                      {d.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Specific Specialty Select */}
            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: 8 }}>
                التخصص المهني الدقيق:
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="input"
                style={{ fontSize: 15, fontWeight: 600, padding: '14px 18px', background: 'var(--surface-card)' }}
              >
                {specialtiesMap[profession]?.map((sp, idx) => (
                  <option key={idx} value={sp} style={{ background: '#0b1329', color: '#fff' }}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Button */}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep(2)}
                className="btn btn-primary"
                style={{ padding: '12px 30px', fontSize: 15 }}
              >
                التالي: تحديد جهة الترخيص
                <ArrowLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: COUNTRY & LICENSURE BOARD */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid var(--border)' }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--gold)', color: '#0b132b', width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>2</span>
              الدولة أو المجلس الذي تتقدم لاختبار المزاولة فيه
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20 }}>
              يتم ضبط بنك الأسئلة ونموذج الامتحان تلقائياً لمطابقة معايير الدولة المختارة
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {countries.map((c, idx) => {
                const isSelected = country === c.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setCountry(c.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{c.flag}</span>
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: isSelected ? 800 : 600, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {c.name}
                    </span>
                    {isSelected && <CheckCircle2 size={18} style={{ color: '#38bdf8' }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ padding: '10px 22px' }}>
                <ArrowRight size={16} />
                رجوع
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '12px 30px' }}>
                التالي: أهداف الخطة والجاهزية
                <ArrowLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: GOALS, TIMELINE & SELF-ASSESSMENT */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid var(--border)' }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--gold)', color: '#0b132b', width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>3</span>
              هدفك الأكاديمي والجدول الزمني المستهدف
            </h2>

            {/* Target Date */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: 8 }}>
                متى تخطط لخوض الامتحان الفعلي؟
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {['خلال أقل من شهر (مكثف وسريع)', 'خلال شهر إلى 3 أشهر (مثالي)', 'خلال 3 إلى 6 أشهر (تأسيسي)', 'لم يحدد موعد دقيق بعد'].map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetDate(t)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: targetDate === t ? 'rgba(245, 158, 11, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${targetDate === t ? 'var(--gold)' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: targetDate === t ? 'var(--gold-light)' : '#cbd5e1',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: 'inherit'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Level */}
            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', display: 'block', marginBottom: 8 }}>
                تقييمك لمستواك المهني والسريري الحالي:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'مبتدئ — أحتاج مراجعة شاملة للأساسيات وحل أسئلة متدرجة الصعوبة',
                  'متوسط — لدي الأساسيات وأحتاج تدريباً مكثفاً ومحاكاة للامتحان تحت الوقت',
                  'متقدم — أحتاج فقط فلترة الأسئلة الصعبة وأهم النقاط الحرجة لضمان النجاح'
                ].map((lvl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentLevel(lvl)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: currentLevel === lvl ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${currentLevel === lvl ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      fontSize: 13.5,
                      color: currentLevel === lvl ? '#ffffff' : '#cbd5e1',
                      fontWeight: currentLevel === lvl ? 700 : 500
                    }}
                  >
                    {lvl}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ padding: '10px 22px' }}>
                <ArrowRight size={16} />
                رجوع
              </button>
              <button
                onClick={generatePlanWithGroq}
                className="btn btn-gold"
                style={{ padding: '14px 34px', fontSize: 15 }}
              >
                <Sparkles size={18} />
                توليد خطتي الذكية بواسطة Groq AI
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: AI PROCESSING & DIAGNOSTIC RESULT */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', border: '1px solid var(--border)' }}
          >
            {loadingAi ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  border: '4px solid rgba(56, 189, 248, 0.2)',
                  borderTopColor: 'var(--gold)',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>
                  جاري تشغيل محرك Groq AI للتحليل السريري...
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
                  نقوم الآن بربط بنك الأسئلة المعتمد لمعايير {country} وتوليد خطتك الأكاديمية المصممة لـ {specialty}
                </p>
              </div>
            ) : diagnosticPlan ? (
              <div>
                {/* Result Top Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  marginBottom: 24
                }}>
                  <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399' }}>
                      تم بناء وتخصيص خطتك الذكية بنجاح!
                    </div>
                    <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                      تخصص {specialty} • معتمد وفق معايير {country}
                    </div>
                  </div>
                </div>

                {/* Score & Targets Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 24
                }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>نسبة الجاهزية المتوقعة حالياً</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#38bdf8' }}>
                      {diagnosticPlan.readiness_score}%
                    </div>
                    <div style={{ fontSize: 11.5, color: '#10b981', marginTop: 4 }}>
                      فرصة اجتياز قابلة للتطور إلى 98%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>هدف الأسئلة الموصى به يومياً</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--gold)' }}>
                      {diagnosticPlan.daily_target_questions} <span style={{ fontSize: 16 }}>سؤالاً</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--gold-light)', marginTop: 4 }}>
                      بمعدل ~{diagnosticPlan.estimated_study_hours} ساعة مذاكرة يومياً
                    </div>
                  </div>
                </div>

                {/* AI Diagnostic Summary */}
                <div style={{
                  padding: 20,
                  borderRadius: 16,
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  marginBottom: 24
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#38bdf8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BrainCircuit size={18} />
                    تحليل وتوصية المعلم الذكي (Groq AI)
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: '#e2e8f0' }}>
                    {diagnosticPlan.ai_diagnostic_summary}
                  </p>
                </div>

                {/* High-Yield Topics */}
                {diagnosticPlan.high_yield_topics && (
                  <div style={{ marginBottom: 28 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
                      🎯 أهم المحاور عالية الأهمية (High-Yield Topics) للامتحان:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {diagnosticPlan.high_yield_topics.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 10,
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: 13,
                            color: '#cbd5e1',
                            fontWeight: 600
                          }}
                        >
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm and Enter Dashboard CTA */}
                <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={completeOnboardingAndGoToDashboard}
                    className="btn btn-gold"
                    style={{ padding: '16px 40px', fontSize: 17, width: '100%', maxWidth: 420 }}
                  >
                    <Sparkles size={18} />
                    تفعيل الخطة والدخول إلى لوحة التحكم الخاصة بي
                  </button>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
                    مشمول ضمن عرض الانطلاق المجاني الكامل لمدة 3 أشهر
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <p>حدث خطأ في تحميل الخطة، يمكنك المتابعة إلى لوحة التحكم مباشرة.</p>
                <button onClick={completeOnboardingAndGoToDashboard} className="btn btn-primary" style={{ marginTop: 16 }}>
                  الانتقال إلى لوحة التحكم
                </button>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
