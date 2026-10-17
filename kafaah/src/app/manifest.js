// Web App Manifest (مُوصى به في Next.js — يُربط تلقائيًا في <head>)
// ref: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md
export default function manifest() {
  return {
    name: 'كفاءة — تراخيص مزاولة المهن والاعتماد المهني',
    short_name: 'كفاءة',
    description:
      'استعد لامتحان مزاولة مهنتك في كل التخصصات: بنوك أسئلة حقيقية، محاكاة امتحان، وتحليل أداء ذكي.',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#f7f8fa',
    theme_color: '#0d9488',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'التدريب', short_name: 'تدريب', url: '/dashboard/practice' },
      { name: 'محاكاة الامتحان', short_name: 'محاكاة', url: '/dashboard/mock' },
      { name: 'بنك الأسئلة', short_name: 'البنك', url: '/dashboard/bank' },
    ],
  };
}
