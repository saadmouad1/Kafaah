'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ChevronDown, Star, Loader2, BookOpen, Layers, ArrowLeft,
  Repeat, Library,
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { useQuestions, useSpecBanks, isEnglish, fmtNum } from '../../../lib/useData';
import { toggleSaved, isSaved } from '../../../lib/progress';

function DifficultyBar({ difficulties }) {
  const total = (difficulties.easy || 0) + (difficulties.medium || 0) + (difficulties.hard || 0) || 1;
  const segs = [
    ['easy', 'var(--success)'],
    ['medium', 'var(--warning, #f59e0b)'],
    ['hard', 'var(--danger)'],
  ];
  return (
    <div className="row" style={{ height: 7, borderRadius: 99, overflow: 'hidden', background: 'var(--surface-3)', width: '100%' }}>
      {segs.map(([k, c]) => (
        <span key={k} style={{ width: `${((difficulties[k] || 0) / total) * 100}%`, background: c }} />
      ))}
    </div>
  );
}

export default function BankPage() {
  const { profile, spec, t, locale, specName, bankName } = useKafaah();
  const specId = profile?.specId;
  const { banks, loading: banksLoading } = useSpecBanks(specId);

  const [activeBank, setActiveBank] = useState(null);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [limit, setLimit] = useState(20);
  const [open, setOpen] = useState({});

  const { questions, total, hasMore, loading } = useQuestions({
    spec: specId,
    bank: activeBank,
    difficulty,
    search: search || null,
    limit,
    enabled: !!activeBank,
  });

  if (!specId) {
    return (
      <div className="card text-center" style={{ padding: 44 }}>
        <Library size={40} style={{ color: 'var(--sector)', marginBottom: 10 }} />
        <p style={{ fontWeight: 800, marginBottom: 14 }}>{t('bank.noSpec')}</p>
        <Link href="/onboarding" className="btn btn-primary"><Repeat size={15} /> {t('nav.changeSectionSpec')}</Link>
      </div>
    );
  }

  // ── قائمة البنوك ──
  if (!activeBank) {
    return (
      <div className="stack" style={{ gap: 16 }}>
        <div>
          <h1 className="page-title">{t('bank.title')}</h1>
          <p className="text-muted mt-1">{t('bank.sub')}</p>
        </div>

        {banksLoading ? (
          <div className="stack">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 116 }} />)}</div>
        ) : banks.length === 0 ? (
          <div className="card text-center text-muted" style={{ padding: 40 }}>
            <Library size={34} style={{ marginBottom: 8 }} />
            <p style={{ fontWeight: 800, color: 'var(--text)' }}>{t('bank.noBanks')}</p>
            <p style={{ fontSize: 13.5, marginTop: 4 }}>{t('bank.noBanksDesc')}</p>
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {banks.map((b) => (
              <button
                key={b.id}
                className="card card-hover"
                onClick={() => { setActiveBank(b.id); setSearch(''); setDifficulty('all'); setLimit(20); setOpen({}); }}
                style={{ textAlign: 'start', width: '100%', cursor: 'pointer', border: '1px solid var(--border)' }}
              >
                <div className="row-between" style={{ gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span className="badge badge-brand"><Layers size={11} /> {t('common.bank')}</span>
                      {b.auto && <span className="badge badge-muted">{t('bank.autoNote')}</span>}
                    </div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 900, lineHeight: 1.5 }}>{bankName(b)}</h3>
                    {b.description && <p className="text-muted" style={{ fontSize: 13, marginTop: 3 }}>{b.description}</p>}
                  </div>
                  <div className="stack" style={{ alignItems: 'flex-end', gap: 6, minWidth: 120 }}>
                    <span className="badge badge-brand">{fmtNum(b.count, locale)} {t('common.question')}</span>
                    <span className="text-muted row" style={{ gap: 5, fontSize: 12.5, fontWeight: 700 }}>
                      {t('bank.openBank')} <ArrowLeft size={14} />
                    </span>
                  </div>
                </div>
                {b.count > 0 && (
                  <div className="mt-3">
                    <DifficultyBar difficulties={b.difficulties} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── تفاصيل بنك ──
  const bank = banks.find((b) => b.id === activeBank);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row-between wrap" style={{ gap: 10 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveBank(null)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={15} style={{ transform: 'scaleX(-1)' }} /> {t('bank.back')}
          </button>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} style={{ color: 'var(--sector)' }} /> {bank ? bankName(bank) : t('bank.questionsInBank')}
          </h1>
          <p className="text-muted mt-1" style={{ fontSize: 13 }}>
            {loading ? t('common.loading') : t('bank.count', { n: fmtNum(total, locale) })}
            {' · '}{specName(spec)}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ gap: 10, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', insetInlineStart: 14, color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingInlineStart: 42 }}
            placeholder={t('bank.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setLimit(20); }}
          />
        </div>
        <div className="mt-2 chip-row">
          {[['all', t('common.allDifficulties')], ['easy', t('common.easy')], ['medium', t('common.medium')], ['hard', t('common.hard')]].map(([v, l]) => (
            <span key={v} className={`chip${difficulty === v ? ' active' : ''}`} onClick={() => { setDifficulty(v); setLimit(20); }}>{l}</span>
          ))}
        </div>
      </div>

      {loading && questions.length === 0 ? (
        <div className="stack">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>
      ) : questions.length === 0 ? (
        <div className="card text-center text-muted" style={{ padding: 40 }}>{t('bank.noMatch')}</div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {questions.map((q) => {
            const en = isEnglish(q.text);
            const isOpen = open[q.id];
            const correct = q.correctIndex ?? q.correct_index ?? 0;
            return (
              <div key={q.id} className="card">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${q.difficulty === 'hard' ? 'badge-danger' : q.difficulty === 'easy' ? 'badge-success' : 'badge-warning'}`}>
                      {q.difficulty === 'hard' ? t('common.hard') : q.difficulty === 'easy' ? t('common.easy') : t('common.medium')}
                    </span>
                  </div>
                  <button className="icon-btn" onClick={() => toggleSaved(q)} aria-label={t('q.saveAria')}>
                    <Star size={17} fill={isSaved(q.id) ? 'var(--gold)' : 'none'} color={isSaved(q.id) ? 'var(--gold)' : 'currentColor'} />
                  </button>
                </div>
                <p style={{ fontWeight: 700, lineHeight: 1.7, direction: en ? 'ltr' : 'rtl', textAlign: en ? 'left' : 'right' }}>{q.text}</p>

                <button className="btn btn-ghost btn-sm mt-2" onClick={() => setOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}>
                  {isOpen ? t('common.hideAnswer') : t('common.showAnswer')} <ChevronDown size={15} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
                </button>

                {isOpen && (
                  <div className="mt-2 stack" style={{ gap: 8 }}>
                    {(q.options || []).map((opt, i) => {
                      const oen = isEnglish(opt);
                      const ok = i === correct;
                      return (
                        <div key={i} style={{
                          padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: ok ? 800 : 600,
                          background: ok ? 'var(--success-soft)' : 'var(--surface-3)',
                          color: ok ? '#047857' : 'var(--text-secondary)',
                          border: ok ? '1px solid color-mix(in srgb, var(--success) 30%, transparent)' : '1px solid transparent',
                          direction: oen ? 'ltr' : 'rtl', textAlign: oen ? 'left' : 'right',
                        }}>
                          {ok && '✓ '}{opt}
                        </div>
                      );
                    })}
                    {q.explanation && (
                      <div className="card soft-sector" style={{ padding: 12, fontSize: 13.5, fontWeight: 600 }}>
                        <div className="row" style={{ gap: 6, fontWeight: 800, marginBottom: 4 }}><BookOpen size={15} /> {t('common.explanation')}</div>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <button className="btn btn-ghost btn-block" onClick={() => setLimit((l) => l + 20)} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null} {t('bank.loadMore')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
