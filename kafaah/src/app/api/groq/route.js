import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const apiKey = process.env.GROQ_API_KEY || '';
const MODEL = 'qwen/qwen3.8-27b';

function client() {
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ── خطة تشخيصية ذكية واحترافية (باللغة العربية ومخصصة للمركز والتخصص) ──────────
function fallbackPlan({ specialty, authority, location, exam, level = 'خريج', lang = 'ar' }) {
  const locName = location === 'sanaa' ? 'المجلس الطبي بصنعاء'
    : location === 'aden' ? 'المجلس الطبي بعدن'
    : location === 'ksa' ? 'الهيئة السعودية للتخصصات الصحية (SCFHS)'
    : (authority || 'مجلس مزاولة المهنة المعتمد');

  const spec = specialty || 'تخصصك المهني';

  if (lang === 'en') {
    return {
      readiness: 72,
      dailyTarget: 35,
      studyHours: 2.5,
      summary: `Tailored study roadmap for ${spec} focused on the high-yield examination blueprint for ${locName}. By solving 35 questions daily and reviewing high-yield topics, you will steadily achieve full readiness.`,
      focusAreas: [
        'Core Principles & Clinical Guidelines',
        'High-Yield Applied Case Scenarios',
        'Ethics, Regulations & Patient Safety',
        'Emergency Management & Critical Protocols',
        'Mistake Log Mastery & Spaced Repetition',
      ],
      weeks: [
        { title: 'Week 1: Core Fundamentals & Blueprint', tasks: 'Review high-frequency foundational questions and baseline concepts', target: '75%' },
        { title: 'Week 2: Advanced Applied Scenarios', tasks: 'Focus on clinical cases and scenario decision-making', target: '82%' },
        { title: 'Week 3: Timed Realistic Simulation', tasks: 'Complete full mock exams under official time constraints', target: '88%' },
        { title: 'Week 4: Final Mastery & Rapid Review', tasks: 'Review personal mistake bank and critical high-yield takeaways', target: '94%' },
      ],
    };
  }

  return {
    readiness: 72,
    dailyTarget: 35,
    studyHours: 2.5,
    summary: `بناءً على تخصصك في «${spec}» واختيارك لمركز امتحان «${locName}»، قمنا بإعداد خطة دراسية متخصصة تركز على المعايير والنماذج الأكثر تكراراً في هذا المركز. بمعدل ٣٥ سؤالاً يومياً مع مراجعة الشروحات ستصل لنسبة جاهزية تتجاوز 90% بثقة تامة.`,
    focusAreas: [
      `المعايير المعتمدة في امتحانات ${locName}`,
      'الحالات التطبيقية الأكثر تكراراً في دورات السنوات السابقة',
      'بروتوكولات الطوارئ والقرارات التشخيصية الحرجة',
      'اللوائح وأخلاقيات الممارسة المهنية وسلامة المريض',
      'تثبيت المفاهيم عبر سجل الأخطاء والمراجعة التكرارية',
    ],
    weeks: [
      { title: 'الأسبوع الأول: الأساسيات والمعايير الأكثر تكراراً', tasks: `حل نماذج الأسئلة المتكررة واستيعاب خريطة أوزان امتحان ${locName}`, target: '75%' },
      { title: 'الأسبوع الثاني: الحالات السريرية والتطبيقية المعقدة', tasks: 'التركيز على السيناريوهات والتشخيص التفريقي وخطوات العلاج الأولى', target: '82%' },
      { title: 'الأسبوع الثالث: المحاكاة الواقعية تحت ضغط الوقت', tasks: 'إجراء امتحانات تجريبية كاملة بنفس مدة وعدد أسئلة الاختبار الفعلي', target: '88%' },
      { title: 'الأسبوع الرابع: بنك الأخطاء والتثبيت النهائي', tasks: 'مراجعة كافة الأسئلة المحفوظة والأخطاء السابقة لضمان عدم تكرارها', target: '94%' },
    ],
  };
}

function normalizePlan(raw, ctx) {
  const fb = fallbackPlan(ctx);
  if (!raw || typeof raw !== 'object') return fb;

  return {
    readiness: raw.readiness_score ?? raw.readiness ?? fb.readiness,
    dailyTarget: raw.daily_target_questions ?? raw.dailyTarget ?? fb.dailyTarget,
    studyHours: raw.estimated_study_hours ?? raw.studyHours ?? fb.studyHours,
    summary: raw.ai_diagnostic_summary || raw.summary || fb.summary,
    focusAreas: Array.isArray(raw.high_yield_topics) && raw.high_yield_topics.length
      ? raw.high_yield_topics
      : Array.isArray(raw.focusAreas) && raw.focusAreas.length
      ? raw.focusAreas
      : fb.focusAreas,
    weeks: (raw.weekly_milestones || raw.weeks || fb.weeks).map((w, i) => ({
      title: w.title || w.focus || `الأسبوع ${i + 1}`,
      tasks: w.tasks || w.focus || (fb.weeks[i]?.tasks || ''),
      target: w.target || w.target_accuracy || `${75 + i * 6}%`,
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

  const action = body.action;
  const payload = body.payload || body;
  const groq = client();

  // ── ١) الخطة التشخيصية الذكية ──────────────────────────────────────────
  if (action === 'diagnostic_plan') {
    const lang = payload.lang || 'ar';
    const location = payload.location || payload.examLocation || 'all';
    const locLabel = location === 'sanaa' ? 'المجلس الطبي بصنعاء (اليمن)'
      : location === 'aden' ? 'المجلس الطبي بعدن (اليمن)'
      : location === 'ksa' ? 'الهيئة السعودية للتخصصات الصحية SCFHS / برومترك (المملكة العربية السعودية)'
      : (payload.authority || payload.country || 'اليمن والمملكة العربية السعودية');

    const ctx = {
      specialty: payload.specialty || payload.specLabel || 'التخصص المهني',
      authority: locLabel,
      location,
      exam: payload.exam_name || payload.exam || 'امتحان مزاولة المهنة',
      level: payload.current_level || payload.level || 'خريج',
      lang,
    };

    if (!groq) {
      return NextResponse.json({ success: true, plan: fallbackPlan(ctx), fallback: true });
    }

    try {
      const prompt = lang === 'en'
        ? `You are a senior academic licensing advisor for the "Kafaah" preparation platform.
Specialization: ${ctx.specialty}
Target Examination Authority / Location: ${ctx.authority}
Candidate Level: ${ctx.level}
Target Exam Date: ${payload.target_date || payload.examDate || 'Upcoming session'}

Generate a realistic, high-impact, professional study plan tailored specifically to the ${ctx.authority} blueprint.
Output MUST be pure JSON with EXACTLY this structure, no code fences, no markdown formatting:
{
  "readiness_score": 75,
  "daily_target_questions": 35,
  "estimated_study_hours": 2.5,
  "ai_diagnostic_summary": "Detailed strategic summary...",
  "high_yield_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "weekly_milestones": [
    {"title": "Week 1: Core Fundamentals", "tasks": "Tasks description...", "target_accuracy": "75%"},
    {"title": "Week 2: Clinical Scenarios", "tasks": "Tasks description...", "target_accuracy": "82%"},
    {"title": "Week 3: Timed Mock Simulations", "tasks": "Tasks description...", "target_accuracy": "88%"},
    {"title": "Week 4: Mistake Bank & Mastery", "tasks": "Tasks description...", "target_accuracy": "94%"}
  ]
}`
        : `أنت مستشار أكاديمي خبير في منصة «كفاءة» للتدريب والاستعداد لامتحانات مزاولة المهن الرسمية.
التخصص: ${ctx.specialty}
مركز وهيئة الامتحان المستهدفة: ${ctx.authority}
المستوى الدراسي: ${ctx.level}
تاريخ الامتحان المستهدف: ${payload.target_date || payload.examDate || 'الدورة الامتحانية القادمة'}

أعد خطة دراسية متقنة ومخصصة خصيصاً لمعايير هذا المركز باللغة العربية الفصحى الأنيقة الخالية من أي علامات نجوم (**).
يجب أن يكون الناتج بتنسيق JSON نظيف وصحيح حصراً دون أي نص خارجي بالبنية التالية:
{
  "readiness_score": 75,
  "daily_target_questions": 35,
  "estimated_study_hours": 2.5,
  "ai_diagnostic_summary": "ملخص تشخيصي دقيق واستراتيجي يوضح كيفية اجتياز امتحان ${ctx.authority}...",
  "high_yield_topics": ["المحور الأول عالي التكرار", "المحور الثاني", "المحور الثالث", "المحور الرابع", "المحور الخامس"],
  "weekly_milestones": [
    {"title": "الأسبوع الأول: أساسيات المعايير", "tasks": "تفاصيل المهام الأسبوعية...", "target_accuracy": "75%"},
    {"title": "الأسبوع الثاني: الحالات والسيناريوهات", "tasks": "تفاصيل المهام الأسبوعية...", "target_accuracy": "82%"},
    {"title": "الأسبوع الثالث: المحاكاة الواقعية الموقوتة", "tasks": "تفاصيل المهام الأسبوعية...", "target_accuracy": "88%"},
    {"title": "الأسبوع الرابع: تثبيت بنك الأخطاء والمفاهيم الحرجة", "tasks": "تفاصيل المهام الأسبوعية...", "target_accuracy": "94%"}
  ]
}`;

      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are an academic exam advisor. Output strictly raw JSON. No markdown backticks, no explanations outside JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.35,
        max_tokens: 1500,
      });

      const rawContent = completion.choices[0]?.message?.content || '{}';
      const cleaned = rawContent.replace(/```json/gi, '').replace(/```/gi, '').trim();
      let parsed = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch {}
        }
      }

      if (parsed) {
        return NextResponse.json({ success: true, plan: normalizePlan(parsed, ctx) });
      }

      return NextResponse.json({ success: true, plan: fallbackPlan(ctx), fallback: true });
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
      ? `You are the "Kafaah AI Academic Study Companion", a dedicated expert tutor helping candidates prepare for professional practice licensing exams (in Health, Engineering, Law, Finance, and Education).

Important formatting and communication guidelines:
1. Writing style: Keep your tone academic, warm, encouraging, and natural.
2. Clean text: Avoid markdown asterisks (**) or raw markdown formatting symbols. Use clean lines, bullet dots (•), and simple numbers.
3. Greetings: If the student simply greets you (e.g. "hi", "hello"), respond with a short, warm, welcoming message in 1 or 2 sentences acknowledging their field/specialty and ask which concept or exam question they would like to review today. Do NOT dump long robotic bullet lists on simple greetings.
4. Explanations: When answering questions or clinical scenarios, be structured, concise, and focused on high-yield exam takeaways.${ctxLine ? '\n\nStudent context:\n' + ctxLine : ''}`
      : `أنت «المساعد الأكاديمي الذكي» في منصة كفاءة، مرافق دراسي خبير لمساعدة الطلاب والممارسين على الاستعداد والنجاح في امتحانات مزاولة المهنة (الصحية، الهندسية، القانونية، المالية، والتربوية).

إرشادات الأسلوب والتنسيق الإلزامية:
1. التنسيق الأنيق الخالي من علامات التشويش:
   - ممنوع تماماً استخدام علامات النجوم ** أو النجوم المزدوجة في النص العربي. اكتب العناوين والكلمات بصورة طبيعية وأنيقة دون نجوم.
   - استخدم لغة عربية سليمة، فصيحة، محفزة، ومريحة للقراءة.
   - استخدم رمز النقطة • للقوائم، أو الأرقام 1، 2، 3 عند التسلسل.
2. الردود على التحية والمحادثات القصيرة:
   - عند إلقاء التحية (مثل: مرحبا، السلام عليكم، صباح الخير، أهلاً):
     * رحّب بالطالب بأسلوب إنساني ودافئ ومختصر (في سطرين فقط).
     * اذكر تخصصه بتشجيع (مثلاً: «أهلاً بك يا دكتور! يسعدني مرافقتك في مذاكرة الصيدلة السريرية والاستعداد لامتحان المزاولة. ما هو الموضوع أو السؤال الذي تود أن نراجعه معاً اليوم؟»).
     * لا تطبع أبداً قوائم نقاط جاهزة أو أسئلة روبوتية طويلة مكررة عند مجرد إلقاء التحية.
3. الشرح الأكاديمي والسريري:
   - عند السؤال عن مفهوم أو مسألة، اشرح بدقة وتركيز: الفكرة الأساسية، التعليل العلمي، ونقطة تركيز هامة للامتحان.${ctxLine ? '\n\nسياق الطالب:\n' + ctxLine : ''}`;

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
