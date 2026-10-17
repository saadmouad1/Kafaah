'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard } from 'lucide-react';
import { useKafaah } from '../lib/context/KafaahProvider';

// الشريط العلوي العام للصفحات العامة فقط (لوحة التحكم لها هيكلها الخاص)
export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const { hasName, t } = useKafaah();

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = ['/login', '/register', '/onboarding'].includes(pathname);
  const hideTopbar = isDashboard || isAdmin;

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
                <Link href="/#app" className="btn btn-ghost btn-sm desktop-only">{t('nav.app')}</Link>
              </>
            )}
            {hasName ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                <LayoutDashboard size={15} />
                {t('nav.myDashboard')}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
                <Link href="/register" className="btn btn-gold btn-sm">
                  <Sparkles size={14} />
                  {t('nav.startNow')}
                </Link>
              </>
            )}
          </nav>
        </header>
      )}

      <main>{children}</main>
    </>
  );
}
