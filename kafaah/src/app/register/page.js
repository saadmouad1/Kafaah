'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowLeft, 
  ShieldCheck, CheckCircle2, Award, Zap, Stethoscope, 
  Compass, Scale, Calculator, GraduationCap, Check 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('health');

  const disciplines = [
    { id: 'health', name: 'القطاع الصحي والطبي', icon: Stethoscope, color: '#10b981', desc: 'الطب البشري، الأسنان، الصيدلة، التمريض' },
    { id: 'eng', name: 'الهندسة والتقنية', icon: Compass, color: '#f97316', desc: 'المدني، المعماري، الكهربائي، الميكانيكي، البرمجيات' },
    { id: 'law', name: 'القانون والمحاماة', icon: Scale, color: '#0d9488', desc: 'مزاولة المحاماة، القضاء، اللوائح والمرافعات' },
    { id: 'finance', name: 'المحاسبة والمالية', icon: Calculator, color: '#f59e0b', desc: 'زمالة SOCPA و CPA، معايير IFRS والتدقيق' },
    { id: 'edu', name: 'التربية والتعليم', icon: GraduationCap, color: '#f43f5e', desc: 'الرخصة المهنية للمعلمين والمعايير التربوية' }
  ];

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('kafaah_user_auth', JSON.stringify({
      name: name || 'مشترك جديد',
      email: email || 'user@kafaah.edu',
      discipline: selectedDiscipline,
      role: 'candidate',
      trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months free
    }));

    router.push('/dashboard');
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
        maxWidth: 1180,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: 'clamp(1.5rem, 3.5vw, 3.5rem)',
        alignItems: 'center'
      }}>

        {/* ── LEFT SHOWCASE PANEL: Web Platform Features & Trust Seals ── */}
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
            عرض التدشين الحصري: اشتراك كامل مجاني لمدة 3 أشهر بدون أي رسوم
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.25,
            marginBottom: 16,
            fontFamily: 'var(--font-display)'
          }}>
            ابدأ رحلة الإعداد المهني والاعتماد الآن
          </h2>

          <p style={{
            fontSize: '15.5px',
            color: '#334155',
            lineHeight: 1.8,
            marginBottom: 26,
            fontWeight: 600
          }}>
            أنشئ حسابك خلال ثوانٍ واستفد فوراً من وصول غير محدود لجميع بنوك الأسئلة المحكمة، اختبارات المحاكاة الوزارية، وتحليلات الجاهزية الذكية.
          </p>

          {/* 4 Steps to Certification */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 26
          }}>
            {[
              { num: '١', title: 'اختر مجالك المهني', desc: 'صحي، هندسي، قانوني، مالي، تربوي' },
              { num: '٢', title: 'خطة تدريب ذكية', desc: 'تشخيص أولي مدعوم بـ Groq AI' },
              { num: '٣', title: 'محاكاة قاعة الامتحان', desc: 'توقيت حقيقي وبيئة تحاكي الاختبار الفعلي' },
              { num: '٤', title: 'اجتياز من أول محاولة', desc: 'نسبة نجاح 99.4% لمعايير الترخيص' }
            ].map((st, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(226, 232, 240, 0.85)',
                borderRadius: 16,
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {st.num}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{st.title}</span>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>{st.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 800 }}>✓ لا حاجة لبطاقة بنكية</span>
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 800 }}>✓ وصول فوري لـ 26,500+ سؤال</span>
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 800 }}>✓ متوافق مع كافة الأجهزة</span>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL: Frosted Glass Luxury Registration Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="glass-panel"
          style={{
            borderRadius: 32,
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3.5vw, 2.5rem)',
            background: 'rgba(255, 255, 255, 0.8)',
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
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#b45309',
              padding: '4px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10
            }}>
              <Award size={14} />
              تسجيل حساب متدرب جديد
            </span>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2rem)',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 6,
              fontFamily: 'var(--font-display)'
            }}>
              إنشاء حساب في كفاءة
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              أدخل بياناتك للانضمام إلى منصة الاختبارات الوطنية
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Discipline Selector */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
                اختر مجالك المهني:
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>الاسم الكامل</span>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
                <input
                  required
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="د. / م. / أستاذ ..."
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
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>كلمة المرور</span>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
                <input
                  required
                  className="input"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 خانات على الأقل"
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
              className="btn btn-gold"
              style={{
                padding: '14px 24px',
                fontSize: 16,
                borderRadius: 14,
                marginTop: 8,
                width: '100%',
                fontWeight: 800
              }}
            >
              <Sparkles size={18} />
              إنشاء الحساب وبدء التدريب مجاناً
              <ArrowLeft size={16} />
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{
            marginTop: 24,
            textAlign: 'center',
            paddingTop: 18,
            borderTop: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <p style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>
              لديك حساب بالفعل؟{' '}
              <Link href="/login" style={{ color: '#059669', fontWeight: 900, textDecoration: 'none' }}>
                تسجيل الدخول إلى حسابك
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
