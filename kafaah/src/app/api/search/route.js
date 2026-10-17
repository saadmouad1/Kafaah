import { NextResponse } from 'next/server';
import { deepSearch, searchSuggestions } from '@/lib/banks';

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

    if (sp.get('suggest') === '1') {
      return NextResponse.json({ suggestions: searchSuggestions({ sector, spec, specs, bank, banks }) });
    }

    const q = (sp.get('q') || '').trim();
    if (q.length < 2) {
      return NextResponse.json({ query: q, matchedRows: 0, unique: 0, banksInvolved: 0, duplicated: 0, groups: [], truncated: false });
    }

    const result = deepSearch({ sector, spec, specs, bank, banks, q, groupLimit: sp.get('limit') || 60 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'تعذّر إجراء البحث' }, { status: 500 });
  }
}
