'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Send, Sparkles, Loader2, Trash2, Bot, UserRound,
  Copy, Check, BookOpen, BrainCircuit, Lightbulb,
  CheckCircle2, Compass, Stethoscope, Scale, Calculator,
  GraduationCap, RefreshCw
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';

const STORE = 'kafaah_chat_v1';

// مكوّن تنسيق الردود بذكاء لمنع ظهور أي نجوم أو علامات ماركداون مشوشة للمستخدم
function FormattedChatText({ content }) {
  if (!content) return null;

  // تقسيم النص إلى أسطر
  const lines = String(content).split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.8 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: 4 }} />;

        // معالجة القوائم المنقطة (- أو • أو *)
        const isBullet = /^[•\-\*]\s+/.test(trimmed);
        // معالجة القوائم المرقمة (1. أو 2.)
        const isNumbered = /^\d+[\.\)]\s+/.test(trimmed);

        let cleanText = trimmed;
        let prefix = null;

        if (isBullet) {
          cleanText = trimmed.replace(/^[•\-\*]\s+/, '');
          prefix = (
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--sector, #059669)',
              display: 'inline-block',
              marginInlineEnd: 10,
              flexShrink: 0,
              marginTop: 9
            }} />
          );
        } else if (isNumbered) {
          const match = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
          if (match) {
            const num = match[1];
            cleanText = match[2];
            prefix = (
              <span style={{
                minWidth: 20,
                height: 20,
                borderRadius: 6,
                background: 'color-mix(in srgb, var(--sector, #059669) 15%, transparent)',
                color: 'var(--sector, #059669)',
                fontSize: 11.5,
                fontWeight: 900,
                display: 'inline-grid',
                placeItems: 'center',
                marginInlineEnd: 8,
                flexShrink: 0,
                marginTop: 2
              }}>
                {num}
              </span>
            );
          }
        }

        // إزالة النجوم المزدوجة ** وتحويلها إلى نص عريض ومميز بدلاً من ظهور **
        const parts = [];
        let remaining = cleanText;
        let keyCounter = 0;

        while (remaining.length > 0) {
          const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
            const matchIndex = boldMatch.index;
            if (matchIndex > 0) {
              parts.push(<span key={keyCounter++}>{remaining.slice(0, matchIndex)}</span>);
            }
            parts.push(
              <strong
                key={keyCounter++}
                style={{
                  color: 'inherit',
                  fontWeight: 900,
                  background: 'color-mix(in srgb, var(--sector, #059669) 10%, transparent)',
                  padding: '1px 5px',
                  borderRadius: 4
                }}
              >
                {boldMatch[1]}
              </strong>
            );
            remaining = remaining.slice(matchIndex + boldMatch[0].length);
          } else {
            // إزالة أي نجمة مفردة متبقية للتنظيف التام
            const finalClean = remaining.replace(/\*/g, '');
            parts.push(<span key={keyCounter++}>{finalClean}</span>);
            break;
          }
        }

        if (isBullet || isNumbered) {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginInlineStart: 4 }}>
              {prefix}
              <div style={{ flex: 1 }}>{parts}</div>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0 }}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const { profile, sector, spec, t, lang, sectorName, specName, localize } = useKafaah();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  // استرجاع المحادثة السابقة
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(messages.slice(-40))); } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  // اقتراحات تخصصية ذكية بحسب مجال المتدرب
  const specialtyTitle = specName(spec) || sectorName(sector) || 'تخصصك';
  const customSuggestions = [
    `اشرح لي أهم المفاهيم المتكررة في امتحانات ${specialtyTitle}`,
    `ساعدني في وضع خطة مكثفة لمراجعة ${specialtyTitle}`,
    `اختبرني بسؤال تطبيقي من نماذج امتحانات المزاولة`,
    `ما هي أهم الأخطاء الشائعة التي يقع فيها المتقدمون للامتحان؟`
  ];

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...messages, { role: 'user', content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setMessages(next);
    setInput('');
    setBusy(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          lang,
          context: {
            sectorLabel: sectorName(sector),
            specLabel: specName(spec),
            authority: localize(spec?.authority),
          },
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.text || data.reply || t('chat.error');
      setMessages((m) => [...m, {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'تعذّر الوصول إلى المساعد الأكاديمي حاليًا. يُرجى التحقق من الاتصال بالإنترنت والمحاولة مجددًا.',
        error: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    // تمدد تلقائي للـ textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }

  function clearChat() {
    setMessages([]);
    try { localStorage.removeItem(STORE); } catch {}
  }

  function copy(idx, text) {
    try {
      navigator.clipboard.writeText(text);
      setCopied(idx);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  }

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 960, margin: '0 auto' }}>
      
      {/* ── Chat Header & Status Pod ── */}
      <div className="card" style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--sector-1, #10b981) 0%, var(--sector-2, #059669) 100%)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'var(--shadow-brand)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                {t('chat.title')}
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 10px',
                borderRadius: 999,
                background: 'var(--success-soft)',
                color: 'var(--success)',
                fontSize: 11.5,
                fontWeight: 800,
                border: '1px solid color-mix(in srgb, var(--success) 35%, transparent)'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                متصل
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
              رفيقك الدراسي والمهني الذكي في <strong>{specialtyTitle}</strong>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearChat}
            style={{
              borderRadius: 10,
              fontSize: 12.5,
              color: 'var(--danger)',
              borderColor: 'color-mix(in srgb, var(--danger) 30%, var(--border))',
              background: 'color-mix(in srgb, var(--danger) 8%, var(--surface))'
            }}
          >
            <Trash2 size={14} />
            {t('chat.clear')}
          </button>
        )}
      </div>

      {/* ── Chat Messages Container ── */}
      <div className="card" style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        minHeight: '66vh',
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Messages Stream */}
        <div style={{
          padding: '22px 20px',
          flex: 1,
          overflowY: 'auto',
          maxHeight: '62vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          
          {/* Empty State with Dynamic Specialty Suggestions */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', maxWidth: 640, margin: '0 auto' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                margin: '0 auto 16px',
                background: 'color-mix(in srgb, var(--sector) 15%, var(--surface))',
                border: '1.5px solid color-mix(in srgb, var(--sector) 35%, transparent)',
                color: 'var(--sector)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--sector) 35%, transparent)'
              }}>
                <Sparkles size={30} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                مرحباً بك في المساعد الأكاديمي
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 24, fontWeight: 500 }}>
                اسألني عن أي مفهوم تخصصي أو تطبيقي، أو اطلب شرحاً لحالة سريرية أو مسألة مهنية، أو استعراض أسئلة امتحانات مزاولة المهنة.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--sector)', textAlign: 'start' }}>
                  مواضيع مقترحة لبدء المذاكرة:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 10 }}>
                  {customSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => send(s)}
                      style={{
                        padding: '13px 15px',
                        borderRadius: 14,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'start',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--sector) 12%, var(--surface))';
                        e.currentTarget.style.borderColor = 'var(--sector)';
                        e.currentTarget.style.color = 'var(--sector)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-2)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                    >
                      <Lightbulb size={16} style={{ flexShrink: 0, color: 'var(--sector)' }} />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Messages List */}
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: isUser
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'color-mix(in srgb, var(--sector) 16%, var(--surface))',
                  border: isUser
                    ? '1px solid var(--border-strong)'
                    : '1.5px solid color-mix(in srgb, var(--sector) 40%, transparent)',
                  color: isUser ? '#ffffff' : 'var(--sector)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  {isUser ? <UserRound size={19} /> : <Bot size={19} />}
                </div>

                {/* Message Body */}
                <div style={{ maxWidth: '85%', minWidth: 120 }}>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 5,
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                    fontWeight: 700
                  }}>
                    <span>{isUser ? 'أنت' : 'المساعد الأكاديمي'}</span>
                    {m.time && <span>• {m.time}</span>}
                  </div>

                  <div style={{
                    background: isUser
                      ? 'linear-gradient(135deg, var(--sector-1, #10b981) 0%, var(--sector-2, #059669) 100%)'
                      : 'var(--surface-2)',
                    color: isUser ? '#ffffff' : 'var(--text)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    padding: '14px 18px',
                    borderRadius: 18,
                    borderTopInlineStartRadius: isUser ? 18 : 4,
                    borderTopInlineEndRadius: isUser ? 4 : 18,
                    fontSize: 14.5,
                    boxShadow: isUser ? 'var(--shadow-brand)' : 'var(--shadow-xs)'
                  }}>
                    {isUser ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontWeight: 600 }}>
                        {m.content}
                      </div>
                    ) : (
                      <FormattedChatText content={m.content} />
                    )}
                  </div>

                  {/* Assistant Message Actions */}
                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: 11.5,
                          padding: '3px 10px',
                          borderRadius: 8,
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          background: 'var(--surface)'
                        }}
                        onClick={() => copy(i, m.content)}
                      >
                        {copied === i ? (
                          <>
                            <Check size={13} style={{ color: 'var(--success)' }} />
                            <span style={{ color: 'var(--success)', fontWeight: 800 }}>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>نسخ الرد</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Thinking / Loading State */}
          {busy && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, var(--sector) 16%, var(--surface))',
                border: '1.5px solid color-mix(in srgb, var(--sector) 40%, transparent)',
                color: 'var(--sector)'
              }}>
                <Bot size={19} />
              </div>
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: '11px 18px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13.5,
                color: 'var(--sector)',
                fontWeight: 700
              }}>
                <Loader2 size={16} className="spin" />
                جاري التفكير وصياغة الشرح الأكاديمي...
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ── Chat Input Dock ── */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={textareaRef}
            className="input"
            style={{
              flex: 1,
              minHeight: 46,
              maxHeight: 140,
              resize: 'none',
              padding: '12px 16px',
              fontSize: 14.5,
              borderRadius: 14,
              border: '1.5px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              lineHeight: 1.6,
              fontWeight: 600,
              transition: 'border-color 0.18s, box-shadow 0.18s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--sector)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--ring)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder={`اكتب سؤالك أو المفهوم الذي تود مراجعته في ${specialtyTitle}...`}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            rows={1}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{
              height: 46,
              padding: '0 22px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14.5,
              fontWeight: 800,
              boxShadow: 'var(--shadow-brand)'
            }}
            onClick={() => send()}
            disabled={busy || !input.trim()}
          >
            {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            <span>إرسال</span>
          </button>
        </div>

      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>
        اضغط <kbd style={{ padding: '2px 7px', background: 'var(--surface-3)', borderRadius: 5, color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11 }}>Enter ↵</kbd> للإرسال، أو <kbd style={{ padding: '2px 7px', background: 'var(--surface-3)', borderRadius: 5, color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 11 }}>Shift + Enter</kbd> لسطر جديد
      </div>

    </div>
  );
}
