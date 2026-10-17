import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  addQuestions, updateQuestion, deleteQuestion, replaceBankQuestions,
  createBank, updateBank, deleteBank, listBanks,
  bankStats, subjectsFor, queryQuestions,
} from '@/lib/banks';
import { ALL_SPECS, SECTORS } from '@/lib/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin() {
  const store = await cookies();
  return store.get('kafaah_admin_session')?.value === 'authenticated';
}

function deny() {
  return NextResponse.json({ error: 'غير مصرّح — سجّل دخول المالك' }, { status: 401 });
}

// GET /api/admin/banks                 → إحصاءات + فهرس + المحتوى
// GET /api/admin/banks?spec=x          → بنوك التخصص
// GET /api/admin/banks?spec=x&bank=b   → أسئلة بنك (مع بحث/صفحات)
// GET /api/admin/banks?subjects=1&spec=x
export async function GET(request) {
  if (!(await isAdmin())) return deny();
  const sp = new URL(request.url).searchParams;
  const spec = sp.get('spec');
  try {
    if (sp.get('subjects') === '1') {
      return NextResponse.json({ subjects: subjectsFor({ spec }) });
    }
    if (spec && !sp.get('bank') && !sp.get('search') && !sp.get('offset') && !sp.get('limit')) {
      return NextResponse.json({ specId: spec, banks: listBanks(spec) });
    }
    if (spec) {
      return NextResponse.json({
        banks: listBanks(spec),
        ...queryQuestions({
          spec,
          bank: sp.get('bank'),
          search: sp.get('search'),
          subject: sp.get('subject'),
          difficulty: sp.get('difficulty'),
          limit: sp.get('limit') || 50,
          offset: sp.get('offset') || 0,
        }),
      });
    }
    return NextResponse.json({ stats: bankStats(), content: { sectors: SECTORS, specs: ALL_SPECS } });
  } catch (error) {
    console.error('Admin banks GET error:', error);
    return NextResponse.json({ error: 'تعذّر تحميل البيانات' }, { status: 500 });
  }
}

// POST /api/admin/banks  → طرق الإدخال المتعددة
// body: { action, specId, bankId?, question|questions, id?, patch?, title?, description? }
export async function POST(request) {
  if (!(await isAdmin())) return deny();
  try {
    const body = await request.json();
    const { action, specId, bankId } = body;

    switch (action) {
      case 'createBank': {
        const bank = createBank(specId, { title: body.title, description: body.description });
        return NextResponse.json({ ok: true, bank });
      }
      case 'updateBank': {
        const bank = updateBank(specId, bankId, { title: body.title, description: body.description });
        return NextResponse.json({ ok: true, bank });
      }
      case 'deleteBank': {
        const result = deleteBank(specId, bankId);
        return NextResponse.json({ ok: true, ...result });
      }
      case 'add': {
        const list = body.questions || body.question;
        const result = addQuestions(specId, bankId, list);
        return NextResponse.json({ ok: true, ...result });
      }
      case 'update': {
        const q = updateQuestion(specId, bankId, body.id, body.patch || body.question);
        return NextResponse.json({ ok: true, question: q });
      }
      case 'delete': {
        const result = deleteQuestion(specId, bankId, body.id);
        return NextResponse.json({ ok: true, ...result });
      }
      case 'replace': {
        const result = replaceBankQuestions(specId, bankId, body.questions);
        return NextResponse.json({ ok: true, ...result });
      }
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin banks POST error:', error);
    return NextResponse.json({ error: error.message || 'فشل تنفيذ الإجراء' }, { status: 400 });
  }
}
