'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, ChevronDown, X } from 'lucide-react';
import questionsData from '../../../data/questions.json';

function checkIsEnglish(text) {
  if (!text) return false;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return latin > arabic;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'medical', label: 'طبي' },
    { id: 'engineering', label: 'هندسي' },
    { id: 'law', label: 'قانوني' },
    { id: 'finance', label: 'مالي' },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = questionsData.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchText = item.text?.toLowerCase().includes(q)
        || item.explanation?.toLowerCase().includes(q)
        || item.options?.some(o => o?.toLowerCase().includes(q));
      return matchCat && matchText;
    }).slice(0, 30);
    setResults(filtered);
  }, [query, selectedCategory]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          البحث الشامل في الأسئلة
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          ابحث في كامل بنك الأسئلة — {questionsData.length.toLocaleString()} سؤال متاح
        </p>
      </div>

      {/* Search box */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <SearchIcon size={20} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ابحث بالكلمة، التشخيص، العلاج، المادة..."
          style={{
            width: '100%', padding: '16px 52px 16px 16px', borderRadius: 16,
            border: '2px solid var(--border)', outline: 'none', fontSize: 16,
            fontFamily: 'var(--font-body)', background: '#fff', boxShadow: 'var(--shadow-subtle)',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--emerald)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
            padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            background: selectedCategory === c.id ? 'var(--text)' : '#fff',
            color: selectedCategory === c.id ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)', transition: 'all 0.2s'
          }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!query && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <SearchIcon size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 700 }}>ابدأ الكتابة للبحث في الأسئلة</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16, fontWeight: 700 }}>لم يُعثر على نتائج لـ "{query}"</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>جرب كلمات مختلفة أو غيّر الفئة</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16 }}>
            {results.length} نتيجة
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((q, i) => {
              const isEn = checkIsEnglish(q.text);
              const isOpen = expanded === i;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    style={{
                      width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--emerald-dark)', background: 'var(--emerald-light)', padding: '2px 8px', borderRadius: 6, marginBottom: 8, display: 'inline-block' }}>
                        {q.category === 'medical' ? 'طبي' : q.category === 'engineering' ? 'هندسي' : q.category}
                      </span>
                      <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, lineHeight: 1.7, direction: isEn ? 'ltr' : 'rtl', textAlign: isEn ? 'left' : 'right' }}>
                        {q.text}
                      </p>
                    </div>
                    <ChevronDown size={18} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 4 }} />
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                        {q.options.map((opt, idx) => (
                          <div key={idx} style={{
                            padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            background: idx === q.correct_index ? 'var(--emerald-light)' : 'var(--bg-subtle)',
                            color: idx === q.correct_index ? 'var(--emerald-dark)' : 'var(--text-secondary)',
                            border: `1px solid ${idx === q.correct_index ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                            direction: isEn ? 'ltr' : 'rtl'
                          }}>
                            {opt} {idx === q.correct_index && ' ✓'}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 10 }}>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
