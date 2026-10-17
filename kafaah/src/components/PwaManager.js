'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';
import { useKafaah } from '../lib/context/KafaahProvider';

/**
 * PwaManager:
 * - يدير تثبيت التطبيق على الشاشة الرئيسية للهواتف.
 * - ينظف الكاش القديم ويلغي أي Service Workers قديمة لمنع أخطاء الحزم.
 * - ينبه المستخدم بلطف في حال انقطاع الاتصال بالإنترنت لإعادة الاتصال.
 */
export default function PwaManager() {
  const { t } = useKafaah();
  const [offline, setOffline] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // إلغاء أي Service Worker قديم وحذف الكاش غير المتزامن لمنع أخطاء الذاكرة المؤقتة
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister().catch(() => {});
          }
        }).catch(() => {});
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name).catch(() => {});
          }
        }).catch(() => {});
      }
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
          <span>انقطع الاتصال بالإنترنت — يُرجى إعادة الاتصال لمتابعة التدريب وحفظ النتائج</span>
        </div>
      )}

      {installEvt && !dismissed && (
        <div className="install-fab" role="dialog" aria-label={t('pwa.installAria')}>
          <div className="row" style={{ gap: 10 }}>
            <span className="install-fab-icon" aria-hidden>
              <Download size={18} />
            </span>
            <span style={{ lineHeight: 1.45, textAlign: 'start' }}>
              <strong style={{ display: 'block', fontSize: 14 }}>{t('pwa.install')}</strong>
              <span style={{ fontSize: 12, opacity: 0.85 }}>{t('pwa.installSub')}</span>
            </span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={install}>
              {t('pwa.installBtn')}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setDismissed(true)}
              aria-label={t('pwa.close')}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
