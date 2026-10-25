import { NextResponse } from 'next/server';
import { deepSearch, searchSuggestions } from '@/lib/banks';
import { authenticateAndVerifySubscription, checkRateLimit } from '@/lib/apiSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/search?q=&spec=&sector=&specs=&bank=&banks=&suggest=1
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const sector = sp.get('sector');
    const spec = sp.get('spec');
    const specs = sp.get('specs');
    const bank = sp.get('bank');
    const banks = sp.get('banks');

    // الاقتراحات السريعة للكلمات المفتاحية متاحة لتسهيل البحث
    if (sp.get('suggest') === '1') {
      return NextResponse.json({ suggestions: searchSuggestions({ sector, spec, specs, bank, banks }) });
    }

    const q = (sp.get('q') || '').trim();
    if (q.length < 2) {
      return NextResponse.json({ query: q, matchedRows: 0, unique: 0, banksInvolved: 0, duplicated: 0, groups: [], truncated: false });
    }

    // فحص معدل الطلبات
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'internal_ip';
    const rate = checkRateLimit(`search_${clientIp}`, 60, 60000);
    if (!rate.ok) {
      return NextResponse.json({
        error: `تم تجاوز معدل البحث المسموح به. يرجى الانتظار ${rate.retryAfterSec} ثانية.`,
      }, { status: 429 });
    }

    // التحقق الصارم من اشتراك العميل قبل عرض نتائج بنوك الأسئلة
    const auth = await authenticateAndVerifySubscription(request);
    if (!auth.authorized) {
      return NextResponse.json({
        error: auth.error || 'البحث في بنك الأسئلة مقفل: يتطلب اشتراكاً نشطاً ومؤكداً من المشرف.',
        unauthorized: true,
      }, { status: auth.status || 403 });
    }

    const requestedLimit = parseInt(sp.get('limit') || '60', 10);
    const safeLimit = Math.min(Math.max(isNaN(requestedLimit) ? 60 : requestedLimit, 1), 60);

    const result = deepSearch({ sector, spec, specs, bank, banks, q, groupLimit: safeLimit });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'تعذّر إجراء البحث' }, { status: 500 });
  }
}
