'use client';
import { useState, useMemo } from 'react';
import { useQuestions } from '../../../lib/useData';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const checkIsEnglish = (text) => {
  if (!text) return false;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const arabicChars = (text.match(/[؀-ۿ]/g) || []).length;
  return englishChars > arabicChars;
};

const SECTOR_LABELS = {
  medical: 'القطاع الصحي',
  engineering: 'الهندسة',
  law: 'القانون',
  finance: 'المالية',
  education: 'التعليم',
};

export default function BankPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const { questions, loading } = useQuestions();

  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.sectorId || q.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !searchTerm || q.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const cat = q.sectorId || q.category;
      const matchCat = filterCat === 'all' || cat === filterCat;
      return matchSearch && matchCat;
    }).slice(0, 50);
  }, [questions, searchTerm, filterCat]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>بنك الأسئلة الشامل</h1>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 24 }}>
        {loading ? 'جاري التحميل...' : `${questions.length.toLocaleString()} سؤال متاح`}
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث في الأسئلة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '14px 44px 14px 20px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'جميع الأقسام' : (SECTOR_LABELS[c] || c)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ background: '#f1f5f9', borderRadius: 16, height: 140, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((q, idx) => {
            const isEng = checkIsEnglish(q.text);
            const cat = q.sectorId || q.category;
            return (
              <motion.div key={q.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: 'var(--shadow-subtle)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, background: 'var(--blue-light)', color: 'var(--blue-sky)', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
                    {SECTOR_LABELS[cat] || cat || 'عام'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-numbers)' }}>{q.id}</span>
                </div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: 16,
                  direction: isEng ? 'ltr' : 'rtl',
                  textAlign: isEng ? 'left' : 'right',
                  fontFamily: isEng ? 'system-ui' : 'var(--font-heading)'
                }}>{q.text}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(q.options || []).map((opt, oIdx) => {
                    const isCorrect = oIdx === (q.correctIndex ?? q.correct_index);
                    const isEngOpt = checkIsEnglish(opt);
                    return (
                      <div key={oIdx} style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        background: isCorrect ? 'var(--emerald-light)' : 'var(--bg-subtle)',
                        border: isCorrect ? '1px solid var(--emerald-glow)' : '1px solid transparent',
                        color: isCorrect ? 'var(--emerald-dark)' : 'var(--text-secondary)',
                        fontWeight: isCorrect ? 700 : 500,
                        direction: isEngOpt ? 'ltr' : 'rtl',
                        textAlign: isEngOpt ? 'left' : 'right',
                      }}>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontWeight: 600 }}>
              لا توجد أسئلة تطابق بحثك.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
