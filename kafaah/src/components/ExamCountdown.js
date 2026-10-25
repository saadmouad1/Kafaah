'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Flame, Sparkles, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';

export default function ExamCountdown({
  targetDate = null,
  title = 'دورة امتحانات مزاولة المهنة القادمة',
  subtitle = 'المجلس الطبي وهيئة التخصصات الصحية — احسم استعدادك واضمن تفوقك من المحاولة الأولى',
  ctaText = 'احسم مقعدك وابدأ المذاكرة الآن',
  ctaHref = '#pricing',
  compact = false,
  onCtaClick = null,
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReady: false,
  });

  useEffect(() => {
    // Determine exam target date: default to 42 days from now at 09:00 AM
    let target = targetDate ? new Date(targetDate) : null;
    if (!target || isNaN(target.getTime())) {
      // Calculate next exam cycle (15th of next month)
      const now = new Date();
      target = new Date(now.getTime() + 38 * 24 * 60 * 60 * 1000);
      target.setHours(9, 0, 0, 0);
    }

    const calc = () => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isReady: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isReady: true });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 16,
          padding: '14px 18px',
          boxShadow: '0 4px 18px rgba(245, 158, 11, 0.1)',
        }}
      >
        <div className="row-between wrap" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 3px 10px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Flame size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text)' }}>
                  {title}
                </span>
                <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: 11, fontWeight: 800 }}>
                  توقيت رسمي ⏳
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
                الوقت المتبقي حتى انطلاق الدورة الامتحانية
              </p>
            </div>
          </div>

          {/* Time digits */}
          <div className="row" style={{ gap: 6, direction: 'ltr' }}>
            {[
              { val: pad(timeLeft.days), lbl: 'يوم' },
              { val: pad(timeLeft.hours), lbl: 'ساعة' },
              { val: pad(timeLeft.minutes), lbl: 'دقيقة' },
              { val: pad(timeLeft.seconds), lbl: 'ثانية' },
            ].map((unit, i) => (
              <div
                key={i}
                style={{
                  minWidth: 46,
                  padding: '6px 8px',
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  textAlign: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-numbers, monospace)', lineHeight: 1 }}>
                  {unit.val}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginTop: 3 }}>
                  {unit.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full Hero & Landing version with high marketing power
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 22,
        padding: 'clamp(1.2rem, 3.5vw, 2rem)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.96) 50%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.45)',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.4), 0 0 25px rgba(245, 158, 11, 0.15)',
        color: '#ffffff',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '15%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          left: '10%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 22,
        }}
      >
        {/* Left / Info Side */}
        <div style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 999, background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontSize: 12.5, fontWeight: 900, marginBottom: 12 }}>
            <Flame size={15} style={{ color: '#f59e0b' }} />
            <span>الامتحان يقترب · احسم قرارك اليوم</span>
          </div>

          <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, margin: '0 0 8px', color: '#ffffff', lineHeight: 1.3 }}>
            {title}
          </h3>

          <p style={{ fontSize: 13.5, color: '#cbd5e1', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>
            {subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 12, color: '#94a3b8', fontWeight: 600, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              نماذج مطابقة 100% لنظام المجلس
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={14} style={{ color: '#f59e0b' }} />
              خطة مكثفة تضمن لك النجاح
            </span>
          </div>
        </div>

        {/* Right / Counter & CTA Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            flex: '0 0 auto',
            width: '100%',
            maxWidth: 380,
          }}
        >
          {/* Flip Digital Timer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              width: '100%',
              direction: 'ltr',
            }}
          >
            {[
              { val: pad(timeLeft.days), lbl: 'أيام', sub: 'Days' },
              { val: pad(timeLeft.hours), lbl: 'ساعات', sub: 'Hours' },
              { val: pad(timeLeft.minutes), lbl: 'دقائق', sub: 'Mins' },
              { val: pad(timeLeft.seconds), lbl: 'ثوانٍ', sub: 'Secs' },
            ].map((box, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 14,
                  padding: '12px 6px',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                    fontWeight: 900,
                    color: idx === 0 ? '#fbbf24' : '#ffffff',
                    fontFamily: 'var(--font-numbers, monospace)',
                    lineHeight: 1,
                    textShadow: idx === 0 ? '0 0 15px rgba(251, 191, 36, 0.5)' : 'none',
                  }}
                >
                  {box.val}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#e2e8f0', marginTop: 4 }}>
                  {box.lbl}
                </div>
              </div>
            ))}
          </div>

          {/* Direct CTA Button */}
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="btn"
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 14.5,
                border: 'none',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={17} />
              {ctaText}
              <ArrowLeft size={16} />
            </button>
          ) : (
            <a
              href={ctaHref}
              className="btn"
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 14.5,
                border: 'none',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Sparkles size={17} />
              {ctaText}
              <ArrowLeft size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
