'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, Users, Database, Sparkles, Plus, Search,
  CheckCircle2, AlertTriangle, BarChart3, Settings,
  Clock, ArrowRight, RefreshCw, Key, Filter, Download
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  // Sample questions in the bank
  const [questions, setQuestions] = useState([
    {
      id: 101,
      discipline: 'القطاع الصحي — طب باطني',
      country: 'المملكة العربية السعودية (SMLE)',
      text: 'مريض 58 سنة بألم صدري خلف القص مع ST-elevation في V1-V4...',
      correct: 'أ. تحميل أسبرين وكلوبيدوغريل مع التجهيز الفوري للقسطرة (PCI)',
      accuracy: '86%',
      status: 'معتمد'
    },
    {
      id: 102,
      discipline: 'الهندسة والتقنية — مدني',
      country: 'المملكة العربية السعودية (هيئة المهندسين)',
      text: 'ما هي النسبة القصوى المسموح بها للترخيم (Deflection) في الجسور الخرسانية المسلحة...',
      correct: 'L/360 للأحمال الحية القياسية وفق الكود السعودي SBC',
      accuracy: '79%',
      status: 'معتمد'
    },
    {
      id: 103,
      discipline: 'القانون والمحاماة',
      country: 'الجمهورية اليمنية (نقابة المحامين)',
      text: 'ما هي المدة القانونية المقررة للطعن بالاستئناف في الأحكام المدنية والتجارية...',
      correct: '30 يوماً من اليوم التالي لتاريخ النطق بالحكم أو إعلانه',
      accuracy: '91%',
      status: 'معتمد'
    },
    {
      id: 104,
      discipline: 'المحاسبة والمالية',
      country: 'دولي (CPA / SOCPA)',
      text: 'وفق معيار التقرير المالي الدولي IFRS 15، متى يتم الاعتراف بالإيراد من العقود...',
      correct: 'عند الوفاء بالتزام الأداء (Performance Obligation)',
      accuracy: '82%',
      status: 'معتمد'
    }
  ]);

  // New question form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQDiscipline, setNewQDiscipline] = useState('القطاع الصحي');
  const [newQCountry, setNewQCountry] = useState('اليمن');

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQText) return;
    const newEntry = {
      id: Date.now(),
      discipline: newQDiscipline,
      country: newQCountry,
      text: newQText,
      correct: 'الإجابة المعتمدة المضافة من الإدارة',
      accuracy: '100%',
      status: 'معتمد'
    };
    setQuestions([newEntry, ...questions]);
    setNewQText('');
    setShowAddModal(false);
  };

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)' }}>
      
      {/* ── Admin Top Navigation ── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.85rem 1.8rem',
        background: 'rgba(11, 19, 41, 0.95)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/kafaah-icon.svg" alt="كفاءة" style={{ width: 38, height: 38 }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            كـفـاءة
          </span>
          <span style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '2px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800
          }}>
            لوحة الإدارة والتحكم (Admin HQ)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
            معاينة تجربة المشترك
          </Link>
          <Link href="/" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            الصفحة الرئيسية
          </Link>
        </div>
      </header>

      {/* ── Main Admin Container ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* KPI Ribbons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          <div className="stat-card" style={{ border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>إجمالي المشتركين</span>
              <Users size={18} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', margin: '10px 0 4px' }}>
              14,820
            </div>
            <div style={{ fontSize: 12, color: '#10b981' }}>+340 مشترك جديد اليوم</div>
          </div>

          <div className="stat-card" style={{ border: '1px solid var(--gold-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>عرض الـ 3 أشهر المجاني</span>
              <Sparkles size={18} style={{ color: 'var(--gold)' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', margin: '10px 0 4px' }}>
              12,410
            </div>
            <div style={{ fontSize: 12, color: 'var(--gold-light)' }}>حسابات نشطة مجاناً بمناسبة الانطلاق</div>
          </div>

          <div className="stat-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>أسئلة البنوك المفهرسة</span>
              <Database size={18} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#34d399', margin: '10px 0 4px' }}>
              +12,500
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>موزعة عبر 5 تخصصات مهنية</div>
          </div>

          <div className="stat-card" style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>محرك Groq AI</span>
              <BarChart3 size={18} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#a78bfa', margin: '10px 0 4px' }}>
              99.9%
            </div>
            <div style={{ fontSize: 12, color: '#10b981' }}>متوسط الاستجابة: 240ms (نشط)</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 14,
          marginBottom: 24,
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: '📊 إدارة بنك الأسئلة والمحتوى' },
            { id: 'users', label: '👥 المشتركون وعرض الانطلاق' },
            { id: 'ai', label: '🤖 إعدادات Groq AI وقاعدة البيانات' },
            { id: 'councils', label: '🏛️ مجالس وهيئات التراخيص المعتمدة' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                background: activeTab === t.id ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${activeTab === t.id ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: activeTab === t.id ? '#ffffff' : 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: QUESTION BANK MANAGER */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 500 }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="ابحث في الأسئلة، الكلمات المفتاحية، أو أرقام الحالات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ paddingRight: 40 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-gold"
                  style={{ padding: '10px 20px', fontSize: 13.5 }}
                >
                  <Plus size={16} />
                  إضافة سؤال جديد
                </button>
              </div>
            </div>

            {/* Questions Table */}
            <div style={{
              background: 'var(--surface-card)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 220px 180px 1fr 120px',
                padding: '14px 20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--text-muted)'
              }}>
                <div>ID</div>
                <div>المجال المهني</div>
                <div>جهة الترخيص</div>
                <div>نص السؤال والسيناريو</div>
                <div>الحالة</div>
              </div>

              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 220px 180px 1fr 120px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    alignItems: 'center',
                    fontSize: 13.5
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--gold)' }}>#{q.id}</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>{q.discipline}</div>
                  <div style={{ color: '#cbd5e1' }}>{q.country}</div>
                  <div style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 20 }}>
                    {q.text}
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={12} />
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SUBSCRIBERS */}
        {activeTab === 'users' && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              إدارة المشتركين وعرض الـ 3 أشهر المجاني
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              جميع المشتركين المسجلين خلال فترة الانطلاق يحصلون تلقائياً على 90 يوماً وصول كامل مجاني لجميع الأسئلة والمحاكاة.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'د. أحمد السالمي', email: 'ahmed.salmi@gmail.com', discipline: 'طب بشري', country: 'السعودية SMLE', joined: 'منذ ساعتين', status: 'مفعل (متبقي 89 يوماً)' },
                { name: 'م. مروان القدسي', email: 'marwan.eng@outlook.com', discipline: 'هندسة مدنية', country: 'اليمن', joined: 'اليوم', status: 'مفعل (متبقي 90 يوماً)' },
                { name: 'أ. سارة المفلحي', email: 'sara.law@gmail.com', discipline: 'قانون ومحاماة', country: 'الإمارات DHA/MOH', joined: 'أمس', status: 'مفعل (متبقي 88 يوماً)' },
              ].map((u, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>{u.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{u.email} • {u.discipline} ({u.country})</div>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--gold-light)',
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GROQ AI & DB CONFIG */}
        {activeTab === 'ai' && (
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              حالة محرك الذكاء الاصطناعي (Groq AI) وقاعدة البيانات (Supabase)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 16 }}>
              {/* Groq Card */}
              <div style={{ padding: 20, borderRadius: 16, background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#38bdf8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={18} />
                  مفتاح Groq AI API
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 12 }}>
                  الحالة: متصل بنجاح ✓ • الموديل: openai/gpt-oss-120b
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(0, 0, 0, 0.4)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'var(--gold-light)'
                }}>
                  gsk_GPkZtV3u...ANm (مفعل)
                </div>
              </div>

              {/* Supabase Card */}
              <div style={{ padding: 20, borderRadius: 16, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database size={18} />
                  قاعدة بيانات Supabase
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 12 }}>
                  المشروع: vixdhdvhfwyaynorxtqw • المنفذ: 5432
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(0, 0, 0, 0.4)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#38bdf8'
                }}>
                  https://vixdhdvhfwyaynorxtqw.supabase.co
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL ADD QUESTION ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 28,
            maxWidth: 580,
            width: '100%',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 16 }}>
              إضافة سؤال جديد إلى بنك المنصة
            </h3>

            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>المجال المهني:</label>
                <select
                  value={newQDiscipline}
                  onChange={(e) => setNewQDiscipline(e.target.value)}
                  className="input"
                >
                  <option value="القطاع الصحي">القطاع الصحي والطبي</option>
                  <option value="الهندسة والتقنية">الهندسة والتقنية</option>
                  <option value="القانون والمحاماة">القانون والمحاماة</option>
                  <option value="المحاسبة والمالية">المحاسبة والمالية</option>
                  <option value="التربية والتعليم">التربية والتعليم</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>نص السؤال / الحالة السريرية أو التطبيقية:</label>
                <textarea
                  rows={4}
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="input"
                  placeholder="اكتب نص السؤال بدقة..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                >
                  حفظ السؤال في البنك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
