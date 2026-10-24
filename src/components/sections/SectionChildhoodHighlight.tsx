import React from 'react';
import { motion } from 'framer-motion';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import { CHILDHOOD_ASSETS, MediaAsset } from '../../data/assetsManifest';

export interface SectionChildhoodHighlightProps {
  locale: Locale;
  onSelectAsset: (asset: MediaAsset) => void;
}

export const SectionChildhoodHighlight: React.FC<SectionChildhoodHighlightProps> = ({
  locale,
  onSelectAsset,
}) => {
  const { childhood } = romanticConfig;

  if (CHILDHOOD_ASSETS.length < 2) return null;

  return (
    <section
      id="stage-childhood"
      data-stage="stage-childhood"
      className="relative w-full py-16 sm:py-28 px-4 sm:px-6 bg-transparent overflow-hidden"
    >
      {/* Soft warm nostalgic ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] rounded-full bg-gradient-to-tr from-amber-400/15 via-rose-500/10 to-transparent blur-[120px]"
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Title & Description: Prominently visible immediately */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="font-script text-2xl sm:text-4xl text-amber-300/90 mb-1">
            {getRomanticText(childhood.eyebrow, locale)}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white tracking-tight">
            {getRomanticText(childhood.title, locale)}
          </h2>
          <p className="mt-3 max-w-lg mx-auto font-serif italic text-sm sm:text-lg text-rose-100/90 leading-relaxed px-2">
            {getRomanticText(childhood.description, locale)}
          </p>
        </motion.div>

        {/* Two Kindergarten Polaroids: Side by side with clean vintage border & handwriting */}
        <div className="relative w-full max-w-2xl flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 my-2">
          {/* Polaroid 1: Masa TK */}
          <motion.button
            type="button"
            onClick={() => onSelectAsset(CHILDHOOD_ASSETS[0])}
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            whileInView={{ opacity: 1, y: 0, rotate: -3 }}
            viewport={{ once: true, margin: '100px' }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.5 }}
            aria-label={getRomanticText(childhood.captions[0], locale)}
            className="group relative w-64 sm:w-72 bg-[#FAF5ED] p-3 pb-11 sm:p-4 sm:pb-12 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_25px_60px_rgba(244,63,94,0.3)] cursor-pointer transition-shadow"
          >
            <div className="w-full aspect-[4/5] rounded overflow-hidden bg-slate-900 border border-black/10">
              <img
                src={CHILDHOOD_ASSETS[0].url}
                alt={getRomanticText(childhood.captions[0], locale)}
                width={CHILDHOOD_ASSETS[0].width || 600}
                height={CHILDHOOD_ASSETS[0].height || 740}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="absolute bottom-2.5 sm:bottom-3 inset-x-0 text-center font-script text-2xl sm:text-3xl text-slate-800">
              {getRomanticText(childhood.captions[0], locale)}
            </span>
          </motion.button>

          {/* Polaroid 2: Masih kecil banget */}
          <motion.button
            type="button"
            onClick={() => onSelectAsset(CHILDHOOD_ASSETS[1])}
            initial={{ opacity: 0, y: 24, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 3 }}
            viewport={{ once: true, margin: '100px' }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            aria-label={getRomanticText(childhood.captions[1], locale)}
            className="group relative w-64 sm:w-72 bg-[#FAF5ED] p-3 pb-11 sm:p-4 sm:pb-12 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_25px_60px_rgba(251,191,36,0.3)] cursor-pointer transition-shadow"
          >
            <div className="w-full aspect-[4/5] rounded overflow-hidden bg-slate-900 border border-black/10">
              <img
                src={CHILDHOOD_ASSETS[1].url}
                alt={getRomanticText(childhood.captions[1], locale)}
                width={CHILDHOOD_ASSETS[1].width || 600}
                height={CHILDHOOD_ASSETS[1].height || 740}
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="absolute bottom-2.5 sm:bottom-3 inset-x-0 text-center font-script text-2xl sm:text-3xl text-slate-800">
              {getRomanticText(childhood.captions[1], locale)}
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
};
