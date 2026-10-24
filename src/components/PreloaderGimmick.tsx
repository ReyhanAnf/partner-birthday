import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { romanticConfig, Locale, getRomanticText } from '../config/romanticConfig';
import { useMediaPreloader } from '../hooks/useMediaPreloader';
import { ISHA_ASSETS, REYHAN_ISHA_ASSETS } from '../data/assetsManifest';

export interface PreloaderGimmickProps {
  criticalAssets?: string[];
  backgroundAssets?: string[];
  locale?: Locale;
  onExperienceStart?: () => void;
  onUnlockAudio?: () => void;
}

export const PreloaderGimmick: React.FC<PreloaderGimmickProps> = ({
  criticalAssets = [],
  backgroundAssets = [],
  locale = 'id',
  onExperienceStart,
  onUnlockAudio,
}) => {
  const { preloader, recipient } = romanticConfig;

  const {
    progress,
    isReady,
    isDismissed,
    currentQuoteIndex,
    startExperience,
  } = useMediaPreloader({
    criticalAssets,
    backgroundAssets,
    minDurationMs: 1400,
    fallbackTimeoutMs: 4000,
    quotesCount: preloader.quotes.length,
    quoteIntervalMs: 2500,
    onUnlockAudio,
  });

  const currentQuote = useMemo(() => {
    return preloader.quotes[currentQuoteIndex] || preloader.quotes[0];
  }, [preloader.quotes, currentQuoteIndex]);

  const orbitPreviews = useMemo(() => {
    return [
      ISHA_ASSETS[0]?.url,
      REYHAN_ISHA_ASSETS[0]?.url,
      ISHA_ASSETS[2]?.url,
      REYHAN_ISHA_ASSETS[1]?.url,
      ISHA_ASSETS[4]?.url,
      REYHAN_ISHA_ASSETS[2]?.url,
    ].filter(Boolean);
  }, []);

  const handleEnterClick = () => {
    startExperience();
    if (onExperienceStart) {
      onExperienceStart();
    }
  };

  const circleCircumference = 2 * Math.PI * 84;
  const strokeDashoffset =
    circleCircumference - (progress / 100) * circleCircumference;

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          key="romantic-preloader-root"
          id="preloader"
          data-testid="preloader"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome screen and media preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.28,
            filter: 'blur(24px)',
            transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
          }}
          className="preloader-screen fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#05070E] text-white overflow-hidden px-6 py-10 sm:py-14 select-none"
        >
          {/* Living Rotating Aurora Gradients */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.18, 1],
              }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] bg-gradient-to-tr from-rose-600/20 via-fuchsia-500/10 to-amber-400/15 rounded-full blur-[120px]"
            />
          </div>

          {/* Minimalist Whisper Header (No Badge!) */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.75, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 font-serif italic text-sm sm:text-base tracking-[0.28em] text-rose-200/80 uppercase"
          >
            {recipient.partnerName} &amp; {recipient.name}
          </motion.p>

          {/* Centerpiece: Orbiting Photo Constellation + Sculptural Progress Dial */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-xl">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-6">
              {/* Orbiting Miniature Memory Frames */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 pointer-events-none"
              >
                {orbitPreviews.map((src, i) => {
                  const angle = (i / orbitPreviews.length) * Math.PI * 2;
                  const radius = 112;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <motion.div
                      key={i}
                      style={{
                        left: `calc(50% + ${x}px - 22px)`,
                        top: `calc(50% + ${y}px - 28px)`,
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-11 h-14 sm:w-12 sm:h-16 rounded-lg overflow-hidden border border-rose-300/35 shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-slate-900"
                    >
                      <img
                        src={src}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover opacity-85"
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Glowing SVG Progress Ring */}
              <svg
                className="w-44 h-44 sm:w-48 sm:h-48 -rotate-90 drop-shadow-[0_0_25px_rgba(244,63,94,0.35)]"
                viewBox="0 0 192 192"
                aria-hidden="true"
              >
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="url(#preloaderRoseGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 120ms ease-out' }}
                />
                <defs>
                  <linearGradient id="preloaderRoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="50%" stopColor="#FDA4AF" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Sculptural Numeric Readout */}
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading memory assets"
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span className="font-serif italic text-5xl sm:text-6xl font-light text-white tracking-tighter tabular-nums">
                  {progress.toString().padStart(2, '0')}
                  <span className="text-xl sm:text-2xl text-rose-400">%</span>
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-rose-300/70 mt-1">
                  {isReady ? 'Ready' : 'Loading'}
                </span>
              </div>
            </div>

            {/* Poetic Quote Stream */}
            <div className="min-h-[4.5rem] flex items-center justify-center px-4 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`quote-${currentQuote.id}`}
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45 }}
                  className="font-serif italic text-lg sm:text-2xl text-rose-100/90 max-w-lg leading-relaxed"
                >
                  &ldquo;{getRomanticText(currentQuote.text, locale)}&rdquo;
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Interactive Curtain Trigger */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-xs gap-3">
            <motion.button
              type="button"
              data-testid="preloader-enter"
              onClick={handleEnterClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="preloader-enter-btn group relative w-full min-h-[52px] py-4 px-7 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 text-white font-medium shadow-[0_0_40px_rgba(244,63,94,0.45)] hover:shadow-[0_0_60px_rgba(244,63,94,0.8)] flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <span className="text-sm sm:text-base font-medium tracking-widest uppercase">
                {getRomanticText(preloader.buttonText, locale)}
              </span>
              <ChevronRight
                className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform duration-200"
                aria-hidden="true"
              />
            </motion.button>

            <p className="text-[11px] text-slate-400/80 text-center font-light tracking-wide">
              {getRomanticText(preloader.buttonSubtext, locale)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
