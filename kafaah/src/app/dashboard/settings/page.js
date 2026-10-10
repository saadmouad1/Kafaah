'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Moon, CheckCircle2, AlertCircle,
  Smartphone, Globe, Shield, Save, Key, CreditCard, Clock
} from 'lucide-react';
import { localDB } from '@/lib/mockDb';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    discipline: 'طب عام',
  });

  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    weeklyReport: false,
    newQuestions: true,
    smsAlerts: false
  });

  useEffect(() => {
    // Check if user session exists in local storage
    const session = localStorage.getItem('kafaah_session');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setProfile({
          name: userData.name || 'طالب كفاءة',
          email: userData.email || 'student@example.com',
          phone: userData.phone || '+967 770 000 000',
          discipline: userData.specialization || 'الطب البشري',
        });
      } catch (e) {
        // use defaults
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    }, 800);
  };

  const TABS = [
    { id: 'account', label: 'الحساب الشخصي', icon: User },
    { id: 'security', label: 'الأمان وكلمة المرور', icon: Lock },
    { id: 'notifications', label: 'التنبيهات', icon: Bell },
    { id: 'subscription', label: 'الاشتراك والباقات', icon: CreditCard },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>الإعدادات</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 15 }}>تخصيص ملفك الشخصي وتفضيلات المنصة.</p>
        </div>
        <AnimatePresence>
          {showSavedMsg && (
            <motion.initial initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 16px', background: 'var(--emerald-light)', color: 'var(--emerald-dark)', borderRadius: 12, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} /> تم حفظ التغييرات بنجاح
            </motion.initial>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, gap: 24 }}>
        
        {/* Settings Navigation */}
        <div style={{ flexShrink: 0, width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16,
                  background: active ? '#fff' : 'transparent', border: active ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: active ? 'var(--shadow-subtle)' : 'none', color: active ? 'var(--coral)' : 'var(--text-secondary)',
                  fontWeight: active ? 800 : 700, fontSize: 15, cursor: 'pointer', textAlign: 'right', width: '100%'
                }}
              >
                <Icon size={20} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        <div style={{ flex: 1 }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--shadow-card)' }}
          >
            {/* 1. Account Settings */}
            {activeTab === 'account' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <User size={24} style={{ color: 'var(--coral)' }} /> البيانات الشخصية
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>الاسم الكامل</label>
                    <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} 
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit', background: 'var(--bg-subtle)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>البريد الإلكتروني</label>
                    <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} disabled
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit', background: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, marginTop: 6, display: 'block' }}>لا يمكن تغيير البريد الإلكتروني حالياً. تواصل مع الدعم الفني.</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>رقم الهاتف</label>
                      <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} 
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit', background: 'var(--bg-subtle)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>التخصص المهني</label>
                      <input type="text" value={profile.discipline} onChange={e => setProfile({...profile, discipline: e.target.value})} disabled
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit', background: '#f8fafc', color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '14px 28px', borderRadius: 12, background: 'var(--coral)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saving ? <span style={{ opacity: 0.8 }}>جاري الحفظ...</span> : <><Save size={18} /> حفظ التعديلات</>}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Security */}
            {activeTab === 'security' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={24} style={{ color: 'var(--emerald)' }} /> الأمان وكلمة المرور
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>كلمة المرور الحالية</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>كلمة المرور الجديدة</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>تأكيد كلمة المرور الجديدة</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: 15, fontFamily: 'inherit' }} />
                  </div>
                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '14px 28px', borderRadius: 12, background: 'var(--text)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Key size={18} /> تحديث كلمة المرور
                  </button>
                </div>
              </div>
            )}

            {/* 3. Notifications */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bell size={24} style={{ color: 'var(--blue-sky)' }} /> إعدادات التنبيهات
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'emailAlerts', title: 'تنبيهات البريد الإلكتروني', desc: 'استلام التنبيهات الهامة عبر الإيميل' },
                    { key: 'weeklyReport', title: 'التقرير الأسبوعي', desc: 'ملخص أسبوعي لمستواك في الاختبارات' },
                    { key: 'newQuestions', title: 'تحديثات بنك الأسئلة', desc: 'إشعار عند إضافة أسئلة جديدة في تخصصك' },
                    { key: 'smsAlerts', title: 'الرسائل النصية (SMS)', desc: 'تنبيهات عاجلة بخصوص الاشتراك' },
                  ].map((item) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 16, border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{item.title}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{item.desc}</div>
                      </div>
                      <button onClick={() => setNotifs({...notifs, [item.key]: !notifs[item.key]})} style={{ width: 44, height: 24, borderRadius: 999, background: notifs[item.key] ? 'var(--blue-sky)' : 'var(--border)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', top: 2, right: notifs[item.key] ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'right 0.2s', boxShadow: 'var(--shadow-subtle)' }} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '14px 28px', borderRadius: 12, background: 'var(--blue-sky)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Save size={18} /> حفظ التفضيلات
                  </button>
                </div>
              </div>
            )}

            {/* 4. Subscription */}
            {activeTab === 'subscription' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CreditCard size={24} style={{ color: 'var(--gold)' }} /> باقة الاشتراك
                </h2>
                
                <div style={{ padding: 24, borderRadius: 20, border: '2px solid var(--gold)', background: 'var(--gold-light)', marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, background: 'var(--gold)', color: '#fff', padding: '4px 10px', borderRadius: 8 }}>نشط</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>الباقة الشاملة (تجريبية)</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>
                        وصول غير محدود لجميع الأسئلة والاختبارات التجريبية.
                      </p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold-dark)', fontFamily: 'var(--font-numbers)' }}>مجاناً</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(217, 119, 6, 0.2)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold-dark)', fontWeight: 700, fontSize: 13 }}>
                    <Clock size={16} /> تنتهي الصلاحية بعد 3 أشهر
                  </div>
                </div>

                <div style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>الترقية لباقة بريميوم</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>احصل على تقارير ذكية وشروحات مفصلة بالذكاء الاصطناعي.</p>
                  </div>
                  <button style={{ padding: '12px 20px', borderRadius: 10, background: 'var(--text)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                    ترقية الآن
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
