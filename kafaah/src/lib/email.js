// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · email (نظام الإشعارات والبريد الإلكتروني المعتمد)
//  مرتبط عبر Gmail SMTP الرسمي: almikhlafiprogrammer@gmail.com
// ─────────────────────────────────────────────────────────────────────────────
import nodemailer from 'nodemailer';

// إعداد ناقل SMTP
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

// ── ١) إرسال رمز التحقق الأمني OTP (دخول، استعادة كلمة المرور، أو تسجيل جديد) ──
export async function sendOtpEmail({ email, code, name, purpose = 'login' }) {
  if (!email) return { ok: false, error: 'البريد الإلكتروني مطلوب' };
  const transporter = getTransporter();

  const clientName = name ? `يا ${name}` : 'عزيزنا الممارس';

  let title = 'رمز التحقق لتسجيل الدخول';
  let desc = 'استخدم رمز الأمان التالي لإتمام تسجيل الدخول إلى حسابك ومتابعة تدريبك:';
  let subject = `🔐 رمز التحقق لتسجيل الدخول إلى كفاءة: ${code}`;

  if (purpose === 'reset') {
    title = 'إعادة تعيين كلمة المرور';
    desc = 'لقد طلبت إعادة تعيين كلمة المرور لحسابك في منصة كفاءة. أدخل الرمز التالي لتعيين كلمة مرور جديدة:';
    subject = `🔑 رمز إعادة تعيين كلمة المرور - منصة كفاءة: ${code}`;
  } else if (purpose === 'register') {
    title = 'تأكيد الحساب والبريد الإلكتروني';
    desc = 'أهلاً بك في منصة كفاءة! استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني والبدء في تفعيل اشتراكك:';
    subject = `✨ رمز تأكيد بريدك الإلكتروني - منصة كفاءة: ${code}`;
  }

  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #0b1324; border-radius: 20px; border: 1px solid #1e293b; color: #f8fafc; line-height: 1.7;">
      
      <!-- Logo & Header -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #0d9488, #059669); line-height: 56px; color: #ffffff; font-size: 26px; font-weight: 900; margin-bottom: 12px; box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.5);">
          ك
        </div>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0 0 6px;">${title}</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">أهلاً بك ${clientName} في منصة كفاءة</p>
      </div>

      <!-- Main Box -->
      <div style="background: #111e38; border-radius: 16px; padding: 26px; border: 1px solid #1e3a5f; margin-bottom: 22px; text-align: center;">
        <p style="font-size: 14.5px; color: #cbd5e1; margin-top: 0; margin-bottom: 18px;">
          ${desc}
        </p>

        <!-- OTP Code Big Display -->
        <div style="display: inline-block; background: #064e3b; border: 2px dashed #10b981; border-radius: 14px; padding: 14px 32px; margin-bottom: 18px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #34d399;">
            ${code}
          </span>
        </div>

        <div style="color: #fbbf24; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ⏱️ هذا الرمز صالح لمدة 10 دقائق فقط لمرة واحدة
        </div>
      </div>

      <!-- Security Notice -->
      <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="font-size: 12.5px; color: #fca5a5; margin: 0;">
          🔒 <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص. فريق منصة كفاءة لن يطلب منك هذا الرمز إطلاقاً تحت أي ظرف.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 18px;">
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          منصة كفاءة لاجتياز امتحانات مزاولة المهن الرسمية · اليمن والمملكة العربية السعودية
        </p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('[OTP Email Simulated]:', { to: email, code, purpose });
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: email,
    subject,
    html,
  });
}

// ── ٢) إشعار العميل فور إرسال إشعار الدفع (الكريمي / جيب) ─────────────────────
export async function sendPaymentSubmittedEmailToClient(payment) {
  if (!payment.email) return;
  const transporter = getTransporter();

  const methodLabel = payment.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب';
  const name = payment.clientName || 'عزيزنا الممارس';

  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; color: #1e293b; line-height: 1.7;">
      
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 56px; height: 56px; border-radius: 16px; background: #0284c7; line-height: 56px; color: #ffffff; font-size: 26px; font-weight: 900; margin-bottom: 12px;">
          ⏳
        </div>
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 900; margin: 0 0 6px;">تم استلام إشعار التحويل بنجاح</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">شكراً لك يا <strong>${name}</strong>، جارٍ التحقق من الحوالة</p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <p style="font-size: 14.5px; color: #334155; margin-top: 0;">
          لقد استلمنا بيانات إشعار السداد الخاص باشتراكك في <strong>${payment.packageName}</strong> بقيمة <strong>$${payment.amount}</strong> عبر <strong>${methodLabel}</strong>.
        </p>

        <div style="background: #ffffff; border-radius: 10px; padding: 14px; border: 1px solid #cbd5e1; margin-top: 14px; font-size: 13.5px;">
          <div style="color: #64748b; margin-bottom: 4px;">بيانات العملية المرسلة:</div>
          <div style="color: #0f172a; font-weight: bold;">
            ${payment.transactionNumber ? `رقم العملية: ${payment.transactionNumber}` : `اسم المحول: ${payment.senderName}`}
          </div>
        </div>
      </div>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="font-size: 13px; color: #065f46; margin: 0;">
          ⚡ <strong>ماذا بعد؟</strong> يقوم فريق الإدارة بمطابقة العملية فوراً، وسيصلك بريد إلكتروني رسمي فور تفعيل حسابك لتبدأ التدريب مباشرة.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 18px;">
        <p style="font-size: 12.5px; color: #64748b; margin: 0 0 8px;">
          لأي استفسار أو تسريع التفعيل، يسعدنا تواصلك مع خدمة العملاء عبر واتساب:
        </p>
        <a href="https://wa.me/967772686817?text=${encodeURIComponent(`مرحباً، قمت بإرسال حوالة اشتراك في منصة كفاءة باسم: ${payment.clientName}`)}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; text-decoration: none;">
          واتساب الدعم الفني المباشر
        </a>
      </div>
    </div>
  `;

  if (!transporter) return { ok: true, simulated: true };

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: payment.email,
    subject: `⏳ استلمنا إشعار التحويل الخاص بك بنجاح | منصة كفاءة`,
    html,
  });
}

// ── ٣) تنبيه فوري للمالك بوجود عملية دفع جديدة ───────────────────────────────
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
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 26px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0 0 6px;">🔔 إشعار تحويل جديد ينتظر المراجعة</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">منصة كفاءة للتدريب على مزاولة المهن</p>
      </div>

      <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;">اسم العميل:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${payment.clientName || 'غير مسجل'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">البريد الإلكتروني:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; direction: ltr; text-align: right;">${payment.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">رقم الهاتف / واتساب:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; direction: ltr; text-align: right;">${payment.phone || 'غير مسجل'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">طريقة الدفع:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0284c7;">${methodLabel} (${payment.accountType || ''})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">بيانات التحقق:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #d97706;">${identifierText}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">الباقة والمبلغ:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #059669; font-size: 16px;">${payment.packageName} — $${payment.amount}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://kafaah-three.vercel.app/admin" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; display: inline-block;">
          فتح لوحة تحكم الإدارة وتفعيل الحساب ⚡
        </a>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('[Email Simulation] Admin Notification:', payment);
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: adminEmails.join(','),
    subject: `🔔 طلب دفع جديد (${methodLabel}): ${payment.clientName || payment.email} ($${payment.amount})`,
    html,
  });
}

// ── ٤) البريد الاحترافي الفخم: شكر العميل + تأكيد التفعيل الكامل ─────────────
export async function sendApprovalNoticeToClient(payment, subscription) {
  if (!payment.email) return;
  const transporter = getTransporter();

  const clientName = payment.clientName ? payment.clientName.trim() : 'زميلنا الممارس العزيز';
  const expiresDate = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'لمدة شهر كامل';

  const methodLabel = payment.method === 'kuraimi' ? 'بنك الكريمي' : 'محفظة جيب';

  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'IBM Plex Sans Arabic', Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; color: #1e293b; line-height: 1.8;">
      
      <!-- Top Brand Header -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; width: 62px; height: 62px; border-radius: 18px; background: linear-gradient(135deg, #0d9488, #059669); line-height: 62px; color: #ffffff; font-size: 30px; font-weight: 900; margin-bottom: 14px; box-shadow: 0 12px 28px -6px rgba(13, 148, 136, 0.45);">
          🎓
        </div>
        <div style="display: inline-block; padding: 4px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 999px; color: #047857; font-size: 12px; font-weight: 800; margin-bottom: 10px;">
          ✓ تم تأكيد الحوالة وتفعيل الحساب بنجاح
        </div>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0 0 8px;">
          مرحباً بك في منصة كفاءة!
        </h1>
        <p style="color: #64748b; font-size: 15px; margin: 0;">
          خطوتك الموثوقة لاجتياز امتحان مزاولة المهنة بامتياز
        </p>
      </div>

      <!-- Warm Letter of Gratitude -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 1px solid #bbf7d0; margin-bottom: 22px;">
        <h3 style="color: #065f46; font-size: 17px; margin-top: 0; margin-bottom: 10px; font-weight: 800;">
          عزيزنا الممارس / ${clientName}،
        </h3>
        <p style="font-size: 14.5px; color: #334155; margin: 0 0 12px;">
          يسعدنا ويشرفنا انضمامك إلى منصة <strong>«كفاءة»</strong>. نود أن نشكرك من القلب على ثقتك واختيارك لمنصتنا لتكون رفيقتك الأكاديمية الأولى في الاستعداد لاختبار مزاولة المهنة.
        </p>
        <p style="font-size: 14.5px; color: #334155; margin: 0;">
          نحن ندرك تماماً أهمية هذا الامتحان في مسيرتك المهنية ومستقبلك، ولهذا وضعنا بين يديك بنوك أسئلة حقيقية من دورات السنوات السابقة (صنعاء، عدن، والمملكة العربية السعودية)، مع نظام محاكاة دقيق ومساعد ذكاء اصطناعي يحلل مستواك ويوجهك حتى لحظة دخولك قاعة الامتحان وأنت في قمة الجاهزية.
        </p>
      </div>

      <!-- Official Subscription Receipt Card -->
      <div style="background: #f8fafc; border-radius: 16px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
          <strong style="color: #0f172a; font-size: 15px;">🧾 تفاصيل إيصال الاشتراك المعتمد:</strong>
          <span style="font-size: 12px; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 6px;">حساب نشط</span>
        </div>

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

      <!-- 3 Steps to Success -->
      <div style="background: #ffffff; border-radius: 16px; padding: 20px; border: 1.5px solid #e0e7ff; margin-bottom: 26px;">
        <h4 style="color: #3730a3; font-size: 15px; margin-top: 0; margin-bottom: 14px; font-weight: 800;">
          🚀 خطتك السريعة للانطلاق اليوم:
        </h4>
        <div style="font-size: 13.5px; color: #334155;">
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <span style="background: #4f46e5; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
            <span><strong>ابدأ بامتحان تجريبي لتشخيص مستواك:</strong> اختر مركزك (صنعاء، عدن، أو السعودية) واختبر نفسك في بيئة موقوتة مطابقة للواقع.</span>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <span style="background: #4f46e5; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
            <span><strong>ركّز على بنك الأخطاء:</strong> كل سؤال تخطئ فيه يتم حفظه تلقائياً لتتمكن من مراجعته وإتقانه حتى لا يتكرر.</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <span style="background: #4f46e5; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
            <span><strong>استشر المساعد الأكاديمي الذكي:</strong> اطرح أي استفسار سريري أو تخصصي لتحصل على شرح مبسّط وموجه للامتحان.</span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="https://kafaah-three.vercel.app/dashboard" style="background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 14px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 24px -6px rgba(5, 150, 105, 0.4);">
          ابدأ التدريب الآن على حسابك 🚀
        </a>
      </div>

      <!-- Support Footer -->
      <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">
          فريق كفاءة معك في كل خطوة. للتواصل المباشر مع فريق الدعم الفني:
        </p>
        <a href="https://wa.me/967772686817" style="color: #059669; font-weight: bold; text-decoration: none; font-size: 13.5px;">
          📱 واتساب الدعم الفني: 772686817 967+
        </a>
        <p style="font-size: 11.5px; color: #94a3b8; margin-top: 14px;">
          منصة كفاءة © 2026 — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('[Email Simulation] Client Activation Notice:', { to: payment.email });
    return { ok: true, simulated: true };
  }

  return await transporter.sendMail({
    from: FROM_HEADER,
    to: payment.email,
    subject: `🎓 مرحباً بك يا ${clientName}! تم تفعيل اشتراكك الشامل في منصة كفاءة ✨`,
    html,
  });
}
