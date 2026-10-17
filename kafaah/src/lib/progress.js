'use client';
// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · progress  — تخزين تقدّم المستخدم محليًا (localStorage)
//  أسئلة مُجابة، أخطاء، مفضلة، نتائج المحاكاة، سلسلة الأيام، وإحصاءات.
// ─────────────────────────────────────────────────────────────────────────────
const KEY = 'kafaah_progress_v1';
const listeners = new Set();

const EMPTY = {
  answered: {}, // questionId -> true
  correct: {},  // questionId -> true
  mistakes: {}, // questionId -> { count, lastAt, q:{...} }
  saved: {},    // questionId -> q:{...}
  mocks: [],    // [{at,total,correct,specId,minutes,passScore,passed}]
  daily: {},    // 'YYYY-MM-DD' -> { a, c }
  days: [],     // أيام النشاط (ISO date)
};

function read() {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function write(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getProgress() {
  return read();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function compact(q) {
  if (!q) return null;
  return {
    id: q.id, specId: q.specId, sectorId: q.sectorId, subject: q.subject,
    difficulty: q.difficulty, text: q.text, options: q.options, correctIndex: q.correctIndex,
    explanation: q.hasExplanation ? undefined : q.explanation,
  };
}

// تسجيل إجابة سؤال
export function recordAnswer(question, isCorrect, selectedIndex) {
  if (!question?.id) return;
  const s = read();
  s.answered[question.id] = true;
  if (isCorrect) {
    s.correct[question.id] = true;
    delete s.mistakes[question.id];
  } else {
    const prev = s.mistakes[question.id];
    s.mistakes[question.id] = {
      count: (prev?.count || 0) + 1,
      lastAt: new Date().toISOString(),
      subject: question.subject,
      q: compact(question),
    };
    delete s.correct[question.id];
  }
  const d = today();
  s.daily[d] = s.daily[d] || { a: 0, c: 0 };
  s.daily[d].a += 1;
  if (isCorrect) s.daily[d].c += 1;
  if (!s.days.includes(d)) s.days.push(d);
  write(s);
}

export function toggleSaved(question) {
  if (!question?.id) return false;
  const s = read();
  if (s.saved[question.id]) delete s.saved[question.id];
  else s.saved[question.id] = { at: new Date().toISOString(), q: compact(question) };
  write(s);
  return !!s.saved[question.id];
}

export function isSaved(id) {
  return !!read().saved[id];
}

export function removeMistake(id) {
  const s = read();
  delete s.mistakes[id];
  write(s);
}

export function clearMistakes() {
  const s = read();
  s.mistakes = {};
  write(s);
}

export function recordMock(result) {
  const s = read();
  s.mocks.unshift({ at: new Date().toISOString(), ...result });
  s.mocks = s.mocks.slice(0, 40);
  const d = today();
  s.daily[d] = s.daily[d] || { a: 0, c: 0 };
  s.daily[d].a += result.total || 0;
  s.daily[d].c += result.correct || 0;
  if (!s.days.includes(d)) s.days.push(d);
  write(s);
}

export function computeStreak(days) {
  if (!days?.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  // اسمح ببدء السلسلة من اليوم أو أمس
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getStats() {
  const s = read();
  const answered = Object.keys(s.answered).length;
  const correct = Object.keys(s.correct).length;
  const mistakes = Object.keys(s.mistakes).length;
  const saved = Object.keys(s.saved).length;
  const mocks = s.mocks || [];
  const bestMock = mocks.reduce((m, x) => Math.max(m, x.total ? Math.round((x.correct / x.total) * 100) : 0), 0);
  const avgMock = mocks.length
    ? Math.round(mocks.reduce((a, x) => a + (x.total ? (x.correct / x.total) * 100 : 0), 0) / mocks.length)
    : 0;
  return {
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    mistakes,
    saved,
    mocks: mocks.length,
    bestMock,
    avgMock,
    streak: computeStreak(s.days),
    last7: last7(s.daily),
  };
}

function last7(daily) {
  const out = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = dd.toISOString().slice(0, 10);
    out.push({ date: key, ...(daily[key] || { a: 0, c: 0 }) });
  }
  return out;
}

export function exportProgress() {
  const s = read();
  const answers = Object.keys(s.answered).map((id) => ({ id, correct: !!s.correct[id] }));
  return { version: 1, exportedAt: new Date().toISOString(), progress: { ...s, answeredRaw: answers } };
}

export function importProgress(data) {
  if (!data?.progress) throw new Error('ملف غير صالح');
  const p = data.progress;
  const s = read();
  const merged = {
    ...s,
    answered: { ...s.answered, ...(p.answered || {}) },
    correct: { ...s.correct, ...(p.correct || {}) },
    mistakes: { ...s.mistakes, ...(p.mistakes || {}) },
    saved: { ...s.saved, ...(p.saved || {}) },
    mocks: [...(p.mocks || []), ...s.mocks].slice(0, 60),
    days: [...new Set([...(s.days || []), ...(p.days || [])])],
  };
  write(merged);
  return true;
}

export function resetProgress() {
  write({ ...EMPTY });
}
