// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · migrate-banks.mjs
//  يرقّي ملفات البنوك القديمة (questions على مستوى التخصص) إلى النموذج الجديد
//  (banks: [ { id, title, description, auto, questions } ]).
//  يُنشئ بنكًا افتراضيًا واحدًا لكل تخصص مع الحفاظ على كل الأسئلة.
//  التشغيل:  node scripts/migrate-banks.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANKS_DIR = path.join(__dirname, '..', 'src', 'data', 'banks');
const today = () => new Date().toISOString().slice(0, 10);

const files = fs.readdirSync(BANKS_DIR).filter((f) => f.endsWith('.json') && f !== '_index.json');

const index = [];
let migrated = 0;
let totalQ = 0;

for (const file of files) {
  const specId = file.replace(/\.json$/, '');
  const full = path.join(BANKS_DIR, file);
  const raw = JSON.parse(fs.readFileSync(full, 'utf8'));

  let banks;
  if (Array.isArray(raw.banks)) {
    banks = raw.banks;
  } else if (Array.isArray(raw.questions)) {
    banks = [
      {
        id: `${specId}-b1`,
        title: raw.banks?.[0]?.title || '',
        description: '',
        auto: true,
        createdAt: raw.updatedAt || today(),
        updatedAt: raw.updatedAt || today(),
        questions: raw.questions,
      },
    ];
    migrated++;
  } else {
    banks = [];
  }

  banks = banks.map((b, i) => {
    const id = b.id || `${specId}-b${i + 1}`;
    const questions = (b.questions || []).map((q) => ({ ...q, specId, bankId: id }));
    return {
      id,
      title: b.title || '',
      description: b.description || '',
      ...(b.auto || !b.title ? { auto: true } : {}),
      createdAt: b.createdAt || today(),
      updatedAt: b.updatedAt || today(),
      questions,
    };
  });

  const count = banks.reduce((s, b) => s + b.questions.length, 0);
  const payload = {
    specId,
    sectorId: raw.sectorId || 'medical',
    updatedAt: raw.updatedAt || today(),
    count,
    banks,
  };
  fs.writeFileSync(full, JSON.stringify(payload, null, 1), 'utf8');
  index.push({ specId, sectorId: payload.sectorId, count });
  totalQ += count;
  console.log(`• ${specId}: ${banks.length} bank(s) · ${count} questions`);
}

fs.writeFileSync(
  path.join(BANKS_DIR, '_index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), total: totalQ, files: index }, null, 1),
  'utf8',
);

console.log(`\n✅ migrated ${migrated} legacy file(s) · ${files.length} files · ${totalQ} questions`);
