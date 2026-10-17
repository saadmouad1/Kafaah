import { NextResponse } from 'next/server';
import { upsertClient } from '@/lib/clients';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/clients → تسجيل/تحديث عميل (من صفحة التسجيل أو الدخول)
// body: { action: 'register'|'touch', email, name?, phone?, sectorId?, specId? }
export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action === 'register' ? 'register' : 'touch';
    const client = upsertClient({
      email: body.email,
      name: body.name,
      phone: body.phone,
      sectorId: body.sectorId,
      specId: body.specId,
      mode: action,
    });

    // مزامنة مع قاعدة البيانات في Prisma
    if (body.email) {
      try {
        const emailLower = body.email.trim().toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email: emailLower } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: emailLower,
              name: body.name || emailLower.split('@')[0],
              phone: body.phone || null,
              specialization: body.specId || null,
              subscription: 'trial',
              role: 'user',
            }
          });
        } else if (body.name || body.specId) {
          await prisma.user.update({
            where: { email: emailLower },
            data: {
              ...(body.name ? { name: body.name } : {}),
              ...(body.specId ? { specialization: body.specId } : {}),
            }
          });
        }
      } catch (dbErr) {
        console.warn('Prisma client sync notice:', dbErr.message);
      }
    }

    return NextResponse.json({ ok: true, client });
  } catch (error) {
    // لا نُفشل تجربة المستخدم المحلية إن تعذّرت المزامنة
    return NextResponse.json({ ok: false, error: error.message || 'تعذّرت المزامنة' }, { status: 200 });
  }
}
