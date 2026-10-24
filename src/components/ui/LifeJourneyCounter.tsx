import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Heart } from 'lucide-react';
import { romanticConfig, Locale } from '../../config/romanticConfig';

export interface LifeJourneyCounterProps {
  locale?: Locale;
}

interface LifeDuration {
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  is21Passed: boolean;
  until21: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const BIRTH_TIMESTAMP = new Date('2005-10-26T00:00:00+07:00').getTime();
const BIRTHDAY_21_TIMESTAMP = new Date('2026-10-26T00:00:00+07:00').getTime();

function calculateLife(now: Date): LifeDuration {
  const diffMs = Math.max(0, now.getTime() - BIRTH_TIMESTAMP);
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Exact calendar difference
  const birthYear = 2005;
  const birthMonth = 9; // October (0-indexed)
  const birthDay = 26;

  let years = now.getFullYear() - birthYear;
  let months = now.getMonth() - birthMonth;
  let days = now.getDate() - birthDay;

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Countdown to 21
  const untilDiff = BIRTHDAY_21_TIMESTAMP - now.getTime();
  const is21Passed = untilDiff <= 0;
  const absUntilSeconds = Math.max(0, Math.floor(untilDiff / 1000));
  const untilDays = Math.floor(absUntilSeconds / 86400);
  const untilHours = Math.floor((absUntilSeconds % 86400) / 3600);
  const untilMinutes = Math.floor((absUntilSeconds % 3600) / 60);
  const untilSecs = absUntilSeconds % 60;

  return {
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    is21Passed,
    until21: {
      days: untilDays,
      hours: untilHours,
      minutes: untilMinutes,
      seconds: untilSecs,
    },
  };
}

export const LifeJourneyCounter: React.FC<LifeJourneyCounterProps> = ({ locale = 'id' }) => {
  const [life, setLife] = useState<LifeDuration>(() => calculateLife(new Date()));
  const { recipient } = romanticConfig;

  useEffect(() => {
    const timer = setInterval(() => {
      setLife(calculateLife(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toLocaleString('id-ID');

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '50px' }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl bg-gradient-to-b from-[#121626]/90 via-[#0D101C]/90 to-[#070A12]/95 border border-rose-500/25 p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(244,63,94,0.15)] backdrop-blur-xl overflow-hidden"
      >
        {/* Subtle decorative background ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl"
        />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-300 font-script text-2xl sm:text-3xl">
              <Clock className="w-5 h-5 text-amber-300" aria-hidden="true" />
              <span>Sudah berapa lama {recipient.name} hidup di bumi?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
              Sejak 26 Oktober 2005 &bull; Detik demi detik yang penuh cerita
            </p>
          </div>

          {/* Milestone Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span className="font-mono font-medium">
              {life.is21Passed
                ? 'Resmi 21 Tahun! 🎂'
                : `Menuju 21 Tahun: ${life.until21.days}h ${life.until21.hours}j ${life.until21.minutes}m ${life.until21.seconds}d`}
            </span>
          </div>
        </div>

        {/* 4 Primary Big Metric Blocks */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 text-center overflow-hidden flex flex-col justify-center">
            <span className="font-mono text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight block truncate">
              {formatNumber(life.totalDays)}
            </span>
            <p className="text-[11px] sm:text-xs text-rose-300/80 uppercase tracking-widest mt-1 font-medium">
              Hari
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 text-center overflow-hidden flex flex-col justify-center">
            <span className="font-mono text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight block truncate">
              {formatNumber(life.totalHours)}
            </span>
            <p className="text-[11px] sm:text-xs text-amber-300/80 uppercase tracking-widest mt-1 font-medium">
              Jam
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4 text-center overflow-hidden flex flex-col justify-center">
            <span className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-white tracking-tight block truncate">
              {formatNumber(life.totalMinutes)}
            </span>
            <p className="text-[11px] sm:text-xs text-rose-300/80 uppercase tracking-widest mt-1 font-medium">
              Menit
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 border border-rose-400/30 p-3 sm:p-4 text-center shadow-[0_0_20px_rgba(244,63,94,0.15)] overflow-hidden flex flex-col justify-center">
            <span className="font-mono text-sm sm:text-xl md:text-2xl font-bold text-rose-200 tracking-tight animate-pulse block truncate px-0.5">
              {formatNumber(life.totalSeconds)}
            </span>
            <p className="text-[10px] sm:text-xs text-rose-200 uppercase tracking-widest mt-1 font-medium flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              Detik Berjalan
            </p>
          </div>
        </div>

        {/* Detailed Human Breakdown */}
        <div className="relative z-10 rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/50 shrink-0" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Tepatnya:{' '}
              <span className="font-semibold text-white">
                {life.years} Tahun, {life.months} Bulan, {life.days} Hari
              </span>
              , dan{' '}
              <span className="font-mono text-amber-200">
                {String(life.hours).padStart(2, '0')}:{String(life.minutes).padStart(2, '0')}:
                {String(life.seconds).padStart(2, '0')}
              </span>
            </p>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 italic font-serif">
            {locale === 'id'
              ? 'Terima kasih sudah tumbuh sehebat ini, Saa ✨'
              : 'Thank you for growing up so wonderfully, Saa ✨'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
