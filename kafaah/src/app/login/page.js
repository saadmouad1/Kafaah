'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, ArrowLeft, ShieldCheck, 
  Sparkles, CheckCircle2, Award, Zap, Stethoscope, Compass, 
  Scale, Calculator, GraduationCap 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('health');

  const disciplines = [
    { id: 'health', name: 'القطاع الصحي والطبي', icon: Stethoscope, color: '#10b981' },
    { id: 'eng', name: 'الهندسة والتقنية', icon: Compass, color: '#f97316' },
    { id: 'law', name: 'القانون والمحاماة', icon: Scale, color: '#0d9488' },
    { id: 'finance', name: 'المحاسبة والمالية', icon: Calculator, color: '#f59e0b' },
    { id: 'edu', name: 'التربية والتعليم', icon: GraduationCap, color: '#f43f5e' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('kafaah_user_auth', JSON.stringify({
      email: email || 'candidate@kafaah.edu',
      name: email ? email.split('@')[0] : 'د. أحمد المهدي',
      discipline: selectedDiscipline,
      role: email.includes('admin') ? 'admin' : 'candidate'
    }));

    if (email.includes('admin')) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const fillQuickDemo = (role = 'doctor') => {
    if (role === 'doctor') {
      setEmail('doctor.ahmed@kafaah.edu');
      setPassword('Kafaah2025!');
      setSelectedDiscipline('health');
    } else {
      setEmail('admin@kafaah.gov');
      setPassword('AdminMaster2025!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1.5rem, 4vw, 3.5rem) 1.25rem',
      position: 'relative'
    }}>
      
      {/* Main Responsive Split-Screen Platform Container */}
      <div style={{
        width: '100%',
        maxWidth: 1140,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'clamp(1.5rem, 3.5vw, 3rem)',
        alignItems: 'center'
      }}>

        {/* ── LEFT SHOWCASE PANEL: Web Platform Prestige & National Accreditations ── */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ padding: '0.5rem clamp(0.5rem, 2vw, 1.5rem)' }}
        >
          {/* Institutional Brand Header (No fragile SVG text, pure high-contrast typography) */}
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            textDecoration: 'none',
            marginBottom: 24
          }}>
            <img 
              src="/kafaah-icon.svg" 
              alt="كفاءة" 
              style={{ width: 54, height: 54, filter: 'drop-shadow(0 4px 10px rgba(5, 150, 105, 0.15))' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontSize: '1.7rem',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-display)'
              }}>
                كـفـاءة
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#059669',
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  المنظومة الوطنية
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 700, marginTop: 3 }}>
                تراخيص مزاولة المهن والاعتماد المهني
              </span>
            </div>
          </Link>

          {/* Promotion Banner with Gold Shimmer */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 18px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
            border: '1.5px solid #f59e0b',
            color: '#b45309',
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 18,
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)'
          }}>
            <Sparkles size={16} style={{ color: '#d97706' }} />
            عرض التدشين: وصول كامل مجاني لجميع الاختبارات لمدة 3 أشهر
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.25,
            marginBottom: 16,
            fontFamily: 'var(--font-display)'
          }}>
            بوابتك الذكية لاجتياز امتحانات الترخيص والاعتماد المهني
          </h2>

          <p style={{
            fontSize: '15.5px',
            color: '#334155',
            lineHeight: 1.8,
            marginBottom: 26,
            fontWeight: 600
          }}>
            انضم إلى آلاف الممارسين في القطاعات الطبية، الهندسية، القانونية، المالية والتربوية. تجربة محاكاة واقعية 100% لقاعة الاختبار، ومعالج ذكي يحلل نقاط القوة والضعف بدقة.
          </p>

          {/* 3 Value Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {[
              { title: 'أكثر من 26,500 سؤال محكّم', desc: 'مطابقة لمعايير المجالس الطبية، هيئة المهندسين، ونقابة المحامين' },
              { title: 'محاكاة واقعية 100% لبيئة الامتحان', desc: 'توقيت حقيقي، بطاقة مراجعة الأسئلة، وتحليل فوري للدرجات' },
              { title: 'تحليل دقيق بنظام Groq AI السريع', desc: 'توجيه أكاديمي فوري وتحديد مواطن التحسين لكل مادة وتخصص' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <strong style={{ fontSize: 14.5, color: '#0f172a', display: 'block' }}>{item.title}</strong>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Demo Credentials for Reviewers */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1.5px dashed #cbd5e1',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', display: 'block' }}>
                💡 للاختبار والتجربة الفورية السريعة:
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                يمكنك ملء بيانات الدخول بنقرة واحدة
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fillQuickDemo('doctor')}
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#059669',
                  padding: '5px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                حساب متدرب تجريبي
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  color: '#b45309',
                  padding: '5px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                حساب الإدارة
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL: Frosted Glass Luxury Authentication Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="glass-panel"
          style={{
            borderRadius: 32,
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3.5vw, 2.5rem)',
            background: 'rgba(255, 255, 255, 0.78)',
            backdropFilter: 'blur(26px) saturate(190%)',
            WebkitBackdropFilter: 'blur(26px) saturate(190%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.1), 0 4px 16px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#059669',
              padding: '4px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10
            }}>
              <ShieldCheck size={14} />
              منصة الاختبارات الوطنية المعتمدة
            </span>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 6,
              fontFamily: 'var(--font-display)'
            }}>
              تسجيل الدخول إلى حسابك
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              أدخل بريدك الإلكتروني وكلمة المرور للمتابعة
            </p>
          </div>

          {/* Quick Specialty / Discipline Selector Pills */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
              حدد مجالك المهني المستهدف:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 8
            }}>
              {disciplines.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedDiscipline === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDiscipline(d.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: isSelected ? d.color : 'rgba(255, 255, 255, 0.75)',
                      border: `1.5px solid ${isSelected ? d.color : '#e2e8f0'}`,
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <Icon size={14} />
                    {d.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>البريد الإلكتروني</span>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
                <input
                  required
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  style={{
                    paddingRight: 44,
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 600
                  }}
                />
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>كلمة المرور</span>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 700, cursor: 'pointer' }}>
                  نسيت كلمة المرور؟
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
                <input
                  required
                  className="input"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    paddingRight: 44,
                    paddingLeft: 44,
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 600
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: 14,
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="btn btn-emerald"
              style={{
                padding: '14px 24px',
                fontSize: 16,
                borderRadius: 14,
                marginTop: 8,
                width: '100%',
                fontWeight: 800
              }}
            >
              دخول إلى منصة الاختبارات
              <ArrowLeft size={16} />
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{
            marginTop: 24,
            textAlign: 'center',
            paddingTop: 18,
            borderTop: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <p style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>
              ليس لديك حساب حتى الآن؟{' '}
              <Link href="/register" style={{ color: '#d97706', fontWeight: 900, textDecoration: 'none' }}>
                أنشئ حساباً مجانياً (3 أشهر مجاناً)
              </Link>
            </p>
          </div>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
