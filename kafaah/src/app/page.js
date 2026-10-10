'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Award, Smartphone, BrainCircuit, Clock,
  BookOpen, CheckCircle2, ArrowLeft, ArrowRight,
  Stethoscope, Compass, Scale, Calculator, GraduationCap,
  Download, Send, Mail, Phone, MessageSquare, Star, Zap,
  Check, X, HelpCircle, Layers, ShieldCheck
} from 'lucide-react';

export default function LandingPage() {
  const [activeDiscipline, setActiveDiscipline] = useState('health');
  
  // Interactive Smart Contact & Concierge State
  const [contactSent, setContactSent] = useState(false);
  const [contactTopic, setContactTopic] = useState('health');
  const [contactCouncil, setContactCouncil] = useState('المجلس الطبي اليمني');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTimeframe, setContactTimeframe] = useState('خلال 30 يوماً');
  const [contactNotes, setContactNotes] = useState('');
  const [contactTicket, setContactTicket] = useState('');



  const disciplinesData = {
    health: {
      title: 'القطاع الصحي والطبي',
      icon: Stethoscope,
      themeColor: '#10b981',
      bgLight: '#ecfdf5',
      badge: 'امتحانات البورد ورخص المزاولة الصحية',
      desc: 'بنوك أسئلة سريرية ضخمة تغطي الطب البشري، طب الأسنان، الصيدلة السريرية، التمريض، والمختبرات وفق معايير المجلس الطبي اليمني، الهيئة السعودية SMLE، دبي DHA، والبرومترك.',
      stats: '+12,500 سؤال سريري • بنك أوزموسيس المدمج',
      councils: ['المجلس الطبي اليمني', 'الهيئة السعودية للتخصصات SMLE', 'هيئة الصحة بدبي DHA', 'امتحانات البرومترك الدولية']
    },
    eng: {
      title: 'الهندسة والتقنية',
      icon: Compass,
      themeColor: '#f97316',
      bgLight: '#fff7ed',
      badge: 'الاعتماد والتصنيف المهني الهندسي',
      desc: 'تدريب مكثف على معايير الكود الهندسي الوطني، التصميم الإنشائي، إدارة المشاريع الهندسية، الأنظمة الكهربائية والميكانيكية، وهندسة البرمجيات والأمن السيبراني.',
      stats: '+4,200 سؤال تطبيقي • اختبارات التصنيف المهني',
      councils: ['نقابة المهندسين', 'هيئة المهندسين السعودية', 'اتحاد المهندسين العرب', 'شهادات الاعتماد الدولية']
    },
    law: {
      title: 'القانون والمحاماة',
      icon: Scale,
      themeColor: '#0d9488',
      bgLight: '#f0fdfa',
      badge: 'رخصة مزاولة المحاماة والقضاء',
      desc: 'نماذج اختبارات مزاولة مهنة المحاماة، اللوائح والمرافعات المدنية والجنائية، الأنظمة التجارية والشركات، وأخلاقيات المهنة القضائية المعتمدة.',
      stats: '+3,100 سؤال وحالة قضائية • فقه القضاء والأنظمة',
      councils: ['نقابة المحامين', 'المعهد العالي للقضاء', 'وزارات العدل', 'هيئات التحكيم المعتمدة']
    },
    finance: {
      title: 'المحاسبة والمالية',
      icon: Calculator,
      themeColor: '#f59e0b',
      bgLight: '#fffbeb',
      badge: 'زمالة المحاسب القانوني (SOCPA / CPA)',
      desc: 'معايير المحاسبة الدولية IFRS، التدقيق والمراجعة، إدارة المخاطر المالية، الزكاة والضرائب، وإدارة الاستثمار المصرفي والأسواق المالية.',
      stats: '+3,800 سؤال تحليلي • زمالات مهنية معتمدة',
      councils: ['جمعية المحاسبين القانونيين', 'الهيئة السعودية للمحاسبين SOCPA', 'الزمالة الدولية CPA']
    },
    edu: {
      title: 'التربية والتعليم',
      icon: GraduationCap,
      themeColor: '#f43f5e',
      bgLight: '#fff1f2',
      badge: 'رخصة المعلم المهنية',
      desc: 'المعايير التربوية العامة، أساليب واستراتيجيات التدريس الحديثة، التقويم التربوي، والقيادة والإشراف المدرسي التخصصي.',
      stats: '+2,900 سؤال تربوي • معايير الرخص المعتمدة',
      councils: ['هيئة تقويم التعليم والتدريب', 'المراكز الوطنية للقياس', 'وزارات التربية والتعليم']
    }
  };

  const topicCouncils = {
    health: ['المجلس الطبي اليمني', 'الهيئة السعودية SMLE', 'هيئة الصحة بدبي DHA', 'المجلس القطري DHP', 'وزارة الصحة الكويتية', 'البورد العربي والبرومترك الدولي'],
    eng: ['نقابة المهندسين اليمنيين', 'الهيئة السعودية للمهندسين SCE', 'جمعية المهندسين الإماراتية', 'امتحان التصنيف المهني الهندسي'],
    law: ['نقابة المحامين اليمنيين', 'المعهد العالي للقضاء', 'رخصة المحاماة العدلية', 'هيئات التحكيم المعتمدة'],
    finance: ['جمعية المحاسبين القانونيين', 'الهيئة السعودية للمحاسبين SOCPA', 'الزمالة الدولية CPA', 'معهد CFA'],
    edu: ['المراكز الوطنية للقياس', 'هيئة تقويم التعليم والتدريب', 'الرخصة المهنية للمعلمين', 'وزارات التربية والتعليم']
  };

  const currentDisc = disciplinesData[activeDiscipline];
  const DiscIcon = currentDisc.icon;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const generatedTicket = 'KAF-' + Math.floor(100000 + Math.random() * 900000);
    setContactTicket(generatedTicket);
    setContactSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text)' }}>

      {/* ── 1. LAUNCH PROMOTIONAL BANNER (WARM GOLD & AMBER) ── */}
      <div style={{
        background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
        color: '#0f172a',
        padding: '11px 16px',
        textAlign: 'center',
        fontSize: 'clamp(12.5px, 2.5vw, 14px)',
        fontWeight: 800,
        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.25)'
      }}>
        🎉 <strong>بمناسبة التدشين الرسمي:</strong> وصول مجاني كامل وغير محدود لمدة <strong>3 أشهر</strong> لجميع بنوك الأسئلة وامتحانات المحاكاة لكافة التخصصات!
        <Link href="/register" style={{
          marginRight: 12,
          background: '#0f172a',
          color: '#ffffff',
          padding: '4px 14px',
          borderRadius: 999,
          textDecoration: 'none',
          fontSize: 12,
          fontWeight: 800,
          display: 'inline-block'
        }}>
          سجّل الآن واستفد من العرض
        </Link>
      </div>

      {/* ── 2. HERO SECTION (SUNLIT & BRIGHT) ── */}
      <section style={{
        padding: 'clamp(3rem, 7vw, 6rem) 1.5rem clamp(2.5rem, 6vw, 4.5rem)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          
          {/* Accreditation Tag with Multi-Color Aura */}
          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              borderRadius: 999,
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              color: '#059669',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}>
              <Award size={17} style={{ color: '#d97706' }} />
              المنظومة الوطنية الأولى لتراخيص مزاولة المهن والاعتماد المهني
            </span>
          </div>

          {/* Main Hero Header (High Contrast Charcoal) */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.18,
            letterSpacing: '-0.5px',
            color: '#0f172a',
            maxWidth: 1000,
            margin: '0 auto 24px'
          }}>
            اجتز اختبار مزاولة المهنة والترخيص المهني{' '}
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 50%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              من المحاولة الأولى
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)',
            color: '#475569',
            lineHeight: 1.8,
            maxWidth: 820,
            margin: '0 auto 36px',
            fontWeight: 600
          }}>
            المنصة الشاملة لكافة التخصصات (الصحية، الهندسية، القانونية، المالية، والتربوية). 
            بنوك أسئلة سريرية وتطبيقية محكمة، محاكاة دقيقة لقاعة الامتحان، ومعالج ذكي مدعوم بـ <strong style={{ color: '#059669' }}>Groq AI</strong> لبناء خطتك الأكاديمية وقياس جاهزيتك.
          </p>

          {/* Bright Multi-Color CTAs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 48
          }}>
            <Link href="/register" className="btn btn-emerald" style={{ padding: '16px 36px', fontSize: 16 }}>
              <Sparkles size={18} />
              ابدأ الآن مجاناً (عرض 3 أشهر بالكامل)
              <ArrowLeft size={16} />
            </Link>

            <a href="#app" className="btn btn-coral" style={{ padding: '16px 32px', fontSize: 16 }}>
              <Smartphone size={18} />
              استعراض تطبيق الجوال الرسمي
            </a>

            <Link href="/login" className="btn btn-ghost" style={{ padding: '16px 30px', fontSize: 15 }}>
              تسجيل الدخول
            </Link>
          </div>

          {/* 4 Multi-Color Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            maxWidth: 1000,
            margin: '0 auto 52px'
          }}>
            {[
              { num: '+26,500', label: 'سؤال تخصصي معتمد', color: '#059669', bg: '#ecfdf5', border: '#10b981' },
              { num: '5 مجالات', label: 'كافة المهن الوطنية', color: '#ea580c', bg: '#fff7ed', border: '#f97316' },
              { num: '99.4%', label: 'نسبة اجتياز المشتركين', color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
              { num: '3 أشهر', label: 'مجاناً بالكامل بمناسبة التدشين', color: '#e11d48', bg: '#fff1f2', border: '#f43f5e' }
            ].map((st, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '22px 16px',
                  textAlign: 'center',
                  background: st.bg,
                  border: `1.5px solid ${st.border}40`,
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 900, color: st.color, marginBottom: 4 }}>
                  {st.num}
                </div>
                <div style={{ fontSize: 13.5, color: '#334155', fontWeight: 700 }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* HERO SUNLIT VISUAL SHOWCASE */}
          <div style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-float)',
            background: '#ffffff',
            maxWidth: 1040,
            margin: '0 auto'
          }}>
            <img 
              src="/images/hero-bright-visual.svg" 
              alt="كفاءة — واجهة قمرة الامتحان الطبي والتطبيقي الذكية"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

        </div>
      </section>

      {/* ── 3. DISCIPLINES SECTION (#disciplines) ── */}
      <section id="disciplines" style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: '#d97706', fontSize: 13.5, fontWeight: 800, letterSpacing: 1 }}>
              التغطية الشاملة لكافة الرخص والاعتمادات
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)', fontWeight: 900, color: '#0f172a', marginTop: 8 }}>
              اختر مجالك المهني واستكشف معايير الامتحان
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, marginTop: 8 }}>
              بنوك أسئلة مخصصة ومطابقة 100% لمعايير الهيئات والمجالس الوطنية
            </p>
          </div>

          {/* Discipline Selector Buttons (Multi-Color) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 36
          }}>
            {Object.keys(disciplinesData).map((key) => {
              const d = disciplinesData[key];
              const Icon = d.icon;
              const isSelected = activeDiscipline === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDiscipline(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '13px 22px',
                    borderRadius: 16,
                    background: isSelected ? d.themeColor : '#ffffff',
                    border: `2px solid ${d.themeColor}`,
                    color: isSelected ? '#ffffff' : d.themeColor,
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.22s ease',
                    boxShadow: isSelected ? `0 6px 20px ${d.themeColor}40` : 'var(--shadow-subtle)'
                  }}
                >
                  <Icon size={20} />
                  {d.title}
                </button>
              );
            })}
          </div>

          {/* Active Discipline Showcase Card */}
          <motion.div
            key={activeDiscipline}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              padding: 'clamp(2rem, 5vw, 3.5rem)',
              border: `2px solid ${currentDisc.themeColor}50`,
              maxWidth: 980,
              margin: '0 auto',
              background: currentDisc.bgLight,
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: '#ffffff',
                  border: `2px solid ${currentDisc.themeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <DiscIcon size={30} style={{ color: currentDisc.themeColor }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
                    {currentDisc.title}
                  </h3>
                  <span style={{ fontSize: 13.5, color: currentDisc.themeColor, fontWeight: 800 }}>
                    {currentDisc.badge}
                  </span>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: `1.5px solid ${currentDisc.themeColor}40`,
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 13.5,
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                {currentDisc.stats}
              </div>
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.85, color: '#334155', marginBottom: 26, fontWeight: 600 }}>
              {currentDisc.desc}
            </p>

            {/* Councils Alignment */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#475569', marginBottom: 12 }}>
                معتمد ومطابق لاختبارات الهيئات والمجالس التالية:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {currentDisc.councils.map((c, i) => (
                  <span key={i} style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    background: '#ffffff',
                    border: `1.5px solid ${currentDisc.themeColor}35`,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#0f172a',
                    boxShadow: 'var(--shadow-subtle)'
                  }}>
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Link
                href="/register"
                className="btn"
                style={{
                  background: currentDisc.themeColor,
                  color: '#ffffff',
                  padding: '14px 32px',
                  fontSize: 15.5,
                  boxShadow: `0 4px 18px ${currentDisc.themeColor}40`
                }}
              >
                ابدأ التدريب على هذا التخصص مجاناً
                <ArrowLeft size={16} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>



      {/* ── 5. MOBILE APP SECTION (#app) (TITANIUM MOCKUP) ── */}
      <section id="app" style={{
        padding: 'clamp(3.5rem, 6vw, 5.5rem) 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'transparent'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 48,
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                color: '#ea580c',
                fontSize: 13,
                fontWeight: 900,
                background: '#ffedd5',
                border: '1px solid #f97316',
                padding: '4px 14px',
                borderRadius: 999
              }}>
                تطبيق كفاءة الرسمي للهواتف الذكية (iOS &amp; Android)
              </span>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)', fontWeight: 900, color: '#0f172a', margin: '16px 0 20px' }}>
                منصتك وتدريبك معك أينما كنت
              </h2>

              <p style={{ fontSize: 15.5, color: '#475569', lineHeight: 1.85, marginBottom: 24, fontWeight: 600 }}>
                صُمم تطبيق كفاءة ليعمل بسلاسة فائقة كتطبيق جوال رسمي.
                عند فتح التطبيق، يتم توجيهك فوراً إلى تسجيل الدخول أو لوحة التحكم الشخصية دون أي إعلانات أو تكرار لصفحات الترويج، لتبدأ جلساتك فوراً.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {[
                  'واجهة تطبيق مصممة هندسياً لسهولة الحل والتنقل بيد واحدة على الجوال',
                  'تنبيهات ذكية بمواعيد جلسات المذاكرة وأهداف الأسئلة اليومية',
                  'مزامنة لحظية للتقدم بين هاتفك وحاسوبك المكتبي'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#1e293b', fontWeight: 700 }}>
                    <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Install / Download Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link href="/register?mode=app" className="btn btn-coral" style={{ padding: '14px 30px', fontSize: 15.5 }}>
                  <Download size={18} />
                  تثبيت واستخدام التطبيق الآن
                </Link>

                <Link href="/login?mode=app" className="btn btn-ghost" style={{ padding: '14px 26px', fontSize: 15 }}>
                  دخول عبر التطبيق
                </Link>
              </div>

              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 14, fontWeight: 600 }}>
                يدعم هواتف iPhone (iOS) وأجهزة Android والحواسب اللوحية iPad
              </div>
            </div>

            {/* Titanium Mobile Mockup */}
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/images/app-mobile-mockup.svg" 
                alt="تطبيق كفاءة للجوال"
                style={{ maxWidth: 360, width: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. ACADEMIC CONCIERGE & MULTI-CHANNEL CONTACT SECTION (#contact) ── */}
      <section id="contact" style={{
        padding: 'clamp(4.5rem, 8vw, 7rem) 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'transparent',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              borderRadius: 999,
              background: 'rgba(236, 253, 245, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #10b981',
              color: '#047857',
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 14,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
            }}>
              <ShieldCheck size={16} style={{ color: '#059669' }} />
              مركز خدمة المشتركين والدعم الفني
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#0f172a',
              margin: '8px 0 14px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}>
              تواصل مع فريق منصة كـفـاءة
            </h2>
            <p style={{
              color: '#475569',
              fontSize: 'clamp(15px, 2.2vw, 17px)',
              maxWidth: 760,
              margin: '0 auto',
              lineHeight: 1.85,
              fontWeight: 600,
              fontFamily: 'var(--font-body)'
            }}>
              فريق الدعم الفني وخدمة العملاء في خدمتكم للإجابة على استفساراتكم والمساعدة في تفعيل الحسابات وتلقي الملاحظات والاقتراحات.
            </p>
          </div>

          {/* 3 VIP Direct Communication Pods */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 20,
            marginBottom: 36
          }}>
            {/* Pod 1: WhatsApp Support */}
            <div className="glass-card" style={{
              padding: '24px 26px',
              border: '1.5px solid rgba(16, 185, 129, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1.5px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    <MessageSquare size={24} />
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#ecfdf5',
                    color: '#047857',
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #10b981'
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                    متصل الآن
                  </span>
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                  واتساب خدمة المشتركين والدعم الفني
                </h4>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, marginBottom: 18, fontWeight: 600 }}>
                  تواصل مباشر وفوري عبر الواتساب للمساعدة في الحسابات وتفعيل الاشتراك والرد على الأسئلة.
                </p>
              </div>
              <a
                href="https://wa.me/967770000000?text=مرحباً%20منصة%20كفاءة،%20لدي%20استفسار%20بخصوص%20المنصة"
                target="_blank"
                rel="noreferrer"
                className="btn btn-emerald"
                style={{ width: '100%', padding: '13px 20px', fontSize: 14.5 }}
              >
                <MessageSquare size={17} />
                مراسلة الدعم الفني عبر واتساب
              </a>
            </div>

            {/* Pod 2: Official Telegram Channel */}
            <div className="glass-card" style={{
              padding: '24px 26px',
              border: '1.5px solid rgba(13, 148, 136, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                    border: '1.5px solid #0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0d9488'
                  }}>
                    <BookOpen size={24} />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#f0fdfa',
                    color: '#0f766e',
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #0d9488',
                    fontFamily: 'var(--font-numbers)'
                  }}>
                    تحديثات وإعلانات
                  </span>
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                  قناة المنصة الرسمية على تليجرام
                </h4>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, marginBottom: 18, fontWeight: 600 }}>
                  تحديثات الأسئلة، إعلانات الدورات الامتحانية، وأحدث الميزات في منصة وتطبيق كفاءة.
                </p>
              </div>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: 14.5,
                  border: '1.5px solid #0d9488',
                  color: '#0f766e',
                  background: 'rgba(240, 253, 250, 0.8)'
                }}
              >
                الانضمام إلى قناة تليجرام
                <ArrowLeft size={16} />
              </a>
            </div>

            {/* Pod 3: Institutional Hotline & Desk */}
            <div className="glass-card" style={{
              padding: '24px 26px',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1.5px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706'
                  }}>
                    <Phone size={24} />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#fffbeb',
                    color: '#b45309',
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #f59e0b'
                  }}>
                    دعم 7 أيام في الأسبوع
                  </span>
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                  الهاتف والبريد الإلكتروني المعتمد
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, color: '#334155', fontWeight: 700, marginBottom: 16 }}>
                  <div>📞 هاتف: <strong dir="ltr" style={{ color: '#0f172a', fontFamily: 'var(--font-numbers)' }}>+967 770 000 000</strong></div>
                  <div>✉️ بريد: <strong style={{ color: '#0f172a' }}>support@kafaah.edu</strong></div>
                  <div>⏰ ساعات العمل: 8:00 صباحاً – 11:30 مساءً</div>
                </div>
              </div>
              <a
                href="tel:+967770000000"
                className="btn btn-gold"
                style={{ width: '100%', padding: '13px 20px', fontSize: 14.5 }}
              >
                <Phone size={16} />
                الاتصال برقم خدمة المشتركين
              </a>
            </div>
          </div>

          {/* Clean Support Form (Glass Panel) */}
          <div className="glass-panel" style={{
            borderRadius: 24,
            padding: 'clamp(1.8rem, 4vw, 2.8rem)',
            position: 'relative'
          }}>
            <div style={{ marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                إرسال رسالة أو استفسار لفريق الدعم
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                أدخل بياناتك وسنقوم بالرد عليك في أقرب وقت ممكن
              </p>
            </div>

            {contactSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '2.5rem 1rem' }}
              >
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '3px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#059669'
                }}>
                  <CheckCircle2 size={38} />
                </div>

                <h4 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                  تم استلام رسالتك بنجاح!
                </h4>
                <p style={{ color: '#334155', fontSize: 15.5, lineHeight: 1.8, maxWidth: 580, margin: '0 auto 20px', fontWeight: 600 }}>
                  شكراً لتواصلك معنا، تم تحويل رسالتك إلى فريق الدعم الفني وسيقوم أحد ممثلينا بالرد عليك عبر الواتساب أو البريد الإلكتروني.
                </p>

                <button
                  onClick={() => setContactSent(false)}
                  className="btn btn-ghost"
                  style={{ padding: '12px 24px', fontSize: 14.5 }}
                >
                  إرسال رسالة أخرى
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Name & Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                      الاسم الكامل:
                    </label>
                    <input
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input"
                      style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                      type="text"
                      placeholder="اكتب اسمك الكامل..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                      رقم الواتساب أو الهاتف:
                    </label>
                    <input
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', direction: 'ltr', textAlign: 'right' }}
                      type="tel"
                      placeholder="+967 770 000 000"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                      البريد الإلكتروني:
                    </label>
                    <input
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="input"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', direction: 'ltr', textAlign: 'right' }}
                      type="email"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                {/* Request Type Selector */}
                <div>
                  <label style={{ fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    نوع الرسالة أو الاستفسار:
                  </label>
                  <select
                    className="input"
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <option>استفسار عن تفعيل الحساب والاشتراك المجاني (3 أشهر)</option>
                    <option>ملاحظة أو تدقيق على سؤال أو إجابة في بنك الأسئلة</option>
                    <option>طلب إضافة تخصص أو دورة امتحانية جديدة</option>
                    <option>مشكلة تقنية في الموقع أو التطبيق</option>
                    <option>اقتراح لتطوير خدمات المنصة</option>
                    <option>استفسار عام آخر</option>
                  </select>
                </div>

                {/* Message Body */}
                <div>
                  <label style={{ fontSize: 13.5, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
                    نص الرسالة أو الاستفسار:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="input"
                    style={{ background: 'rgba(255, 255, 255, 0.9)', resize: 'vertical' }}
                    placeholder="اكتب تفاصيل استفسارك أو ملاحظتك هنا..."
                  />
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                  <button
                    type="submit"
                    className="btn btn-emerald"
                    style={{
                      padding: '14px 32px',
                      fontSize: 16,
                      borderRadius: 14
                    }}
                  >
                    <Send size={18} />
                    إرسال الرسالة إلى الدعم الفني
                  </button>

                  <a
                    href="https://wa.me/967770000000?text=مرحباً%20منصة%20كفاءة،%20أحتاج%20إلى%20مساعدة"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                    style={{
                      padding: '14px 22px',
                      fontSize: 14.5,
                      borderRadius: 14,
                      border: '1.5px solid #10b981',
                      color: '#047857',
                      background: 'rgba(236, 253, 245, 0.7)'
                    }}
                  >
                    <MessageSquare size={17} />
                    تواصل مباشر عبر واتساب
                  </a>
                </div>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── 7. CLEAN PUBLIC FOOTER (NO INTERNAL PREMATURE LINKS) ── */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '3.5rem 1.5rem 2.5rem',
        borderTop: '1px solid rgba(226, 232, 240, 0.7)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            marginBottom: 28
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
              <img 
                src="/kafaah-icon.svg" 
                alt="شعار كفاءة" 
                style={{ width: 46, height: 46 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)' }}>
                  كـفـاءة
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#059669', background: '#ecfdf5', border: '1px solid #10b981', padding: '2px 8px', borderRadius: 999 }}>
                    المنظومة الوطنية
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 700, marginTop: 3 }}>
                  تراخيص مزاولة المهن والاعتماد المهني
                </span>
              </div>
            </Link>

            {/* Public footer links only */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <a href="#disciplines" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>التخصصات المعتمدة</a>
              <a href="#app" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>تطبيق الجوال</a>
              <a href="#contact" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>تواصل معنا</a>
              <Link href="/login" style={{ color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>تسجيل الدخول</Link>
              <Link href="/register" style={{ color: '#059669', textDecoration: 'none', fontSize: 14, fontWeight: 800 }}>إنشاء حساب (3 أشهر مجاناً)</Link>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            fontSize: 12.5,
            color: '#64748b',
            fontWeight: 600
          }}>
            <p>
              © 2026 كـفـاءة — المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني. جميع الحقوق محفوظة.
            </p>
            <p>
              منصة تأهيلية وأكاديمية محكمة لإعداد الممارسين لاجتياز امتحانات البورد والمجالس الوطنية المعتمدة.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
