import os
import shutil

BASE_DIR = r"d:\professional_practice_exam\kafaah\src"

ADMIN_PAGE_JS = """'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Users, Database, Sparkles, Plus, Search,
  CheckCircle2, BarChart3, Settings, LogOut, ArrowRight,
  Filter, Download, Edit3, Trash2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [newQCategory, setNewQCategory] = useState('medical');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');

  const [questions, setQuestions] = useState([
    {
      id: 'KAF-101',
      category: 'medical',
      text: 'مريض يبلغ من العمر 58 عاماً، مصاب بارتفاع ضغط الدم، حضر بألم صدري ضاغط...',
      status: 'نشط',
      date: '2026-10-10'
    },
    {
      id: 'KAF-102',
      category: 'engineering',
      text: 'في تصميم العناصر الخرسانية المسلحة المعرضة لقوى الانحناء، ما هو الموقع المناسب...',
      status: 'نشط',
      date: '2026-10-09'
    }
  ]);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQText) return;
    const newEntry = {
      id: 'KAF-' + Math.floor(Math.random() * 900 + 100),
      category: newQCategory,
      text: newQText,
      status: 'نشط',
      date: new Date().toISOString().split('T')[0]
    };
    setQuestions([newEntry, ...questions]);
    setShowAddModal(false);
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQExplanation('');
  };

  const handleOptionChange = (idx, val) => {
    const newOpts = [...newQOptions];
    newOpts[idx] = val;
    setNewQOptions(newOpts);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Admin Top Navigation ── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
              بوابة المشرفين - كفاءة
            </h1>
            <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700, background: 'var(--danger-light)', padding: '2px 8px', borderRadius: 999 }}>
              صلاحيات الإدارة الشاملة
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', borderRadius: 999, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              معاينة حساب الطالب
              <ArrowRight size={16} />
            </button>
          </Link>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
          </Link>
        </div>
      </header>

      {/* ── Main Admin Container ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 40
        }}>
          {[
            { label: 'إجمالي المشتركين', val: '14,820', sub: '+340 هذا الأسبوع', icon: Users, color: 'var(--blue-sky)', bg: 'var(--blue-light)' },
            { label: 'أسئلة بنك كفاءة', val: '+12,500', sub: 'عبر 5 تخصصات', icon: Database, color: 'var(--emerald)', bg: 'var(--emerald-light)' },
            { label: 'جلسات التدريب', val: '84,102', sub: 'جلسة مكتملة', icon: BarChart3, color: 'var(--gold)', bg: 'var(--gold-light)' }
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)', marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{s.sub}</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={24} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {[
            { id: 'overview', label: 'إدارة بنك الأسئلة' },
            { id: 'users', label: 'المشتركون والاشتراكات' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: activeTab === t.id ? 'var(--text)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
                border: 'none',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: QUESTION BANK MANAGER */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 340 }}>
                <Search size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="ابحث في بنك الأسئلة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'var(--font-body)' }}
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 12,
                  background: 'var(--emerald)', color: '#fff', border: 'none',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 8px 16px var(--emerald-glow)'
                }}
              >
                <Plus size={18} /> إضافة سؤال جديد
              </button>
            </div>

            {/* Questions Table */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 100px', padding: '16px 24px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>
                <div>المعرف</div>
                <div>التخصص</div>
                <div>نص السؤال</div>
                <div>تاريخ الإضافة</div>
                <div>إجراءات</div>
              </div>
              {questions.map((q) => (
                <div key={q.id} style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 100px 100px', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
                  <div style={{ fontFamily: 'var(--font-numbers)', color: 'var(--text-muted)' }}>{q.id}</div>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--blue-light)', color: 'var(--blue-sky)', fontSize: 12 }}>
                      {q.category === 'medical' ? 'طبي' : q.category === 'engineering' ? 'هندسي' : q.category}
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: 24, color: 'var(--text)' }}>
                    {q.text}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{q.date}</div>
                  <div style={{ display: 'flex', gap: 12, color: 'var(--text-dim)' }}>
                    <Edit3 size={18} style={{ cursor: 'pointer' }} />
                    <Trash2 size={18} style={{ cursor: 'pointer', color: 'var(--danger)' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: SUBSCRIBERS */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '16px 24px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>
                <div>المشترك</div>
                <div>التخصص المهني</div>
                <div>تاريخ التسجيل</div>
                <div>الحالة</div>
              </div>
              {[
                { name: 'د. أحمد السالمي', email: 'ahmed.salmi@gmail.com', discipline: 'طب بشري', joined: 'منذ ساعتين', status: 'مفعل' },
                { name: 'م. مروان القدسي', email: 'marwan.eng@outlook.com', discipline: 'هندسة مدنية', joined: 'اليوم', status: 'مفعل' },
              ].map((u, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{u.discipline}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.joined}</div>
                  <div>
                    <span style={{ padding: '4px 12px', borderRadius: 8, background: 'var(--emerald-light)', color: 'var(--emerald-dark)', fontSize: 12, fontWeight: 700 }}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* ── MODAL ADD QUESTION ── */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, padding: 20
          }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{
              background: '#fff', borderRadius: 24, padding: 32,
              maxWidth: 600, width: '100%', boxShadow: 'var(--shadow-float)'
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 24, fontFamily: 'var(--font-display)' }}>
                إضافة سؤال جديد
              </h3>

              <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>التخصص المهني</label>
                  <select
                    value={newQCategory}
                    onChange={(e) => setNewQCategory(e.target.value)}
                    style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit', fontSize: 15 }}
                  >
                    <option value="medical">القطاع الصحي والطبي</option>
                    <option value="engineering">الهندسة والتقنية</option>
                    <option value="law">القانون والمحاماة</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>نص السؤال</label>
                  <textarea
                    rows={3}
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="اكتب نص السؤال هنا..."
                    required
                    style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>الخيارات المتاحة (حدد الإجابة الصحيحة)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {newQOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input 
                          type="radio" 
                          name="correctOption" 
                          checked={newQCorrect === idx}
                          onChange={() => setNewQCorrect(idx)}
                          style={{ width: 18, height: 18, accentColor: 'var(--emerald)' }}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`الخيار ${idx + 1}`}
                          required
                          style={{ flex: 1, padding: 12, borderRadius: 10, border: newQCorrect === idx ? '1px solid var(--emerald)' : '1px solid var(--border)', outline: 'none', fontFamily: 'inherit', fontSize: 14, background: newQCorrect === idx ? 'var(--emerald-light)' : '#fff' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>الشرح التفصيلي (اختياري)</label>
                  <textarea
                    rows={2}
                    value={newQExplanation}
                    onChange={(e) => setNewQExplanation(e.target.value)}
                    placeholder="اكتب شرحاً يظهر للطالب عند الإجابة..."
                    style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--emerald)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 8px 16px var(--emerald-glow)' }}
                  >
                    حفظ وإضافة للبنك
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
"""

def setup_admin():
    # Overwrite Admin Page
    admin_path = os.path.join(BASE_DIR, 'app/admin/page.js')
    with open(admin_path, 'w', encoding='utf-8') as f:
        f.write(ADMIN_PAGE_JS)
    print("Admin page rewritten successfully.")

    # Remove dashboard database/create routes completely
    db_route = os.path.join(BASE_DIR, 'app/dashboard/database')
    create_route = os.path.join(BASE_DIR, 'app/dashboard/create')
    
    if os.path.exists(db_route):
        shutil.rmtree(db_route)
        print("Removed /dashboard/database")
    if os.path.exists(create_route):
        shutil.rmtree(create_route)
        print("Removed /dashboard/create")

setup_admin()
