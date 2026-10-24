import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import { ISHA_ASSETS, MediaAsset } from '../../data/assetsManifest';
import { Card3DTilt } from '../ui/Card3DTilt';

export interface Section2IshaStoryTimelineProps {
  locale: Locale;
  onSelectAsset: (asset: MediaAsset) => void;
}

export const Section2_IshaStoryTimeline: React.FC<Section2IshaStoryTimelineProps> = ({
  locale,
  onSelectAsset,
}) => {
  const { stage2IshaStory, recipient } = romanticConfig;

  // Partition all 58 ISHA_ASSETS across 3 radically different visual acts (19 + 19 + 20 = 58)
  const act1Photos = ISHA_ASSETS.slice(0, 19);
  const act2Photos = ISHA_ASSETS.slice(19, 38);
  const act3Photos = ISHA_ASSETS.slice(38, 58);

  const chapter1 = stage2IshaStory.chapters[0];
  const chapter2 = stage2IshaStory.chapters[1];
  const chapter3 = stage2IshaStory.chapters[2];

  // Act 1: Horizontal Scroll-Scrubbed Exhibition Track
  const act1Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: act1Progress } = useScroll({
    target: act1Ref,
    offset: ['start start', 'end end'],
  });
  const act1Smooth = useSpring(act1Progress, { stiffness: 90, damping: 26 });
  const horizontalX = useTransform(act1Smooth, [0, 1], ['2%', '-62%']);
  const watermark1X = useTransform(act1Smooth, [0, 1], ['-10%', '25%']);

  // Act 2: Interactive 3D Fanning Deck State + Scroll Parallax
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const act2Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: act2Progress } = useScroll({
    target: act2Ref,
    offset: ['start end', 'end start'],
  });
  const act2LeftY = useTransform(act2Progress, [0, 1], [50, -60]);
  const act2RightY = useTransform(act2Progress, [0, 1], [-30, 65]);

  // Act 3: Opposing Wave Streams
  const act3Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: act3Progress } = useScroll({
    target: act3Ref,
    offset: ['start end', 'end start'],
  });
  const waveRow1X = useTransform(act3Progress, [0, 1], ['0%', '-24%']);
  const waveRow2X = useTransform(act3Progress, [0, 1], ['-20%', '4%']);

  const deckHighlightPhotos = act2Photos.slice(0, 5);
  const collagePhotos = act2Photos.slice(5); // 14 photos in asymmetric editorial spread

  return (
    <section
      id="stage-isha-story"
      data-stage="stage-isha-story"
      className="stage-isha-story relative w-full bg-transparent overflow-x-clip"
    >
      {/* =====================================================================
          ACT I: HORIZONTAL SCROLL-JACKING EXHIBITION GALLERY (19 Photos)
      ===================================================================== */}
      <div ref={act1Ref} className="relative h-[210vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-12 sm:py-16">
          {/* Giant Counter-Moving Sculptural Typography Watermark */}
          <motion.div
            aria-hidden="true"
            style={{ x: watermark1X }}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 select-none z-0 opacity-[0.04]"
          >
            <span className="font-serif italic text-[28vw] leading-none text-white whitespace-nowrap">
              01 • RADIANCE
            </span>
          </motion.div>

          {/* Editorial Narrative Header (No Badges!) */}
          <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-serif italic text-rose-300/80 text-lg sm:text-xl mb-1">
                I. {getRomanticText(chapter1.subtitle, locale)}
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-none">
                {getRomanticText(chapter1.title, locale)}
              </h2>
            </div>
            <p className="text-slate-300/85 font-light text-xs sm:text-sm max-w-md md:text-right leading-relaxed">
              &ldquo;{getRomanticText(chapter1.quote, locale)}&rdquo;
            </p>
          </div>

          {/* Horizontal Scrubbed Filmstrip Wall (All 19 Act-1 Portraits) */}
          <div className="relative z-10 w-full overflow-hidden my-auto py-4">
            <motion.div
              style={{ x: horizontalX }}
              className="flex items-center gap-5 sm:gap-8 px-6 sm:px-16 w-max gpu-accelerated"
            >
              {act1Photos.map((asset, idx) => {
                const isTall = idx % 3 === 0;
                const tiltDeg = idx % 2 === 0 ? -3.5 : 3.5;
                const offsetY = idx % 3 === 1 ? '-14px' : idx % 3 === 2 ? '14px' : '0px';

                return (
                  <motion.div
                    key={asset.id}
                    style={{ rotateZ: tiltDeg, y: offsetY }}
                    whileHover={{ scale: 1.07, rotateZ: 0, zIndex: 30 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    onClick={() => onSelectAsset(asset)}
                    className={`group relative shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-rose-300/25 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ${
                      isTall
                        ? 'w-48 sm:w-64 aspect-[3/4]'
                        : 'w-44 sm:w-56 aspect-square'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={`${recipient.name} exhibition ${idx + 1}`}
                      width={asset.width || 480}
                      height={asset.height || 600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="font-serif italic text-rose-200 text-sm">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Subtle Editorial Progress Caption */}
          <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 flex items-center justify-between text-xs text-slate-400 font-light">
            <span>{getRomanticText(chapter1.description, locale)}</span>
            <span className="font-serif italic text-rose-300/80 shrink-0 ml-4">
              01 / 03
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ACT II: INTERACTIVE 3D DEALING TAROT DECK & ASYMMETRIC MAGAZINE SPREAD (19 Photos)
      ===================================================================== */}
      <div
        ref={act2Ref}
        className="relative w-full py-24 sm:py-36 px-4 sm:px-8 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Left: Interactive 3D Fanning Stack (5 Highlight Portraits) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-sm h-80 sm:h-96 flex items-center justify-center perspective-1000">
              {deckHighlightPhotos.map((asset, idx) => {
                const offset =
                  (idx - activeDeckIndex + deckHighlightPhotos.length) %
                  deckHighlightPhotos.length;
                const isFront = offset === 0;
                const rot = offset === 0 ? 0 : offset % 2 === 1 ? offset * 6 : -offset * 6;
                const xShift = offset === 0 ? 0 : offset % 2 === 1 ? offset * 18 : -offset * 18;
                const yShift = offset * 8;
                const scale = 1 - offset * 0.05;

                return (
                  <motion.div
                    key={asset.id}
                    animate={{
                      rotateZ: rot,
                      x: xShift,
                      y: yShift,
                      scale,
                      zIndex: 20 - offset,
                      opacity: offset > 3 ? 0.3 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                    onClick={() => {
                      if (isFront) {
                        setActiveDeckIndex((prev) => (prev + 1) % deckHighlightPhotos.length);
                      } else {
                        setActiveDeckIndex(idx);
                      }
                    }}
                    className="preserve-3d absolute w-60 sm:w-72 aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border-2 border-rose-300/35 shadow-[0_25px_65px_rgba(0,0,0,0.75)] cursor-pointer"
                  >
                    <img
                      src={asset.url}
                      alt={`${recipient.name} deck card ${idx + 1}`}
                      width={asset.width || 480}
                      height={asset.height || 640}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-between">
                      <span className="font-serif italic text-rose-200 text-sm">
                        {locale === 'id' ? 'Sentuh untuk kartu berikutnya' : 'Tap to deal next card'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsset(asset);
                        }}
                        className="text-xs text-amber-300 underline hover:text-white cursor-pointer"
                      >
                        Zoom
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Sculptural Editorial Story */}
          <div className="lg:col-span-6 text-left space-y-6">
            <span className="font-serif italic text-rose-300/80 text-xl block">
              II. {getRomanticText(chapter2.subtitle, locale)}
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-normal text-white leading-[1.12]">
              {getRomanticText(chapter2.title, locale)}
            </h3>
            <blockquote className="font-serif italic text-xl sm:text-2xl text-rose-200/90 border-l-2 border-rose-400/60 pl-5 py-1">
              &ldquo;{getRomanticText(chapter2.quote, locale)}&rdquo;
            </blockquote>
            <p className="text-slate-300/85 font-light text-sm sm:text-base leading-relaxed">
              {getRomanticText(chapter2.description, locale)}
            </p>
          </div>
        </div>

        {/* Asymmetric Floating Editorial Collage (Remaining 14 Portraits of Act 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
          {collagePhotos.map((asset, idx) => {
            // Varied editorial column spans so no two rows look the same!
            const colSpanClass =
              idx % 5 === 0
                ? 'col-span-2 sm:col-span-5 aspect-[4/5]'
                : idx % 5 === 1
                ? 'col-span-1 sm:col-span-4 aspect-square'
                : idx % 5 === 2
                ? 'col-span-1 sm:col-span-3 aspect-[3/4]'
                : idx % 5 === 3
                ? 'col-span-1 sm:col-span-6 aspect-[16/10]'
                : 'col-span-1 sm:col-span-6 aspect-[4/3]';

            const motionY = idx % 2 === 0 ? act2LeftY : act2RightY;
            // Each tile enters from a different direction, then keeps a slow idle "breathing" float.
            const enterFrom = [
              { x: -80, y: 40, rotate: -8 },
              { x: 0, y: 90, rotate: 4 },
              { x: 80, y: 40, rotate: 8 },
              { x: 0, y: -60, rotate: -4 },
            ][idx % 4];

            return (
              <motion.div
                key={asset.id}
                style={{ y: motionY }}
                className={`${colSpanClass} perspective-1000`}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.82,
                    ...enterFrom,
                    clipPath: 'inset(18% 18% 18% 18% round 24px)',
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    clipPath: 'inset(0% 0% 0% 0% round 16px)',
                  }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.9, delay: (idx % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <motion.div
                    animate={{ y: [0, idx % 2 ? -8 : 8, 0], rotate: [0, idx % 2 ? 0.8 : -0.8, 0] }}
                    transition={{ duration: 5 + (idx % 4), repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-full"
                  >
                <Card3DTilt onClick={() => onSelectAsset(asset)} className="w-full h-full">
                  <div className="group relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-rose-400/50 shadow-2xl">
                    <img
                      src={asset.url}
                      alt={`${recipient.name} editorial ${asset.id}`}
                      width={asset.width || 480}
                      height={asset.height || 600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Card3DTilt>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          ACT III: OPPOSING KINETIC WAVE RIBBONS (20 Photos -> Completes 58!)
      ===================================================================== */}
      <div ref={act3Ref} className="relative w-full py-20 sm:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center mb-14">
          <p className="font-serif italic text-rose-300/80 text-lg sm:text-xl mb-2">
            III. {getRomanticText(chapter3.subtitle, locale)}
          </p>
          <h3 className="font-serif text-3xl sm:text-5xl font-normal text-white mb-4">
            {getRomanticText(chapter3.title, locale)}
          </h3>
          <p className="text-slate-300/85 font-light text-sm sm:text-base max-w-xl mx-auto">
            {getRomanticText(chapter3.quote, locale)}
          </p>
        </div>

        {/* Wave Stream 1 (10 Portraits scrubbing left with sine-wave vertical offsets) */}
        <div className="w-full overflow-hidden py-4">
          <motion.div
            style={{ x: waveRow1X }}
            className="flex items-center gap-4 sm:gap-6 px-4 w-max gpu-accelerated"
          >
            {act3Photos.slice(0, 10).map((asset, idx) => (
              <motion.button
                key={asset.id}
                type="button"
                onClick={() => onSelectAsset(asset)}
                whileHover={{ scale: 1.08, rotateZ: 0 }}
                style={{
                  marginTop: idx % 2 === 0 ? '0px' : '28px',
                  rotate: idx % 2 === 0 ? '-2deg' : '2.5deg',
                }}
                aria-label={`View portrait ${asset.id}`}
                className="group relative w-44 sm:w-56 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-rose-300/20 hover:border-rose-400 shadow-xl cursor-pointer"
              >
                <img
                  src={asset.url}
                  alt={`${recipient.name} wave ${asset.id}`}
                  width={asset.width || 480}
                  height={asset.height || 640}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Wave Stream 2 (Remaining 10 Portraits scrubbing right) */}
        <div className="w-full overflow-hidden py-4 mt-2">
          <motion.div
            style={{ x: waveRow2X }}
            className="flex items-center gap-4 sm:gap-6 px-4 w-max gpu-accelerated"
          >
            {act3Photos.slice(10, 20).map((asset, idx) => (
              <motion.button
                key={asset.id}
                type="button"
                onClick={() => onSelectAsset(asset)}
                whileHover={{ scale: 1.08, rotateZ: 0 }}
                style={{
                  marginTop: idx % 2 === 0 ? '24px' : '0px',
                  rotate: idx % 2 === 0 ? '2deg' : '-2.5deg',
                }}
                aria-label={`View portrait ${asset.id}`}
                className="group relative w-44 sm:w-56 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-rose-300/20 hover:border-rose-400 shadow-xl cursor-pointer"
              >
                <img
                  src={asset.url}
                  alt={`${recipient.name} wave ${asset.id}`}
                  width={asset.width || 480}
                  height={asset.height || 640}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
