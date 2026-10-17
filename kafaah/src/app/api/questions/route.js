import { NextResponse } from 'next/server';
import { queryQuestions, subjectsFor } from '@/lib/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/questions?sector=&spec=&specs=&bank=&banks=&subject=&difficulty=&search=&limit=&offset=
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

    if (sp.get('subjects') === '1') {
      return NextResponse.json({ subjects: subjectsFor({ sector, spec, specs }) });
    }

    const result = queryQuestions({
      sector, spec, specs, bank, banks, subject, difficulty, search,
      limit: sp.get('limit') || 20,
      offset: sp.get('offset') || 0,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الأسئلة' }, { status: 500 });
  }
}
