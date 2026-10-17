import './globals.css';
import { KafaahProvider } from '../lib/context/KafaahProvider';
import SiteChrome from '../components/SiteChrome';
import PwaManager from '../components/PwaManager';

export const metadata = {
  metadataBase: new URL('https://kafaah.app'),
  title: {
    default: 'كفاءة | منصة تراخيص مزاولة المهن والاعتماد المهني',
    template: '%s · كفاءة',
  },
  description:
    'كفاءة — المنصة الوطنية للتدريب والاستعداد لامتحانات مزاولة المهن والاعتماد المهني في القطاعات الصحية والهندسية والقانونية والمالية والتربوية. بنوك أسئلة حقيقية، محاكاة امتحان، وتحليل أداء ذكي.',
  applicationName: 'كفاءة',
  keywords: ['كفاءة', 'تراخيص مزاولة المهن', 'SMLE', 'SCFHS', 'الهيئة السعودية للتخصصات', 'اختبار الهندسة', 'رخصة المحاماة', 'SOCPA', 'الرخصة المهنية'],
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'كفاءة' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    title: 'كفاءة | تراخيص مزاولة المهن',
    description: 'استعد لامتحان مزاولة مهنتك في كل التخصصات — بنوك أسئلة، محاكاة، وتحليل ذكي.',
    images: ['/og.png'],
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
  ],
};

const themeScript = `try{var t=localStorage.getItem('kafaah_theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches&&localStorage.getItem('kafaah_theme')==='auto')){document.documentElement.dataset.theme='dark';}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <KafaahProvider>
          <PwaManager />
          <SiteChrome>{children}</SiteChrome>
        </KafaahProvider>
      </body>
    </html>
  );
}
