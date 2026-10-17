// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · generic JSON store (server-side)
//  قراءة/كتابة ملفات JSON بسيطة تحت src/data مع ذاكرة مؤقتة اعتمادًا على mtime.
//  تُستخدم من Route Handlers فقط.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

export function dataPath(name) {
  return path.join(DATA_DIR, name);
}

export function readJson(name, fallback) {
  try {
    const raw = fs.readFileSync(dataPath(name), 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(name, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(dataPath(name), JSON.stringify(value, null, 1), 'utf8');
  return value;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
