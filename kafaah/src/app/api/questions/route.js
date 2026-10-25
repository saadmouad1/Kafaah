import { NextResponse } from 'next/server';
import { queryQuestions, subjectsFor, specExamMeta } from '@/lib/banks';

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

    // جلب بيانات النماذج والمراكز والسنوات المتاحة للتخصص
    if (sp.get('meta') === '1' && spec) {
      return NextResponse.json(specExamMeta(spec));
    }

    if (sp.get('subjects') === '1') {
      return NextResponse.json({ subjects: subjectsFor({ sector, spec, specs }) });
    }

    const result = queryQuestions({
      sector, spec, specs, bank, banks, subject, difficulty, search,
      year, years, location, language,
      limit: sp.get('limit') || 20,
      offset: sp.get('offset') || 0,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الأسئلة' }, { status: 500 });
  }
}
