'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('kafaah_user_auth', JSON.stringify({
      email: email || 'candidate@kafaah.edu',
      name: email ? email.split('@')[0] : 'د. أحمد المهدي',
      role: email.includes('admin') ? 'admin' : 'candidate'
    }));

    if (email.includes('admin')) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
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
          maxWidth: 440,
          borderRadius: 32,
          padding: '3rem 2.5rem',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <img 
              src="/kafaah-icon.svg" 
              alt="كفاءة" 
              style={{ width: 64, height: 64, filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.2))' }} 
            />
          </Link>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)'
          }}>
            مرحباً بك مجدداً
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            قم بتسجيل الدخول للوصول إلى منصة الاختبارات
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                placeholder="أدخل بريدك الإلكتروني"
                style={{ paddingRight: 44, background: 'rgba(255, 255, 255, 0.9)' }}
              />
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>كلمة المرور</span>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>
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
            className="btn btn-emerald"
            style={{
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '16px',
              marginTop: '0.5rem',
              width: '100%',
              fontWeight: 800
            }}
          >
            دخول
            <ArrowLeft size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            ليس لديك حساب؟{' '}
            <Link href="/register" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none' }}>
              أنشئ حساباً جديداً
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

