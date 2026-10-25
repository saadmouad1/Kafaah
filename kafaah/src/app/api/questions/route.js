import { NextResponse } from 'next/server';
import { queryQuestions, subjectsFor, specExamMeta } from '@/lib/banks';
import { authenticateAndVerifySubscription, checkRateLimit } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/questions?sector=&spec=&specs=&bank=&banks=&subject=&difficulty=&search=&year=&years=&location=&language=&limit=&offset=&meta=
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const sector = sp.get('sector');
    const spec = sp.get('spec');
    const specs = sp.get('specs');
    const bank = sp.get('bank');
    const banks = sp.get('banks');
    const subject = sp.get('subject');
    const difficulty = sp.get('difficulty');
    const search = sp.get('search');
    const year = sp.get('year');
    const years = sp.get('years');
    const location = sp.get('location');
    const language = sp.get('language');

    // ١) جلب بيانات الفهارس والمراكز والسنوات المتاحة للتخصص (بيانات وصفية عامة)
    if (sp.get('meta') === '1' && spec) {
      return NextResponse.json(specExamMeta(spec));
    }

    if (sp.get('subjects') === '1') {
      return NextResponse.json({ subjects: subjectsFor({ sector, spec, specs }) });
    }

    // ٢) فحص Rate Limit لمنع البوتات وهجمات حجب الخدمة ومحاولات استخراج البيانات
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'internal_ip';
    const rate = checkRateLimit(`q_req_${clientIp}`, 90, 60000);
    if (!rate.ok) {
      return NextResponse.json({
        error: `تم تجاوز معدل الطلبات المسموح به. يرجى الانتظار ${rate.retryAfterSec} ثانية.`,
        rateLimited: true,
      }, { status: 429 });
    }

    // ٣) فحص أمني حاسم: لا يُسلّم أي سؤال إلا لمستخدم مسجل ومؤكد الاشتراك من المشرف
    const auth = await authenticateAndVerifySubscription(request);
    if (!auth.authorized) {
      return NextResponse.json({
        error: auth.error || 'الوصول إلى بنوك الأسئلة مقفل: حسابك غير مشترك أو بانتظار تأكيد الحوالة من المشرف.',
        unauthorized: true,
        status: auth.status,
      }, { status: auth.status || 403 });
    }

    // ٤) حماية صارمة ضد الكشط: تحديد سقف أعلى لعدد الأسئلة المسترجعة بالطلب الواحد
    const requestedLimit = parseInt(sp.get('limit') || '20', 10);
    const safeLimit = Math.min(Math.max(isNaN(requestedLimit) ? 20 : requestedLimit, 1), 250);
    const requestedOffset = parseInt(sp.get('offset') || '0', 10);
    const safeOffset = Math.max(isNaN(requestedOffset) ? 0 : requestedOffset, 0);

    const result = queryQuestions({
      sector, spec, specs, bank, banks, subject, difficulty, search,
      year, years, location, language,
      limit: safeLimit,
      offset: safeOffset,
    });

    const res = NextResponse.json(result);
    // ترويسات أمان تمنع تخزين محتوى الأسئلة في الكاش العام
    res.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    return res;
  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الأسئلة' }, { status: 500 });
  }
}
