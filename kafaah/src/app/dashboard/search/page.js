'use client';
import { useState } from 'react';
import { Search as SearchIcon, BookOpen, CheckCircle2, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const sampleSearchPool = [
  {
    id: 'Q-101',
    category: 'الطب البشري • الطوارئ',
    text: 'ما هو الإجراء السريري الفوري ذو الأولوية لمريض احتشاء عضلة القلب مع ارتفاع ST (STEMI) المؤكد تخطيطياً؟',
    answer: 'إعطاء جرعة تحميلية من الأسبرين ومثبط P2Y12 والتنسيق الفوري للقسطرة الأولية (Primary PCI)',
    explanation: 'إعادة التروية العاجلة خلال 90-120 دقيقة هي المعيار الذهبي دون انتظار نتائج إنزيمات القلب.'
  },
  {
    id: 'Q-102',
    category: 'الطب البشري • الباطنية',
    text: 'ما هو المؤشر التشخيصي المعياري لارتفاع ضغط الدم المستمر لدى البالغين؟',
    answer: 'قراءة ضغط الدم المستمرة فوق 140/90 ملم زئبقي في قراءتين منفصلتين على الأقل',
    explanation: 'توصيات الجمعية الأوروبية والأمريكية لارتفاع ضغط الدم تعتمد 140/90 كحد أدنى للتشخيص السريري.'
  },
  {
    id: 'Q-103',
    category: 'الهندسة • الهندسة المدنية',
    text: 'ما هو الغرض الهندسي الأساسي من استخدام حديد التسليح داخل الخرسانة المسلحة؟',
    answer: 'مقاومة قوى الشد والانحناء التي تضعف الخرسانة غير المسلحة أمامها',
    explanation: 'الخرسانة تتمتع بمقاومة ضغط فائقة لكنها هشة تحت إجهاد الشد، لذلك يتولى فولاذ التسليح تحمل قوى الشد.'
  },
  {
    id: 'Q-104',
    category: 'القانون والمحاماة • أصول المحاكمات',
    text: 'ما هو الميعاد القانوني العام للطعن بالاستئناف في الأحكام المدنية والتجارية وفق قانون المرافعات؟',
    answer: 'ثلاثون يوماً من اليوم التالي لتاريخ صدور الحكم أو إعلانه حسب الأحوال',
    explanation: 'مواعيد الطعن من النظام العام ويسقط الحق في الاستئناف بفوات الميعاد المحدد قانوناً.'
  },
  {
    id: 'Q-105',
    category: 'المحاسبة والمالية • المعايير الدولية',
    text: 'وفق معيار المحاسبة الدولي IFRS 15، متى يتم الاعتراف بالإيراد من العقود مع العملاء؟',
    answer: 'عند استيفاء التزام الأداء بنقل السيطرة على السلعة أو الخدمة الموعودة إلى العميل',
    explanation: 'المعيار يعتمد نموذج الخطوات الخمس ونقل السيطرة كمعيار جوهري للاعتراف بالإيراد.'
  }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('الكل');

  const filteredQuestions = sampleSearchPool.filter(q => {
    const matchesQuery = !query || q.text.includes(query) || q.answer.includes(query) || q.category.includes(query);
    const matchesCat = selectedCat === 'الكل' || q.category.includes(selectedCat);
    return matchesQuery && matchesCat;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      
      {/* ── Search Header ── */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        borderRadius: 22,
        padding: '28px',
        marginBottom: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
          البحث الشامل في بنك الأسئلة والامتحانات
        </h1>
        <p style={{ color: '#475569', fontSize: 14.5, fontWeight: 600, marginBottom: 20 }}>
          ابحث بالكلمات المفتاحية، المواضيع، الأمراض، أو المصطلحات المهنية للوصول المباشر للشروحات المعتمدة
        </p>

        {/* Input Box */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{
              paddingRight: 48,
              fontSize: 16,
              height: 52,
              background: '#ffffff',
              border: '2px solid #cbd5e1'
            }}
            placeholder="اكتب كلمة البحث (مثال: STEMI, ضغط الدم, خرسانة, استئناف, IFRS)..."
          />
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#059669' }}>
            <SearchIcon size={22} />
          </div>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#64748b' }}>تصفية حسب التخصص:</span>
          {['الكل', 'الطب البشري', 'الهندسة', 'القانون', 'المحاسبة'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                background: selectedCat === cat ? '#0f172a' : '#f1f5f9',
                color: selectedCat === cat ? '#ffffff' : '#334155',
                border: '1px solid transparent',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.18s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Results ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>
          نتائج البحث ({filteredQuestions.length} سؤال مطابق):
        </div>

        {filteredQuestions.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1.5px solid #e2e8f0',
            borderRadius: 18,
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            لم يتم العثور على أسئلة تطابق بحثك. جرب كلمة بحث أخرى.
          </div>
        ) : (
          filteredQuestions.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(226, 232, 240, 0.85)',
                borderRadius: 20,
                padding: '24px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: 8 }}>
                  {item.category}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, fontFamily: 'var(--font-numbers)' }}>
                  {item.id}
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 14, lineHeight: 1.7, fontFamily: 'var(--font-heading)' }}>
                {item.text}
              </h3>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 12
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#047857', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  الإجابة النموذجية المعتمدة:
                </div>
                <div style={{ fontSize: 14.5, color: '#1e293b', fontWeight: 700 }}>
                  {item.answer}
                </div>
              </div>

              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7, fontWeight: 600 }}>
                💡 <strong>التفسير:</strong> {item.explanation}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
