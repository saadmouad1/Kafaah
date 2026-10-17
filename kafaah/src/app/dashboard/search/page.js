'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Loader2, Star, BookOpen, Layers, Copy, TrendingUp, X, Sparkles, Check,
} from 'lucide-react';
import { useKafaah } from '../../../lib/context/KafaahProvider';
import { useScopeBanks, isEnglish, fmtNum } from '../../../lib/useData';
import { toggleSaved, isSaved } from '../../../lib/progress';

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function SearchPage() {
  const { sector, spec, t, locale, sectorName, specName, bankName } = useKafaah();
  const specsOfSection = sector?.specializations || [];

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [dupOnly, setDupOnly] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState({});
  const [showAll, setShowAll] = useState({});
  const reqId = useRef(0);

  // كل تخصصات قسمك محددة تلقائيًا
  useEffect(() => {
    setSelected(specsOfSection.map((s) => s.id));
    setSelectedBanks([]);
  }, [sector?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const allSelected = selected.length === specsOfSection.length && selected.length > 0;

  // بنوك النطاق المحدد (لتحديد «من أي بنك أبحث»)
  const { banks: scopeBanks } = useScopeBanks(
    allSelected
      ? { sector: sector?.id }
      : { specs: selected.length ? selected : null },
  );

  // إعادة تعيين اختيار البنوك عند تغيّر النطاق
  useEffect(() => { setSelectedBanks([]); }, [selected.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (!selected.length) return p; // لا تخصصات محددة => لا بحث
    if (allSelected && sector?.id) p.set('sector', sector.id);
    else p.set('specs', selected.join(','));
    if (selectedBanks.length) p.set('banks', selectedBanks.join(','));
    return p;
  }, [selected, allSelected, sector?.id, selectedBanks]);

  useEffect(() => {
    if (!params.toString()) { setSuggestions([]); return; }
    fetch(`/api/search?${params.toString()}&suggest=1`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [params]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !params.toString()) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqId.current;
    const h = setTimeout(() => {
      fetch(`/api/search?${params.toString()}&q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => { if (id === reqId.current) setData(d); })
        .catch(() => {})
        .finally(() => id === reqId.current && setLoading(false));
    }, 320);
    return () => clearTimeout(h);
  }, [query, params]);

  const tokens = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q.split(/\s+/).filter((t) => t.length >= 2).map(escapeRe);
  }, [query]);

  function Highlight({ text }) {
    if (!tokens.length) return <>{text}</>;
    let parts;
    try {
      parts = String(text).split(new RegExp(`(${tokens.join('|')})`, 'gi'));
    } catch {
      return <>{text}</>;
    }
    return (
      <>
        {parts.map((p, i) =>
          tokens.some((t) => new RegExp(`^${t}$`, 'i').test(p)) ? (
            <mark key={i} className="hl">{p}</mark>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </>
    );
  }

  function toggleSpec(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleBank(id) {
    setSelectedBanks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const diffLabel = (dv) => (dv === 'easy' ? t('common.easy') : dv === 'hard' ? t('common.hard') : t('common.medium'));

  const d = data;
  const groups = d ? (dupOnly ? d.groups.filter((g) => g.count > 1) : d.groups) : [];
  const stats = d
    ? [
        { icon: Layers, label: t('search.matched'), value: fmtNum(d.matchedRows, locale), tone: 'brand' },
        { icon: BookOpen, label: t('search.unique'), value: fmtNum(d.unique, locale), tone: 'muted' },
        { icon: Copy, label: t('search.duplicated'), value: fmtNum(d.duplicated, locale), tone: 'warning' },
        { icon: TrendingUp, label: t('search.banksInvolved'), value: fmtNum(d.banksInvolved, locale), tone: 'info' },
      ]
    : [];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <h1 className="page-title">{t('search.title')}</h1>
        <p className="text-muted mt-1">{t('search.sub')}</p>
      </div>

      {/* نطاق البحث: تخصصات قسمك فقط */}
      <div className="card" style={{ padding: 14 }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 13.5 }}>
            {t('search.scope', { sector: sectorName(sector) || t('search.yourSection') })}
          </span>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="chip"
              onClick={() => setSelected(allSelected ? [] : specsOfSection.map((s) => s.id))}
            >
              {allSelected ? t('search.clearAll') : t('search.selectAll')}
            </button>
          </div>
        </div>
        <div className="chip-row">
          {specsOfSection.map((s) => {
            const on = selected.includes(s.id);
            return (
              <span key={s.id} className={`chip${on ? ' active' : ''}`} onClick={() => toggleSpec(s.id)}>
                {on && <Check size={12} />} {specName(s)}
              </span>
            );
          })}
        </div>
        {!selected.length && (
          <p className="text-muted mt-2" style={{ fontSize: 12.5, fontWeight: 700 }}>
            {t('search.pickOne')}
          </p>
        )}

        {/* نطاق البنوك: بنك محدّد أو كل البنوك */}
        {scopeBanks.length > 0 && (
          <div className="mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 13.5 }}>{t('search.bankScope')}</span>
            <div className="chip-row mt-2">
              <span
                className={`chip${selectedBanks.length === 0 ? ' active' : ''}`}
                onClick={() => setSelectedBanks([])}
              >
                {selectedBanks.length === 0 && <Check size={12} />} {t('search.allBanks')}
              </span>
              {scopeBanks.map((b) => {
                const on = selectedBanks.includes(b.id);
                return (
                  <span key={b.id} className={`chip${on ? ' active' : ''}`} onClick={() => toggleBank(b.id)}>
                    {on && <Check size={12} />} {bankName(b)}
                    <span className="text-muted" style={{ fontSize: 11, fontWeight: 700 }}> ·{fmtNum(b.count, locale)}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <form className="card" style={{ padding: 14 }} onSubmit={(e) => e.preventDefault()}>
        <div className="row" style={{ gap: 10, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', insetInlineStart: 14, color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingInlineStart: 42, paddingInlineEnd: query ? 42 : 14 }}
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="icon-btn"
              style={{ position: 'absolute', insetInlineEnd: 6, width: 32, height: 32 }}
              onClick={() => setQuery('')}
              aria-label={t('search.clearAria')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {suggestions.length > 0 && !query && (
          <div className="chip-row mt-2">
            <span className="text-muted row" style={{ gap: 6, fontSize: 12.5, fontWeight: 800 }}>
              <Sparkles size={14} /> {t('search.try')}
            </span>
            {suggestions.slice(0, 8).map((s) => (
              <span key={s} className="chip" onClick={() => setQuery(s)}>{s}</span>
            ))}
          </div>
        )}
      </form>

      {loading && (
        <p className="text-muted row" style={{ gap: 8 }}>
          <Loader2 size={16} className="spin" /> {t('search.searching')}
        </p>
      )}

      {d && !loading && (
        <>
          <div className="stat-grid">
            {stats.map((s, i) => (
              <div key={i} className="card stat-card-sm">
                <span className={`stat-ico tone-${s.tone}`}><s.icon size={16} /></span>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {d.duplicated > 0 && (
            <div className="row-between card soft-sector" style={{ padding: 12, gap: 10, flexWrap: 'wrap' }}>
              <span className="row" style={{ gap: 8, fontSize: 13.5, fontWeight: 700 }}>
                <Copy size={15} /> {t('search.dupNotice', { n: fmtNum(d.duplicated, locale) })}
              </span>
              <button className={`chip${dupOnly ? ' active' : ''}`} onClick={() => setDupOnly((v) => !v)}>
                {dupOnly ? t('search.showAll') : t('search.showDupOnly')}
              </button>
            </div>
          )}

          <div className="stack" style={{ gap: 12 }}>
            {groups.map((g) => {
              const en = isEnglish(g.text);
              const isOpen = open[g.key];
              const listAll = showAll[g.key];
              const occ = listAll ? g.occurrences : g.occurrences.slice(0, 4);
              const rep = { id: g.occurrences[0]?.id, ...g };
              return (
                <div key={g.key} className="card">
                  <div className="row-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-brand">{g.subject}</span>
                      {g.count > 1 && (
                        <span className="badge badge-warning"><Copy size={11} /> {t('search.repeated', { n: fmtNum(g.count, locale) })}</span>
                      )}
                      {g.banks > 1 && <span className="badge badge-info">{t('search.banksCount', { n: fmtNum(g.banks, locale) })}</span>}
                    </div>
                    <button className="icon-btn" onClick={() => toggleSaved(rep)} aria-label={t('search.saveAria')}>
                      <Star size={17} fill={isSaved(rep.id) ? 'var(--gold)' : 'none'} color={isSaved(rep.id) ? 'var(--gold)' : 'currentColor'} />
                    </button>
                  </div>

                  <p style={{ fontWeight: 700, lineHeight: 1.8, direction: en ? 'ltr' : 'rtl', textAlign: en ? 'left' : 'right' }}>
                    <Highlight text={g.text} />
                  </p>

                  <div className="stack" style={{ gap: 6, marginTop: 10 }}>
                    <span className="text-muted" style={{ fontSize: 12.5, fontWeight: 800 }}>{t('search.appearedIn')}</span>
                    <div className="stack" style={{ gap: 6 }}>
                      {occ.map((o, i) => (
                        <div key={i} className="occurrence">
                          <BookOpen size={14} />
                          <span style={{ fontWeight: 800 }}>{bankName({ specId: o.specId, title: o.bankTitle, auto: o.bankAuto })}</span>
                          <span className="dot" style={{ background: 'var(--border-strong)' }} />
                          <span className="text-muted">{o.specLabel}</span>
                          <span className="badge badge-muted" style={{ marginInlineStart: 'auto' }}>{diffLabel(o.difficulty)}</span>
                        </div>
                      ))}
                      {g.occurrences.length > 4 && !listAll && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowAll((s) => ({ ...s, [g.key]: true }))}>
                          {t('search.showAllBanks', { n: fmtNum(g.occurrences.length, locale) })}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm mt-2"
                    onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))}
                  >
                    {isOpen ? t('common.hideAnswer') : t('common.showAnswerExplanation')}
                  </button>
                  {isOpen && (
                    <div className="mt-2 stack" style={{ gap: 8 }}>
                      {(g.options || []).map((opt, i) => {
                        const ok = i === (g.correctIndex ?? 0);
                        const oen = isEnglish(opt);
                        return (
                          <div
                            key={i}
                            className={`option-static${ok ? ' correct' : ''}`}
                            style={{ direction: oen ? 'ltr' : 'rtl', textAlign: oen ? 'left' : 'right' }}
                          >
                            {ok && '✓ '}{opt}
                          </div>
                        );
                      })}
                      {g.explanation && (
                        <div className="card soft-sector" style={{ padding: 12, fontSize: 13.5, fontWeight: 600 }}>
                          <strong style={{ display: 'block', marginBottom: 4 }}>{t('common.explanation')}:</strong>
                          {g.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {d.truncated && (
              <p className="text-muted text-center">{t('search.truncated', { n: fmtNum(d.groups.length, locale) })}</p>
            )}
            {groups.length === 0 && (
              <div className="card text-center text-muted" style={{ padding: 36 }}>
                {t('search.noResults')}
              </div>
            )}
          </div>
        </>
      )}

      {!d && !loading && query.trim().length < 2 && (
        <div className="card text-center text-muted" style={{ padding: 36 }}>
          {t('search.startTyping', { spec: spec ? specName(spec) : sectorName(sector) || t('search.yourSection') })}
        </div>
      )}
    </div>
  );
}
