import Link from 'next/link';

export const metadata = { title: 'لا يوجد اتصال' };

export default function OfflinePage() {
  return (
    <main className="container" style={{ maxWidth: 520, paddingBlock: 64, textAlign: 'center' }}>
      <div
        className="card"
        style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
      >
        <div
          aria-hidden
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            display: 'grid',
            placeItems: 'center',
            background: 'color-mix(in srgb, var(--sector) 14%, transparent)',
            color: 'var(--sector)',
            fontSize: 40,
          }}
        >
          📡
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>لا يوجد اتصال بالإنترنت</h1>
        <p className="text-muted" style={{ margin: 0, lineHeight: 1.9 }}>
          يبدو أنك غير متصل. الأسئلة التي تدربت عليها سابقًا محفوظة ويمكنك الوصول إليها، وسنعيد
          الاتصال تلقائيًا عند عودة الشبكة.
        </p>
        <div className="row" style={{ gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link className="btn btn-primary" href="/dashboard">
            العودة للرئيسية
          </Link>
          <Link className="btn btn-ghost" href="/dashboard/practice">
            متابعة التدريب
          </Link>
        </div>
      </div>
    </main>
  );
}
