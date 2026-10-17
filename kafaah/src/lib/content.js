// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · unified content model
//  المصدر الوحيد للحقيقة: الأقسام (Sectors) ← التخصصات (Specializations)
//  كل تخصص يحمل: جهة الترخيص، مخطط الامتحان، ومعجم المصطلحات الخاص به.
//  يُستخدم من السيرفر والعميل معًا (لا يحتوي أي اعتماد على المتصفح).
// ─────────────────────────────────────────────────────────────────────────────

export const SECTORS = [
  {
    id: 'medical',
    label: 'القطاع الصحي والطبي',
    short: 'الصحي',
    icon: 'health',
    color: '#0ea5a4',
    colorSoft: '#e6fffb',
    gradient: ['#0ea5a4', '#0f766e'],
    tagline: 'رخص المزاولة الطبية والبورد',
    description:
      'بنوك أسئلة سريرية وتطبيقية تغطي الطب البشري، طب الأسنان، الصيدلة، التمريض، المختبرات، والعلاج الطبيعي وفق أحدث نماذج الامتحانات التخصصية والدولية.',
    lexicon: {
      field: 'المجال الطبي',
      practitioner: 'الممارس الصحي',
      exam: 'امتحان المزاولة',
      caseWord: 'الحالة السريرية',
      questionNoun: 'سؤال سريري',
      practiceTitle: 'التدريب',
      practiceSub: 'تدريب على أسئلة حقيقية مع شرح مفصّل لكل خيار.',
      mockTitle: 'محاكاة الامتحان',
      bankTitle: 'بنك الأسئلة',
    },
    specializations: [
      {
        id: 'gms',
        label: 'الطب البشري والجراحة العامة',
        country: 'اليمن · السعودية · الخليج',
        authority: 'المجلس الطبي · SMLE · DHA · Prometric',
        blueprint: { questions: 100, minutes: 150, passScore: 60 },
        keywords: ['طب', 'جراحة', 'باطنة', 'clinical', 'medicine'],
      },
      {
        id: 'dentistry',
        label: 'طب وجراحة الفم والأسنان',
        country: 'اليمن · السعودية',
        authority: 'المجلس الطبي · SCFHS Dentistry',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'pharmacy',
        label: 'الصيدلة السريرية والصيدلانية',
        country: 'السعودية · الخليج',
        authority: 'SCFHS Pharmacy',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'nursing',
        label: 'التمريض والرعاية الحرجة',
        country: 'السعودية · الخليج',
        authority: 'SCFHS Nursing · Prometric',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'lab',
        label: 'علوم المختبرات الطبية',
        country: 'اليمن · السعودية',
        authority: 'الهيئة السعودية للتخصصات · المجلس الطبي',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'pt',
        label: 'العلاج الطبيعي والتأهيل',
        country: 'السعودية · الخليج',
        authority: 'SCFHS Physical Therapy',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'radiology',
        label: 'التصوير الطبي والأشعة',
        country: 'الخليج',
        authority: 'SCFHS Radiology',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
      {
        id: 'emergency',
        label: 'طب الطوارئ والعناية المركزة',
        country: 'الخليج',
        authority: 'SCFHS Emergency Medicine',
        blueprint: { questions: 100, minutes: 120, passScore: 60 },
      },
    ],
  },

  {
    id: 'engineering',
    label: 'الهندسة والتقنية',
    short: 'الهندسي',
    icon: 'engineering',
    color: '#3b82f6',
    colorSoft: '#eff6ff',
    gradient: ['#3b82f6', '#1d4ed8'],
    tagline: 'التدريب والتأهيل المهني الهندسي',
    description:
      'تدريب مكثف على الكود والأنظمة الهندسية، التصميم الإنشائي، إدارة المشاريع، الأنظمة الكهربائية والميكانيكية، وهندسة البرمجيات والأمن السيبراني.',
    lexicon: {
      field: 'المجال الهندسي',
      practitioner: 'المهندس',
      exam: 'امتحان التصنيف المهني',
      caseWord: 'المسألة التطبيقية',
      questionNoun: 'سؤال تطبيقي',
      practiceTitle: 'التدريب',
      practiceSub: 'مسائل تطبيقية مع حلول وخطوات مفصّلة.',
      mockTitle: 'محاكاة الامتحان',
      bankTitle: 'بنك الأسئلة',
    },
    specializations: [
      { id: 'eng_civil', label: 'الهندسة المدنية والإنشائية', country: 'عام · السعودية', authority: 'هيئة المهندسين Saudi Council of Engineers', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_arch', label: 'الهندسة المعمارية والتخطيط', country: 'عام', authority: 'SCE Architecture', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_elec', label: 'الهندسة الكهربائية والإلكترونية', country: 'عام', authority: 'SCE Electrical', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_mech', label: 'الهندسة الميكانيكية والصناعية', country: 'عام', authority: 'SCE Mechanical', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_it', label: 'هندسة البرمجيات وتقنية المعلومات', country: 'عام', authority: 'SCE · الشهادات الدولية', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_chem', label: 'الهندسة الكيميائية', country: 'عام', authority: 'SCE Chemical', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
      { id: 'eng_env', label: 'الهندسة البيئية والمياه', country: 'عام', authority: 'SCE Environmental', blueprint: { questions: 80, minutes: 120, passScore: 60 } },
    ],
  },

  {
    id: 'law',
    label: 'القانون والمحاماة',
    short: 'القانوني',
    icon: 'law',
    color: '#8b5cf6',
    colorSoft: '#f5f3ff',
    gradient: ['#8b5cf6', '#6d28d9'],
    tagline: 'رخصة مزاولة المحاماة والقضاء',
    description:
      'نماذج اختبارات مزاولة مهنة المحاماة، اللوائح والمرافعات، الأنظمة التجارية والشركات، القانون الجنائي، والتحكيم الدولي وأخلاقيات المهنة.',
    lexicon: {
      field: 'المجال القانوني',
      practitioner: 'المحامي',
      exam: 'امتحان المزاولة',
      caseWord: 'الواقعة القانونية',
      questionNoun: 'سؤال قانوني',
      practiceTitle: 'التدريب',
      practiceSub: 'وقائع ومسائل مع تحليل السند والمواد النظامية.',
      mockTitle: 'محاكاة الامتحان',
      bankTitle: 'بنك الأسئلة',
    },
    specializations: [
      { id: 'law_bar', label: 'رخصة مزاولة مهنة المحاماة', country: 'عام · السعودية', authority: 'نقابة المحامين · وزارة العدل', blueprint: { questions: 100, minutes: 120, passScore: 60 } },
      { id: 'law_commercial', label: 'القانون التجاري والشركات', country: 'عام', authority: 'لجنة المحامين التجاريين', blueprint: { questions: 100, minutes: 120, passScore: 60 } },
      { id: 'law_criminal', label: 'القانون الجنائي والمرافعات', country: 'عام', authority: 'المعهد العالي للقضاء', blueprint: { questions: 100, minutes: 120, passScore: 60 } },
      { id: 'law_judiciary', label: 'القضاء والنيابة العامة', country: 'عام', authority: 'المعهد العالي للقضاء', blueprint: { questions: 100, minutes: 120, passScore: 60 } },
      { id: 'law_arbitration', label: 'التحكيم الدولي والوساطة', country: 'دولي', authority: 'هيئات التحكيم المعتمدة', blueprint: { questions: 100, minutes: 120, passScore: 60 } },
    ],
  },

  {
    id: 'finance',
    label: 'المحاسبة والمالية',
    short: 'المالي',
    icon: 'finance',
    color: '#f59e0b',
    colorSoft: '#fffbeb',
    gradient: ['#f59e0b', '#d97706'],
    tagline: 'الزمالات المهنية والمحاسبين',
    description:
      'معايير المحاسبة الدولية IFRS، التدقيق والمراجعة، إدارة المخاطر المالية، الزكاة والضرائب، والتحليل المالي وإدارة الاستثمار.',
    lexicon: {
      field: 'المجال المالي والمحاسبي',
      practitioner: 'المحاسب',
      exam: 'امتحان الزمالة',
      caseWord: 'الحالة المحاسبية',
      questionNoun: 'سؤال محاسبي',
      practiceTitle: 'التدريب',
      practiceSub: 'مسائل محاسبية ومالية مع تطبيق المعايير الدولية.',
      mockTitle: 'محاكاة الامتحان',
      bankTitle: 'بنك الأسئلة',
    },
    specializations: [
      { id: 'cpa', label: 'المحاسب القانوني المعتمد CPA', country: 'دولي', authority: 'AICPA', blueprint: { questions: 100, minutes: 180, passScore: 75 } },
      { id: 'cma', label: 'المحاسب الإداري المعتمد CMA', country: 'دولي', authority: 'IMA', blueprint: { questions: 100, minutes: 180, passScore: 72 } },
      { id: 'socpa', label: 'الزمالة السعودية SOCPA', country: 'السعودية', authority: 'الهيئة السعودية للمحاسبين', blueprint: { questions: 100, minutes: 180, passScore: 60 } },
      { id: 'cfa', label: 'المحلل المالي المعتمد CFA', country: 'دولي', authority: 'CFA Institute', blueprint: { questions: 90, minutes: 135, passScore: 70 } },
      { id: 'tax', label: 'الزكاة والضرائب', country: 'السعودية', authority: 'هيئة الزكاة والضريبة والجمارك', blueprint: { questions: 100, minutes: 150, passScore: 60 } },
    ],
  },

  {
    id: 'education',
    label: 'التربية والتعليم',
    short: 'التربوي',
    icon: 'education',
    color: '#ec4899',
    colorSoft: '#fdf2f8',
    gradient: ['#ec4899', '#be185d'],
    tagline: 'الرخصة المهنية للمعلمين',
    description:
      'المعايير التربوية العامة، استراتيجيات التدريس الحديثة، التقويم التربوي، القيادة والإشراف المدرسي، والإرشاد الطلابي.',
    lexicon: {
      field: 'المجال التربوي',
      practitioner: 'المعلّم',
      exam: 'الرخصة المهنية',
      caseWord: 'الموقف التربوي',
      questionNoun: 'سؤال تربوي',
      practiceTitle: 'التدريب',
      practiceSub: 'مواقف ومسائل تعليمية مع تحليل الأساليب والاستراتيجيات.',
      mockTitle: 'محاكاة الامتحان',
      bankTitle: 'بنك الأسئلة',
    },
    specializations: [
      { id: 'edu_general', label: 'الرخصة المهنية للمعلمين (عام)', country: 'السعودية', authority: 'هيئة تقويم التعليم والتدريب', blueprint: { questions: 88, minutes: 120, passScore: 60 } },
      { id: 'edu_subject', label: 'رخصة المعلم التخصصية', country: 'السعودية', authority: 'هيئة تقويم التعليم والتدريب', blueprint: { questions: 88, minutes: 120, passScore: 60 } },
      { id: 'edu_leadership', label: 'الإدارة والقيادة المدرسية', country: 'عام', authority: 'هيئات تطوير التعليم', blueprint: { questions: 88, minutes: 120, passScore: 60 } },
      { id: 'edu_counsel', label: 'الإرشاد الطلابي والتوجيه', country: 'عام', authority: 'هيئات تطوير التعليم', blueprint: { questions: 88, minutes: 120, passScore: 60 } },
    ],
  },
];

// ── Index helpers ─────────────────────────────────────────────────────────────

export const ALL_SPECS = SECTORS.flatMap((sector) =>
  sector.specializations.map((spec) => ({
    ...spec,
    sectorId: sector.id,
    sectorLabel: sector.label,
    sectorColor: sector.color,
    sectorIcon: sector.icon,
  })),
);

const SECTOR_MAP = Object.fromEntries(SECTORS.map((s) => [s.id, s]));
const SPEC_MAP = Object.fromEntries(ALL_SPECS.map((s) => [s.id, s]));

export function getSector(id) {
  return SECTOR_MAP[id] || SECTORS[0];
}

export function getSpec(id) {
  return SPEC_MAP[id] || ALL_SPECS[0];
}

export function findSectorIdBySpec(specId) {
  return SPEC_MAP[specId]?.sectorId || SECTORS[0].id;
}

export function specsOfSector(sectorId) {
  return SECTOR_MAP[sectorId]?.specializations || [];
}

export function countSpecs() {
  return ALL_SPECS.length;
}

// الحقول المعروضة للفلترة (تُستخدم في الأدمن والتحليلات)
export const DIFFICULTIES = [
  { id: 'easy', label: 'سهل', color: '#10b981' },
  { id: 'medium', label: 'متوسط', color: '#f59e0b' },
  { id: 'hard', label: 'صعب', color: '#ef4444' },
];
