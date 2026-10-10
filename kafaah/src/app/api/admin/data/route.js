import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      include: {
        specializations: true,
        questions: true,
      },
    });

    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sectors, questions, users });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
