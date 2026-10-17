'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';

/**
 * مدير تجربة التطبيق (PWA):
 * - تسجيل Service Worker للعمل دون اتصال وتسريع التحميل.
 * - شريط تنبيه عند انقطاع الاتصال.
 * - زر «ثبّت التطبيق» عند إتاحة المتصفح لذلك.
 */
export default function PwaManager() {
  const [offline, setOffline] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // تسجيل Service Worker في الإنتاج فقط (لتفادي إزعاج التطوير)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const register = () =>
        navigator.serviceWorker
          .register('/sw.js', { scope: '/', updateViaCache: 'none' })
          .catch(() => {});
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }

    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    setOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // لا نُظهر زر التثبيت إن كان التطبيق مثبّتًا أصلًا
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) setDismissed(true);
    } catch {}

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvt) return;
    installEvt.prompt();
    try {
      await installEvt.userChoice;
    } catch {}
    setInstallEvt(null);
  }

  return (
    <>
      {offline && (
        <div className="offline-banner" role="status" aria-live="polite">
          <WifiOff size={15} />
          <span>أنت غير متصل بالإنترنت — نعرض المحتوى المحفوظ، وسنعيد المزامنة تلقائيًا.</span>
        </div>
      )}

      {installEvt && !dismissed && (
        <div className="install-fab" role="dialog" aria-label="تثبيت التطبيق">
          <div className="row" style={{ gap: 10 }}>
            <span className="install-fab-icon" aria-hidden>
              <Download size={18} />
            </span>
            <span style={{ lineHeight: 1.45, textAlign: 'start' }}>
              <strong style={{ display: 'block', fontSize: 14 }}>ثبّت تطبيق كفاءة</strong>
              <span style={{ fontSize: 12, opacity: 0.85 }}>وصول أسرع وتجربة كالتطبيقات</span>
            </span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={install}>
              تثبيت
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setDismissed(true)}
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
