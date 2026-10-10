import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector') || null;
    const spec = searchParams.get('spec') || null;
    const limit = parseInt(searchParams.get('limit') || '0');

    const where = {};
    if (sector && sector !== 'all') where.sectorId = sector;
    if (spec && spec !== 'all') where.specializationId = spec;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      ...(limit > 0 ? { take: limit } : {}),
    });

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
