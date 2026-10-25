import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });
  }
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
