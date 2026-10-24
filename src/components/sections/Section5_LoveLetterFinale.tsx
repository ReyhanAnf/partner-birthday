import React, { useState, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, PartyPopper } from 'lucide-react';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import { ISHA_ASSETS, REYHAN_ISHA_ASSETS } from '../../data/assetsManifest';

export interface Section5LoveLetterFinaleProps {
  locale: Locale;
}

const FLOATING_HEARTS = [
  { id: 1, left: '12%', size: 18, duration: 7.5, delay: 0 },
  { id: 2, left: '26%', size: 14, duration: 9.2, delay: 1.4 },
  { id: 3, left: '48%', size: 22, duration: 8.1, delay: 0.7 },
  { id: 4, left: '72%', size: 16, duration: 8.8, delay: 2.1 },
  { id: 5, left: '86%', size: 20, duration: 7.9, delay: 1.1 },
];

export const Section5_LoveLetterFinale: React.FC<Section5LoveLetterFinaleProps> = ({
  locale,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(true);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const { stage5Finale, recipient } = romanticConfig;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
  });

  // Aceternity Tracing Beam progress along the letter spine
  const beamHeight = useTransform(smoothProgress, [0.15, 0.85], ['10%', '100%']);
  const leftKeepsakeY = useTransform(smoothProgress, [0, 1], [80, -50]);
  const rightKeepsakeY = useTransform(smoothProgress, [0, 1], [110, -65]);

  const triggerConfettiBurst = useCallback(() => {
    setHasCelebrated(true);
    setBurstCount((c) => c + 1);
    try {
      const colors = ['#F43F5E', '#FDA4AF', '#FBBF24', '#FFF1F2', '#FB7185'];
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { x: 0.2, y: 0.72 },
        colors,
      });
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { x: 0.8, y: 0.72 },
        colors,
      });
      setTimeout(() => {
        try {
          confetti({
            particleCount: 95,
            spread: 110,
            startVelocity: 45,
            origin: { x: 0.5, y: 0.55 },
            colors,
          });
        } catch {
          // Ignore headless error
        }
      }, 260);
    } catch {
      // Ignore canvas-confetti errors in restricted headless environments
    }
  }, []);

  const handleToggleSeal = () => {
    const nextState = !isEnvelopeOpen;
    setIsEnvelopeOpen(nextState);
    if (nextState && !hasCelebrated) {
      triggerConfettiBurst();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="stage-love-letter"
      data-stage="stage-love-letter"
      className="stage-love-letter relative w-full py-28 sm:py-40 px-4 sm:px-6 bg-gradient-to-b from-transparent via-[#13091F]/80 to-[#070A12] overflow-hidden"
    >
      {/* Rising Ambient Luminous Hearts */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATING_HEARTS.map((item) => (
          <motion.div
            key={`${item.id}-${burstCount}`}
            style={{ left: item.left }}
            initial={{ y: '110%', opacity: 0, scale: 0.6 }}
            animate={{
              y: '-15%',
              opacity: [0, 0.55, 0.55, 0],
              scale: [0.7, 1.1, 0.9],
              rotate: [-12, 14, -8],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-0 text-rose-400/40"
          >
            <Heart
              style={{ width: item.size, height: item.size }}
              className="fill-rose-400/25"
            />
          </motion.div>
        ))}
      </div>

      {/* Warm Candlelight Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-tr from-rose-600/15 via-pink-500/10 to-amber-400/15 rounded-full blur-[140px]"
      />

      {/* Floating 3D Keepsake Polaroids Flanking the Letter (Desktop) */}
      <motion.div
        aria-hidden="true"
        style={{ y: leftKeepsakeY, rotateZ: -8 }}
        className="hidden xl:block pointer-events-none absolute left-10 top-1/3 w-48 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-slate-900 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.8)] opacity-75"
      >
        <img
          src={REYHAN_ISHA_ASSETS[0]?.url}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ y: rightKeepsakeY, rotateZ: 7 }}
        className="hidden xl:block pointer-events-none absolute right-10 top-1/2 w-48 aspect-[4/5] rounded-2xl overflow-hidden border border-white/15 bg-slate-900 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.8)] opacity-75"
      >
        <img
          src={ISHA_ASSETS[0]?.url}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Calligraphic Prologue Whisper (No Badge) */}
        <p className="font-script text-3xl sm:text-5xl text-rose-300/90 mb-3 text-center drop-shadow-[0_0_20px_rgba(244,63,94,0.35)]">
          {getRomanticText(stage5Finale.sectionBadge, locale)}
        </p>

        {/* Interactive 3D Royal Wax Seal Emblem */}
        <div
          style={{ perspective: '1000px' }}
          className="perspective-1000 mb-10 flex flex-col items-center"
        >
          <motion.button
            type="button"
            onClick={handleToggleSeal}
            whileHover={{ scale: 1.05, rotateZ: 2 }}
            whileTap={{ scale: 0.94 }}
            aria-expanded={isEnvelopeOpen}
            aria-label={
              isEnvelopeOpen
                ? locale === 'id'
                  ? 'Tutup pesan surat'
                  : 'Close letter message'
                : locale === 'id'
                ? 'Buka pesan surat'
                : 'Open letter message'
            }
            className="preserve-3d group relative min-h-[60px] px-7 py-3.5 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 border border-amber-300/60 shadow-[0_15px_50px_rgba(244,63,94,0.55)] text-amber-100 flex items-center gap-3.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {/* Spinning Filigree Halo inside the Wax Seal */}
            <div className="relative w-10 h-10 rounded-full bg-rose-950/80 border border-amber-300/50 flex items-center justify-center shadow-inner">
              <motion.span
                aria-hidden="true"
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0.5 rounded-full border border-dashed border-amber-300/40"
              />
              <Heart
                className={`w-4 h-4 text-rose-300 fill-rose-400 group-hover:scale-110 transition-transform ${
                  isEnvelopeOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs sm:text-sm font-serif tracking-[0.2em] uppercase font-medium">
              {isEnvelopeOpen
                ? getRomanticText(
                    stage5Finale.envelopeClosePrompt || { id: 'Tutup pesan', en: 'Close message' },
                    locale
                  )
                : getRomanticText(stage5Finale.envelopePrompt, locale)}
            </span>
          </motion.button>
        </div>

        {/* 3D Origami Unfolding Love Letter Manuscript */}
        <AnimatePresence initial={false}>
          {isEnvelopeOpen && (
            <motion.article
              key="love-letter-card"
              initial={{ opacity: 0, y: 32, rotateX: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, rotateX: 12, scale: 0.95 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="w-full rounded-[2.2rem] bg-gradient-to-b from-[#151226]/95 via-[#0F1123]/95 to-[#090B16]/95 border border-rose-300/25 p-7 sm:p-14 shadow-[0_35px_100px_rgba(0,0,0,0.85),0_0_70px_rgba(244,63,94,0.12)] backdrop-blur-2xl relative overflow-hidden"
            >
              {/* Aceternity Scroll-Linked Tracing Beam Along Left Spine */}
              <div
                aria-hidden="true"
                className="absolute left-4 sm:left-6 top-10 bottom-10 w-[2px] bg-white/5 rounded-full overflow-hidden"
              >
                <motion.div
                  style={{ height: beamHeight }}
                  className="w-full bg-gradient-to-b from-amber-300 via-rose-400 to-pink-500 shadow-[0_0_15px_#f43f5e]"
                />
              </div>

              {/* Subtle Corner Filigree Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl"
              />

              {/* Editorial Manuscript Header (Zero Pill Badges) */}
              <div className="pl-4 sm:pl-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/10 pb-6 mb-8">
                <h2 className="font-serif italic text-3xl sm:text-4xl text-rose-100 tracking-wide">
                  {getRomanticText(stage5Finale.letter.salutation, locale)}
                </h2>
                <span className="font-serif italic text-xs sm:text-sm text-amber-200/75 tracking-wider">
                  {getRomanticText(stage5Finale.letter.stampText, locale)}
                </span>
              </div>

              {/* Staggered Poetic Letter Paragraphs */}
              <div className="pl-4 sm:pl-6 space-y-6 text-slate-200/95 font-light text-base sm:text-lg leading-[1.85]">
                {stage5Finale.letter.paragraphs.map((p, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.12 }}
                    className="leading-[1.85] first-letter:font-serif first-letter:text-2xl first-letter:text-rose-300 first-letter:mr-0.5"
                  >
                    {getRomanticText(p, locale)}
                  </motion.p>
                ))}
              </div>

              {/* Handwritten Calligraphic Signature */}
              <div className="pl-4 sm:pl-6 mt-12 pt-8 border-t border-white/10 flex flex-col items-end text-right">
                <p className="text-xs sm:text-sm text-slate-400 italic mb-2">
                  {getRomanticText(stage5Finale.letter.closing, locale)}
                </p>
                <p className="font-script text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200 py-1">
                  {stage5Finale.letter.signature}
                </p>
              </div>
            </motion.article>
          )}
        </AnimatePresence>

        {/* Grand Finale Celebration Trigger */}
        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <motion.button
            type="button"
            onClick={triggerConfettiBurst}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative min-h-[54px] px-9 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-medium tracking-wider uppercase text-xs sm:text-sm shadow-[0_0_40px_rgba(244,63,94,0.5)] hover:shadow-[0_0_65px_rgba(244,63,94,0.85)] flex items-center gap-3 cursor-pointer transition-all"
          >
            <PartyPopper className="w-5 h-5 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span>
              {hasCelebrated
                ? getRomanticText(stage5Finale.replayButton, locale)
                : getRomanticText(stage5Finale.celebrationButton, locale)}
            </span>
          </motion.button>

          {hasCelebrated && (
            <motion.p
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="text-rose-200 font-serif italic text-xl sm:text-2xl flex items-center gap-2.5 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
              <span>{getRomanticText(stage5Finale.postConfettiMessage, locale)}</span>
            </motion.p>
          )}

          {/* Subtle Epilogue Colophon */}
          <p className="mt-8 text-[11px] font-mono uppercase tracking-[0.35em] text-slate-500">
            {recipient.fullName} &bull; {recipient.milestoneYear}
          </p>
        </div>
      </div>
    </section>
  );
};
