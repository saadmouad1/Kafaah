'use client';
import { useEffect, useState } from 'react';
import {
  CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw,
  Search, ExternalLink, MessageCircle, Building2, Wallet, Check, X,
  User, Mail, Phone, Calendar, ArrowUpRight, Loader2
} from 'lucide-react';

export default function PaymentsManager({ onDone, onErr }) {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.error) {
        if (onErr) onErr(data.error);
        return;
      }
      setPayments(data.payments || []);
      setStats(data.stats || null);
    } catch (err) {
      if (onErr) onErr('تعذّر تحميل قائمة طلبات الدفع');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(payment) {
    if (!confirm(`هل أنت متأكد من مطابقة الحوالة وتفعيل اشتراك «${payment.clientName || payment.email}» فوراً؟`)) {
      return;
    }
    setBusyId(payment.id);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id: payment.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشل تأكيد الطلب');
      }
      if (onDone) onDone(`تم تأكيد الدفعة وتفعيل اشتراك ${payment.clientName || payment.email} بنجاح! ✓`);
      await load();
    } catch (err) {
      if (onErr) onErr(err.message || 'تعذّر التأكيد');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(payment) {
    const reason = prompt('يرجى كتابة سبب الرفض (مثال: لم تصل الحوالة / رقم العملية غير صحيح):', 'بيانات التحويل غير مطابقة أو لم يتم استلام الحوالة');
    if (!reason) return;

    setBusyId(payment.id);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id: payment.id, reason }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشل رفض الطلب');
      }
      if (onDone) onDone('تم تحديث حالة الطلب إلى مرفوض');
      await load();
    } catch (err) {
      if (onErr) onErr(err.message || 'تعذّر تحديث الطلب');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = payments
    .filter((p) => {
      if (filter === 'pending') return p.status === 'pending';
      if (filter === 'approved') return p.status === 'approved';
      if (filter === 'rejected') return p.status === 'rejected';
      return true;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.email || '').toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q) ||
        (p.senderName || '').toLowerCase().includes(q) ||
        (p.transactionNumber || '').toLowerCase().includes(q) ||
        (p.phone || '').includes(q)
      );
    });

  if (loading && !payments.length) {
    return <div className="skeleton" style={{ height: 260 }} />;
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      {/* بطاقات الإحصاءات */}
      <div className="grid grid-4">
        <div className="stat-card" style={{ borderRight: '4px solid #f59e0b' }}>
          <div className="stat-num" style={{ color: '#d97706' }}>
            {(stats?.pendingCount || 0).toLocaleString('ar-EG')}
          </div>
          <div className="stat-label">بانتظار التأكيد (جديد)</div>
        </div>

        <div className="stat-card" style={{ borderRight: '4px solid #10b981' }}>
          <div className="stat-num text-success">
            {(stats?.approvedCount || 0).toLocaleString('ar-EG')}
          </div>
          <div className="stat-label">مدفوعات مؤكدة ومفعلة</div>
        </div>

        <div className="stat-card" style={{ borderRight: '4px solid #ef4444' }}>
          <div className="stat-num" style={{ color: '#ef4444' }}>
            {(stats?.rejectedCount || 0).toLocaleString('ar-EG')}
          </div>
          <div className="stat-label">طلبات مرفوضة</div>
        </div>

        <div className="stat-card" style={{ borderRight: '4px solid #0284c7' }}>
          <div className="stat-num" style={{ color: '#0284c7' }}>
            ${stats?.totalCollected || 0}
          </div>
          <div className="stat-label">إجمالي المحصّل (USD)</div>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="row-between wrap" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'pending', label: `قيد الانتظار (${stats?.pendingCount || 0})` },
            { id: 'approved', label: `المعتمدة (${stats?.approvedCount || 0})` },
            { id: 'rejected', label: `المرفوضة (${stats?.rejectedCount || 0})` },
            { id: 'all', label: `الكل (${payments.length})` },
          ].map((f) => (
            <button
              key={f.id}
              className={`chip${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="row" style={{ gap: 8 }}>
          <div style={{ position: 'relative', width: 220 }}>
            <Search
              size={15}
              style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: 'var(--text-muted)' }}
            />
            <input
              className="input input-sm"
              style={{ paddingInlineStart: 32 }}
              placeholder="بحث بالاسم، الإيميل، رقم العملية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load} title="تحديث">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* قائمة طلبات الدفع */}
      <div className="stack" style={{ gap: 10 }}>
        {filtered.map((p) => {
          const isPending = p.status === 'pending';
          const isApproved = p.status === 'approved';
          const isRejected = p.status === 'rejected';

          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '16px 20px',
                borderInlineStart: `4px solid ${
                  isPending ? '#f59e0b' : isApproved ? '#10b981' : '#ef4444'
                }`,
              }}
            >
              <div className="row-between wrap" style={{ gap: 12 }}>
                {/* معلومات العميل والتحويل */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: 16 }}>
                      {p.clientName || 'عميل بدون اسم'}
                    </span>
                    <span
                      className={`badge ${
                        isApproved ? 'badge-success' : isPending ? 'badge-brand' : 'badge-danger'
                      }`}
                      style={{
                        background: isPending ? '#fef3c7' : undefined,
                        color: isPending ? '#92400e' : undefined,
                        border: isPending ? '1px solid #f59e0b' : undefined,
                      }}
                    >
                      {isApproved ? '✓ معتمد ومفعل' : isPending ? '⏳ قيد الانتظار' : '✕ مرفوض'}
                    </span>
                    <span className="badge badge-muted">
                      {p.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب'} ({p.accountType})
                    </span>
                    <span className="badge badge-brand" style={{ fontWeight: 800 }}>
                      ${p.amount} {p.currency}
                    </span>
                  </div>

                  <div className="row wrap text-muted" style={{ fontSize: 13, gap: 14 }}>
                    <span className="row" style={{ gap: 4 }}>
                      <Mail size={14} /> <span dir="ltr">{p.email}</span>
                    </span>
                    {p.phone && (
                      <span className="row" style={{ gap: 4 }}>
                        <Phone size={14} /> <span dir="ltr">{p.phone}</span>
                      </span>
                    )}
                    <span className="row" style={{ gap: 4 }}>
                      <Calendar size={14} /> {new Date(p.createdAt).toLocaleString('ar-YE')}
                    </span>
                  </div>

                  {/* بيانات التحقق (رقم العملية / اسم المحول) */}
                  <div
                    style={{
                      background: 'var(--card-subtle, #f8fafc)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '8px 14px',
                      marginTop: 10,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      fontSize: 13,
                    }}
                  >
                    {p.transactionNumber && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>رقم العملية: </span>
                        <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-numbers)' }}>
                          {p.transactionNumber}
                        </strong>
                      </div>
                    )}
                    {p.senderName && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>اسم المحول منه: </span>
                        <strong style={{ color: 'var(--text)' }}>{p.senderName}</strong>
                      </div>
                    )}
                    {p.notes && (
                      <div style={{ width: '100%', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>ملاحظات: </span>
                        {p.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* أزرار الإجراءات للمالك */}
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  {isPending && (
                    <>
                      <button
                        type="button"
                        className="btn btn-emerald btn-sm"
                        disabled={busyId === p.id}
                        onClick={() => handleApprove(p)}
                        style={{ fontWeight: 900, gap: 6, padding: '8px 16px' }}
                      >
                        {busyId === p.id ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={15} />}
                        تأكيد وتفعيل الاشتراك
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === p.id}
                        onClick={() => handleReject(p)}
                      >
                        <XCircle size={14} /> رفض
                      </button>
                    </>
                  )}

                  {p.phone && (
                    <a
                      href={`https://wa.me/967${p.phone.replace(/[^0-9]/g, '').slice(-9)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      title="مراسلة العميل واتساب"
                      style={{ color: '#10b981' }}
                    >
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              </div>

              {p.rejectionReason && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                  سبب الرفض: {p.rejectionReason}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card text-center text-muted" style={{ padding: 40 }}>
            {filter === 'pending'
              ? '🎉 لا توجد طلبات دفع قيد الانتظار حالياً.'
              : 'لا توجد طلبات مطابقة للبحث أو الفلتر.'}
          </div>
        )}
      </div>
    </div>
  );
}
