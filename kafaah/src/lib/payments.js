// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · payments (طلبات الدفع والتحقق المحلي — الكريمي وجيب)
//  حفظ ومتابعة وتأكيد طلبات التحويل البنكي اليدوي
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid, today } from './store.js';
import { assignSubscription } from './subscriptions.js';
import { getPackage } from './packages.js';
import {
  sendPaymentAlertToAdmin,
  sendApprovalNoticeToClient,
  sendPaymentSubmittedEmailToClient
} from './email.js';

const FILE = 'payments.json';

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.payments)) {
    const seeded = { payments: [] };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(payments) {
  return writeJson(FILE, { payments });
}

export function listPayments({ status, email } = {}) {
  let list = load().payments;
  if (status) {
    list = list.filter((p) => p.status === status);
  }
  if (email) {
    const e = email.trim().toLowerCase();
    list = list.filter((p) => (p.email || '').toLowerCase() === e);
  }
  return list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export function getPayment(id) {
  return load().payments.find((p) => p.id === id) || null;
}

// العميل يرسل إشعار الدفع
export async function createPaymentRequest({
  email,
  clientName = '',
  phone = '',
  packageId = 'monthly',
  method = 'kuraimi', // 'kuraimi' | 'jeeb'
  accountType = 'aden_usd',
  transactionNumber = '',
  senderName = '',
  notes = '',
} = {}) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) throw new Error('البريد الإلكتروني للعميل مطلوب');

  const cleanTx = String(transactionNumber || '').trim();
  const cleanSender = String(senderName || '').trim();

  // التحقق: يجب إدخال رقم العملية أو اسم المحول على الأقل
  if (!cleanTx && !cleanSender) {
    throw new Error('يرجى كتابة رقم العملية أو اسم الشخص المحول منه لتأكيد الحوالة');
  }

  const pkg = getPackage(packageId) || {
    id: 'monthly',
    name: 'باقة كفاءة الشاملة',
    price: 5,
    currency: 'USD',
  };

  const data = load();
  const now = new Date().toISOString();

  const paymentRecord = {
    id: uid('pay'),
    email: e,
    clientName: clientName.trim(),
    phone: phone.trim(),
    packageId: pkg.id,
    packageName: pkg.name,
    amount: pkg.price,
    currency: pkg.currency || 'USD',
    method,
    accountType,
    transactionNumber: cleanTx,
    senderName: cleanSender,
    notes: notes.trim(),
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    createdAt: now,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };

  data.payments.unshift(paymentRecord);
  save(data.payments);

  // إرسال تنبيه للمالك وللعميل فوراً
  try {
    await Promise.allSettled([
      sendPaymentAlertToAdmin(paymentRecord),
      sendPaymentSubmittedEmailToClient(paymentRecord),
    ]);
  } catch (err) {
    console.warn('Payment notification emails warning:', err.message);
  }

  return paymentRecord;
}

// تأكيد الدفع وتفعيل الاشتراك تلقائياً للعميل
export async function approvePayment(id, adminEmail = 'admin') {
  const data = load();
  const p = data.payments.find((x) => x.id === id);
  if (!p) throw new Error('طلب الدفع غير موجود');

  if (p.status === 'approved') {
    return p; // معتمد مسبقاً
  }

  const now = new Date().toISOString();
  p.status = 'approved';
  p.reviewedAt = now;
  p.reviewedBy = adminEmail;

  save(data.payments);

  // 1. تفعيل الاشتراك في نظام الاشتراكات
  const sub = assignSubscription({
    email: p.email,
    clientName: p.clientName,
    packageId: p.packageId,
    status: 'active',
  });

  // 2. مزامنة مع جدول المستخدمين في قاعدة البيانات إن وجد
  try {
    await prisma.user.updateMany({
      where: { email: p.email.toLowerCase() },
      data: { subscription: p.packageId || 'premium' },
    });
  } catch (dbErr) {
    console.warn('Prisma sync warning:', dbErr.message);
  }

  // 3. إرسال بريد تهنئة وتأكيد تفعيل للعميل
  try {
    await sendApprovalNoticeToClient(p, sub);
  } catch (err) {
    console.warn('Client approval email warning:', err.message);
  }

  return { payment: p, subscription: sub };
}

// رفض طلب الدفع مع توضيح السبب
export function rejectPayment(id, reason = 'بيانات التحويل غير مطابقة أو لم تصل الحوالة بعد', adminEmail = 'admin') {
  const data = load();
  const p = data.payments.find((x) => x.id === id);
  if (!p) throw new Error('طلب الدفع غير موجود');

  p.status = 'rejected';
  p.reviewedAt = new Date().toISOString();
  p.reviewedBy = adminEmail;
  p.rejectionReason = reason;

  save(data.payments);
  return p;
}

// إحصائيات المدفوعات للمالك
export function getPaymentStats() {
  const list = load().payments;
  const pending = list.filter((p) => p.status === 'pending');
  const approved = list.filter((p) => p.status === 'approved');
  const rejected = list.filter((p) => p.status === 'rejected');

  const totalCollected = approved.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return {
    total: list.length,
    pendingCount: pending.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    totalCollected,
  };
}
