'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BrainCircuit, Activity, BookOpen, BarChart3, Search,
  AlertTriangle, Star, Settings, LogOut, UserRound, Moon, Sun, Repeat, Languages,
  MessageCircle,
} from 'lucide-react';
import SubscriptionGatekeeper from '../../components/dashboard/SubscriptionGatekeeper';
import { useKafaah } from '../../lib/context/KafaahProvider';

function useTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('kafaah_theme');
    const initial = saved || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.dataset.theme = initial === 'dark' ? 'dark' : 'light';
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('kafaah_theme', next);
    document.documentElement.dataset.theme = next === 'dark' ? 'dark' : 'light';
  };
  return { theme, toggle };
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile, sector, spec, logout, ready, hasName,
    isSubscribed, subStatus, checkSubscription,
    t, lang, setLang, sectorShortName, specName
  } = useKafaah();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!ready) return;
    if (!hasName) router.replace('/login');
    else if (!profile.specId) router.replace('/onboarding');
  }, [ready, hasName, profile.specId, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div className="skeleton" style={{ width: 320, height: 260, borderRadius: 24 }} />
      </div>
    );
  }

  if (!hasName) {
    return null;
  }

  // حماية صارمة: لا يمكن لأي مستخدم رؤية أي صفحة أو بنك أسئلة دون اشتراك مفعل ومؤكد
  if (!isSubscribed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <header
          style={{
            padding: '12px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <Link href="/" className="brand" style={{ gap: 8 }}>
            <img src="/icon.svg" alt="كفاءة" className="brand-logo-img" width="34" height="34" />
            <span className="brand-title" style={{ fontSize: '1.1rem' }}>
              كـفـاءة<span className="brand-dot" />
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background: subStatus === 'pending' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: subStatus === 'pending' ? '#b45309' : '#dc2626',
                fontWeight: 800,
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {subStatus === 'pending' ? '⏳ قيد المراجعة والمطابقة' : '🔒 اشتراك غير مفعل'}
            </span>

            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/');
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)', fontSize: 13 }}
            >
              <LogOut size={15} /> خروج
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '20px 16px' }}>
          <SubscriptionGatekeeper
            profile={profile}
            subStatus={subStatus}
            onRefresh={() => checkSubscription(profile.email)}
            logout={() => {
              logout();
              router.replace('/');
            }}
          />
        </main>
      </div>
    );
  }

  const nav = [
    { label: t('nav.home'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.practice'), path: '/dashboard/practice', icon: BrainCircuit },
    { label: t('nav.mock'), path: '/dashboard/mock', icon: Activity },
    { label: t('nav.bank'), path: '/dashboard/bank', icon: BookOpen },
    { label: t('nav.analytics'), path: '/dashboard/analytics', icon: BarChart3 },
    { label: t('nav.search'), path: '/dashboard/search', icon: Search },
    { label: t('nav.chat'), path: '/dashboard/chat', icon: MessageCircle },
    { label: t('nav.mistakes'), path: '/dashboard/mistakes', icon: AlertTriangle },
    { label: t('nav.saved'), path: '/dashboard/saved', icon: Star },
  ];

  const bottom = [
    { label: t('bottom.home'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('bottom.practice'), path: '/dashboard/practice', icon: BrainCircuit },
    { label: t('bottom.mock'), path: '/dashboard/mock', icon: Activity },
    { label: t('bottom.bank'), path: '/dashboard/bank', icon: BookOpen },
    { label: t('bottom.account'), path: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (p) => pathname === p || (p !== '/dashboard' && pathname?.startsWith(p));

  const initials = (profile.name || t('nav.user')).trim().charAt(0);
  const nextLangLabel = lang === 'ar' ? 'English' : 'العربية';

  return (
    <div className="dash">
      {/* ── Sidebar (desktop) ── */}
      <aside className="side">
        <Link href="/" className="brand" style={{ padding: '4px 6px 14px' }}>
          <img src="/icon.svg" alt="" className="brand-logo-img" width="38" height="38" />
          <span className="brand-text-wrap">
            <span className="brand-title">كـفـاءة<span className="brand-dot" /></span>
          </span>
        </Link>

        <div className="card soft-sector" style={{ padding: 12, borderRadius: 16 }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--sector)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name || t('nav.user')}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{specName(spec)}</div>
            </div>
          </div>
          <div className="badge badge-brand" style={{ marginTop: 10, width: '100%', justifyContent: 'center', fontSize: 11.5 }}>
            {sectorShortName(sector)}
          </div>
          {profile.subscription?.expiresAt && new Date(profile.subscription.expiresAt) > new Date() ? (
            <div className="badge badge-success" style={{ marginTop: 6, width: '100%', justifyContent: 'center', fontSize: 11 }}>
              ✓ باقة كفاءة مفعلة
            </div>
          ) : (
            <Link href="/dashboard/settings" className="badge badge-gold" style={{ marginTop: 6, width: '100%', justifyContent: 'center', fontSize: 11, textDecoration: 'none' }}>
              ⚡ ترقية الحساب (الكريمي / جيب)
            </Link>
          )}
        </div>

        <div className="side-group">{t('nav.menu')}</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map(({ label, path, icon: Icon }) => (
            <Link key={path} href={path} className={`side-link${isActive(path) ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={isActive(path) ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="side-group">{t('nav.account')}</div>
        <Link href="/dashboard/settings" className={`side-link${isActive('/dashboard/settings') ? ' active' : ''}`}>
          <Settings size={18} /> {t('nav.settings')}
        </Link>
        <Link href="/dashboard/profile" className={`side-link${isActive('/dashboard/profile') ? ' active' : ''}`}>
          <UserRound size={18} /> {t('nav.profile')}
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <button
            onClick={() => { logout(); router.replace('/'); }}
            className="side-link"
            style={{ width: '100%', border: 0, background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
          >
            <LogOut size={18} /> {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        {/* Mobile app bar */}
        <div className="row-between dash-appbar" style={{ marginBottom: 16 }}>
          <Link href="/dashboard" className="brand">
            <img src="/icon.svg" alt="" className="brand-logo-img" width="34" height="34" />
            <span className="brand-title" style={{ fontSize: '1.05rem' }}>كـفـاءة</span>
          </Link>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge badge-brand">{sectorShortName(sector)}</span>
            <Link href="/dashboard/settings" className="icon-btn" aria-label={t('nav.settings')} title={t('nav.settings')}>
              <Settings size={18} />
            </Link>
          </div>
        </div>

        <div className="dash-inner fade-up">{children}</div>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="bottom-nav" aria-label={t('nav.bottomAria')}>
        {bottom.map(({ label, path, icon: Icon }) => (
          <Link key={path} href={path} className={`nav-item${isActive(path) ? ' active' : ''}`}>
            <span className="nav-ico"><Icon size={20} strokeWidth={isActive(path) ? 2.6 : 2} /></span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
