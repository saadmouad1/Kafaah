'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Users, Database, Plus, Search, BarChart3, LogOut,
  ArrowRight, Edit3, Trash2, ChevronDown, ChevronRight, X,
  BookOpen, Layers, Settings, Eye, Filter, CheckCircle2, XCircle,
  Building2, GraduationCap, Scale, Coins, Heart
} from 'lucide-react';
// Removed mock imports

// ─── helpers ────────────────────────────────────────────────────────────────
const SECTOR_ICONS = { medical: Heart, engineering: Settings, law: Scale, finance: Coins, education: GraduationCap };
const SECTOR_COLORS = { medical: '#10b981', engineering: '#3b82f6', law: '#f59e0b', finance: '#8b5cf6', education: '#ec4899' };

function checkIsEnglish(text) {
  if (!text) return false;
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  return en > ar;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, Icon }) {
  return (
    <motion.div whileHover={{ y: -3 }} style={{
      background: '#fff', borderRadius: 20, padding: '22px 24px',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-numbers)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color, fontWeight: 700, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 50, height: 50, borderRadius: 16, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={26} />
      </div>
    </motion.div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'نظرة عامة',       icon: BarChart3 },
  { id: 'users',     label: 'إدارة العملاء',    icon: Users },
  { id: 'sectors',   label: 'الأقسام والتخصصات', icon: Layers },
  { id: 'questions', label: 'إدارة الأسئلة',    icon: Database },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ sectors: [], questions: [], users: [] });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoadingData(false);
      });
  }, []);

  // ── AUTH guard ──
  useEffect(() => {
    const ok = document.cookie.includes('kafaah_admin_session=authenticated');
    if (!ok) router.replace('/admin/login');
    else setSessionChecked(true);
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  if (!sessionChecked) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 700 }}>جارٍ التحقق من الصلاحيات...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP BAR ── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 2rem', height: 64,
        background: '#fff', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 200, boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>بوابة المشرفين — كفاءة</div>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>Admin Control Panel</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="/dashboard" style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={15} /> معاينة الطالب
          </a>
          <button onClick={handleLogout} title="خروج" style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={15} /> خروج
          </button>
        </div>
      </header>

      {/* ── SIDEBAR + CONTENT ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: 220, background: '#fff', borderLeft: '1px solid var(--border)', flexShrink: 0, padding: '20px 12px', position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 12, paddingRight: 8, letterSpacing: 1 }}>القائمة الرئيسية</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12,
                  background: active ? 'rgba(239,68,68,0.08)' : 'transparent',
                  color: active ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: active ? 800 : 600, fontSize: 14, border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'right',
                  borderRight: active ? '3px solid #ef4444' : '3px solid transparent'
                }}>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {loadingData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>جاري جلب البيانات من القاعدة...</div>
              </div>
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'overview'  && <OverviewTab sectors={data.sectors} questions={data.questions} users={data.users} />}
                {activeTab === 'users'     && <UsersTab users={data.users} />}
                {activeTab === 'sectors'   && <SectorsTab sectors={data.sectors} questions={data.questions} />}
                {activeTab === 'questions' && <QuestionsTab sectors={data.sectors} questions={data.questions} />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ sectors, questions, users }) {
  const totalQ = questions.length;
  const totalSpecs = sectors.reduce((s, c) => s + (c.specializations?.length || 0), 0);
  const catCounts = useMemo(() => questions.reduce((a, q) => { const cat = q.sectorId || q.category; a[cat] = (a[cat] || 0) + 1; return a; }, {}), [questions]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>نظرة عامة على المنصة</h1>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 28 }}>إحصائيات حقيقية من بيانات كفاءة</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="إجمالي الأسئلة" value={totalQ.toLocaleString()} sub="في بنك كفاءة" color="#10b981" Icon={Database} />
        <StatCard label="الأقسام الرئيسية" value={sectors.length} sub="قطاع مهني" color="#3b82f6" Icon={Layers} />
        <StatCard label="التخصصات" value={totalSpecs} sub="تخصص في كل الأقسام" color="#f59e0b" Icon={GraduationCap} />
        <StatCard label="المشتركون" value={users.length} sub="عميل مسجل" color="#ef4444" Icon={Users} />
      </div>

      {/* Sector breakdown */}
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>توزيع الأسئلة على الأقسام</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sectors.map(sector => {
          const count = catCounts[sector.id] || 0;
          const pct = totalQ > 0 ? Math.round((count / totalQ) * 100) : 0;
          const Icon = SECTOR_ICONS[sector.id] || Layers;
          return (
            <div key={sector.id} style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: SECTOR_COLORS[sector.id] + '18', color: SECTOR_COLORS[sector.id], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{sector.label}</span>
                  <span style={{ fontFamily: 'var(--font-numbers)', fontWeight: 900, color: SECTOR_COLORS[sector.id], fontSize: 14 }}>{count} سؤال</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                    style={{ height: '100%', background: SECTOR_COLORS[sector.id], borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{sector.specializations.length} تخصص</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 700 }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — USERS
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>إدارة العملاء والمشتركين</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>عرض وإدارة جميع المشتركين في المنصة</p>
        </div>
        <button style={{ padding: '12px 20px', borderRadius: 12, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <Plus size={18} /> إضافة مشترك يدوياً
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 1.2fr 1fr 1fr', padding: '14px 22px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>
          <div>المشترك</div><div>التخصص</div><div>تاريخ التسجيل</div><div>الحالة</div><div>إجراءات</div>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: '70px 24px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Users size={36} style={{ color: 'var(--text-dim)' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>لا يوجد مشتركون مسجلون بعد</p>
          </div>
        ) : (
          users.map((u, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 1.2fr 1fr 1fr', padding: '14px 22px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13, alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>{u.name} <br/><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</span></div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{u.specializationId || '-'}</div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(u.createdAt).toLocaleDateString()}</div>
              <div><span style={{ padding: '4px 10px', borderRadius: 6, background: '#10b98120', color: '#10b981', fontSize: 11, fontWeight: 700 }}>نشط</span></div>
              <div style={{ color: 'var(--text-muted)' }}>-</div>
            </div>
          ))
        )}
      </div>

      {/* Subscription plans info */}
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>خطط الاشتراك المتوفرة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { plan: 'التجربة المجانية', duration: '3 أشهر', price: 'مجاناً', color: '#10b981', desc: 'وصول كامل لجميع الأسئلة' },
            { plan: 'الاشتراك الشهري', duration: '30 يوم', price: 'بعد التفعيل', color: '#3b82f6', desc: 'تجديد تلقائي شهرياً' },
            { plan: 'الاشتراك السنوي', duration: '365 يوم', price: 'بعد التفعيل', color: '#f59e0b', desc: 'خصم خاص للسنة الكاملة' },
          ].map((p, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: `1px solid ${p.color}30`, borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{p.plan}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: p.color, fontFamily: 'var(--font-numbers)', marginBottom: 6 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{p.duration} • {p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — SECTORS & SPECIALIZATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function SectorsTab({ sectors, questions }) {
  const [expandedSector, setExpandedSector] = useState('medical');
  const catCounts = useMemo(() => questions.reduce((a, q) => { const cat = q.sectorId || q.category; a[cat] = (a[cat] || 0) + 1; return a; }, {}), [questions]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>إدارة الأقسام والتخصصات</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>هيكل المنصة المهنية — كل قسم يحوي تخصصات مستقلة</p>
        </div>
        <button style={{ padding: '12px 20px', borderRadius: 12, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <Plus size={18} /> إضافة قسم جديد
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sectors.map(sector => {
          const Icon = SECTOR_ICONS[sector.id] || Layers;
          const color = SECTOR_COLORS[sector.id];
          const qCount = catCounts[sector.id] || 0;
          const isOpen = expandedSector === sector.id;

          return (
            <div key={sector.id} style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
              {/* Sector header */}
              <div
                onClick={() => setExpandedSector(isOpen ? null : sector.id)}
                style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{sector.label}</div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{sector.specializations?.length || 0} تخصص</span>
                    <span style={{ fontSize: 13, color, fontWeight: 800 }}>{qCount} سؤال</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); /* Add action */ }} style={{ padding: '7px 14px', borderRadius: 8, background: color + '18', color, border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                    + تخصص
                  </button>
                  <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {/* Specializations grid */}
              {isOpen && (
                <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginTop: 16 }}>
                    {(sector.specializations || []).map(spec => (
                      <div key={spec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{spec.label}</div>
                          <div style={{ fontSize: 11, color, fontWeight: 700, background: color + '18', padding: '1px 8px', borderRadius: 999, display: 'inline-block' }}>{spec.country}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}><Edit3 size={15} /></button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                    {/* Add specialization */}
                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, border: `2px dashed ${color}50`, background: color + '06', color, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                      <Plus size={16} /> إضافة تخصص
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — QUESTIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function QuestionsTab({ sectors, questions }) {
  const [filterSector, setFilterSector] = useState('all');
  const [filterSpec, setFilterSpec] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  // Question form state
  const [form, setForm] = useState({ sector: 'medical', spec: 'smle', text: '', options: ['', '', '', ''], correct: 0, explanation: '' });
  const [extraQuestions, setExtraQuestions] = useState([]);

  const allQuestions = useMemo(() => [...extraQuestions, ...questions], [extraQuestions, questions]);

  const currentSector = sectors.find(s => s.id === filterSector);

  const filtered = useMemo(() => {
    let q = allQuestions;
    if (filterSector !== 'all') q = q.filter(x => x.category === filterSector || x.sectorId === filterSector);
    if (filterSpec !== 'all') q = q.filter(x => x.specialty === filterSpec || x.specialization === filterSpec);
    if (searchQ.trim()) {
      const s = searchQ.toLowerCase();
      q = q.filter(x => x.text?.toLowerCase().includes(s) || x.id?.toLowerCase().includes(s));
    }
    return q;
  }, [allQuestions, filterSector, filterSpec, searchQ]);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    const newQ = {
      id: `KAF-${Date.now()}`,
      category: form.sector,
      sector: form.sector,
      specialty: form.spec,
      text: form.text,
      options: form.options,
      correct_index: form.correct,
      explanation: form.explanation,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setExtraQuestions(prev => [newQ, ...prev]);
    setShowModal(false);
    setForm({ sector: 'medical', spec: 'smle', text: '', options: ['', '', '', ''], correct: 0, explanation: '' });
    setFilterSector(newQ.sector);
    setPage(1);
  };

  const sectorLabel = (id) => sectors.find(s => s.id === id)?.label || id;
  const color = filterSector !== 'all' ? (SECTOR_COLORS[filterSector] || '#10b981') : '#10b981';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>إدارة بنك الأسئلة</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{filtered.length.toLocaleString()} سؤال • مفلتر حسب القسم والتخصص</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '12px 22px', borderRadius: 12, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, boxShadow: '0 8px 20px rgba(239,68,68,0.25)' }}>
          <Plus size={18} /> إضافة سؤال جديد
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid var(--border)', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input type="text" value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder="ابحث بنص السؤال أو المعرف..."
            style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        {/* Sector filter */}
        <select value={filterSector} onChange={e => { setFilterSector(e.target.value); setFilterSpec('all'); setPage(1); }}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: '#fff', minWidth: 180, cursor: 'pointer' }}>
          <option value="all">جميع الأقسام</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        {/* Spec filter */}
        <select value={filterSpec} onChange={e => { setFilterSpec(e.target.value); setPage(1); }}
          disabled={filterSector === 'all'}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: '#fff', minWidth: 200, cursor: filterSector === 'all' ? 'not-allowed' : 'pointer', opacity: filterSector === 'all' ? 0.5 : 1 }}>
          <option value="all">جميع التخصصات</option>
          {(currentSector?.specializations || []).map(sp => <option key={sp.id} value={sp.id}>{sp.label}</option>)}
        </select>
      </div>

      {/* Questions table */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-subtle)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 1fr 80px', padding: '14px 22px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>
          <div>المعرف</div><div>القسم</div><div>نص السؤال</div><div>إجراءات</div>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: 14 }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>لا توجد أسئلة لهذا التصفية</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>جرب تغيير الفلاتر أو أضف أسئلة لهذا التخصص</p>
          </div>
        ) : (
          paged.map((q, i) => {
            const isEn = checkIsEnglish(q.text);
            return (
              <div key={q.id || i} style={{
                display: 'grid', gridTemplateColumns: '140px 140px 1fr 80px',
                padding: '14px 22px', borderBottom: '1px solid var(--border-subtle)',
                alignItems: 'center', fontSize: 13
              }}>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>{q.id}</div>
                <div>
                  <span style={{ padding: '3px 10px', borderRadius: 6, background: (SECTOR_COLORS[q.sectorId || q.category] || '#10b981') + '18', color: SECTOR_COLORS[q.sectorId || q.category] || '#10b981', fontSize: 11, fontWeight: 700 }}>
                    {sectorLabel(q.sectorId || q.category)}
                  </span>
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 20, color: 'var(--text)', fontWeight: 600, direction: isEn ? 'ltr' : 'rtl' }}>
                  {q.text}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}><Edit3 size={16} /></button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontWeight: 700 }}>
            السابق
          </button>
          <span style={{ padding: '8px 16px', fontWeight: 800, color: 'var(--text-muted)', fontSize: 14 }}>
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontWeight: 700 }}>
            التالي
          </button>
        </div>
      )}

      {/* ── ADD QUESTION MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 24, padding: 32, maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-float)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>إضافة سؤال جديد للبنك</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Sector + Spec */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>القسم الرئيسي *</label>
                    <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value, spec: sectors.find(s => s.id === e.target.value)?.specializations[0]?.id || '' }))}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit' }}>
                      {sectors.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>التخصص *</label>
                    <select value={form.spec} onChange={e => setForm(f => ({ ...f, spec: e.target.value }))}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit' }}>
                      {(sectors.find(s => s.id === form.sector)?.specializations || []).map(sp => <option key={sp.id} value={sp.id}>{sp.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Question text */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>نص السؤال / الحالة السريرية *</label>
                  <textarea rows={4} required value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="اكتب نص السؤال بدقة..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Options */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>الخيارات — حدد الإجابة الصحيحة ✓</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {form.options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="radio" name="correct" checked={form.correct === idx} onChange={() => setForm(f => ({ ...f, correct: idx }))}
                          style={{ width: 18, height: 18, accentColor: '#10b981', flexShrink: 0 }} />
                        <input type="text" required value={opt} onChange={e => { const opts = [...form.options]; opts[idx] = e.target.value; setForm(f => ({ ...f, options: opts })); }}
                          placeholder={`الخيار ${idx + 1}`}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${form.correct === idx ? '#10b981' : 'var(--border)'}`, outline: 'none', fontSize: 14, fontFamily: 'inherit', background: form.correct === idx ? '#f0fdf4' : '#fff' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>الشرح التفصيلي (يظهر للطالب بعد الإجابة)</label>
                  <textarea rows={2} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="اكتب الشرح العلمي..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', outline: 'none', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 22px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>إلغاء</button>
                  <button type="submit" style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 8px 20px rgba(239,68,68,0.25)' }}>
                    <Plus size={16} style={{ display: 'inline', marginLeft: 6 }} />
                    حفظ السؤال
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
