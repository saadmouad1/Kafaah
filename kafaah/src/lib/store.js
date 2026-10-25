// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · generic JSON store (server-side & serverless resilient)
//  دعم متكامل لبيئات Vercel Serverless (قراءة فقط لـ /var/task مع دعم /tmp والذاكرة)
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SEED_DIR = path.join(process.cwd(), 'src', 'data');
const TMP_DIR = path.join(os.tmpdir(), 'kafaah_data');

if (!globalThis.__kafaah_store) {
  globalThis.__kafaah_store = new Map();
}
const cache = globalThis.__kafaah_store;

export function dataPath(name) {
  return path.join(SEED_DIR, name);
}

export function tmpPath(name) {
  return path.join(TMP_DIR, name);
}

export function readJson(name, fallback) {
  // 1. فحص الذاكرة السريعة أولاً (In-Memory Cache)
  if (cache.has(name)) {
    try {
      return JSON.parse(JSON.stringify(cache.get(name)));
    } catch {
      return cache.get(name);
    }
  }

  // 2. محاولة القراءة من مجلد التخزين المؤقت القابل للكتابة /tmp
  try {
    const rawTmp = fs.readFileSync(tmpPath(name), 'utf8');
    const parsed = JSON.parse(rawTmp);
    cache.set(name, parsed);
    return parsed;
  } catch {}

  // 3. الرجوع للملف الأصلي المضمن في حزمة المشروع تحت src/data
  try {
    const rawSeed = fs.readFileSync(dataPath(name), 'utf8');
    const parsed = JSON.parse(rawSeed);
    cache.set(name, parsed);
    return parsed;
  } catch {}

  return fallback;
}

export function writeJson(name, value) {
  // تحديث الذاكرة فوراً لمنع أي تأخير في الردود
  cache.set(name, value);

  let payload = '';
  try {
    payload = JSON.stringify(value, null, 1);
  } catch (err) {
    console.error(`[store] JSON stringify error for ${name}:`, err);
    return value;
  }

  // 1. الكتابة إلى مجلد /tmp القابل للكتابة في جميع بيئات التشغيل بما فيها Vercel
  try {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.writeFileSync(tmpPath(name), payload, 'utf8');
  } catch (tmpErr) {
    console.warn(`[store] Warning: write to tmp failed for ${name}:`, tmpErr.message);
  }

  // 2. محاولة التحديث في بيئة التطوير المحلية إن أمكن
  try {
    fs.mkdirSync(SEED_DIR, { recursive: true });
    fs.writeFileSync(dataPath(name), payload, 'utf8');
  } catch {
    // نتجاهل الخطأ في بيئة Vercel لأن الملفات محمية للقراءة فقط (EROFS)
  }

  return value;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
