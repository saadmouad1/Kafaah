'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Activity, Search, User, Sparkles, Smartphone, Award, ShieldCheck } from 'lucide-react';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Check if current route is an internal dashboard route
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="كفاءة — المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني لكافة التخصصات (الصحية، الهندسية، القانونية، المالية، التربوية)" />
        <title>كفاءة | المنصة الوطنية لتراخيص مزاولة المهن والاعتماد المهني</title>
        
        {/* Curated Luxury Typography Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />

        {/* Favicons & App Icons */}
        <link rel="icon" type="image/svg+xml" href="/kafaah-icon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>

        {/* ── TOPBAR NAVIGATION ── */}
        {!isAdmin && (
          <header className="topbar">
            <Link href="/" className="brand" aria-label="الرئيسية — كفاءة">
              <img 
                src="/kafaah-icon.svg" 
                alt="شعار كفاءة" 
                className="brand-logo-img" 
                width="40" 
                height="40" 
              />
              <div className="brand-text-wrap">
                <div className="brand-title">
                  كـفـاءة
                  <span className="brand-dot"></span>
                  <span className="brand-badge">عرض 3 أشهر مجاناً</span>
                </div>
                <span className="brand-subtitle">
                  تراخيص مزاولة المهن والاعتماد المهني
                </span>
              </div>
            </Link>

            {/* Public Landing Navigation vs Dashboard Navigation */}
            {!isDashboard && !isAuthPage ? (
              <div className="topbar-right">
                <a href="#features" className="topbar-desktop-only" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, padding: '6px 12px' }}>
                  المميزات
                </a>
                <a href="#disciplines" className="topbar-desktop-only" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, padding: '6px 12px' }}>
                  التخصصات
                </a>
                <a href="#app" className="topbar-desktop-only" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={15} />
                  تطبيق الجوال
                </a>
                <a href="#contact" className="topbar-desktop-only" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, padding: '6px 12px' }}>
                  تواصل معنا
                </a>

                <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                  تسجيل الدخول
                </Link>

                <Link href="/register" className="btn btn-gold" style={{ padding: '9px 18px', fontSize: 13.5 }}>
                  <Sparkles size={15} />
                  ابدأ مجاناً (3 أشهر)
                </Link>
              </div>
            ) : isDashboard ? (
              <div className="topbar-right">
                <Link href="/dashboard/search" className="btn btn-ghost topbar-desktop-only" style={{ padding: '8px 16px', fontSize: 13 }}>
                  <Search size={15} style={{ color: '#38bdf8' }} />
                  بحث في الأسئلة
                </Link>
                <Link href="/dashboard/profile" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                  <User size={16} />
                  <span className="topbar-desktop-only">حسابي</span>
                </Link>
              </div>
            ) : (
              <div className="topbar-right">
                <Link href="/" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                  العودة للرئيسية
                </Link>
              </div>
            )}
          </header>
        )}

        {/* ── Page Content ── */}
        <main>{children}</main>

        {/* ── Mobile Bottom Navigation (ONLY IN DASHBOARD FOR LOGGED-IN USERS) ── */}
        {isDashboard && (
          <nav className="bottom-nav" aria-label="شريط التنقل السفلي للتطبيق">
            <Link href="/dashboard" className={`nav-item${pathname === '/dashboard' ? ' active' : ''}`}>
              <Home size={20} />
              <span>الرئيسية</span>
            </Link>
            <Link href="/dashboard/practice" className={`nav-item${pathname?.includes('/practice') ? ' active' : ''}`}>
              <BookOpen size={20} />
              <span>التدريب</span>
            </Link>
            <Link href="/dashboard/mock" className={`nav-item${pathname?.includes('/mock') ? ' active' : ''}`}>
              <Activity size={20} />
              <span>الامتحان</span>
            </Link>
            <Link href="/dashboard/search" className={`nav-item${pathname?.includes('/search') ? ' active' : ''}`}>
              <Search size={20} />
              <span>البحث</span>
            </Link>
            <Link href="/dashboard/profile" className={`nav-item${pathname?.includes('/profile') ? ' active' : ''}`}>
              <User size={20} />
              <span>حسابي</span>
            </Link>
          </nav>
        )}

      </body>
    </html>
  );
}
