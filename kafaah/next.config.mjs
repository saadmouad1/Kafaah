// ملاحظة: إضافة @ducanh2912/next-pwa تعتمد على webpack ولا تعمل مع Turbopack
// (الافتراضي في Next 16)، لذا نستخدم Service Worker مكتوبًا يدويًا في public/sw.js
// مع ربط app/manifest.js (يُولّد /manifest.webmanifest تلقائيًا).
// ref: node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
