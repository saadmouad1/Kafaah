// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · packages (الباقات) — server-side store (src/data/packages.json)
//  الباقة الافتراضية: اشتراك شهري بسعر 5 دولار (لا توجد بوابات دفع بعد).
// ─────────────────────────────────────────────────────────────────────────────
import { readJson, writeJson, uid, today } from './store.js';

const FILE = 'packages.json';

const DEFAULT_PACKAGES = [
  {
    id: 'quarterly',
    name: 'باقة الـ 3 أشهر (المكثفة للامتحان)',
    nameEn: '3-Months Intensive Exam Prep',
    price: 12,
    originalPrice: 20,
    discount: '60%',
    badge: 'الأكثر اختياراً للامتحان · وفر 40% 🔥',
    currency: 'USD',
    interval: '3_months',
    features: [
      'صلاحية ممتدة لـ 90 يوماً كاملة تغطي فترة المذاكرة حتى موعد الامتحان',
      'توفير مالي حصري (12$ فقط بدلاً من 15$ للاشتراك الشهري)',
      'وصول غير محدود لجميع بنوك الأسئلة ودورات السنوات السابقة (صنعاء، عدن، السعودية)',
      'محاكاة امتحانات تجريبية موقوتة مطابقة لبيئة الاختبار الحقيقي',
      'مساعد أكاديمي ذكي AI غير محدود لشرح الحالات والسيناريوهات',
      'سجل الأخطاء التفاعلي وحفظ دائم لمستواك وتقدمك طوال فترة الاستعداد',
    ],
    featuresEn: [
      'Full 90-day extended validity covering your entire study period until exam day',
      'Exclusive savings: only $12 instead of $15 for month-by-month',
      'Unlimited access to all question banks & past exam rounds (Sana’a, Aden, Prometric)',
      'Unlimited realistic timed mock exams matching official council blueprints',
      'Unlimited AI academic tutor for case rationales and instant concept breakdowns',
      'Permanent mistakes bank & saved questions preserved throughout your journey',
    ],
    active: true,
    createdBy: 'system',
    createdAt: today(),
  },
  {
    id: 'monthly',
    name: 'الباقة الشهرية المرنة',
    nameEn: 'Monthly Flexible Plan',
    price: 5,
    originalPrice: 10,
    discount: '50%',
    badge: 'تجديد شهري مرن',
    currency: 'USD',
    interval: 'month',
    features: [
      'صلاحية لمدة 30 يوماً كاملة لجميع بنوك التخصص',
      'محاكاة امتحانات تجريبية غير محدودة مطابقة للامتحان الرسمي',
      'تحليل أداء تفصيلي واكتشاف نقاط الضعف ونسبة الجاهزية',
      'مساعد ذكي AI مدعوم بالذكاء الاصطناعي لشرح وتفسير الأسئلة',
      'سجل الأخطاء وبنك المفضلة مع حفظ التقدم التلقائي',
    ],
    featuresEn: [
      'Full 30-day access to all question banks in your specialization',
      'Unlimited realistic mock exams mimicking official testing blueprints',
      'Advanced performance analytics, weakness detection & exam readiness',
      'AI smart assistant for instant case explanations and rationale',
      'Mistakes bank & saved questions with progress persistence',
    ],
    active: true,
    createdBy: 'system',
    createdAt: today(),
  },
];

function load() {
  const data = readJson(FILE, null);
  if (!data || !Array.isArray(data.packages)) {
    const seeded = { packages: JSON.parse(JSON.stringify(DEFAULT_PACKAGES)) };
    writeJson(FILE, seeded);
    return seeded;
  }
  return data;
}

function save(packages) {
  return writeJson(FILE, { packages });
}

export function listPackages({ activeOnly = false } = {}) {
  const list = load().packages;
  return activeOnly ? list.filter((p) => p.active !== false) : list;
}

export function getPackage(id) {
  return load().packages.find((p) => p.id === id) || null;
}

export function createPackage(input = {}) {
  const data = load();
  const name = String(input.name || '').trim();
  if (!name) throw new Error('اسم الباقة مطلوب');
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('السعر غير صالح');
  let id = String(input.id || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!id) id = uid('pkg');
  if (data.packages.some((p) => p.id === id)) throw new Error('معرّف الباقة مستخدم');
  const pkg = {
    id,
    name,
    nameEn: String(input.nameEn || '').trim(),
    price,
    originalPrice: Number(input.originalPrice) || (price * 2),
    discount: input.discount ? String(input.discount).trim() : '50%',
    badge: input.badge ? String(input.badge).trim() : '',
    currency: String(input.currency || 'USD').trim().toUpperCase(),
    interval: ['month', 'year', 'once'].includes(input.interval) ? input.interval : 'month',
    features: Array.isArray(input.features) ? input.features.map((f) => String(f).trim()).filter(Boolean) : [],
    featuresEn: Array.isArray(input.featuresEn) ? input.featuresEn.map((f) => String(f).trim()).filter(Boolean) : [],
    active: input.active !== false,
    createdBy: input.createdBy || 'admin',
    createdAt: today(),
  };
  data.packages.push(pkg);
  save(data.packages);
  return pkg;
}

export function updatePackage(id, patch = {}) {
  const data = load();
  const pkg = data.packages.find((p) => p.id === id);
  if (!pkg) throw new Error('الباقة غير موجودة');
  if (patch.name !== undefined) {
    const name = String(patch.name || '').trim();
    if (!name) throw new Error('اسم الباقة مطلوب');
    pkg.name = name;
  }
  if (patch.nameEn !== undefined) pkg.nameEn = String(patch.nameEn || '').trim();
  if (patch.price !== undefined) {
    const price = Number(patch.price);
    if (!Number.isFinite(price) || price < 0) throw new Error('السعر غير صالح');
    pkg.price = price;
  }
  if (patch.originalPrice !== undefined) pkg.originalPrice = Number(patch.originalPrice) || 0;
  if (patch.discount !== undefined) pkg.discount = String(patch.discount || '').trim();
  if (patch.badge !== undefined) pkg.badge = String(patch.badge || '').trim();
  if (patch.currency !== undefined) pkg.currency = String(patch.currency || 'USD').trim().toUpperCase();
  if (patch.interval !== undefined) pkg.interval = ['month', 'year', 'once'].includes(patch.interval) ? patch.interval : pkg.interval;
  if (patch.features !== undefined) pkg.features = Array.isArray(patch.features) ? patch.features.map((f) => String(f).trim()).filter(Boolean) : [];
  if (patch.featuresEn !== undefined) pkg.featuresEn = Array.isArray(patch.featuresEn) ? patch.featuresEn.map((f) => String(f).trim()).filter(Boolean) : [];
  if (patch.active !== undefined) pkg.active = !!patch.active;
  save(data.packages);
  return pkg;
}

export function deletePackage(id) {
  const data = load();
  const before = data.packages.length;
  data.packages = data.packages.filter((p) => p.id !== id);
  if (data.packages.length === before) throw new Error('الباقة غير موجودة');
  save(data.packages);
  return { deleted: before - data.packages.length };
}
