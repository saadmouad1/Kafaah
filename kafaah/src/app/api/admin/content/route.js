import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import {
  loadContent, addSector, updateSector, deleteSector, addSpec, updateSpec, deleteSpec,
} from '@/lib/contentStore';
import { getBankIndex } from '@/lib/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });

// GET /api/admin/content → الأقسام والتخصصات + عدد الأسئلة لكل تخصص
export async function GET() {
  if (!(await isAdmin())) return deny();
  try {
    const content = loadContent();
    const index = getBankIndex();
    const counts = Object.fromEntries(index.items.map((i) => [i.specId, i.count]));
    const sectors = content.sectors.map((s) => ({
      ...s,
      count: index.bySector[s.id] || 0,
      specializations: (s.specializations || []).map((sp) => ({ ...sp, sectorId: s.id, count: counts[sp.id] || 0 })),
    }));
    return NextResponse.json({ sectors, specs: content.specs });
  } catch (error) {
    console.error('Admin content GET error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل المحتوى' }, { status: 500 });
  }
}

// POST /api/admin/content  body: { action, ... }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    switch (body.action) {
      case 'addSector':
        return NextResponse.json({ ok: true, sector: addSector(body.sector || body) });
      case 'updateSector':
        return NextResponse.json({ ok: true, sector: updateSector(body.id, body.patch || {}) });
      case 'deleteSector':
        return NextResponse.json({ ok: true, ...deleteSector(body.id) });
      case 'addSpec':
        return NextResponse.json({ ok: true, spec: addSpec(body.sectorId, body.spec || body) });
      case 'updateSpec':
        return NextResponse.json({ ok: true, spec: updateSpec(body.id, body.patch || {}) });
      case 'deleteSpec':
        return NextResponse.json({ ok: true, ...deleteSpec(body.id) });
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'فشل تنفيذ الإجراء' }, { status: 400 });
  }
}
