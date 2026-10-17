'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Loader2, Trash2, Bot, UserRound, Copy, Check } from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';

const STORE = 'kafaah_chat_v1';

export default function ChatPage() {
  const { profile, sector, spec, t, lang, sectorName, specName, localize } = useKafaah();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const endRef = useRef(null);

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
  }, [messages]);

  const suggestions = [t('chat.s1'), t('chat.s2'), t('chat.s3'), t('chat.s4')];

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
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
          messages: next,
        }),
      });
      const data = await res.json();
      const reply = data.text || data.reply || t('chat.error');
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('chat.error'), error: true }]);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function clearChat() {
    setMessages([]);
    try { localStorage.removeItem(STORE); } catch {}
  }

  function copy(idx, text) {
    try { navigator.clipboard.writeText(text); setCopied(idx); setTimeout(() => setCopied(null), 1500); } catch {}
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row-between wrap">
        <div>
          <h1 className="page-title row" style={{ gap: 8 }}><Sparkles size={20} style={{ color: 'var(--sector)' }} /> {t('chat.title')}</h1>
          <p className="text-muted mt-1">{t('chat.sub')}</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearChat}><Trash2 size={14} /> {t('chat.clear')}</button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
        <div className="stack" style={{ gap: 14, padding: 16, flex: 1, overflowY: 'auto', maxHeight: '62vh' }}>
          {messages.length === 0 && (
            <div className="text-center" style={{ padding: '26px 8px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto', background: 'linear-gradient(135deg, var(--sector-1), var(--sector-2))', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <Bot size={32} />
              </div>
              <p className="text-muted mt-3">{t('chat.empty')}</p>
              <div className="row wrap" style={{ gap: 8, justifyContent: 'center', marginTop: 10 }}>
                {suggestions.map((s, i) => (
                  <span key={i} className="chip" onClick={() => send(s)}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, display: 'grid', placeItems: 'center', background: isUser ? 'var(--surface-3)' : 'color-mix(in srgb, var(--sector) 14%, transparent)', color: isUser ? 'var(--text-secondary)' : 'var(--sector)' }}>
                  {isUser ? <UserRound size={18} /> : <Bot size={18} />}
                </div>
                <div style={{ maxWidth: '82%' }}>
                  <div className="text-dim" style={{ fontSize: 11, marginBottom: 3, textAlign: isUser ? 'end' : 'start' }}>
                    {isUser ? t('chat.you') : t('chat.assistant')}
                  </div>
                  <div
                    style={{
                      background: isUser ? 'var(--sector)' : 'var(--surface-3)',
                      color: isUser ? '#fff' : 'var(--text)',
                      padding: '11px 14px',
                      borderRadius: 16,
                      fontWeight: 600,
                      fontSize: 14,
                      lineHeight: 1.75,
                      whiteSpace: 'pre-wrap',
                      borderTopInlineStartRadius: 4,
                    }}
                  >
                    {m.content}
                  </div>
                  {!isUser && (
                    <button className="btn btn-ghost btn-sm mt-1" style={{ fontSize: 11.5, padding: '2px 8px' }} onClick={() => copy(i, m.content)}>
                      {copied === i ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb, var(--sector) 14%, transparent)', color: 'var(--sector)' }}>
                <Bot size={18} />
              </div>
              <span className="text-muted row" style={{ gap: 8, fontSize: 13 }}><Loader2 size={14} className="spin" /> {t('chat.thinking')}</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="row" style={{ gap: 8, padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <textarea
            className="input"
            style={{ flex: 1, minHeight: 46, maxHeight: 140, resize: 'none' }}
            placeholder={t('chat.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={busy || !input.trim()} aria-label={t('chat.send')}>
            {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} {t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
