import { NextResponse } from 'next/server';
import { getBankIndex, bankStats, listBanks, banksFor } from '@/lib/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/banks              → فهرس البنوك (كل التخصصات)
// GET /api/banks?stats=1      → إحصاءات كاملة
// GET /api/banks?spec=x       → بنوك تخصص معيّن
// GET /api/banks?sector=x     → بنوك قطاع معيّن
// GET /api/banks?specs=a,b    → بنوك مجموعة تخصصات
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  try {
    if (sp.get('stats') === '1') {
      return NextResponse.json(bankStats());
    }
    const spec = sp.get('spec');
    const sector = sp.get('sector');
    const specs = sp.get('specs');
    if (spec && !sector && !specs) {
      return NextResponse.json({ specId: spec, banks: listBanks(spec) });
    }
    if (spec || sector || specs) {
      return NextResponse.json({ banks: banksFor({ spec, sector, specs }) });
    }
    return NextResponse.json(getBankIndex({ fresh: true }));
  } catch (error) {
    console.error('Banks API Error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الفهرس' }, { status: 500 });
  }
}
