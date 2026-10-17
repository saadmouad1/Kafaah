import { NextResponse } from 'next/server';
import { loadContent } from '@/lib/contentStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/content → الأقسام والتخصصات (المصدر القابل للتعديل من لوحة المالك)
export async function GET() {
  try {
    return NextResponse.json(loadContent());
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل المحتوى' }, { status: 500 });
  }
}
