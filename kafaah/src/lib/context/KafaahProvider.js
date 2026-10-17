'use client';
// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · KafaahProvider
//  سياق موحّد لكل الصفحات: الهوية + القسم + التخصص + المعجم + الثيم.
//  يحلّ مشكلة تعدد مفاتيح التخزين (kafaah_session / kafaah_user_auth /
//  kafaah_user_profile) التي كانت تسبب فقدان الاختيار وظهور اسم افتراضي.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { SECTORS, ALL_SPECS } from '../content';
import {
  translate, localeOf, dirOf,
  sectorLabel as _sectorLabel, sectorShort as _sectorShort,
  sectorTagline as _sectorTagline, specLabel as _specLabel, localizeText,
  bankLabel as _bankLabel,
} from '../i18n';

const STORAGE_KEY = 'kafaah_profile';
const LANG_KEY = 'kafaah_lang';

const EMPTY = {
  id: null,
  name: '',
  email: '',
  phone: '',
  sectorId: null,
  specId: null,
  level: 'graduate',
  examDate: null,
  country: null,
  plan: null,
  planGeneratedAt: null,
  subscription: null,
  createdAt: null,
};

const KafaahContext = createContext(null);

function readStored() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // الترحيل من المفاتيح القديمة
    const legacy =
      JSON.parse(localStorage.getItem('kafaah_user_profile') || 'null') ||
      JSON.parse(localStorage.getItem('kafaah_user_auth') || 'null') ||
      JSON.parse(localStorage.getItem('kafaah_session') || 'null');
    if (legacy) {
      const migrated = {
        ...EMPTY,
        name: legacy.name || legacy.fullName || legacy.username || '',
        email: legacy.email || '',
        sectorId: legacy.sectorId || legacy.discipline || null,
        specId: legacy.specId || legacy.specialty || null,
        level: legacy.level || 'graduate',
        examDate: legacy.examDate || legacy.targetDate || null,
        plan: legacy.plan || legacy.diagnosticPlan || null,
        createdAt: legacy.createdAt || new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {}
  return null;
}

export function KafaahProvider({ children }) {
  const [profile, setProfileState] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState('ar');
  // المحتوى (الأقسام/التخصصات) — يُحمّل من الخادم ليعكس تعديلات لوحة المالك
  const [sectors, setSectors] = useState(SECTORS);
  const [specs, setSpecs] = useState(ALL_SPECS);

  useEffect(() => {
    let alive = true;
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        if (Array.isArray(d.sectors) && d.sectors.length) setSectors(d.sectors);
        if (Array.isArray(d.specs) && d.specs.length) setSpecs(d.specs);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const stored = readStored();
    if (stored) setProfileState({ ...EMPTY, ...stored });
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === 'en' || savedLang === 'ar') setLangState(savedLang);
    } catch {}
    setReady(true);
  }, []);

  const setLang = useCallback((l) => {
    const next = l === 'en' ? 'en' : 'ar';
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  }, []);

  // تطبيق اللغة والاتجاه على مستوى الجذر
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dirOf(lang);
  }, [lang]);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const locale = localeOf(lang);
  const dir = dirOf(lang);
  const sectorName = useCallback((s) => _sectorLabel(s, lang), [lang]);
  const specName = useCallback((sp) => _specLabel(sp, lang), [lang]);
  const sectorShortName = useCallback((s) => _sectorShort(s, lang), [lang]);
  const sectorTagline = useCallback((s) => _sectorTagline(s, lang), [lang]);
  const localize = useCallback((str) => localizeText(str, lang), [lang]);
  const bankName = useCallback((bank) => _bankLabel(bank, lang), [lang]);

  const persist = useCallback((next) => {
    setProfileState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setProfile = useCallback(
    (partial) => {
      setProfileState((prev) => {
        const next = typeof partial === 'function' ? partial(prev) : { ...prev, ...partial };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const login = useCallback((data) => {
    const next = {
      ...EMPTY,
      createdAt: new Date().toISOString(),
      ...data,
      subscription:
        data.subscription ||
        JSON.parse(JSON.stringify({ plan: 'active', startedAt: new Date().toISOString() })),
    };
    if (!next.subscription.expiresAt) {
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      next.subscription.expiresAt = d.toISOString();
    }
    persist(next);
    return next;
  }, [persist]);

  const logout = useCallback(() => {
    persist(EMPTY);
    try {
      ['kafaah_session', 'kafaah_user_auth', 'kafaah_user_profile'].forEach((k) =>
        localStorage.removeItem(k),
      );
    } catch {}
  }, [persist]);

  const sector = useMemo(() => (profile.sectorId ? sectors.find((s) => s.id === profile.sectorId) || null : null), [sectors, profile.sectorId]);
  const spec = useMemo(() => (profile.specId ? specs.find((s) => s.id === profile.specId) || null : null), [specs, profile.specId]);
  const lexicon = sector?.lexicon || {
    field: 'المجال',
    practitioner: 'الممارس',
    exam: 'الامتحان',
    caseWord: 'السؤال',
    questionNoun: 'سؤال',
    practiceTitle: 'التدريب',
    practiceSub: 'تدريب على أسئلة تخصصك.',
    mockTitle: 'الامتحان التجريبي',
    bankTitle: 'بنك الأسئلة',
  };

  const hasProfile = !!(profile.sectorId && profile.specId);
  const hasName = !!profile.name;

  // تطبيق ثيم القسم على مستوى الجذر
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (sector) {
      root.style.setProperty('--sector', sector.color);
      root.style.setProperty('--sector-soft', sector.colorSoft);
      root.style.setProperty('--sector-1', sector.gradient[0]);
      root.style.setProperty('--sector-2', sector.gradient[1]);
      root.dataset.sector = sector.id;
    } else {
      root.style.removeProperty('--sector');
      root.style.removeProperty('--sector-soft');
      root.style.removeProperty('--sector-1');
      root.style.removeProperty('--sector-2');
      delete root.dataset.sector;
    }
  }, [sector]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      login,
      logout,
      ready,
      hasProfile,
      hasName,
      sector,
      spec,
      lexicon,
      sectors,
      allSpecs: specs,
      // i18n
      lang,
      setLang,
      t,
      locale,
      dir,
      sectorName,
      specName,
      sectorShortName,
      sectorTagline,
      localize,
      bankName,
    }),
    [profile, setProfile, login, logout, ready, hasProfile, hasName, sector, spec, lexicon,
     sectors, specs,
     lang, setLang, t, locale, dir, sectorName, specName, sectorShortName, sectorTagline, localize, bankName],
  );

  return <KafaahContext.Provider value={value}>{children}</KafaahContext.Provider>;
}

export function useKafaah() {
  const ctx = useContext(KafaahContext);
  if (!ctx) throw new Error('useKafaah must be used within KafaahProvider');
  return ctx;
}

export function useProfile() {
  return useKafaah().profile;
}
