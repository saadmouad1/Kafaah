'use client';
import { useState, useEffect, useCallback } from 'react';

// Central data hook — fetches from Supabase via API routes
export function useQuestions({ sector = null, spec = null, limit = 0 } = {}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sector && sector !== 'all') params.set('sector', sector);
      if (spec && spec !== 'all') params.set('spec', spec);
      if (limit > 0) params.set('limit', limit);

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sector, spec, limit]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  return { questions, loading, error, refetch: fetchQuestions };
}

export function useSectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sectors')
      .then(r => r.json())
      .then(d => { setSectors(d.sectors || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { sectors, loading };
}

// Shuffle utility
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function checkIsEnglish(text) {
  if (!text) return false;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return latin > arabic;
}
