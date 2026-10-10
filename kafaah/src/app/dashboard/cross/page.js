'use client';
export default function EmptyPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>هذه الصفحة قيد التطوير</h2>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>سيتم إضافة الميزات قريباً في التحديث القادم.</p>
      </div>
    </div>
  )
}
