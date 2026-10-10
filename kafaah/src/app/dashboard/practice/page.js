'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, HelpCircle, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import Link from 'next/link';

const practiceQuestions = [
  {
    id: 1,
    category: 'الطب البشري • الطوارئ والقلب',
    text: 'مريض يبلغ من العمر 58 عاماً، مصاب بارتفاع ضغط الدم، حضر إلى قسم الطوارئ بألم صدري ضاغط مستمر منذ ساعتين مع انتشار للفك الأيسر. أظهر تخطيط القلب (ECG) ارتفاعاً ملحوظاً في قطعة ST بمقدار 3mm في المساري V1-V4. ما هو الإجراء السريري الفوري ذو الأولوية القصوى؟',
    options: [
      'إعطاء جرعة تحميلية من الأسبرين ومثبط P2Y12 والتنسيق الفوري للقسطرة الأولية (Primary PCI)',
      'إجراء تصوير مقطعي محوسب بالصبغة للصدر والشرايين قبل إعطاء أي مضادات تجلط',
      'إعطاء مسكنات أفيونية وريدية ومراقبة أنزيمات التروبونين بعد 6 ساعات',
      'تحويل المريض للعيادة الخارجية لإجراء اختبار الجهد القلبي الروتيني'
    ],
    correctIndex: 0,
    explanation: 'احتشاء عضلة القلب مع ارتفاع ST (STEMI) حالة طوارئ وعائية حرجة تتطلب إعادة التروية العاجلة (Primary PCI في غضون 90-120 دقيقة). الإجراء الفوري هو إعطاء جرعة تحميلية من الأسبرين ومثبط مستقبلات ADP والتوجه الفوري لمختبر القسطرة دون انتظار نتائج أنزيمات القلب.'
  },
  {
    id: 2,
    category: 'الطب البشري • الباطنية والغدد الصماء',
    text: 'مريضة تبلغ من العمر 32 عاماً تعاني من خفقان، فقدان وزن غير مبرر رغم زيادة الشهية، وعدم تحمل الحرارة مع جحوظ في العينين (Exophthalmos). أظهرت الفحوصات انخفاض TSH وارتفاع Free T4. ما هو التشخيص الأكثر احتمالاً؟',
    options: [
      'داء غريفز (Graves Disease)',
      'التهاب الغدة الدرقية لهاشيموتو (Hashimoto Thyroiditis)',
      'ورم الغدة النخامية المفرز لـ TSH',
      'تضخم الغدة الدرقية المتعدد العقيدات غير السام'
    ],
    correctIndex: 0,
    explanation: 'وجود فرط نشاط الغدة الدرقية (انخفاض TSH وارتفاع FT4) مع جحوظ العينين علامة تشخيصية مميزة لداء غريفز المناعي الذاتي.'
  },
  {
    id: 3,
    category: 'الهندسة • الهندسة المدنية والإنشائية',
    text: 'في تصميم العناصر الخرسانية المسلحة المعرضة لقوى الانحناء، ما هو الموقع المناسب لوضع حديد التسليح الرئيسي لمقاومة عزم الانحناء الموجب في جسر بسيط الارتكاز (Simply Supported Beam)؟',
    options: [
      'في الثلث السفلي (منطقة الشد السفلية)',
      'في الثلث العلوي (منطقة الضغط العلوية)',
      'في المحور الحيادي تماماً',
      'على الأطراف الجانبية فقط بدون تسليح طولي'
    ],
    correctIndex: 0,
    explanation: 'في الجسور بسيطة الارتكاز، يسبب عزم الانحناء الموجب إجهادات شد في ألياف الخرسانة السفلية وإجهادات ضغط في العلوية. نظراً لضعف الخرسانة في الشد، يوضع التسليح الرئيسي في المنطقة السفلية لتحمل قوى الشد.'
  }
];

export default function Practice() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = practiceQuestions[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      
      {/* ── Top Header ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 12px', borderRadius: 999 }}>
            {q.category}
          </span>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 6, fontFamily: 'var(--font-display)' }}>
            التدريب الذكي التفاعلي 🧠
          </h1>
        </div>

        <div style={{
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          color: '#334155',
          padding: '6px 16px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 800,
          fontFamily: 'var(--font-numbers)'
        }}>
          سؤال {currentIdx + 1} من {practiceQuestions.length}
        </div>
      </div>

      {/* ── Question Card ── */}
      <motion.div
        key={currentIdx}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(226, 232, 240, 0.85)',
          borderRadius: 24,
          padding: 'clamp(1.8rem, 4vw, 2.8rem)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 24
        }}
      >
        <h2 style={{
          fontSize: 'clamp(17px, 2.5vw, 20px)',
          fontWeight: 800,
          lineHeight: 1.85,
          color: '#0f172a',
          marginBottom: 28,
          fontFamily: 'var(--font-heading)'
        }}>
          {q.text}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {q.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.correctIndex;
            let optBg = '#ffffff';
            let optBorder = '#e2e8f0';
            let optColor = '#1e293b';

            if (selectedOption !== null) {
              if (isCorrect) {
                optBg = '#ecfdf5';
                optBorder = '#10b981';
                optColor = '#047857';
              } else if (isSelected) {
                optBg = '#fef2f2';
                optBorder = '#ef4444';
                optColor = '#991b1b';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: optBg,
                  border: `2px solid ${optBorder}`,
                  color: optColor,
                  fontSize: 15.5,
                  fontWeight: isSelected || (selectedOption !== null && isCorrect) ? 800 : 600,
                  cursor: selectedOption === null ? 'pointer' : 'default',
                  textAlign: 'right',
                  fontFamily: 'inherit',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.06)' : 'var(--shadow-subtle)'
                }}
              >
                <span style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: `2px solid ${optBorder}`,
                  background: selectedOption !== null && isCorrect ? '#10b981' : (isSelected ? '#ef4444' : '#f8fafc'),
                  color: selectedOption !== null && (isCorrect || isSelected) ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#f8fafc',
              border: `2px solid ${selectedOption === q.correctIndex ? '#10b981' : '#f59e0b'}`,
              borderRadius: 18,
              padding: '20px 24px',
              marginBottom: 24
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {selectedOption === q.correctIndex ? (
                <CheckCircle2 size={22} style={{ color: '#059669' }} />
              ) : (
                <XCircle size={22} style={{ color: '#dc2626' }} />
              )}
              <span style={{
                fontSize: 16,
                fontWeight: 900,
                color: selectedOption === q.correctIndex ? '#047857' : '#991b1b',
                fontFamily: 'var(--font-heading)'
              }}>
                {selectedOption === q.correctIndex ? 'أحسنت! إجابة صحيحة' : 'إجابة غير صحيحة — راجع التفسير أدناه'}
              </span>
            </div>

            <p style={{ color: '#334155', fontSize: 14.5, lineHeight: 1.85, fontWeight: 600 }}>
              {q.explanation}
            </p>
          </motion.div>
        )}

        {/* Navigation Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 20
        }}>
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="btn btn-ghost"
            style={{ opacity: currentIdx === 0 ? 0.4 : 1, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
          >
            <ArrowRight size={16} />
            السابق
          </button>

          {currentIdx < practiceQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-emerald"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              السؤال التالي
              <ArrowLeft size={16} />
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="btn btn-emerald"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              إنهاء الجلسة والعودة
            </Link>
          )}
        </div>

      </motion.div>

    </div>
  );
}
