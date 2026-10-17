'use client';
import { useState, useEffect, useMemo } from 'react';
import { useKafaah } from './context/KafaahProvider';

// ── محمّل أسئلة موحّد (يعتمد على واجهة /api/questions) ────────────────────────
//   useQuestions({ spec|sector|specs, bank|banks, subject, difficulty, search, limit, offset })
//   إذا لم يُمرَّر spec/sector يُستخدم تخصص المستخدم من السياق تلقائيًا.
export function useQuestions({
  sector = null,
  spec = null,
  specs = null,
  bank = null,
  banks = null,
  subject = null,
  difficulty = null,
  search = null,
  limit = 20,
  offset = 0,
  autoProfile = true,
  enabled = true,
} = {}) {
  const { profile } = useKafaah();
  const effSpec = spec || (specs ? null : autoProfile ? profile?.specId : null);
  const effSector = sector || (autoProfile && !effSpec && !specs ? profile?.sectorId : null);

  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const bankKey = Array.isArray(banks) ? banks.join(',') : banks;
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (effSector && effSector !== 'all') p.set('sector', effSector);
    if (effSpec && effSpec !== 'all') p.set('spec', effSpec);
    if (specs) p.set('specs', Array.isArray(specs) ? specs.join(',') : specs);
    if (bank && bank !== 'all') p.set('bank', bank);
    if (bankKey && bankKey !== 'all') p.set('banks', bankKey);
    if (subject && subject !== 'all') p.set('subject', subject);
    if (difficulty && difficulty !== 'all') p.set('difficulty', difficulty);
    if (search) p.set('search', search);
    if (limit > 0) p.set('limit', limit);
    if (offset > 0) p.set('offset', offset);
    return p.toString();
  }, [effSector, effSpec, specs, bank, bankKey, subject, difficulty, search, limit, offset]);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setQuestions(d.questions || []);
        setTotal(d.total || 0);
        setHasMore(!!d.hasMore);
        setError(null);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [params, enabled, tick]);

  return { questions, total, hasMore, loading, error, refetch: () => setTick((t) => t + 1) };
}

export function useSubjects({ sector = null, spec = null, autoProfile = true } = {}) {
  const { profile } = useKafaah();
  const effSpec = spec || (autoProfile ? profile?.specId : null);
  const effSector = sector || (autoProfile && !effSpec ? profile?.sectorId : null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const p = new URLSearchParams({ subjects: '1' });
    if (effSector && effSector !== 'all') p.set('sector', effSector);
    if (effSpec && effSpec !== 'all') p.set('spec', effSpec);
    fetch(`/api/questions?${p}`)
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => setSubjects([]));
  }, [effSector, effSpec]);

  return subjects;
}

// ── بنوك نطاق معيّن (لاختيار البنك في البحث/المحاكاة/التدريب) ────────────────
export function useScopeBanks({ sector = null, spec = null, specs = null, autoProfile = false } = {}) {
  const { profile } = useKafaah();
  const effSpec = spec || (specs ? null : autoProfile ? profile?.specId : null);
  const effSector = sector || (autoProfile && !effSpec && !specs ? profile?.sectorId : null);
  const specsKey = Array.isArray(specs) ? specs.join(',') : specs;

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!effSpec && !effSector && !specsKey) { setBanks([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    const p = new URLSearchParams();
    if (effSpec && effSpec !== 'all') p.set('spec', effSpec);
    else if (specsKey) p.set('specs', specsKey);
    else if (effSector && effSector !== 'all') p.set('sector', effSector);
    fetch(`/api/banks?${p}`)
      .then((r) => r.json())
      .then((d) => alive && setBanks(d.banks || []))
      .catch(() => alive && setBanks([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [effSpec, effSector, specsKey, tick]);

  return { banks, loading, refetch: () => setTick((t) => t + 1) };
}

// بنوك تخصص محدّد
export function useSpecBanks(specId) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(!!specId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!specId) { setBanks([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    fetch(`/api/banks?spec=${encodeURIComponent(specId)}`)
      .then((r) => r.json())
      .then((d) => alive && setBanks(d.banks || []))
      .catch(() => alive && setBanks([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [specId, tick]);

  return { banks, loading, refetch: () => setTick((t) => t + 1) };
}

export function useSectors() {
  const [sectors, setSectors] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sectors')
      .then((r) => r.json())
      .then((d) => {
        setSectors(d.sectors || []);
        setTotalQuestions(d.totalQuestions || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { sectors, totalQuestions, loading };
}

export function useBanks() {
  const [index, setIndex] = useState({ items: [], total: 0, bySector: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banks?stats=1')
      .then((r) => r.json())
      .then((d) => setIndex(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { index, loading };
}

// ── أدوات مساعدة ─────────────────────────────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isEnglish(text) {
  if (!text) return false;
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const la = (text.match(/[a-zA-Z]/g) || []).length;
  return la > ar;
}

export function fmtNum(n, locale = 'ar-EG') {
  return new Intl.NumberFormat(locale).format(n || 0);
}
