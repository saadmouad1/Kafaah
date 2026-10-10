'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Stethoscope, Compass, Scale, Calculator, GraduationCap } from 'lucide-react';
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
    { id: 'health', name: 'الصحي', icon: Stethoscope, color: '#10b981' },
    { id: 'eng', name: 'الهندسي', icon: Compass, color: '#f97316' },
    { id: 'law', name: 'القانوني', icon: Scale, color: '#0d9488' },
    { id: 'finance', name: 'المالي', icon: Calculator, color: '#f59e0b' },
    { id: 'edu', name: 'التربوي', icon: GraduationCap, color: '#f43f5e' }
  ];

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('kafaah_user_auth', JSON.stringify({
      name: name || 'مشترك جديد',
      email: email || 'user@kafaah.edu',
      discipline: selectedDiscipline,
      role: 'candidate',
      trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }));

    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 32,
          padding: '2.5rem',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)'
          }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            انضم إلى المنصة الوطنية للاختبارات والاعتماد المهني
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
              المجال المهني المستهدف:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {disciplines.map((d) => {
                const Icon = d.icon;
                const isSelected = selectedDiscipline === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDiscipline(d.id)}
                    style={{
                      padding: '0.75rem 0.25rem',
                      borderRadius: '12px',
                      background: isSelected ? d.color : 'rgba(255, 255, 255, 0.6)',
                      border: `1.5px solid ${isSelected ? d.color : 'rgba(226, 232, 240, 0.8)'}`,
                      color: isSelected ? '#ffffff' : '#475569',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${d.color}40` : 'none'
                    }}
                    title={d.name}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{d.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>الاسم الكامل</span>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
              <input
                required
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي"
                style={{ paddingRight: 44, background: 'rgba(255, 255, 255, 0.9)' }}
              />
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>البريد الإلكتروني</span>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
              <input
                required
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                style={{ paddingRight: 44, background: 'rgba(255, 255, 255, 0.9)' }}
              />
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>كلمة المرور</span>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#94a3b8' }} />
              <input
                required
                className="input"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف أو أرقام على الأقل"
                style={{ paddingRight: 44, paddingLeft: 44, background: 'rgba(255, 255, 255, 0.9)' }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14,
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
                }}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '16px',
              marginTop: '0.5rem',
              width: '100%',
              fontWeight: 800
            }}
          >
            تسجيل الحساب
            <ArrowLeft size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            لديك حساب بالفعل؟{' '}
            <Link href="/login" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}>
              تسجيل الدخول
            </Link>
          </p>
          <div style={{ marginTop: '1rem' }}>
             <Link href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
               العودة للرئيسية
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
