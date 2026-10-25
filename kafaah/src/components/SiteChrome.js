'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, LayoutDashboard, Menu, X, Layers,
  BookOpen, CreditCard, Smartphone, MessageSquare,
  ArrowLeft, LogIn, UserPlus, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { useKafaah } from '../lib/context/KafaahProvider';

// الشريط العلوي العام للصفحات العامة + القائمة الجانبية المنزلقة للجوال
export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const { hasName, profile, t, isSubscribed, subStatus } = useKafaah();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = ['/login', '/register', '/onboarding'].includes(pathname);
  const hideTopbar = isDashboard || isAdmin;

  // إغلاق القائمة الجانبية عند التنقل
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // تعطيل تمرير الصفحة أثناء فتح القائمة الجانبية
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (drawerOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      {!hideTopbar && (
        <header className="topbar">
          <Link href="/" className="brand" aria-label="كفاءة — الرئيسية">
            <img src="/icon.svg" alt="شعار كفاءة" className="brand-logo-img" width="38" height="38" />
            <span className="brand-text-wrap">
              <span className="brand-title">
                كـفـاءة<span className="brand-dot" />
              </span>
              {!isAuth && <span className="brand-subtitle desktop-only">{t('nav.brandSub')}</span>}
            </span>
          </Link>

          <nav className="topbar-right">
            {!isAuth && (
              <>
                <Link href="/#sectors" className="btn btn-ghost btn-sm desktop-only">{t('nav.sectors')}</Link>
                <Link href="/#features" className="btn btn-ghost btn-sm desktop-only">{t('nav.features')}</Link>
                <Link href="/#pricing" className="btn btn-ghost btn-sm desktop-only">الأسعار والباقات</Link>
                <Link href="/#app" className="btn btn-ghost btn-sm desktop-only">{t('nav.app')}</Link>
              </>
            )}
            {hasName ? (
              isSubscribed ? (
                <Link href="/dashboard" className="btn btn-primary btn-sm desktop-only">
                  <LayoutDashboard size={15} />
                  {t('nav.myDashboard')}
                </Link>
              ) : subStatus === 'pending' ? (
                <Link href="/dashboard" className="btn btn-sm desktop-only" style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800 }}>
                  <ShieldCheck size={15} />
                  بانتظار تأكيد الدفع ⏳
                </Link>
              ) : (
                <Link href="/dashboard" className="btn btn-emerald btn-sm desktop-only" style={{ fontWeight: 800 }}>
                  <CreditCard size={15} />
                  تفعيل الاشتراك 🔒
                </Link>
              )
            ) : (
              <div className="desktop-only" style={{ display: 'flex', gap: 8 }}>
                <Link href="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
                <Link href="/register" className="btn btn-gold btn-sm">
                  <Sparkles size={14} />
                  {t('nav.startNow')}
                </Link>
              </div>
            )}

            {/* زر القائمة الجانبية للجوال والأجهزة اللوحية (Mobile Hamburger) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn btn-ghost btn-sm mobile-only"
              aria-label="فتح القائمة الجانبية"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)'
              }}
            >
              <Menu size={20} />
            </button>
          </nav>
        </header>
      )}

      {/* ── القائمة الجانبية المنزلقة للجوال (Mobile Sidebar Drawer) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99998
              }}
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(330px, 86vw)',
                height: '100vh',
                background: 'var(--surface, #ffffff)',
                borderLeft: '1.5px solid var(--border, #e2e8f0)',
                boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.25)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                overflowY: 'auto'
              }}
            >
              {/* Drawer Top */}
              <div>
                {/* Header with Brand & Close Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border, #e2e8f0)',
                  marginBottom: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/icon.svg" alt="كفاءة" style={{ width: 34, height: 34, borderRadius: 10 }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text, #0f172a)' }}>
                        كـفـاءة<span style={{ color: '#10b981' }}>.</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                        منصة التدريب والاعتماد المهني
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: '1px solid var(--border, #e2e8f0)',
                      background: 'var(--bg, #f8fafc)',
                      color: 'var(--text, #0f172a)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="إغلاق القائمة"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* User Status Snippet (If Logged In) */}
                {hasName && (
                  <div style={{
                    background: isSubscribed ? 'rgba(16, 185, 129, 0.08)' : subStatus === 'pending' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${isSubscribed ? 'rgba(16, 185, 129, 0.3)' : subStatus === 'pending' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: isSubscribed ? '#10b981' : subStatus === 'pending' ? '#f59e0b' : '#ef4444',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 16
                    }}>
                      {profile.name ? profile.name.charAt(0) : 'ك'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.name}
                      </div>
                      <div style={{
                        fontSize: 11.5,
                        color: isSubscribed ? '#059669' : subStatus === 'pending' ? '#b45309' : '#dc2626',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isSubscribed ? '#10b981' : subStatus === 'pending' ? '#f59e0b' : '#ef4444',
                          display: 'inline-block'
                        }} />
                        {isSubscribed ? 'اشتراك مفعل ✓' : subStatus === 'pending' ? 'بانتظار تأكيد الحوالة ⏳' : 'غير مشترك — يلزم التفعيل 🔒'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { href: '/', label: 'الرئيسية', icon: Sparkles },
                    { href: '/#sectors', label: 'الأقسام والتخصصات', icon: Layers },
                    { href: '/#features', label: 'ماذا تستفيد من كفاءة؟', icon: BookOpen },
                    { href: '/#pricing', label: 'الأسعار والباقات', icon: CreditCard },
                    { href: '/#app', label: 'تطبيق الجوال السحابي', icon: Smartphone },
                    { href: '/#contact', label: 'تواصل معنا', icon: MessageSquare }
                  ].map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={idx}
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 14px',
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text, #0f172a)',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          display: 'grid',
                          placeItems: 'center'
                        }}>
                          <Icon size={16} />
                        </div>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div style={{
                paddingTop: 16,
                borderTop: '1px solid var(--border, #e2e8f0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                {hasName ? (
                  isSubscribed ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="btn btn-emerald btn-lg"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 14.5,
                        fontWeight: 900,
                        borderRadius: 12,
                        padding: '12px'
                      }}
                    >
                      <LayoutDashboard size={17} />
                      لوحة التحكم الخاصة بي
                      <ArrowLeft size={15} />
                    </Link>
                  ) : subStatus === 'pending' ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="btn btn-lg"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 900,
                        borderRadius: 12,
                        padding: '12px',
                        background: '#f59e0b',
                        color: '#ffffff'
                      }}
                    >
                      <ShieldCheck size={17} />
                      متابعة حالة تفعيل الحساب ⏳
                      <ArrowLeft size={15} />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="btn btn-emerald btn-lg"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 900,
                        borderRadius: 12,
                        padding: '12px'
                      }}
                    >
                      <CreditCard size={17} />
                      سداد الاشتراك وتفعيل الحساب 🔒
                      <ArrowLeft size={15} />
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="btn btn-emerald btn-lg"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 14.5,
                        fontWeight: 900,
                        borderRadius: 12,
                        padding: '12px'
                      }}
                    >
                      <Sparkles size={16} />
                      اشترك الآن وابدأ التدريب
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        borderRadius: 12,
                        border: '1px solid var(--border, #e2e8f0)'
                      }}
                    >
                      <LogIn size={16} />
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main>{children}</main>
    </>
  );
}

