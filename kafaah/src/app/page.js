'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Award, Smartphone, BrainCircuit, Clock,
  BookOpen, CheckCircle2, ArrowLeft, ArrowRight,
  Stethoscope, Compass, Scale, Calculator, GraduationCap,
  Download, Send, Mail, Phone, MessageSquare, Star, Zap,
  Check, X, HelpCircle, Layers, ShieldCheck, CreditCard,
  Target, BarChart3, AlertCircle, RefreshCw, CheckCheck,
  ChevronLeft, FileText, WifiOff, MessageCircle, Flame
} from 'lucide-react';
import ExamCountdown from '../components/ExamCountdown';

export default function LandingPage() {
  const [activeDiscipline, setActiveDiscipline] = useState('health');
  
  // High-End Calming Entrance Animation State
  const [showIntro, setShowIntro] = useState(true);
  const [introProgress, setIntroProgress] = useState(0);

  useEffect(() => {
    // Check if user already saw the intro in this tab session
    const seen = typeof window !== 'undefined' ? sessionStorage.getItem('kafaah_welcome_seen') : null;
    if (seen) {
      setShowIntro(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setIntroProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setShowIntro(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('kafaah_welcome_seen', 'true');
            }
          }, 350);
          return 100;
        }
        return prev + 6;
      });
    }, 70);

    return () => clearInterval(progressInterval);
  }, []);

  const skipIntro = () => {
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kafaah_welcome_seen', 'true');
    }
  };

  const replayIntro = () => {
    setIntroProgress(0);
    setShowIntro(true);
  };

  // Interactive Live Simulator State in Hero
  const [simSelected, setSimSelected] = useState(null);
  const [simRevealed, setSimRevealed] = useState(false);

  // Interactive Smart Contact State
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState('استفسار عن تفعيل الحساب والاشتراك');
  const [contactNotes, setContactNotes] = useState('');

  // Sample Interactive Question for Hero Simulator
  const sampleQuestion = {
    title: 'طبيب امتياز في قسم الطوارئ يستقبل مريضاً يعاني من انخفاض ضغط الدم الحاد وارتفاع مؤشرات الالتهاب (Septic Shock).',
    question: 'وفقاً للإرشادات السريرية المعتمدة، ما هو الإجراء التشخيصي والعلاجي الأول الواجب تنفيذه ضمن حزمة الساعة الأولى؟',
    options: [
      { id: 'A', text: 'إعطاء مسكنات الألم ومراقبة الحالة مع تأجيل السوائل لحين فحص الكلى', isCorrect: false },
      { id: 'B', text: 'البدء الفوري بسوائل وريدية بلورية، قياس اللاكتات، زرع الدم، وإعطاء مضادات حيوية واسعة الطيف', isCorrect: true },
      { id: 'C', text: 'تحويل المريض مباشرة إلى العيادة الخارجية دون اتخاذ تدابير استباقية', isCorrect: false },
      { id: 'D', text: 'إعطاء مدرات البول لتقليل السوائل في الجسم ومراقبة النبض', isCorrect: false },
    ],
    explanation: 'حزمة الساعة الأولى في علاج الإنتان (Sepsis Hour-1 Bundle): تتطلب قياس مستوى اللاكتات، وسحب عينات زرع الدم قبل المضادات، ثم البدء الفوري بالمضادات الحيوية واسعة الطيف والسوائل البلورية الوريدية (30ml/kg) لاستعادة التروية النسيجية ومنع تفاقم الصدمة الإنتانية.'
  };

  const handleSelectSim = (optionId) => {
    setSimSelected(optionId);
    setSimRevealed(true);
  };

  const resetSim = () => {
    setSimSelected(null);
    setSimRevealed(false);
  };

  const disciplinesData = {
    health: {
      title: 'القطاع الصحي والطبي',
      icon: Stethoscope,
      themeColor: '#10b981',
      bgLight: '#ecfdf5',
      badge: 'امتحانات مزاولة المهن الطبية والبورد',
      desc: 'بنوك أسئلة سريرية تفاعلية تغطي الطب البشري، طب وجراحة الفم والأسنان، الصيدلة السريرية، التمريض العام، والمختبرات الطبية، مطابقة لنماذج المجلس الطبي اليمني، الهيئة السعودية SMLE، وهيئات الخليج والبرومترك.',
      stats: '+12,500 سؤال سريري مشروح',
      specsList: ['الطب البشري والجراحة', 'طب الأسنان', 'الصيدلة السريرية', 'التمريض والرعاية الحرجة', 'المختبرات الطبية', 'العلاج الطبيعي'],
      councils: ['المجلس الطبي اليمني', 'الهيئة السعودية للتخصصات SMLE', 'هيئة الصحة بدبي DHA', 'امتحانات البرومترك التخصصية']
    },
    eng: {
      title: 'الهندسة والتقنية',
      icon: Compass,
      themeColor: '#f97316',
      bgLight: '#fff7ed',
      badge: 'امتحانات التأهيل والتصنيف الهندسي',
      desc: 'تدريب مكثف على مسائل الكود الهندسي، التصميم الإنشائي، إدارة المشاريع الهندسية، الأنظمة الكهربائية والميكانيكية، وهندسة البرمجيات وتقنية المعلومات.',
      stats: '+4,200 مسألة تطبيقية محلولة',
      specsList: ['الهندسة المدنية والإنشائية', 'الهندسة المعمارية', 'الهندسة الكهربائية', 'الهندسة الميكانيكية', 'هندسة البرمجيات'],
      councils: ['نقابة المهندسين اليمنيين', 'الهيئة السعودية للمهندسين SCE', 'جمعيات المهندسين', 'معايير الاعتماد الهندسي']
    },
    law: {
      title: 'القانون والمحاماة',
      icon: Scale,
      themeColor: '#0d9488',
      bgLight: '#f0fdfa',
      badge: 'امتحانات رخصة مزاولة المحاماة',
      desc: 'نماذج اختبارات رخصة مزاولة مهنة المحاماة، اللوائح والمرافعات المدنية والجزائية، الأنظمة التجارية والشركات، وأخلاقيات وقواعد ممارسة المهنة القضائية.',
      stats: '+3,100 قضية وحالة نظامية',
      specsList: ['المحاماة والاستشارات القانونية', 'القانون الجنائي والمرافعات', 'القانون التجاري والشركات', 'الأنظمة واللوائح'],
      councils: ['نقابة المحامين', 'المعهد العالي للقضاء', 'اختبارات رخص المحاماة', 'هيئات التحكيم']
    },
    finance: {
      title: 'المحاسبة والمالية',
      icon: Calculator,
      themeColor: '#f59e0b',
      bgLight: '#fffbeb',
      badge: 'زمالة المحاسب القانوني (SOCPA / CPA)',
      desc: 'معايير المحاسبة والتقارير المالية الدولية IFRS، معايير المراجعة والتدقيق، محاسبة الزكاة والضرائب، والإدارة المالية المتقدمة للمنشآت.',
      stats: '+3,800 سؤال تحليلي ومحاسبي',
      specsList: ['المحاسبة المالية والتقارير', 'المراجعة والتدقيق الخارجي', 'الزكاة والضرائب', 'المحاسبة الإدارية والتكاليف'],
      councils: ['جمعية المحاسبين القانونيين', 'الهيئة السعودية للمحاسبين SOCPA', 'الزمالة المهنية للمحاسبين']
    },
    edu: {
      title: 'التربية والتعليم',
      icon: GraduationCap,
      themeColor: '#f43f5e',
      bgLight: '#fff1f2',
      badge: 'اختبارات الرخص المهنية للمعلمين',
      desc: 'المعايير والمهارات التربوية العامة، أساليب وطرق التدريس الفعالة، القياس والتقويم الصفي، والتعامل مع الفروق الفردية وإدارة البيئة التعليمية.',
      stats: '+2,900 سؤال تربوي وتطبيقي',
      specsList: ['التربوي العام', 'التخصصات العلمية', 'التخصصات الأدبية', 'القيادة والإشراف المدرسي'],
      councils: ['نماذج اختبارات قياس والتربية', 'معايير الرخص المهنية للمعلمين', 'كفايات التدريس']
    }
  };

  const currentDisc = disciplinesData[activeDiscipline];
  const DiscIcon = currentDisc.icon;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="landing" style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas, #f8fafc)',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* ── HIGH-END CINEMATIC & SOOTHING ENTRANCE ANIMATION ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(16px)' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse 90% 80% at 50% 40%, #0b1320 0%, #06151a 50%, #030a0e 100%)',
              color: '#ffffff',
              padding: '1.5rem',
              overflow: 'hidden',
              cursor: 'default',
              userSelect: 'none'
            }}
          >
            {/* Ambient Breathing Aurora Light (Soft on Eyes) */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.18, 0.32, 0.18],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 600,
                height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #10b981 0%, rgba(2, 132, 199, 0.4) 40%, transparent 70%)',
                filter: 'blur(90px)',
                pointerEvents: 'none'
              }}
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.12, 0.22, 0.12],
                rotate: [0, -60, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 480,
                height: 480,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f59e0b 0%, rgba(16, 185, 129, 0.3) 50%, transparent 70%)',
                filter: 'blur(85px)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Bar: Skip Button */}
            <div style={{
              position: 'absolute',
              top: 'clamp(1rem, 3vw, 2rem)',
              right: 'clamp(1rem, 3vw, 2rem)',
              zIndex: 2
            }}>
              <button
                onClick={skipIntro}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-display)'
                }}
              >
                تخطي العرض
                <ArrowLeft size={14} />
              </button>
            </div>

            {/* Central Animated Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
              zIndex: 2,
              position: 'relative'
            }}>
              {/* Emblem with Glowing Rotating Rings */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', width: 96, height: 96, marginBottom: 26 }}
              >
                {/* Rotating Outer Halo Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(16, 185, 129, 0.45)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Soft Glowing Pulsing Backdrop */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)',
                    filter: 'blur(10px)'
                  }}
                />

                {/* Center Icon Frame */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(16px)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                }}>
                  <img src="/icon.svg" alt="كـفـاءة" style={{ width: 56, height: 56, borderRadius: 12 }} />
                </div>
              </motion.div>

              {/* Brand Title with Golden Dot */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4
                }}
              >
                <span style={{
                  background: 'linear-gradient(135deg, #ffffff 30%, #a7f3d0 70%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  كـفـاءة
                </span>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 12px #f59e0b',
                  display: 'inline-block'
                }} />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(13px, 2.8vw, 15px)',
                  color: 'rgba(203, 213, 225, 0.85)',
                  fontWeight: 600,
                  lineHeight: 1.7,
                  marginBottom: 30
                }}
              >
                منصة التدريب والتحضير لاجتياز امتحانات مزاولة المهن
              </motion.p>

              {/* Slender Elegant Progress Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{ width: '100%', maxWidth: 300, marginBottom: 16 }}
              >
                <div style={{
                  height: 4,
                  width: '100%',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <motion.div
                    style={{
                      height: '100%',
                      width: `${introProgress}%`,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #0284c7 0%, #10b981 50%, #f59e0b 100%)',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.8)',
                      transition: 'width 0.1s linear'
                    }}
                  />
                </div>
              </motion.div>

              {/* Dynamic Changing Status Phrase */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: '#94a3b8',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 24
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: introProgress >= 100 ? '#10b981' : '#38bdf8',
                  boxShadow: `0 0 8px ${introProgress >= 100 ? '#10b981' : '#38bdf8'}`,
                  display: 'inline-block'
                }} />
                <span>
                  {introProgress < 40 && 'تهيئة بنوك الأسئلة والنماذج السريرية...'}
                  {introProgress >= 40 && introProgress < 80 && 'مزامنة معايير الاختبارات ونماذج البورد...'}
                  {introProgress >= 80 && 'جاهز للانطلاق والتفوق ✨'}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Animated Atmospheric Light Orbs across Body */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.12, 0.22, 0.12],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '18%',
          left: '-8%',
          width: 540,
          height: 540,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #0284c7 0%, rgba(2, 132, 199, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(85px)'
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          y: [0, -35, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '48%',
          right: '-6%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #f59e0b 0%, rgba(245, 158, 11, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(90px)'
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.14, 0.25, 0.14],
          x: [0, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '76%',
          left: '8%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #10b981 0%, rgba(16, 185, 129, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(90px)'
        }}
      />

      {/* ── 1. HERO SECTION WITH VALUE PROPOSITION & LIVE SIMULATOR ── */}
      <section style={{
        padding: 'clamp(2.5rem, 6vw, 4.5rem) 1.25rem clamp(3rem, 7vw, 5rem)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Top Pill Badge */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 18px',
                borderRadius: 999,
                background: '#ecfdf5',
                border: '1.5px solid #10b981',
                color: '#059669',
                fontSize: 'clamp(12px, 2.4vw, 13.5px)',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                boxShadow: '0 0 8px #10b981'
              }} />
              منصة التدريب والتحضير لاجتياز امتحانات مزاولة المهنة
            </motion.span>
          </div>

          {/* Main Title & Subtitle */}
          <div style={{ textAlign: 'center', maxWidth: 950, margin: '0 auto 36px' }}>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.2,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: 20
              }}
            >
              تدرّب بذكاء على نماذج الامتحانات واجتز مزاولة مهنتك{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                من المحاولة الأولى
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: 'clamp(1.05rem, 2.1vw, 1.25rem)',
                color: '#475569',
                lineHeight: 1.8,
                maxWidth: 820,
                margin: '0 auto',
                fontWeight: 600
              }}
            >
              منصتك التدريبية المتخصصة لطلاب وخريجي المهن الصحية، الهندسية، القانونية، والمالية في <strong>اليمن والسعودية</strong>. 
              آلاف الأسئلة المشروحة مع التعليل العلمي، محاكاة حقيقية لقاعة الاختبار، ومعالج ذكي يحلل جاهزيتك ويكتشف مواطن ضعفك.
            </motion.p>

            {/* Single Unified Primary CTA Block (Clean & Focused) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 32
              }}
            >
              <Link
                href="/register"
                className="btn btn-emerald btn-lg"
                style={{
                  padding: '16px 36px',
                  fontSize: 16.5,
                  fontWeight: 900,
                  borderRadius: 16,
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <Sparkles size={19} />
                اشترك الآن وابدأ التدريب
                <ArrowLeft size={18} />
              </Link>

              <a
                href="#disciplines"
                className="btn btn-ghost"
                style={{
                  padding: '16px 26px',
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 16,
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff'
                }}
              >
                <BookOpen size={17} style={{ color: '#059669' }} />
                استكشف التخصصات ونماذج الأسئلة
              </a>
            </motion.div>

            {/* Trust Badges Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              marginTop: 22,
              fontSize: 13,
              color: '#64748b',
              fontWeight: 700
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} /> تفعيل فوري للاشتراك عبر الكريمي وجيب
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} /> يعمل على الجوال والحاسوب
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} /> بنوك أسئلة محدثة لعام 2026
              </span>
            </div>
          </div>

          {/* ── عداد تنازلي لموعد دورة الامتحان القادمة (Hero Urgency Widget) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{ maxWidth: 960, margin: '0 auto 36px' }}
          >
            <ExamCountdown
              title="العد التنازلي لدورة امتحانات مزاولة المهنة القادمة"
              subtitle="المجلس الطبي اليمني وهيئة التخصصات السعودية — احسم قرارك اليوم وابدأ التحضير المكثف؛ الطلاب الذين يذاكرون مبكراً يحققون نسبة نجاح تتجاوز 92% من أول محاولة!"
              ctaText="احسم اشتراكك وابدأ التحضير"
              ctaHref="#pricing"
            />
          </motion.div>

          {/* ── HERO INTERACTIVE COMPONENT: LIVE PRACTICE SIMULATOR ── */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="card"
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1.5px solid color-mix(in srgb, var(--border) 80%, rgba(255, 255, 255, 0.8))',
              borderRadius: 24,
              boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.08), 0 4px 20px rgba(16, 185, 129, 0.08)',
              position: 'relative'
            }}
          >
            {/* Simulator Header */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 16,
              marginBottom: 20,
              borderBottom: '1.5px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a' }}>
                    جرّب محاكاة سؤال حقيقي الآن
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                    شاهد كيف يشرح لك نظام «كفاءة» كل خيار سريرياً وتطبيقياً
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: 12,
                  fontWeight: 800,
                  border: '1px solid #fde68a'
                }}>
                  <Clock size={13} />
                  محاكاة بيئة الامتحان
                </span>
                {simRevealed && (
                  <button
                    onClick={resetSim}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={12} />
                    إعادة التجربة
                  </button>
                )}
              </div>
            </div>

            {/* Question Box */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '18px 20px',
              marginBottom: 20
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#059669', marginBottom: 6 }}>
                الحالة السريرية • القطاع الطبي والصحي
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.7, marginBottom: 8 }}>
                {sampleQuestion.title}
              </p>
              <p style={{ fontSize: 15.5, fontWeight: 900, color: '#0f172a', lineHeight: 1.7 }}>
                {sampleQuestion.question}
              </p>
            </div>

            {/* Answer Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {sampleQuestion.options.map((opt) => {
                const isSelected = simSelected === opt.id;
                let bg = '#ffffff';
                let border = '1.5px solid #cbd5e1';
                let textColor = '#1e293b';

                if (simRevealed) {
                  if (opt.isCorrect) {
                    bg = '#ecfdf5';
                    border = '2px solid #10b981';
                    textColor = '#065f46';
                  } else if (isSelected && !opt.isCorrect) {
                    bg = '#fef2f2';
                    border = '2px solid #ef4444';
                    textColor = '#991b1b';
                  }
                } else if (isSelected) {
                  bg = '#f0fdf4';
                  border = '2px solid #10b981';
                }

                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: simRevealed ? 1 : 1.008 }}
                    whileTap={{ scale: simRevealed ? 1 : 0.995 }}
                    onClick={() => handleSelectSim(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'right',
                      padding: '14px 18px',
                      borderRadius: 14,
                      background: bg,
                      border: border,
                      color: textColor,
                      cursor: simRevealed ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 14.5,
                      fontWeight: 700,
                      lineHeight: 1.6,
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: opt.isCorrect && simRevealed ? '#10b981' : (isSelected && !opt.isCorrect && simRevealed ? '#ef4444' : '#e2e8f0'),
                        color: (opt.isCorrect && simRevealed) || (isSelected && !opt.isCorrect && simRevealed) ? '#ffffff' : '#475569',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 13,
                        fontWeight: 900,
                        flexShrink: 0
                      }}>
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {simRevealed && opt.isCorrect && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: '#059669',
                        background: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: 8,
                        flexShrink: 0
                      }}>
                        <Check size={14} strokeWidth={3} /> الإجابة الصحيحة
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation Drawer on Selection */}
            <AnimatePresence>
              {simRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: 16,
                    padding: '18px 20px',
                    marginTop: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#047857', fontWeight: 900, fontSize: 14 }}>
                    <CheckCheck size={18} />
                    الشرح والتعليل السريري المعتمد:
                  </div>
                  <p style={{ fontSize: 14, color: '#064e3b', lineHeight: 1.75, fontWeight: 600 }}>
                    {sampleQuestion.explanation}
                  </p>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                      href="/register"
                      className="btn btn-emerald btn-sm"
                      style={{ fontSize: 13, fontWeight: 800, borderRadius: 10 }}
                    >
                      تدرّب على آلاف الأسئلة المشابهة الآن
                      <ArrowLeft size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

        </div>
      </section>


      {/* ── 2. WHAT DO YOU BENEFIT? (ماذا تستفيد من كفاءة؟) ── */}
      <section id="features" style={{
        padding: 'clamp(3.5rem, 7vw, 5.5rem) 1.25rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 48px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#059669',
              fontSize: 13.5,
              fontWeight: 800,
              background: '#ecfdf5',
              padding: '5px 16px',
              borderRadius: 999,
              border: '1.5px solid #10b981',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)'
            }}>
              <Sparkles size={14} />
              لماذا يختار المتدربون منصة كفاءة؟
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginTop: 16,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              كل ما تحتاجه للنجاح في امتحانك{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #0d9488 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                دون تشتت أو ضياع وقت
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: '#475569',
              fontSize: 16,
              marginTop: 12,
              lineHeight: 1.85,
              fontWeight: 600
            }}>
              صممنا المنصة بناءً على معايير قاعات الاختبارات الفعلية للتخلص من رهبة الامتحان ورفع جاهزيتك بثقة كاملة.
            </p>
          </div>

          {/* 4 Core Value Cards with Micro-Animations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 22
          }}>
            {[
              {
                icon: FileText,
                color: '#059669',
                bg: '#ecfdf5',
                border: '#10b981',
                title: 'نماذج أسئلة متكررة ومحدثة',
                desc: 'تغطية شاملة لأسئلة امتحانات المجلس الطبي، الهيئة السعودية SMLE، والبورد المهني في اليمن والخليج لضمان مواكبة أحدث صيغ الأسئلة.'
              },
              {
                icon: CheckCircle2,
                color: '#0284c7',
                bg: '#f0f9ff',
                border: '#38bdf8',
                title: 'شرح فوري وتفصيلي لكل خيار',
                desc: 'لا تحفظ الإجابة فقط! افهم السبب والتعليل العلمي الدقيق وراء صحة الخيار ولماذا تعتبر الخيارات الأخرى خاطئة.'
              },
              {
                icon: Clock,
                color: '#d97706',
                bg: '#fffbeb',
                border: '#f59e0b',
                title: 'محاكاة كاملة لضغط الاختبار',
                desc: 'اختبر نفسك في بيئة مطابقة لقاعة الامتحان الفعلي بمؤقت زمني وتوزيع درجات حقيقي لتكسر حاجز الخوف والتوتر.'
              },
              {
                icon: AlertCircle,
                color: '#e11d48',
                bg: '#fff1f2',
                border: '#fb7185',
                title: 'سجل ذكي للأخطاء والتكرار',
                desc: 'أي سؤال تخطئ فيه ينتقل تلقائياً إلى بنك أخطائك الخاص، لتتمكن من مراجعته وإعادة حله حتى تتقن المفهوم بنسبة 100%.'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6 }}
                  className="card"
                  style={{
                    padding: '28px 24px',
                    borderRadius: 20,
                    background: 'color-mix(in srgb, var(--surface, #ffffff) 88%, transparent)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid color-mix(in srgb, var(--border) 80%, rgba(255, 255, 255, 0.8))',
                    boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.06)'
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: card.bg,
                    border: `1.5px solid ${card.border}`,
                    color: card.color,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 18,
                    boxShadow: `0 4px 14px ${card.color}20`
                  }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#0f172a',
                    marginBottom: 10,
                    lineHeight: 1.3
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14.5,
                    color: '#475569',
                    lineHeight: 1.85,
                    fontWeight: 600
                  }}>
                    {card.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* ── Comparison Banner: Traditional Studying vs Kafaah ── */}
          <div style={{
            marginTop: 48,
            background: 'color-mix(in srgb, var(--surface, #ffffff) 80%, transparent)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid color-mix(in srgb, var(--border) 80%, rgba(255, 255, 255, 0.8))',
            borderRadius: 24,
            padding: 'clamp(1.8rem, 4vw, 2.8rem)',
            boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              textAlign: 'center',
              fontSize: 21,
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 28,
              lineHeight: 1.3
            }}>
              الفرق بين المذاكرة التقليدية والتدريب عبر منصة كفاءة
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 24
            }}>
              {/* Old Traditional Way */}
              <div style={{
                background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
                border: '1.5px solid #fecdd3',
                borderRadius: 18,
                padding: '24px 22px'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#e11d48',
                  fontWeight: 900,
                  fontSize: 16,
                  marginBottom: 16
                }}>
                  <X size={20} strokeWidth={3} /> المذاكرة التقليدية المتعبة
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 13,
                  fontSize: 14,
                  color: '#475569',
                  fontWeight: 600,
                  lineHeight: 1.8
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>• ملازم ورقية ومراجع مشتتة بدون ترتيب أو تنظيم</div>
                  <div style={{ display: 'flex', gap: 10 }}>• أسئلة قديمة قد لا تطابق نماذج امتحانات العام الحالي</div>
                  <div style={{ display: 'flex', gap: 10 }}>• عدم معرفة سبب صحة الإجابة أو الوقوع في الأخطاء الشائعة</div>
                  <div style={{ display: 'flex', gap: 10 }}>• توتر وصدمة يوم الامتحان من ضغط الوقت والشاشة الإلكترونية</div>
                </div>
              </div>

              {/* Kafaah Modern Way */}
              <div style={{
                background: 'color-mix(in srgb, var(--surface, #ffffff) 94%, transparent)',
                border: '2px solid #10b981',
                borderRadius: 18,
                padding: '24px 22px',
                boxShadow: '0 10px 28px rgba(16, 185, 129, 0.12)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#059669',
                  fontWeight: 900,
                  fontSize: 16,
                  marginBottom: 16
                }}>
                  <Check size={20} strokeWidth={3} /> التدريب الذكي عبر كفاءة
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 13,
                  fontSize: 14,
                  color: '#1e293b',
                  fontWeight: 700,
                  lineHeight: 1.8
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>✓ بنوك أسئلة مجمعة ومصنفة حسب المواد والتخصص الدقيق</div>
                  <div style={{ display: 'flex', gap: 10 }}>✓ نماذج امتحانات محدثة دورياً تحاكي صيغ 2026 الفعلية</div>
                  <div style={{ display: 'flex', gap: 10 }}>✓ شرح سريري وتطبيقي فوري يعلمك لماذا هذا الخيار صحيح</div>
                  <div style={{ display: 'flex', gap: 10 }}>✓ تدريب بمؤقت الامتحان وتحليل دقيق لنسبة جاهزيتك قبل دخول القاعة</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ── 3. DISCIPLINES SECTION (#disciplines & #sectors) ── */}
      <section id="disciplines" style={{
        padding: 'clamp(3.5rem, 7vw, 5.5rem) 1.25rem',
        position: 'relative'
      }}>
        {/* Invisible anchor for #sectors */}
        <span id="sectors" style={{ position: 'absolute', top: -80, left: 0 }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#059669',
              fontSize: 13.5,
              fontWeight: 800,
              background: '#ecfdf5',
              padding: '5px 16px',
              borderRadius: 999,
              border: '1.5px solid #10b981',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)'
            }}>
              <Layers size={14} />
              التغطية التخصصية الشاملة
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginTop: 14,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              اختر مجالك المهني واكتشف{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                نماذج بنوك الأسئلة المعتمدة
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: '#475569',
              fontSize: 16,
              marginTop: 10,
              fontWeight: 600,
              lineHeight: 1.85
            }}>
              بنوك أسئلة متكاملة ومصنفة لتلبية معايير امتحانات البورد والمزاولة في اليمن والمملكة والخليج.
            </p>
          </div>

          {/* Discipline Selector Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 32
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
                    gap: 8,
                    padding: '12px 20px',
                    borderRadius: 14,
                    background: isSelected ? d.themeColor : 'color-mix(in srgb, var(--surface, #ffffff) 86%, transparent)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1.5px solid ${isSelected ? d.themeColor : '#cbd5e1'}`,
                    color: isSelected ? '#ffffff' : '#334155',
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 8px 22px ${d.themeColor}38` : '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <Icon size={18} />
                  {d.title}
                </button>
              );
            })}
          </div>

          {/* Active Discipline Card */}
          <motion.div
            key={activeDiscipline}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
            style={{
              padding: 'clamp(2rem, 4vw, 3rem)',
              border: `2px solid ${currentDisc.themeColor}50`,
              maxWidth: 960,
              margin: '0 auto',
              background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              borderRadius: 24,
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 4px 18px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: currentDisc.bgLight,
                  border: `1.5px solid ${currentDisc.themeColor}`,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: `0 4px 14px ${currentDisc.themeColor}25`
                }}>
                  <DiscIcon size={28} style={{ color: currentDisc.themeColor }} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.2
                  }}>
                    {currentDisc.title}
                  </h3>
                  <span style={{ fontSize: 13, color: currentDisc.themeColor, fontWeight: 800 }}>
                    {currentDisc.badge}
                  </span>
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--font-numbers)',
                background: currentDisc.bgLight,
                border: `1.5px solid ${currentDisc.themeColor}40`,
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {currentDisc.stats}
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15.5,
              lineHeight: 1.85,
              color: '#334155',
              marginBottom: 22,
              fontWeight: 600
            }}>
              {currentDisc.desc}
            </p>

            {/* Specialties Included */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10 }}>
                التخصصات المتوفرة في هذا القسم:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {currentDisc.specsList.map((spec, i) => (
                  <span key={i} style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: 'color-mix(in srgb, var(--surface, #ffffff) 80%, transparent)',
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b'
                  }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Exam Blueprint Reference */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10 }}>
                متوافق ومطابق لنماذج امتحانات:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {currentDisc.councils.map((c, i) => (
                  <span key={i} style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
                    border: `1.5px solid ${currentDisc.themeColor}35`,
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: '#0f172a'
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
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 900,
                  borderRadius: 14,
                  boxShadow: `0 8px 22px ${currentDisc.themeColor}38`
                }}
              >
                ابدأ التدريب في {currentDisc.title}
                <ArrowLeft size={16} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>


      {/* ── 4. MOBILE APP SECTION (#app) ── */}
      <section id="app" style={{
        padding: 'clamp(3.5rem, 7vw, 5.5rem) 1.25rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 40,
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#ea580c',
                fontSize: 13,
                fontWeight: 900,
                background: '#ffedd5',
                border: '1.5px solid #f97316',
                padding: '5px 16px',
                borderRadius: 999,
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.12)'
              }}>
                <Smartphone size={14} />
                تطبيق الويب السحابي المتطور (PWA) للهواتف الذكية
              </span>

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)',
                fontWeight: 900,
                color: '#0f172a',
                margin: '18px 0 16px',
                lineHeight: 1.25,
                letterSpacing: '-0.02em'
              }}>
                تدرّب من جوالك في أي وقت ومن أي مكان{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 45%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  بأعلى سرعة وسلاسة
                </span>
              </h2>

              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15.5,
                color: '#475569',
                lineHeight: 1.85,
                marginBottom: 24,
                fontWeight: 600
              }}>
                تطبيق ويب تقدمي خفيف وسريع مصمم خصيصاً ليناسب وتيرة عمل ودراسة الممارسين. حل الأسئلة السريرية، تابع شروحات الذكاء الاصطناعي، واستعرض إحصائياتك من هاتفك مباشرة بتزامن سحابي دائم.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                {[
                  { icon: Smartphone, text: 'واجهة مريحة ومصممة للتنقل السريع وحل الأسئلة بيد واحدة' },
                  { icon: BrainCircuit, text: 'وصول مباشر وسريع لشات الذكاء الاصطناعي وشروحات الأسئلة' },
                  { icon: RefreshCw, text: 'مزامنة سحابية فورية لكافة نتائجك وإجاباتك بين هاتفك وحاسوبك' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14.5, color: '#1e293b', fontWeight: 700 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#fff7ed',
                        border: '1px solid #ffedd5',
                        color: '#ea580c',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={16} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Single Clear Install Action */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <Link
                  href="/register?mode=app"
                  className="btn btn-coral"
                  style={{
                    padding: '14px 28px',
                    fontSize: 15.5,
                    borderRadius: 14,
                    fontWeight: 900,
                    boxShadow: '0 8px 24px rgba(249, 115, 22, 0.28)'
                  }}
                >
                  <Download size={18} />
                  تثبيت التطبيق والوصول السريع
                </Link>
              </div>

              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12.5,
                color: '#64748b',
                marginTop: 14,
                fontWeight: 600
              }}>
                يعمل مباشرة على أجهزة iPhone و Android والحواسب بدون الحاجة لمتجر تطبيقات
              </div>
            </div>

            {/* Mobile Mockup Graphic */}
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/images/app-mobile-mockup.svg" 
                alt="تطبيق كفاءة للهواتف" 
                style={{
                  maxWidth: 340,
                  width: '100%',
                  height: 'auto',
                  margin: '0 auto',
                  display: 'block',
                  filter: 'drop-shadow(0 20px 35px rgba(15, 23, 42, 0.12))'
                }}
              />
            </div>
          </div>

        </div>
      </section>


      {/* ── 5. PRICING & SPECIAL LAUNCH OFFER (#pricing) ── */}
      <section id="pricing" style={{
        padding: 'clamp(4rem, 8vw, 6rem) 1.25rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              borderRadius: 999,
              background: '#fef3c7',
              border: '1.5px solid #f59e0b',
              color: '#92400e',
              fontSize: 13.5,
              fontWeight: 900,
              marginBottom: 14,
              boxShadow: '0 2px 12px rgba(245, 158, 11, 0.15)'
            }}>
              <Sparkles size={16} style={{ color: '#d97706' }} />
              عرض الإطلاق الحصري · خصم 50% لفترة محدودة
            </span>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 12,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              استثمارك الأمثل لاجتياز الامتحان{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                بأعلى معدل تفوق
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: '#475569',
              fontSize: 16,
              maxWidth: 640,
              margin: '0 auto',
              lineHeight: 1.85,
              fontWeight: 600
            }}>
              وصول كامل وغير محدود لكافة بنوك الأسئلة، المحاكاة، والشروحات بسعر رمزي في متناول كل طالب وخريج.
            </p>
          </div>

          {/* Two High-Converting Pricing Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 24,
            marginBottom: 28,
            alignItems: 'stretch',
          }}>
            {/* Card 1: 3-Months Package (The Golden Hero) */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 244, 0.95) 100%)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '2.5px solid #10b981',
              borderRadius: 24,
              padding: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              boxShadow: '0 20px 45px -10px rgba(16, 185, 129, 0.25)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute',
                top: -14,
                right: 24,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                padding: '5px 16px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <Flame size={14} />
                الأكثر طلباً للامتحان · وفر 40% 🔥
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 23, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      باقة الـ 3 أشهر (المكثفة)
                    </h3>
                    <p style={{ fontSize: 13.5, color: '#059669', fontWeight: 800, marginTop: 4 }}>
                      الخيار الأفضل للاستعداد الشامل لدورة الامتحان
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div style={{ background: '#ecfdf5', borderRadius: 16, padding: '14px 18px', border: '1px solid #a7f3d0', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 800 }}>
                      $20 USD
                    </span>
                    <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 900 }}>
                      وفر 40%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: '#047857', lineHeight: 1, fontFamily: 'var(--font-numbers)' }}>
                      $12
                    </span>
                    <span style={{ fontSize: 14, color: '#065f46', fontWeight: 800 }}>
                      USD / 3 أشهر كاملة (4$ شهرياً فقط!)
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
                  {[
                    'صلاحية 90 يوماً متواصلة حتى موعد الامتحان',
                    'وصول كامل لجميع بنوك تخصصك (+35,000 سؤال)',
                    'كل النماذج الوزارية لسنوات (2020 - 2026)',
                    'محاكيات امتحانية غير محدودة بدون قيود',
                    'شروحات سريرية وتعليل علمي لكل خيار',
                    'سجل الأخطاء التفاعلي والمراجعة الذكية',
                    'دعم فني وتأكيد فوري عبر الواتساب',
                    'حفظ دائم للمستوى: لا يُحذف أي تقدم عند التجديد',
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 13.5, color: '#1e293b', fontWeight: 700 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/register?plan=quarterly"
                className="btn btn-emerald btn-lg"
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  fontSize: 16,
                  fontWeight: 900,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 8px 22px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Sparkles size={18} />
                اشترك في باقة الـ 3 أشهر ($12)
                <ArrowLeft size={16} />
              </Link>
            </div>

            {/* Card 2: 1-Month Package (Flexible) */}
            <div className="card" style={{
              background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '1.5px solid #cbd5e1',
              borderRadius: 24,
              padding: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute',
                top: -14,
                right: 24,
                background: '#64748b',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
              }}>
                للمراجعة السريعة · تجديد شهري
              </div>

              <div>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    الباقة الشهرية
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
                    مرونة عالية وتجديد شهر بشهر حسب رغبتك
                  </p>
                </div>

                {/* Price Display */}
                <div style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 18px', border: '1px solid #e2e8f0', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 800 }}>
                      $10 USD
                    </span>
                    <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', padding: '2px 8px', borderRadius: 999, fontSize: 11.5, fontWeight: 900 }}>
                      وفر 50%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: '#0f172a', lineHeight: 1, fontFamily: 'var(--font-numbers)' }}>
                      $5
                    </span>
                    <span style={{ fontSize: 14, color: '#475569', fontWeight: 700 }}>
                      USD / شهر واحد
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
                  {[
                    'صلاحية 30 يوماً كاملة من تاريخ التفعيل',
                    'وصول كامل لجميع بنوك تخصصك',
                    'محاكاة اختبارات تجريبية غير محدودة',
                    'شروحات سريرية وتطبيقية لجميع الأسئلة',
                    'سجل الأخطاء ومتابعة التقدم',
                    'دعم فني عبر الواتساب',
                    'حفظ دائم للمستوى التدريبي عند التجديد',
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Check size={13} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 600 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/register?plan=monthly"
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  fontSize: 15.5,
                  fontWeight: 800,
                  borderRadius: 16,
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                اشترك في الباقة الشهرية ($5)
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>

          {/* شريط طرق الدفع المحلية المعتمدة مع زر الواتساب الفوري */}
          <div style={{
            padding: '18px 22px',
            borderRadius: 18,
            background: 'var(--surface, #ffffff)',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={20} style={{ color: '#059669' }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                  طرق الدفع المحلية المعتمدة في اليمن (تحويل فوري بدون عمولات):
                </span>
              </div>

              {/* زر واتساب للدعم السريع والتأكيد الفوري */}
              <a
                href="https://wa.me/967772686817?text=مرحباً%20منصة%20كفاءة،%20أريد%20الاستفسار%20عن%20طرق%20الدفع%20وتأكيد%20الاشتراك"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
                }}
              >
                <MessageCircle size={16} />
                تواصل سريع عبر واتساب للتأكيد: 772686817
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '5px 14px', borderRadius: 999 }}>
                🏦 بنك الكريمي (عدن وصنعاء)
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 14px', borderRadius: 999 }}>
                📱 محفظة جيب (Jeeb)
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 14px', borderRadius: 999 }}>
                المستفيد: أحمد محمد حمود عبدالله
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '5px 14px', borderRadius: 999 }}>
                ⚡ يتم التفعيل فور إرسال إشعار التحويل
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              marginTop: 4,
              fontSize: 13,
              color: '#64748b',
              fontWeight: 700,
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> تفعيل فوري وتأكيد سريع للحوالة
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={15} style={{ color: '#10b981' }} /> مستوى وسجل تدريب محفوظ دائماً
              </span>
            </div>
          </div>

        </div>
      </section>


      {/* ── 6. DIRECT SUPPORT & CONTACT (#contact) ── */}
      <section id="contact" style={{
        padding: 'clamp(3.5rem, 7vw, 5.5rem) 1.25rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#059669',
              fontSize: 13,
              fontWeight: 800,
              background: '#ecfdf5',
              padding: '5px 16px',
              borderRadius: 999,
              border: '1.5px solid #10b981',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)'
            }}>
              <MessageSquare size={14} />
              خدمة العملاء والدعم الأكاديمي
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginTop: 14,
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}>
              نحن هنا لمساعدتك والإجابة على أي استفسار{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                على مدار الساعة
              </span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: '#475569',
              fontSize: 15.5,
              marginTop: 10,
              fontWeight: 600,
              lineHeight: 1.85
            }}>
              فريق الدعم الفني جاهز لمساعدتك في تفعيل الاشتراك، أو استقبال اقتراحاتك وملاحظاتك حول بنوك الأسئلة.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 20,
            marginBottom: 32
          }}>
            {/* WhatsApp Quick Chat */}
            <div className="card" style={{
              padding: '26px 24px',
              borderRadius: 20,
              border: '1.5px solid #10b981',
              background: 'color-mix(in srgb, #f0fdf4 90%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 10px 28px rgba(16, 185, 129, 0.08)'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                <MessageSquare size={24} />
              </div>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 8
              }}>
                تواصل مباشر عبر واتساب
              </h4>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.8,
                marginBottom: 20,
                fontWeight: 600
              }}>
                تواصل فوري وسريع مع فريق خدمة المشتركين للرد على استفساراتك وتفعيل الحساب.
              </p>
              <a
                href="https://wa.me/967770000000?text=مرحباً%20منصة%20كفاءة،%20أحتاج%20إلى%20مساعدة%20أو%20استفسار"
                target="_blank"
                rel="noreferrer"
                className="btn btn-emerald"
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  fontSize: 14.5,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)'
                }}
              >
                <MessageSquare size={16} />
                مراسلة الدعم عبر واتساب
              </a>
            </div>

            {/* Email Support */}
            <div className="card" style={{
              padding: '26px 24px',
              borderRadius: 20,
              border: '1.5px solid color-mix(in srgb, var(--border) 80%, rgba(255, 255, 255, 0.8))',
              background: 'color-mix(in srgb, var(--surface, #ffffff) 88%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}>
                <Mail size={24} />
              </div>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 8
              }}>
                البريد الإلكتروني المباشر
              </h4>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.8,
                marginBottom: 20,
                fontWeight: 600
              }}>
                يمكنك مراسلتنا للملاحظات والتدقيق التخصصي على بنوك الأسئلة.
              </p>
              <a
                href="mailto:support@kafaah.app"
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  fontSize: 14.5,
                  borderRadius: 14,
                  border: '1.5px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'var(--surface, #ffffff)'
                }}
              >
                <Mail size={16} />
                support@kafaah.app
              </a>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="card" style={{
            padding: 'clamp(1.6rem, 3.8vw, 2.6rem)',
            borderRadius: 24,
            border: '1.5px solid color-mix(in srgb, var(--border) 80%, rgba(255, 255, 255, 0.8))',
            background: 'color-mix(in srgb, var(--surface, #ffffff) 90%, transparent)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.06)'
          }}>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 6
            }}>
              أو أرسل رسالة مباشرة من هنا
            </h4>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: '#64748b',
              marginBottom: 22,
              fontWeight: 600
            }}>
              سنقوم بالرد عليك سريعاً عبر الواتساب أو البريد الإلكتروني.
            </p>

            {contactSent ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 19,
                  fontWeight: 900,
                  color: '#0f172a',
                  marginBottom: 6
                }}>
                  تم استلام رسالتك بنجاح!
                </h4>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  color: '#475569',
                  fontSize: 14.5,
                  fontWeight: 600
                }}>
                  شكراً لتواصلك، سيقوم أحد ممثلي فريق الدعم بالرد عليك في أقرب وقت.
                </p>
                <button onClick={() => setContactSent(false)} className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>الاسم الكامل</label>
                    <input
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input"
                      placeholder="اسمك الكريم..."
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>رقم الواتساب أو الهاتف</label>
                    <input
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                      placeholder="+967 ..."
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>نص الرسالة أو الاستفسار</label>
                  <textarea
                    required
                    rows={3}
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="input"
                    style={{ resize: 'vertical' }}
                    placeholder="اكتب استفسارك أو طلبك هنا..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn-emerald" style={{ padding: '12px 28px', fontSize: 15, borderRadius: 12, fontWeight: 800 }}>
                    <Send size={16} />
                    إرسال الرسالة
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>


      {/* ── 7. FOOTER (Deep Navy Blue Elegance) ── */}
      <footer style={{
        background: 'linear-gradient(180deg, #0d1b2a 0%, #08111c 100%)',
        borderTop: '1px solid rgba(56, 189, 248, 0.12)',
        padding: '3.8rem 1.25rem 2.5rem',
        position: 'relative',
        zIndex: 1,
        color: '#e2e8f0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            marginBottom: 26
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/icon.svg" alt="شعار كفاءة" style={{ width: 44, height: 44, borderRadius: 12 }} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  كـفـاءة<span style={{ color: '#10b981' }}>.</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: '#94a3b8',
                  fontWeight: 600,
                  marginTop: 2
                }}>
                  منصة التدريب والاستعداد لامتحانات مزاولة المهن
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
              <a href="#disciplines" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-display)' }}>التخصصات</a>
              <a href="#app" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-display)' }}>تطبيق الجوال</a>
              <a href="#pricing" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-display)' }}>الأسعار والباقات</a>
              <a href="#contact" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-display)' }}>تواصل معنا</a>
              <Link href="/login" style={{
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '7px 18px',
                borderRadius: 10,
                border: '1px solid rgba(56, 189, 248, 0.28)'
              }}>
                تسجيل الدخول / إنشاء حساب
              </Link>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12.5,
            color: '#64748b',
            fontWeight: 500,
            fontFamily: 'var(--font-body)'
          }}>
            <p>
              © 2026 كـفـاءة — منصة تعليمية وتدريبية متخصصة للتحضير لامتحانات مزاولة المهن. جميع الحقوق محفوظة.
            </p>
            <p>
              كفاءة منصة تدريب مستقلة وليست جهة حكومية أو مانحة للرخص، هدفنا مساعدة الطلاب والممارسين على الاستعداد والنجاح.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
