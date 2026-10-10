'use client';
export default function SavedPage() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>⭐</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 12 }}>
        الأسئلة المحفوظة
      </h1>
      <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
        قائمتك الشخصية من الأسئلة المهمة — قريباً
      </p>
      <div style={{ display: 'inline-block', background: '#eab30822', border: '1px solid #eab30844', color: '#eab308', padding: '10px 28px', borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
        🚧 قيد التطوير — سيكون جاهزاً قريباً
      </div>
    </div>
  );
}
