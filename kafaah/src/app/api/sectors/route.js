import { NextResponse } from 'next/server';
import { SECTORS, ALL_SPECS } from '@/lib/content';
import { getBankIndex } from '@/lib/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/sectors  → نموذج المحتوى الموحّد + عدد الأسئلة لكل تخصص
export async function GET() {
  try {
    const index = getBankIndex();
    const counts = Object.fromEntries(index.items.map((i) => [i.specId, i.count]));

    const sectors = SECTORS.map((s) => ({
      id: s.id,
      label: s.label,
      short: s.short,
      icon: s.icon,
      color: s.color,
      gradient: s.gradient,
      tagline: s.tagline,
      description: s.description,
      lexicon: s.lexicon,
      count: index.bySector[s.id] || 0,
      specializations: s.specializations.map((sp) => ({
        ...sp,
        sectorId: s.id,
        count: counts[sp.id] || 0,
      })),
    }));

    return NextResponse.json({ sectors, totalQuestions: index.total, totalSpecs: ALL_SPECS.length });
  } catch (error) {
    console.error('Sectors API Error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الأقسام' }, { status: 500 });
  }
}
