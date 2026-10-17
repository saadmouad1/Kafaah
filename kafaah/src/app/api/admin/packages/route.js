import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { listPackages, createPackage, updatePackage, deletePackage } from '@/lib/packages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });

// GET /api/admin/packages → كل الباقات
export async function GET() {
  if (!(await isAdmin())) return deny();
  try {
    return NextResponse.json({ packages: listPackages() });
  } catch (error) {
    return NextResponse.json({ error: 'تعذّر تحميل الباقات' }, { status: 500 });
  }
}

// POST /api/admin/packages  body: { action: 'create'|'update'|'delete', ... }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    switch (body.action) {
      case 'create':
        return NextResponse.json({ ok: true, package: createPackage(body.package || body) });
      case 'update':
        return NextResponse.json({ ok: true, package: updatePackage(body.id, body.patch || body.package || {}) });
      case 'delete':
        return NextResponse.json({ ok: true, ...deletePackage(body.id) });
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'فشل تنفيذ الإجراء' }, { status: 400 });
  }
}
