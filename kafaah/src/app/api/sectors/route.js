import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      include: { specializations: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ sectors });
  } catch (error) {
    console.error('Sectors API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
  }
}
