// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · email (نظام الإشعارات والبريد الإلكتروني المعتمد)
//  مرتبط عبر Gmail SMTP الرسمي: almikhlafiprogrammer@gmail.com
//  تصميم بريد احترافي معتمد يحمل شعار منصة كفاءة الرسمي وهويتها البصرية
// ─────────────────────────────────────────────────────────────────────────────
import nodemailer from 'nodemailer';
import path from 'node:path';
import fs from 'node:fs';

function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'almikhlafiprogrammer@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'bitiurmfzxcbttht';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

const FROM_HEADER = `"منصة كفاءة | Kafaah" <${process.env.SMTP_USER || 'almikhlafiprogrammer@gmail.com'}>`;
const LOGO_WEB_URL = 'https://kafaah-three.vercel.app/icon-512.png';

function getLogoAttachments() {
  try {
    const localLogoPath = path.join(process.cwd(), 'public', 'icon-512.png');
    if (fs.existsSync(localLogoPath)) {
      return [
        {
          filename: 'kafaah-logo.png',
          path: localLogoPath,
          cid: 'kafaahLogo',
        },
      ];
    }
  } catch {}
  return [];
}

// ── ١) إرسال رمز التحقق الأمني OTP (دخول، استعادة كلمة المرور، أو تسجيل جديد) ──
export async function sendOtpEmail({ email, code, name, purpose = 'login' }) {
  if (!email) return { ok: false, error: 'البريد الإلكتروني مطلوب' };
  const transporter = getTransporter();

  const clientName = name ? `يا ${name}` : 'عزيزنا الممارس';

  let title = 'رمز التحقق لتسجيل الدخول';
  let desc = 'استخدم رمز الأمان التالي لإتمام تسجيل الدخول إلى حسابك ومتابعة تدريبك:';
  let subject = `🔐 رمز التحقق لتسجيل الدخول إلى كفاءة: ${code}`;
  let badgeText = 'تحقق أمني معتمد';

  if (purpose === 'reset') {
    title = 'إعادة تعيين كلمة المرور';
    desc = 'لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في منصة كفاءة. أدخل الرمز التالي لتعيين كلمة مرورك الجديدة:';
    subject = `🔑 رمز إعادة تعيين كلمة المرور - منصة كفاءة: ${code}`;
    badgeText = 'استعادة الحساب';
  } else if (purpose === 'register') {
    title = 'تأكيد الحساب والبريد الإلكتروني';
    desc = 'أهلاً بك في منصة كفاءة! استخدم رمز التحقق السري التالي لتأكيد ملكية بريدك الإلكتروني ومتابعة تفعيل اشتراكك:';
    subject = `✨ رمز تأكيد بريدك الإلكتروني - منصة كفاءة: ${code}`;
    badgeText = 'تأكيد الحساب الجديد';
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1.5px solid #e2e8f0; overflow: hidden; box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.08);">
        
        <!-- Header Bar with Emerald Accent -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 32px 24px 28px; text-align: center;">
          <img src="${LOGO_WEB_URL}" alt="منصة كفاءة" width="76" height="76" style="width: 76px; height: 76px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); border: 2.5px solid rgba(255, 255, 255, 0.9); margin-bottom: 12px; display: inline-block;" />
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 6px; letter-spacing: -0.5px;">مـنـصـة كـفـاءة</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 13.5px; margin: 0; font-weight: 600;">المنصة المعتمدة لاجتياز امتحانات مزاولة المهن الرسمية</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px;">
          <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 999px; padding: 4px 14px; color: #047857; font-size: 12px; font-weight: 800; margin-bottom: 14px;">
            ${badgeText}
          </div>

          <h2 style="color: #0f172a; font-size: 20px; font-weight: 900; margin: 0 0 10px;">${title}</h2>
          <p style="color: #334155; font-size: 14.5px; line-height: 1.7; margin: 0 0 20px;">
            مرحباً بك ${clientName}،<br/>${desc}
          </p>

          <!-- OTP Code Box -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px dashed #10b981; border-radius: 18px; padding: 22px; text-align: center; margin: 24px 0;">
            <div style="color: #065f46; font-size: 13px; font-weight: 800; margin-bottom: 8px;">رمز التحقق السري (OTP)</div>
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #047857; direction: ltr; margin: 6px 0 10px;">
              ${code}
            </div>
            <div style="color: #d97706; font-size: 12.5px; font-weight: 700;">
              ⏱️ هذا الرمز صالح لمدة 10 دقائق فقط للاستخدام لمرة واحدة
            </div>
          </div>

          <!-- Security Caution Box -->
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="font-size: 12.5px; color: #991b1b; margin: 0; line-height: 1.6;">
              🔒 <strong>تنبيه أمان:</strong> لا تشارك هذا الرمز مع أي شخص إطلاقاً. فريق منصة كفاءة لن يطلب منك هذا الرمز تحت أي ظرف.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center;">
            <p style="font-size: 12.5px; color: #64748b; margin: 0 0 6px;">
              فريق الدعم الفني معك دائماً للمساعدة:
            </p>
            <a href="https://wa.me/967772686817" style="color: #059669; font-weight: 800; text-decoration: none; font-size: 13px;">
              واتساب خدمة المشتركين: 772686817 967+
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
            منصة كفاءة © 2026 · جميع الحقوق محفوظة لتدريب وتأهيل الممارسين المهنيين
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = getLogoAttachments();

  if (!transporter) {
    console.log('[OTP Email Simulated]:', { to: email, code, purpose });
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: email,
    subject,
    html,
    attachments,
  });
}

// ── ٢) إشعار العميل فور إرسال إشعار التحويل البنكي (الكريمي / جيب) ───────────
export async function sendPaymentSubmittedEmailToClient(payment) {
  if (!payment.email) return;
  const transporter = getTransporter();

  const methodLabel = payment.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب';
  const name = payment.clientName || 'عزيزنا الممارس';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1.5px solid #e2e8f0; overflow: hidden; box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.08);">
        
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px 28px; text-align: center;">
          <img src="${LOGO_WEB_URL}" alt="منصة كفاءة" width="76" height="76" style="width: 76px; height: 76px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); border: 2.5px solid rgba(255, 255, 255, 0.9); margin-bottom: 12px; display: inline-block;" />
          <h1 style="color: #ffffff; font-size: 23px; font-weight: 900; margin: 0 0 6px;">تم استلام إشعار السداد بنجاح</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 13.5px; margin: 0; font-weight: 600;">شكراً لك يا ${name}، طلبك قيد المراجعة والمطابقة الفورية</p>
        </div>

        <div style="padding: 32px 28px;">
          <p style="font-size: 14.5px; color: #334155; line-height: 1.7; margin-top: 0;">
            لقد تم استلام بيانات إشعار السداد الخاص باشتراكك في <strong>${payment.packageName}</strong> بقيمة <strong>$${payment.amount}</strong> عبر <strong>${methodLabel}</strong>.
          </p>

          <div style="background: #f8fafc; border-radius: 14px; padding: 18px; border: 1px solid #e2e8f0; margin: 18px 0;">
            <div style="font-size: 12.5px; color: #64748b; margin-bottom: 6px; font-weight: 700;">بيانات التحويل المسجلة:</div>
            <div style="font-size: 15px; color: #0f172a; font-weight: 900;">
              ${payment.transactionNumber ? `رقم العملية: ${payment.transactionNumber}` : `اسم المحول: ${payment.senderName}`}
            </div>
            <div style="font-size: 12.5px; color: #64748b; margin-top: 6px;">
              الحالة الحالية: <span style="color: #d97706; font-weight: 800;">بانتظار مطابقة المشرف وتأكيد التفعيل</span>
            </div>
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="font-size: 13.5px; color: #065f46; margin: 0; line-height: 1.6;">
              ⚡ <strong>ماذا بعد؟</strong> يقوم المشرف بمطابقة الحوالة عبر كشف الحساب وتفعيل كامل مميزات المنصة لك فوراً، وسيصلك بريد إلكتروني رسمي بالتفعيل.
            </p>
          </div>

          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 18px;">
            <p style="font-size: 13px; color: #64748b; margin: 0 0 10px;">
              لتسريع التفعيل أو إرسال صورة السند مباشرة:
            </p>
            <a href="https://wa.me/967772686817?text=${encodeURIComponent(`السلام عليكم، قمت بإرسال حوالة اشتراك في منصة كفاءة باسم: ${payment.clientName} بقيمة $${payment.amount}`)}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13.5px; font-weight: 900; text-decoration: none;">
              واتساب الدعم الفني المباشر 💬
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
            منصة كفاءة © 2026 · جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = getLogoAttachments();

  if (!transporter) return { ok: true, simulated: true };

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: payment.email,
    subject: `⏳ استلمنا إشعار التحويل الخاص بك بنجاح | منصة كفاءة`,
    html,
    attachments,
  });
}

// ── ٣) تنبيه فوري للمالك بوجود عملية دفع جديدة تنتظر التفعيل ────────────────
export async function sendPaymentAlertToAdmin(payment) {
  const adminEmails = [
    process.env.ADMIN_NOTIFY_EMAIL || 'almikhlafiprogrammer@gmail.com',
    process.env.ADMIN_EMAIL || 'saadmouad2004@gmail.com',
  ].filter(Boolean);

  const transporter = getTransporter();

  const methodLabel = payment.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب';
  const identifierText = payment.transactionNumber
    ? `رقم العملية: <strong>${payment.transactionNumber}</strong>`
    : `اسم المحول: <strong>${payment.senderName}</strong>`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1.5px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
        
        <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
          <img src="${LOGO_WEB_URL}" alt="منصة كفاءة" width="60" height="60" style="width: 60px; height: 60px; border-radius: 16px; margin-bottom: 8px;" />
          <h2 style="margin: 0 0 4px; font-size: 20px; color: #ffffff;">🔔 طلب سداد اشتراك جديد بانتظار التأكيد</h2>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">منصة كفاءة — لوحة تحكم المالك</p>
        </div>

        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; width: 140px;">اسم المشترك:</td>
              <td style="padding: 10px 0; font-weight: 900; color: #0f172a;">${payment.clientName || 'غير مسجل'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">البريد الإلكتروني:</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a; direction: ltr; text-align: right;">${payment.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">رقم الهاتف / واتساب:</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a; direction: ltr; text-align: right;">${payment.phone || 'غير مسجل'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">طريقة التحويل:</td>
              <td style="padding: 10px 0; font-weight: 800; color: #0284c7;">${methodLabel} (${payment.accountType || ''})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b;">بيانات السند:</td>
              <td style="padding: 10px 0; font-weight: 900; color: #d97706;">${identifierText}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">الباقة والمبلغ:</td>
              <td style="padding: 10px 0; font-weight: 900; color: #059669; font-size: 16px;">${payment.packageName} — $${payment.amount}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://kafaah-three.vercel.app/admin" style="background: #059669; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-weight: 900; display: inline-block; font-size: 14.5px;">
              فتح لوحة المالك وتأكيد وتفعيل الحساب فوراً ⚡
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = getLogoAttachments();

  if (!transporter) {
    console.log('[Email Simulation] Admin Notification:', payment);
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: adminEmails.join(','),
    subject: `🔔 طلب دفع جديد (${methodLabel}): ${payment.clientName || payment.email} ($${payment.amount})`,
    html,
    attachments,
  });
}

// ── ٤) بريد تأكيد التفعيل الرسمي والمفصل للعميل بعد موافقة المشرف ──────────
export async function sendApprovalNoticeToClient(payment, subscription) {
  if (!payment.email) return;
  const transporter = getTransporter();

  const clientName = payment.clientName ? payment.clientName.trim() : 'زميلنا الممارس العزيز';
  const expiresDate = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'لمدة الصلاحية الكاملة';

  const methodLabel = payment.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1.5px solid #e2e8f0; overflow: hidden; box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.08);">
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 36px 24px 30px; text-align: center;">
          <img src="${LOGO_WEB_URL}" alt="منصة كفاءة" width="82" height="82" style="width: 82px; height: 82px; border-radius: 22px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); border: 3px solid rgba(255, 255, 255, 0.95); margin-bottom: 12px; display: inline-block;" />
          <div style="display: inline-block; padding: 4px 14px; background: rgba(255, 255, 255, 0.2); border-radius: 999px; color: #ffffff; font-size: 12px; font-weight: 900; margin-bottom: 10px;">
            ✓ تم تأكيد الحوالة وتفعيل الحساب بنجاح
          </div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 6px;">مرحباً بك في منصة كفاءة!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0; font-weight: 600;">خطوتك المعتمدة لاجتياز امتحان مزاولة المهنة بامتياز</p>
        </div>

        <div style="padding: 32px 28px;">
          <div style="background: #f0fdf4; border-radius: 16px; padding: 22px; border: 1px solid #bbf7d0; margin-bottom: 22px;">
            <h3 style="color: #065f46; font-size: 16.5px; margin-top: 0; margin-bottom: 10px; font-weight: 900;">
              عزيزنا الممارس / ${clientName}،
            </h3>
            <p style="font-size: 14.5px; color: #334155; line-height: 1.8; margin: 0;">
              يسعدنا إبلاغك بأنه قد تم تأكيد حوالتك وتفعيل كامل بنوك الأسئلة والمحاكيات الامتحانية والمساعد الذكي لحسابك بنجاح. يمكنك الآن الدخول فوراً وبدء التدريب التخصصي.
            </p>
          </div>

          <!-- Official Receipt -->
          <div style="background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <strong style="color: #0f172a; font-size: 14.5px; display: block; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              🧾 تفاصيل إيصال الاشتراك الرسمي:
            </strong>
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">اسم المشترك:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">الباقة المفعلة:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #059669;">${payment.packageName || 'باقة كفاءة الشاملة'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">المبلغ المدفوع:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">$${payment.amount}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">طريقة السداد:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0284c7;">${methodLabel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">صلاحية الوصول الكامل:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #b45309;">حتى ${expiresDate}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://kafaah-three.vercel.app/dashboard" style="background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 14px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.35);">
              الدخول للوحة التحكم وبدء التدريب 🚀
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">
            منصة كفاءة © 2026 · جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = getLogoAttachments();

  if (!transporter) {
    console.log('[Email Simulation] Client Activation Notice:', { to: payment.email });
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: payment.email,
    subject: `🎓 مرحباً بك يا ${clientName}! تم تفعيل اشتراكك الشامل في منصة كفاءة ✨`,
    html,
    attachments,
  });
}
