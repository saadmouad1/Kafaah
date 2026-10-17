import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const apiKey = process.env.GROQ_API_KEY || '';
const MODEL = 'openai/gpt-oss-120b';

function client() {
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ── خطة تشخيصية احتياطية (بلا إنترنت) ────────────────────────────────────────
function fallbackPlan({ specialty, authority, exam }) {
  return {
    readiness: 70,
    dailyTarget: 35,
    studyHours: 2,
    summary: `بناءً على تخصصك (${specialty || 'تخصصك'}) وجهة الترخيص (${authority || 'الجهة الرسمية'})، أعددنا لك مسارًا تدريبيًا مخصصًا يركّز على المحاور الأكثر تكرارًا في ${exam || 'امتحان المزاولة'}. بمعدل ٣٥ سؤالًا يوميًا ترتفع جاهزيتك بثبات.`,
    focusAreas: [
      'المعايير والبروتوكولات المعتمدة',
      'الحالات التطبيقية واتخاذ القرار',
      'التشريعات وأخلاقيات المهنة',
      'إدارة المخاطر والطوارئ',
      'تحليل الأخطاء والتكرار المتباعد',
    ],
    weeks: [
      { title: 'بناء الأساسيات', tasks: 'تغطية الأسئلة عالية التكرار', target: '75%' },
      { title: 'التخصصية الدقيقة', tasks: 'التركيز على الموضوعات المتقدمة', target: '82%' },
      { title: 'محاكاة تحت ضغط الوقت', tasks: 'امتحان كامل بمؤقّت', target: '88%' },
      { title: 'التثبيت النهائي', tasks: 'مراجعة الأخطاء والمفاهيم الحرجة', target: '92%' },
    ],
  };
}

function normalizePlan(raw, ctx) {
  if (!raw || typeof raw !== 'object') return fallbackPlan(ctx);
  return {
    readiness: raw.readiness_score ?? raw.readiness ?? 70,
    dailyTarget: raw.daily_target_questions ?? raw.dailyTarget ?? 35,
    studyHours: raw.estimated_study_hours ?? raw.studyHours ?? 2,
    summary: raw.ai_diagnostic_summary || raw.summary || fallbackPlan(ctx).summary,
    focusAreas: raw.high_yield_topics || raw.focusAreas || fallbackPlan(ctx).focusAreas,
    weeks: (raw.weekly_milestones || raw.weeks || fallbackPlan(ctx).weeks).map((w, i) => ({
      title: w.title || w.focus || `الأسبوع ${i + 1}`,
      tasks: w.tasks || w.focus || '',
      target: w.target || w.target_accuracy || '',
    })),
  };
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 });
  }

  // دعم الشكلين: { action, payload } و الشكل المسطّح { action, question, ... }
  const action = body.action;
  const payload = body.payload || body;
  const groq = client();

  // ── ١) الخطة التشخيصية ────────────────────────────────────────────────
  if (action === 'diagnostic_plan') {
    const ctx = {
      specialty: payload.specialty || payload.specLabel,
      authority: payload.authority || payload.country,
      exam: payload.exam_name || payload.exam,
    };
    if (!groq) return NextResponse.json({ success: true, plan: fallbackPlan(ctx), fallback: true });
    try {
      const prompt = `أنت مستشار أكاديمي في منصة «كفاءة» لتراخيص مزاولة المهن.
المجال: ${payload.profession || payload.sectorLabel || ''}
التخصص: ${ctx.specialty || ''}
الدولة وجهة الترخيص: ${payload.country || ''} (${ctx.exam || ''})
المستوى الحالي: ${payload.current_level || payload.level || 'خريج'}
التاريخ المستهدف: ${payload.target_date || payload.examDate || 'غير محدد'}

أعد JSON فقط بالبنية:
{"readiness_score":70,"daily_target_questions":35,"estimated_study_hours":2,"ai_diagnostic_summary":"...","high_yield_topics":["..."],"weekly_milestones":[{"week":1,"focus":"...","target_accuracy":"75%"}]}`;
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Return pure JSON only, no markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      });
      const cleaned = (completion.choices[0]?.message?.content || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      let parsed = {};
      try { parsed = JSON.parse(cleaned); } catch {}
      return NextResponse.json({ success: true, plan: normalizePlan(parsed, ctx) });
    } catch (e) {
      console.error('Groq diagnostic error:', e?.message);
      return NextResponse.json({ success: true, plan: fallbackPlan(ctx), fallback: true });
    }
  }

  // ── ٢) المدرّس الذكي ──────────────────────────────────────────────────
  if (action === 'tutor_query') {
    const question = payload.question || '';
    const options = payload.options || [];
    const correctAnswer = payload.correctAnswer || '';
    const subject = payload.subject || '';
    const userQuery = payload.user_query || payload.query || '';
    if (!groq) {
      return NextResponse.json({ success: true, text: 'خدمة المدرّس الذكي غير مُهيّأة حاليًا. راجع الشرح المرفق مع السؤال.' , fallback: true });
    }
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'أنت المعلّم الذكي لمنصة كفاءة. اشرح بأسلوب مبسّط ومحكم مع نصيحة للاختبار. أجب بالعربية بإيجاز.' },
          { role: 'user', content: `المادة: ${subject}\nالسؤال: ${question}\nالخيارات: ${options.join(' | ')}\nالإجابة الصحيحة: ${correctAnswer}\nاستفسار الطالب: ${userQuery || 'اشرح لي لماذا هذه الإجابة صحيحة'}` },
        ],
        temperature: 0.5,
        max_tokens: 700,
      });
      const text = completion.choices[0]?.message?.content || '';
      return NextResponse.json({ success: true, text, reply: text });
    } catch (e) {
      console.error('Groq tutor error:', e?.message);
      return NextResponse.json({ success: true, text: 'تعذّر الوصول للمدرّس الذكي حاليًا. حاول لاحقًا.', fallback: true });
    }
  }

  // ── ٣) محادثة المساعد الذكي (Chat) ──────────────────────────────────────
  if (action === 'chat') {
    const incoming = Array.isArray(payload.messages) ? payload.messages : [];
    const ctx = payload.context || {};
    const lang = payload.lang === 'en' ? 'en' : 'ar';
    const clean = incoming
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

    if (!clean.length) {
      return NextResponse.json({ error: 'لا توجد رسائل' }, { status: 400 });
    }

    const ctxLine = [
      ctx.sectorLabel ? (lang === 'en' ? `Sector: ${ctx.sectorLabel}` : `القطاع: ${ctx.sectorLabel}`) : '',
      ctx.specLabel ? (lang === 'en' ? `Specialization: ${ctx.specLabel}` : `التخصص: ${ctx.specLabel}`) : '',
      ctx.authority ? (lang === 'en' ? `Licensing authority: ${ctx.authority}` : `جهة الترخيص: ${ctx.authority}`) : '',
    ].filter(Boolean).join(lang === 'en' ? '\n' : '\n');

    const system = lang === 'en'
      ? `You are "Kafaah" AI assistant, a professional study companion for licensing and professional accreditation exams. Be accurate, concise, and encouraging. Use clear structure (short paragraphs or bullet points). If a question is outside exams/professions, gently steer back.${ctxLine ? '\n\nStudent context:\n' + ctxLine : ''}`
      : `أنت «المساعد الذكي» في منصة كفاءة، مرافق دراسي احترافي لامتحانات الترخيص والاعتماد المهني. كن دقيقًا ومختصرًا ومحفّزًا، ورتّب إجابتك في فقرات قصيرة أو نقاط. إن كان السؤال خارج نطاق المهن والامتحانات فوجّه بلطف.${ctxLine ? '\n\nسياق الطالب:\n' + ctxLine : ''}`;

    if (!groq) {
      return NextResponse.json({
        success: true,
        text: lang === 'en'
          ? 'The AI assistant is not configured right now. Please try again later.'
          : 'المساعد الذكي غير مُهيّأ حاليًا. حاول لاحقًا.',
        fallback: true,
      });
    }
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'system', content: system }, ...clean],
        temperature: 0.6,
        max_tokens: 1200,
      });
      const text = completion.choices[0]?.message?.content || '';
      return NextResponse.json({ success: true, text });
    } catch (e) {
      console.error('Groq chat error:', e?.message);
      return NextResponse.json({
        success: true,
        text: lang === 'en' ? "Couldn't reach the assistant right now. Try again later." : 'تعذّر الوصول إلى المساعد حاليًا. حاول لاحقًا.',
        fallback: true,
      });
    }
  }

  return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
}
