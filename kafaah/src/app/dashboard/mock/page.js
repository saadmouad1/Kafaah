'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, Bookmark, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

const sampleMockQuestions = [
  {
    id: 1,
    question: 'مريضة تبلغ من العمر 45 عاماً تعاني من آلام متكررة في الربع العلوي الأيمن من البطن بعد تناول الوجبات الدسمة، مع غثيان. الموجات فوق الصوتية أظهرت حصوات في المرارة مع زيادة سماكة الجدار (4mm). ما هو الإجراء الجراحي الأمثل؟',
    options: [
      'استئصال المرارة بالمنظار (Laparoscopic Cholecystectomy)',
      'تفتيت الحصوات بالموجات التصادمية',
      'إعطاء حمض اليورسوديوكسيكوليك فقط والمراقبة',
      'استئصال الفص الكبدي الأيمن'
    ],
    correct: 0,
    hint: 'التهاب المرارة الحصوي العرضي هو استطباب قياسي لاستئصال المرارة بالمنظار.'
  },
  {
    id: 2,
    question: 'طفل يبلغ من العمر 4 سنوات أحضر إلى الطوارئ بضيق تنفس حاد وصوت صرير (Stridor) وسعال نباحي مميز، بدأت الأعراض ليلاً بعد رشح بسيط. ما هو التشخيص الأرجح؟',
    options: [
      'التهاب الحنجرة والرغامي الفيروسي (Croup)',
      'التهاب لسان المزمار الحاد (Epiglottitis)',
      'استنشاق جسم غريب',
      'نوبة ربو حادة'
    ],
    correct: 0,
    hint: 'الصرير مع السعال النباحي والحمى الخفيفة علامة كلاسيكية للخناق (Croup).'
  },
  {
    id: 3,
    question: 'في مريض السكري من النوع الثاني حديث التشخيص والذي لم يستجب لتعديل نمط الحياة، ما هو خط العلاج الدوائي الفموي الأول المعتمد دولياً ما لم تكن هناك موانع استخدام؟',
    options: [
      'ميتفورمين (Metformin)',
      'غليميبريد (Glimepiride)',
      'أنسولين قاعدي طويل المفعول',
      'بيوجليتازون (Pioglitazone)'
    ],
    correct: 0,
    hint: 'الميتفورمين هو خط العلاج الأول للسكري النوع الثاني حسب توصيات ADA.'
  }
];

export default function MockPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const toggleFlag = () => {
    setFlagged(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  const calculateScore = () => {
    let correct = 0;
    sampleMockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });
    return {
      correct,
      total: sampleMockQuestions.length,
      percentage: Math.round((correct / sampleMockQuestions.length) * 100)
    };
  };

  const q = sampleMockQuestions[currentIdx];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      
      {/* ── Top Bar: Exam Info & Countdown Timer ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        borderRadius: 20,
        marginBottom: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
            امتحان المحاكاة المعتمد • بورد المزاولة
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 2, fontFamily: 'var(--font-heading)' }}>
            السؤال {currentIdx + 1} من {sampleMockQuestions.length}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Timer Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 14,
            background: timeLeft < 300 ? '#fee2e2' : '#f0fdf4',
            border: `1.5px solid ${timeLeft < 300 ? '#ef4444' : '#10b981'}`,
            color: timeLeft < 300 ? '#b91c1c' : '#047857',
            fontSize: 16,
            fontWeight: 900,
            fontFamily: 'var(--font-numbers)'
          }}>
            <Clock size={18} />
            الوقت المتبقي: {formatTime(timeLeft)}
          </div>

          <button
            onClick={toggleFlag}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 12,
              background: flagged[currentIdx] ? '#fef3c7' : '#f8fafc',
              border: `1.5px solid ${flagged[currentIdx] ? '#f59e0b' : '#cbd5e1'}`,
              color: flagged[currentIdx] ? '#b45309' : '#475569',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Bookmark size={16} />
            {flagged[currentIdx] ? 'مميّز للمراجعة' : 'تمييز السؤال'}
          </button>
        </div>
      </div>

      {isSubmitted ? (
        /* ── Exam Result Card ── */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #10b981',
            borderRadius: 24,
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-float)'
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#ecfdf5',
            border: '3px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={44} />
          </div>

          <h3 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
            اكتمل امتحان المحاكاة بنجاح!
          </h3>
          <p style={{ color: '#475569', fontSize: 16, marginBottom: 24, fontWeight: 600 }}>
            تم تسجيل نتيجتك وحفظها في سجلك الأكاديمي لمتابعة مؤشر الجاهزية
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 24,
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 18,
            padding: '16px 36px',
            marginBottom: 32
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 800 }}>النتيجة</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#059669', fontFamily: 'var(--font-numbers)' }}>
                {calculateScore().correct} / {calculateScore().total}
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: '#cbd5e1' }}></div>
            <div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 800 }}>النسبة المئوية</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-numbers)' }}>
                {calculateScore().percentage}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button
              onClick={() => {
                setSelectedAnswers({});
                setFlagged({});
                setTimeLeft(3600);
                setCurrentIdx(0);
                setIsSubmitted(false);
              }}
              className="btn btn-emerald"
              style={{ padding: '13px 28px', fontSize: 15 }}
            >
              إعادة الامتحان
            </button>
            <Link href="/dashboard" className="btn btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }}>
              العودة للوحة التحكم
            </Link>
          </div>
        </motion.div>
      ) : (
        /* ── Active Question Card ── */
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: 24,
            padding: 'clamp(1.8rem, 4vw, 2.6rem)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: 24
          }}
        >
          {/* Question Text */}
          <h3 style={{
            fontSize: 'clamp(17px, 2.5vw, 20px)',
            fontWeight: 800,
            lineHeight: 1.85,
            color: '#0f172a',
            marginBottom: 28,
            fontFamily: 'var(--font-heading)'
          }}>
            {q.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {q.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: isSelected ? '#ecfdf5' : '#ffffff',
                    border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                    color: isSelected ? '#047857' : '#1e293b',
                    fontSize: 15.5,
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'right',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(16, 185, 129, 0.2)' : 'var(--shadow-subtle)'
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? '#10b981' : '#cbd5e1'}`,
                    background: isSelected ? '#10b981' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                    flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 20
          }}>
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="btn btn-ghost"
              style={{
                opacity: currentIdx === 0 ? 0.4 : 1,
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowRight size={16} />
              السؤال السابق
            </button>

            {currentIdx < sampleMockQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: 15 }}
              >
                السؤال التالي
                <ArrowLeft size={16} />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitted(true)}
                className="btn btn-emerald"
                style={{ padding: '12px 30px', fontSize: 15.5 }}
              >
                <Send size={16} />
                تسليم الامتحان وإنهاء المحاكاة
              </button>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
