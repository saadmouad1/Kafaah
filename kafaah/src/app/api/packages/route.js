import { NextResponse } from 'next/server';
import { listPackages } from '@/lib/packages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/packages → الباقات المتاحة (النشطة فقط)
export async function GET() {
  try {
    return NextResponse.json({ packages: listPackages({ activeOnly: true }) });
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل الباقات' }, { status: 500 });
  }
}
