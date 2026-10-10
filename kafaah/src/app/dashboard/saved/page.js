'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, Trash2, BookOpen } from 'lucide-react';

const SAVED_KEY = 'kafaah_saved';

function getSaved() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch { return []; }
}

function checkIsEnglish(text) {
  if (!text) return false;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return latin > arabic;
}

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(getSaved());
  }, []);

  const removeOne = (id) => {
    const updated = saved.filter(q => q.id !== id);
    setSaved(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_KEY);
      setSaved([]);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            الأسئلة المحفوظة
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            الأسئلة التي قمت بحفظها للمراجعة
          </p>
        </div>
        {saved.length > 0 && (
          <button onClick={clearAll} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--danger)', fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}>
            <Trash2 size={16} /> مسح الكل
          </button>
        )}
      </div>

      {saved.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 24, padding: '60px 32px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <Star size={56} style={{ color: 'var(--text-dim)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>لا توجد أسئلة محفوظة</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            أثناء التدريب، يمكنك حفظ أي سؤال بالضغط على أيقونة النجمة ⭐ لتجده هنا لاحقاً.
          </p>
          <a href="/dashboard/practice" style={{
            display: 'inline-block', marginTop: 24, padding: '14px 32px', borderRadius: 12,
            background: 'var(--emerald)', color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: 15
          }}>
            ابدأ التدريب
          </a>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 16 }}>
            {saved.length} سؤال محفوظ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {saved.map((q, i) => {
                const isEn = checkIsEnglish(q.text);
                const isOpen = expanded === i;
                return (
                  <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', borderRight: '4px solid var(--gold)', overflow: 'hidden' }}
                  >
                    <button onClick={() => setExpanded(isOpen ? null : i)} style={{
                      width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right'
                    }}>
                      <p style={{ flex: 1, fontSize: 14, color: 'var(--text)', fontWeight: 600, lineHeight: 1.7, direction: isEn ? 'ltr' : 'rtl', textAlign: isEn ? 'left' : 'right', margin: 0 }}>
                        {q.text}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); removeOne(q.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}>
                          <Trash2 size={16} />
                        </button>
                        <ChevronDown size={18} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 2 }} />
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                          {q.options?.map((opt, idx) => (
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
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
