'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Timer, Play, Flag, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Award,
  Calendar, MapPin, Languages, Layers, CheckSquare, Square, Check, Filter,
  Sparkles, SlidersHorizontal, BookOpen, AlertCircle, MessageCircle, Copy,
  Clock, Infinity, Plus, Minus
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { useQuestions, useSpecMeta, shuffle, isEnglish } from '../../../lib/useData';
import { recordMock } from '../../../lib/progress';
import QuestionView from '../../../components/QuestionView';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const LOCATIONS = [
  { id: 'all', label: 'جميع المراكز والجهات', short: 'الكل', flag: '🌐' },
  { id: 'sanaa', label: 'صنعاء — المجلس الطبي اليمني', short: 'صنعاء', flag: '🇾🇪' },
  { id: 'aden', label: 'عدن — المجلس الطبي ووزارة الصحة', short: 'عدن', flag: '🇾🇪' },
  { id: 'ksa', label: 'السعودية — الهيئة SCFHS / برومترك', short: 'السعودية', flag: '🇸🇦' },
];

const LANGUAGES = [
  { id: 'all', label: 'الكل (كما أُضيفت أصلاً)', short: 'الكل' },
  { id: 'ar', label: 'العربية فقط', short: 'العربية' },
  { id: 'en', label: 'English Only', short: 'English' },
];

export default function MockPage() {
  const { profile, spec, t, locale, specName, bankName } = useKafaah();
  const specId = profile?.specId;
  const bp = spec?.blueprint || { questions: 40, minutes: 60, passScore: 60 };

  const { models, years, modelsByYear, loading: metaLoading } = useSpecMeta(specId);

  // Filters State
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [yearTab, setYearTab] = useState('all');
  const [selectedModels, setSelectedModels] = useState([]); // Array of bank/model IDs
  const [difficulty, setDifficulty] = useState('all');
  const [count, setCount] = useState(100);
  const [timerMode, setTimerMode] = useState('countdown'); // 'countdown' | 'open'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'wrong' | 'correct'

  // Exam Run State
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // جلب الأسئلة وفق النماذج والسنوات والموقع المختار بحرية تامة دون أي تقييد
  const requestLimit = Math.min(5000, Math.max(count || 100, 100));

  const { questions, total, loading } = useQuestions({
    spec: specId,
    banks: selectedModels.length ? selectedModels : null,
    year: !selectedModels.length && yearTab !== 'all' ? yearTab : null,
    location: selectedLocation !== 'all' ? selectedLocation : null,
    language: selectedLanguage !== 'all' ? selectedLanguage : null,
    difficulty,
    limit: requestLimit,
    offset: seed,
    enabled: true,
  });

  const effCount = total > 0 ? Math.min(count, total) : count;
  const deck = useMemo(() => shuffle(questions).slice(0, effCount), [questions, effCount]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(bp.minutes * 60);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!started || submitted) return;
    if (timerMode === 'countdown') {
      if (secondsLeft <= 0) { setSubmitted(true); return; }
      const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setSecondsElapsed((s) => s + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [started, submitted, secondsLeft, secondsElapsed, timerMode]);

  const answeredCount = Object.keys(answers).length;

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    setIdx(0);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const result = useMemo(() => {
    if (!submitted) return null;
    let c = 0;
    const byBank = {};
    deck.forEach((q) => {
      const correct = q.correctIndex ?? q.correct_index ?? 0;
      const ok = answers[q.id] === correct;
      if (ok) c++;
      const key = bankName({ specId: q.specId, title: q.bankTitle, auto: q.bankAuto }) || t('common.general');
      byBank[key] = byBank[key] || { c: 0, t: 0 };
      byBank[key].t++;
      if (ok) byBank[key].c++;
    });
    const pct = deck.length ? Math.round((c / deck.length) * 100) : 0;
    return { correct: c, total: deck.length, pct, passed: pct >= bp.passScore, byBank };
  }, [submitted, deck, answers, bp.passScore, bankName, t]);

  useEffect(() => {
    if (submitted && result && result.total) {
      const minutesPerQ = (bp.questions > 0 && bp.minutes > 0) ? (bp.minutes / bp.questions) : 1.25;
      const allocMin = Math.max(10, Math.round(deck.length * minutesPerQ));
      const minutesSpent = timerMode === 'countdown'
        ? Math.max(1, Math.round((allocMin * 60 - secondsLeft) / 60))
        : Math.max(1, Math.round(secondsElapsed / 60));

      recordMock({
        total: result.total,
        correct: result.correct,
        specId: spec?.id,
        minutes: minutesSpent,
        passScore: bp.passScore,
        passed: result.passed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  function begin() {
    const eff = total > 0 ? Math.min(count, total) : count;
    setCount(eff);
    const maxOff = Math.max(0, total - eff);
    setSeed(maxOff > 0 ? Math.floor(Math.random() * maxOff) : 0);
    const minutesPerQ = (bp.questions > 0 && bp.minutes > 0) ? (bp.minutes / bp.questions) : 1.25;
    const calcMin = Math.max(10, Math.round(eff * minutesPerQ));
    setSecondsLeft(calcMin * 60);
    setSecondsElapsed(0);
    setAnswers({});
    setFlags({});
    setIdx(0);
    setStarted(true);
  }

  function restart() {
    setStarted(false);
    setSubmitted(false);
    setAnswers({});
    setFlags({});
    setIdx(0);
    setSecondsElapsed(0);
    const minutesPerQ = (bp.questions > 0 && bp.minutes > 0) ? (bp.minutes / bp.questions) : 1.25;
    setSecondsLeft(Math.max(10, Math.round(count * minutesPerQ)) * 60);
    setCopiedShare(false);
  }

  // تبديل اختيار نموذج محدد
  const toggleModel = (modelId) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
  };

  // تحديد نماذج سنة محددة أو إلغاء الكل
  const selectAllInYear = (yr) => {
    const targetModels = yr === 'all' ? models : (modelsByYear[yr] || []);
    const targetIds = targetModels.map((m) => m.id);
    setSelectedModels((prev) => [...new Set([...prev, ...targetIds])]);
  };

  const clearSelection = () => {
    setSelectedModels([]);
  };

  // النماذج المعروضة حالياً حسب تبويب السنة المختار
  const displayedModels = useMemo(() => {
    let list = yearTab === 'all' ? models : (modelsByYear[yearTab] || []);
    if (selectedLocation !== 'all') {
      list = list.filter((m) => m.location === 'all' || m.location === selectedLocation || (m.locations || []).includes(selectedLocation));
    }
    return list;
  }, [models, modelsByYear, yearTab, selectedLocation]);

  // ── شاشة الإعداد ──
  if (!started) {
    return (
      <div className="stack" style={{ gap: 20 }}>
        <div>
          <h1 className="page-title">{t('nav.mock')}</h1>
          <p className="text-muted mt-1">
            اختر مركز الامتحان، والسنوات والنماذج التي تود الاختبار منها، أو حدد أكثر من نموذج لتجربة محاكاة شاملة.
          </p>
        </div>

        {/* 1. اختيار مركز / جهة الامتحان */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <MapPin size={18} style={{ color: 'var(--sector)' }} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>مركز وهيئة الامتحان المستهدفة</h3>
          </div>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
            اختر المركز لتخصيص وإظهار الأسئلة المعتمدة في امتحانات تلك الجهة (صنعاء، عدن، أو السعودية Prometric):
          </p>
          <div className="grid grid-2" style={{ gap: 10 }}>
            {LOCATIONS.map((loc) => {
              const active = selectedLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocation(loc.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: `2px solid ${active ? 'var(--sector)' : 'var(--border)'}`,
                    background: active ? 'color-mix(in srgb, var(--sector) 10%, var(--surface))' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{loc.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: active ? 'var(--sector)' : 'var(--text)' }}>
                      {loc.label}
                    </div>
                  </div>
                  {active && <CheckCircle2 size={18} style={{ color: 'var(--sector)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. اختيار لغة الأسئلة */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row-between wrap" style={{ gap: 8, marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <Languages size={18} style={{ color: 'var(--sector)' }} />
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>لغة عرض الأسئلة</h3>
            </div>
            <span className="badge badge-muted" style={{ fontSize: 11 }}>نص أصلي بدون ترجمة</span>
          </div>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
            تُعرض الأسئلة بنصها وخياراتها الأصلية كما أُضيفت في بنك الاختبارات (عربي أو إنجليزي):
          </p>
          <div className="chip-row">
            {LANGUAGES.map((langItem) => (
              <span
                key={langItem.id}
                className={`chip${selectedLanguage === langItem.id ? ' active' : ''}`}
                onClick={() => setSelectedLanguage(langItem.id)}
                style={{ padding: '8px 16px', fontSize: 13.5, cursor: 'pointer' }}
              >
                {langItem.label}
              </span>
            ))}
          </div>
        </div>

        {/* 3. السنوات واختيار النماذج المتعددة */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row-between wrap" style={{ gap: 10, marginBottom: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--sector)' }} />
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>السنوات والنماذج الامتحانية</h3>
            </div>
            {selectedModels.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearSelection}
                style={{ fontSize: 12, color: 'var(--danger)' }}
              >
                إلغاء تحديد كل النماذج ({selectedModels.length})
              </button>
            )}
          </div>

          <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
            اختر السنة لاستعراض نماذجها، ويمكنك تحديد أكثر من نموذج من سنوات مختلفة للدمج بينهم في الامتحان:
          </p>

          {/* تبويبات السنوات */}
          <div className="chip-row mb-3">
            <span
              className={`chip${yearTab === 'all' ? ' active' : ''}`}
              onClick={() => setYearTab('all')}
              style={{ fontWeight: 800 }}
            >
              جميع السنوات
            </span>
            {(years || []).map((yr) => (
              <span
                key={yr}
                className={`chip${yearTab === yr ? ' active' : ''}`}
                onClick={() => setYearTab(yr)}
                style={{ fontWeight: 800 }}
              >
                {yr}
              </span>
            ))}
          </div>

          {/* شريط الإجراء السريع للنماذج */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-subtle, #f8fafc)',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 12.5,
              marginBottom: 12,
            }}
          >
            <span>
              النماذج المحددة للامتحان:{' '}
              <strong style={{ color: 'var(--sector)' }}>
                {selectedModels.length === 0 ? 'كامل بنك التخصص' : `${selectedModels.length} نماذج`}
              </strong>
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: '4px 10px', fontSize: 11.5 }}
              onClick={() => selectAllInYear(yearTab)}
            >
              تحديد كل نماذج {yearTab === 'all' ? 'المعروضة' : yearTab}
            </button>
          </div>

          {/* قائمة كروت النماذج للاختيار المتعدد */}
          <div className="stack" style={{ gap: 8, maxHeight: 320, overflowY: 'auto', paddingInlineEnd: 4 }}>
            {displayedModels.map((m, idx) => {
              const isChecked = selectedModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  style={{
                    border: `1.5px solid ${isChecked ? 'var(--sector)' : 'var(--border)'}`,
                    background: isChecked ? 'color-mix(in srgb, var(--sector) 8%, var(--surface))' : 'var(--surface)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ color: isChecked ? 'var(--sector)' : 'var(--text-muted)' }}>
                    {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>
                      {m.title || `نموذج اختبار معتمد (${idx + 1})`}
                    </div>
                    <div className="row wrap" style={{ gap: 8, marginTop: 4, fontSize: 11.5 }}>
                      <span className="badge badge-brand">{m.year || '2025'}</span>
                      <span className="badge badge-muted">{m.count || 0} سؤال</span>
                      {m.location && m.location !== 'all' && (
                        <span className="badge badge-gold">
                          {m.location === 'sanaa' ? 'المجلس الطبي بصنعاء' : m.location === 'aden' ? 'عدن' : 'السعودية'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {displayedModels.length === 0 && (
              <div className="text-center text-muted" style={{ padding: 24, fontSize: 13 }}>
                لا توجد نماذج مخصصة لهذه السنة بعد، سيتم سحب الأسئلة العامة من التخصص.
              </div>
            )}
          </div>
        </div>

        {/* 4. إعدادات الامتحان (العدد والوقت والصعوبة والبدء) */}
        <div className="card" style={{ padding: 22, borderRadius: 16 }}>
          <div className="grid grid-3 mb-4" style={{ gap: 14 }}>
            <div className="stat-card" style={{ border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
              <div className="stat-label" style={{ fontWeight: 700 }}>{t('mock.questionCount')}</div>
              <div className="stat-num" style={{ color: 'var(--sector)', fontSize: 28, fontWeight: 900 }}>
                {effCount}
                {total > 0 && effCount === total && (
                  <span className="badge badge-gold" style={{ fontSize: 11, marginInlineStart: 6, verticalAlign: 'middle' }}>
                    كامل البنك ✨
                  </span>
                )}
              </div>
            </div>

            <div className="stat-card" style={{ border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
              <div className="stat-label" style={{ fontWeight: 700 }}>{t('mock.duration')}</div>
              <div className="stat-num" style={{ fontSize: 24, fontWeight: 900 }}>
                {timerMode === 'open' ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>مفتوح (بدون وقت)</span>
                ) : (
                  <>
                    {Math.max(10, Math.round(effCount * ((bp.questions > 0 && bp.minutes > 0) ? (bp.minutes / bp.questions) : 1.25)))}
                    <span style={{ fontSize: 13, fontWeight: 700 }}> {t('common.minutesShort')}</span>
                  </>
                )}
              </div>
            </div>

            <div className="stat-card" style={{ border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
              <div className="stat-label" style={{ fontWeight: 700 }}>{t('mock.passScore')}</div>
              <div className="stat-num" style={{ color: 'var(--success)', fontSize: 28, fontWeight: 900 }}>{bp.passScore}%</div>
            </div>
          </div>

          {/* محدد عدد الأسئلة المرن غير المقيد */}
          <div className="field mb-4" style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>
            <div className="row-between wrap" style={{ gap: 8, marginBottom: 12 }}>
              <label className="label" style={{ fontSize: 15, fontWeight: 900, margin: 0 }}>
                كم سؤالاً تود اختباره؟
              </label>
              <span className="badge badge-brand" style={{ fontSize: 12, fontWeight: 800 }}>
                إجمالي الأسئلة المتاحة: {loading ? '…' : (total || 0).toLocaleString(locale)} سؤال
              </span>
            </div>

            {/* أزرار الاختيار السريع للعدد */}
            <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
              {[
                { n: 20, label: '20 سؤال' },
                { n: 50, label: '50 سؤال' },
                { n: 100, label: '100 (المعيار الرسمي)' },
                { n: 150, label: '150 سؤال' },
                { n: 200, label: '200 سؤال' },
                { n: 300, label: '300 سؤال' },
                { n: 500, label: '500 سؤال' },
              ].filter(opt => total === 0 || opt.n <= total).map((opt) => {
                const isActive = effCount === opt.n;
                return (
                  <button
                    key={opt.n}
                    type="button"
                    onClick={() => setCount(opt.n)}
                    className="btn btn-sm"
                    style={{
                      background: isActive ? 'var(--sector)' : 'var(--surface)',
                      color: isActive ? '#ffffff' : 'var(--text)',
                      border: `1.5px solid ${isActive ? 'var(--sector)' : 'var(--border)'}`,
                      fontWeight: 800,
                      borderRadius: 10,
                      padding: '6px 12px',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}

              {/* زر تحديد كامل البنك */}
              {total > 0 && (
                <button
                  type="button"
                  onClick={() => setCount(total)}
                  className="btn btn-sm"
                  style={{
                    background: effCount === total ? 'linear-gradient(135deg, #10B981, #059669)' : 'var(--surface)',
                    color: effCount === total ? '#ffffff' : 'var(--text)',
                    border: `1.5px solid ${effCount === total ? '#10B981' : 'var(--border)'}`,
                    fontWeight: 900,
                    borderRadius: 10,
                    padding: '6px 14px',
                  }}
                >
                  ⚡ كامل بنك التخصص ({total.toLocaleString(locale)})
                </button>
              )}
            </div>

            {/* إدخال رقمي مباشر + أزرار زيادة ونقصان */}
            <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                أو اكتب العدد يدوياً:
              </span>
              <div className="row" style={{ gap: 4, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.max(5, c - 10))}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                >
                  <Minus size={14} />
                </button>

                <input
                  type="number"
                  min={5}
                  max={total || 5000}
                  value={count}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCount(Math.max(1, Math.min(total || 5000, val)));
                    } else {
                      setCount(5);
                    }
                  }}
                  style={{
                    width: 90,
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: 16,
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setCount((c) => Math.min(total || 5000, c + 10))}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800 }}>سؤال</span>
            </div>

            {/* شريط السحب السلس غير المقيد */}
            <input
              type="range"
              min={5}
              max={Math.max(20, total || 100)}
              step={total > 1000 ? 25 : total > 200 ? 10 : 5}
              value={Math.min(count, total || count || 20)}
              onChange={(e) => setCount(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--sector)', cursor: 'pointer' }}
            />
            <div className="row-between text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              <span>5 أسئلة</span>
              <span>{Math.round((total || 100) / 2)} سؤال</span>
              <span>{total > 0 ? `${total.toLocaleString(locale)} سؤال` : 'الكل'}</span>
            </div>
          </div>

          {/* نظام المؤقت الزمني */}
          <div className="field mb-4" style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
            <label className="label" style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 8 }}>
              نمط التوقيت
            </label>
            <div className="row wrap" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => setTimerMode('countdown')}
                className="btn btn-sm"
                style={{
                  background: timerMode === 'countdown' ? 'var(--sector)' : 'var(--surface)',
                  color: timerMode === 'countdown' ? '#ffffff' : 'var(--text)',
                  border: `1.5px solid ${timerMode === 'countdown' ? 'var(--sector)' : 'var(--border)'}`,
                  fontWeight: 800,
                  borderRadius: 10,
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Clock size={15} />
                مؤقت تنازلي (محاكاة الاختبار الرسمي)
              </button>

              <button
                type="button"
                onClick={() => setTimerMode('open')}
                className="btn btn-sm"
                style={{
                  background: timerMode === 'open' ? 'var(--sector)' : 'var(--surface)',
                  color: timerMode === 'open' ? '#ffffff' : 'var(--text)',
                  border: `1.5px solid ${timerMode === 'open' ? 'var(--sector)' : 'var(--border)'}`,
                  fontWeight: 800,
                  borderRadius: 10,
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Infinity size={15} />
                مفتوح بدون حد زمني (مذاكرة وتدريب هادئ)
              </button>
            </div>
          </div>

          <div className="field mb-4">
            <label className="label">{t('mock.difficultyOptional')}</label>
            <div className="chip-row">
              {[
                ['all', t('common.allDifficulties')],
                ['easy', t('common.easy')],
                ['medium', t('common.medium')],
                ['hard', t('common.hard')],
              ].map(([v, l]) => (
                <span
                  key={v}
                  className={`chip${difficulty === v ? ' active' : ''}`}
                  onClick={() => setDifficulty(v)}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            onClick={begin}
            disabled={loading || total === 0}
            style={{ fontWeight: 900, fontSize: 16, padding: '16px', borderRadius: 14 }}
          >
            <Play size={18} />
            بدء الامتحان التجريبي ({effCount.toLocaleString(locale)} سؤال)
          </button>

          {total === 0 && !loading && (
            <p className="text-muted text-center mt-2" style={{ fontSize: 13 }}>
              لا توجد أسئلة كافية مطابقة للفلاتر المحددة، جرب اختيار سنوات أو مراكز إضافية.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <div className="skeleton" style={{ height: 380 }} />;

  // ── شاشة النتائج ──
  if (submitted && result) {
    return (
      <div className="stack" ref={resultsRef} style={{ gap: 16 }}>
        <div className="card card-pad-lg text-center">
          <div style={{ fontSize: 54 }}>{result.passed ? '🏆' : '📚'}</div>
          <h2 className="mt-2">{result.passed ? t('mock.passed') : t('mock.failed')}</h2>
          <div
            className="stat-num"
            style={{ fontSize: '3rem', color: result.passed ? 'var(--success)' : 'var(--danger)' }}
          >
            {result.pct}%
          </div>
          <p className="text-muted">
            {t('mock.resultLine', { c: result.correct, t: result.total, p: bp.passScore })}
          </p>
          <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 18 }}>
            <button className="btn btn-primary" onClick={restart}>
              <RotateCcw size={15} /> {t('mock.newExam')}
            </button>
            <Link href="/dashboard/analytics" className="btn btn-ghost">
              <Award size={15} /> {t('mock.analytics')}
            </Link>
          </div>
        </div>

        {/* بطاقة مشاركة النتيجة التسويقية عبر واتساب */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(20, 184, 166, 0.06) 100%)',
            border: '2px solid rgba(37, 211, 102, 0.3)',
            borderRadius: 18,
            padding: 22,
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="row-between wrap" style={{ gap: 14, marginBottom: 14 }}>
            <div className="row" style={{ gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#25D366',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.4)',
                }}
              >
                <MessageCircle size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 16.5, fontWeight: 900, margin: 0 }}>
                    شارك إنجازك مع زملائك على واتساب ✨
                  </h3>
                  <span className="badge" style={{ fontSize: 11, background: '#25D366', color: '#fff', border: 'none', fontWeight: 800 }}>
                    حفّز غيرك 🔥
                  </span>
                </div>
                <p className="text-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
                  ألهم زملاء دفعتك وأظهر جاهزيتك للامتحان الرسمي بنقرة واحدة
                </p>
              </div>
            </div>
          </div>

          {/* نص الرسالة الجاهزة */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px dashed rgba(37, 211, 102, 0.45)',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13.5,
              lineHeight: 1.7,
              marginBottom: 16,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {`«أنجزت للتو محاكاة اختبار مزاولة المهنة في ${specName || 'الطب'} بنسبة ${result.pct}% على منصة كفاءة ✨🎯\nجرب مستواك أنت أيضاً وراجع أهم النماذج الوزارية عبر الرابط: https://kafaah-three.vercel.app»`}
          </div>

          {/* أزرار المشاركة والنسخ السريع */}
          <div className="row wrap" style={{ gap: 10 }}>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `أنجزت للتو محاكاة اختبار مزاولة المهنة في ${specName || 'الطب'} بنسبة ${result.pct}% على منصة كفاءة ✨🎯\n\nجرب مستواك أنت أيضاً وراجع أهم النماذج الوزارية عبر الرابط:\nhttps://kafaah-three.vercel.app`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#25D366',
                color: '#fff',
                borderColor: '#25D366',
                fontWeight: 800,
                fontSize: 14,
                padding: '10px 20px',
                borderRadius: 12,
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MessageCircle size={18} />
              مشاركة النتيجة في مجموعات الواتساب
            </a>

            <button
              type="button"
              onClick={() => {
                const text = `أنجزت للتو محاكاة اختبار مزاولة المهنة في ${specName || 'الطب'} بنسبة ${result.pct}% على منصة كفاءة ✨🎯\n\nجرب مستواك أنت أيضاً وراجع أهم النماذج الوزارية عبر الرابط:\nhttps://kafaah-three.vercel.app`;
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText(text);
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 3000);
                }
              }}
              className="btn btn-ghost"
              style={{
                fontWeight: 700,
                fontSize: 14,
                padding: '10px 18px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {copiedShare ? (
                <>
                  <Check size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)', fontWeight: 800 }}>تم نسخ الرسالة بنجاح! 📋</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>نسخ رسالة التميز</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* مراجعة الأسئلة مع فلترة ذكية */}
        <div className="card">
          <div className="row-between wrap" style={{ gap: 10, marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>مراجعة إجابات الامتحان</h3>
            <div className="row wrap" style={{ gap: 6 }}>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className="btn btn-sm"
                style={{
                  background: reviewFilter === 'all' ? 'var(--sector)' : 'var(--surface)',
                  color: reviewFilter === 'all' ? '#fff' : 'var(--text)',
                  border: `1.5px solid ${reviewFilter === 'all' ? 'var(--sector)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                كل الأسئلة ({deck.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('wrong')}
                className="btn btn-sm"
                style={{
                  background: reviewFilter === 'wrong' ? 'var(--danger)' : 'var(--surface)',
                  color: reviewFilter === 'wrong' ? '#fff' : 'var(--danger)',
                  border: `1.5px solid ${reviewFilter === 'wrong' ? 'var(--danger)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                الخاطئة فقط ({deck.length - result.correct})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('correct')}
                className="btn btn-sm"
                style={{
                  background: reviewFilter === 'correct' ? 'var(--success)' : 'var(--surface)',
                  color: reviewFilter === 'correct' ? '#fff' : 'var(--success)',
                  border: `1.5px solid ${reviewFilter === 'correct' ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                الصحيحة فقط ({result.correct})
              </button>
            </div>
          </div>

          <div className="stack" style={{ gap: 12 }}>
            {deck
              .map((q, originalIdx) => ({ q, originalIdx }))
              .filter(({ q }) => {
                const u = answers[q.id];
                const ok = u === (q.correctIndex ?? q.correct_index ?? 0);
                if (reviewFilter === 'wrong') return !ok;
                if (reviewFilter === 'correct') return ok;
                return true;
              })
              .map(({ q, originalIdx }) => {
                const u = answers[q.id];
                const ok = u === (q.correctIndex ?? q.correct_index ?? 0);
                return (
                  <div key={q.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                    <div className="row-between mb-2">
                      <span style={{ fontWeight: 800, fontSize: 13 }}>سؤال {originalIdx + 1}</span>
                      <span className={`badge ${ok ? 'badge-success' : 'badge-danger'}`}>
                        {ok ? 'صحيحة ✓' : 'خاطئة ✕'}
                      </span>
                    </div>
                    <QuestionView
                      question={q}
                      selected={u}
                      reveal={true}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  // ── أثناء حل الامتحان التجريبي ──
  const currentQ = deck[idx];

  return (
    <div className="stack" style={{ gap: 16 }}>
      {/* الشريط العلوي للامتحان */}
      <div className="row-between wrap" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="badge badge-brand" style={{ fontSize: 13, fontWeight: 900 }}>
            سؤال {idx + 1} من {deck.length}
          </span>
          <span className="badge badge-muted">
            المجاب: {answeredCount} / {deck.length}
          </span>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <div
            className="row"
            style={{
              gap: 6,
              background: timerMode === 'open' ? 'var(--card-subtle)' : secondsLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'var(--card-subtle)',
              color: timerMode === 'open' ? 'var(--text)' : secondsLeft < 300 ? 'var(--danger)' : 'var(--text)',
              padding: '6px 14px',
              borderRadius: 999,
              fontWeight: 900,
              fontFamily: 'var(--font-numbers)',
            }}
          >
            {timerMode === 'open' ? <Infinity size={16} /> : <Timer size={16} />}
            <span>{timerMode === 'open' ? `مفتوح: ${fmt(secondsElapsed)}` : fmt(secondsLeft)}</span>
          </div>

          <button
            type="button"
            className="btn btn-emerald btn-sm"
            onClick={submit}
            style={{ fontWeight: 800 }}
          >
            إنهاء وتسليم الامتحان
          </button>
        </div>
      </div>

      {/* السؤال الحالي */}
      {currentQ && (
        <QuestionView
          question={currentQ}
          selected={answers[currentQ.id]}
          onSelect={(optIdx) => {
            setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
          }}
          reveal={false}
        />
      )}

      {/* شريط التنقل بين الأسئلة */}
      <div className="row-between" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          <ChevronRight size={18} /> السؤال السابق
        </button>

        <div className="row" style={{ gap: 6, overflowX: 'auto', maxWidth: '60vw', padding: '4px 0' }}>
          {deck.length <= 80 ? (
            deck.map((_, i) => {
              const isCur = i === idx;
              const isAns = answers[deck[i]?.id] !== undefined;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: isCur ? '2px solid var(--sector)' : '1px solid var(--border)',
                    background: isAns ? 'var(--sector)' : 'var(--surface)',
                    color: isAns ? '#ffffff' : 'var(--text)',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </button>
              );
            })
          ) : (
            (() => {
              const start = Math.max(0, idx - 15);
              const end = Math.min(deck.length, idx + 16);
              const items = [];
              if (start > 0) {
                items.push(
                  <button
                    key="first"
                    type="button"
                    onClick={() => setIdx(0)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}
                  >
                    1…
                  </button>
                );
              }
              for (let i = start; i < end; i++) {
                const isCur = i === idx;
                const isAns = answers[deck[i]?.id] !== undefined;
                items.push(
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: isCur ? '2px solid var(--sector)' : '1px solid var(--border)',
                      background: isAns ? 'var(--sector)' : 'var(--surface)',
                      color: isAns ? '#ffffff' : 'var(--text)',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </button>
                );
              }
              if (end < deck.length) {
                items.push(
                  <button
                    key="last"
                    type="button"
                    onClick={() => setIdx(deck.length - 1)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}
                  >
                    …{deck.length}
                  </button>
                );
              }
              return items;
            })()
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          disabled={idx === deck.length - 1}
          onClick={() => setIdx((i) => Math.min(deck.length - 1, i + 1))}
        >
          السؤال التالي <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}
