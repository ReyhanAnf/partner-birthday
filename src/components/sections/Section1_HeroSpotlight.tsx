import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import { ISHA_ASSETS, REYHAN_ISHA_ASSETS, MediaAsset } from '../../data/assetsManifest';
import { Card3DTilt } from '../ui/Card3DTilt';

export interface Section1HeroSpotlightProps {
  locale: Locale;
  onSelectAsset: (asset: MediaAsset) => void;
}

export const Section1_HeroSpotlight: React.FC<Section1HeroSpotlightProps> = ({
  locale,
  onSelectAsset,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { hero, recipient } = romanticConfig;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Volumetric Lamp Beam expansion on scroll
  const lampScaleX = useTransform(smoothProgress, [0, 0.5, 1], [0.65, 1.35, 1.8]);
  const lampOpacity = useTransform(smoothProgress, [0, 0.4, 0.95], [0.85, 1, 0.15]);

  // Sculptural Title 3D Zoom-Through
  const titleScale = useTransform(smoothProgress, [0, 0.45, 0.9], [1, 1.16, 0.82]);
  const titleY = useTransform(smoothProgress, [0, 0.85], ['0%', '-28%']);
  const titleOpacity = useTransform(smoothProgress, [0, 0.65, 0.95], [1, 0.95, 0]);

  // 7 Orbital Portraits that explode outward in 3D space as you scroll!
  const card0X = useTransform(smoothProgress, [0, 0.8], ['-110%', '-210%']);
  const card0Y = useTransform(smoothProgress, [0, 0.8], ['-18%', '-85%']);
  const card0Rot = useTransform(smoothProgress, [0, 0.8], [-16, -34]);

  const card1X = useTransform(smoothProgress, [0, 0.8], ['110%', '210%']);
  const card1Y = useTransform(smoothProgress, [0, 0.8], ['-18%', '-85%']);
  const card1Rot = useTransform(smoothProgress, [0, 0.8], [16, 34]);

  const card2X = useTransform(smoothProgress, [0, 0.8], ['-140%', '-250%']);
  const card2Y = useTransform(smoothProgress, [0, 0.8], ['35%', '90%']);
  const card2Rot = useTransform(smoothProgress, [0, 0.8], [-10, -26]);

  const card3X = useTransform(smoothProgress, [0, 0.8], ['140%', '250%']);
  const card3Y = useTransform(smoothProgress, [0, 0.8], ['35%', '90%']);
  const card3Rot = useTransform(smoothProgress, [0, 0.8], [10, 26]);

  const centerScale = useTransform(smoothProgress, [0, 0.45, 0.9], [0.92, 1.18, 1.35]);
  const centerY = useTransform(smoothProgress, [0, 0.9], ['12%', '-6%']);
  const leftWingX = useTransform(smoothProgress, [0, 0.75], ['-55%', '-135%']);
  const leftWingRot = useTransform(smoothProgress, [0, 0.75], [-9, -22]);
  const rightWingX = useTransform(smoothProgress, [0, 0.75], ['55%', '135%']);
  const rightWingRot = useTransform(smoothProgress, [0, 0.75], [9, 22]);

  const heroConstellation = [
    ISHA_ASSETS[0],
    REYHAN_ISHA_ASSETS[0],
    ISHA_ASSETS[1],
    REYHAN_ISHA_ASSETS[1],
    ISHA_ASSETS[2],
    REYHAN_ISHA_ASSETS[2],
    ISHA_ASSETS[3],
  ].filter(Boolean);

  return (
    <section
      ref={sectionRef}
      id="stage-hero-lamp"
      data-stage="stage-hero-lamp"
      className="stage-hero-lamp relative h-[185vh] w-full bg-transparent"
    >
      {/* Sticky Fullscreen 3D Theatre */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 sm:px-8 perspective-1000">
        {/* Aceternity Volumetric Lamp Cone */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: lampScaleX, opacity: lampOpacity }}
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[760px] h-[440px] z-0 flex flex-col items-center"
        >
          <div className="w-72 sm:w-[28rem] h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_45px_rgba(244,63,94,1)] mt-10" />
          <div className="w-full h-full bg-gradient-to-b from-rose-500/30 via-fuchsia-500/10 to-transparent rounded-full blur-[90px] -mt-4" />
        </motion.div>

        {/* Giant Subtle Background Kinetic Watermark */}
        <motion.div
          aria-hidden="true"
          style={{ scale: centerScale, opacity: useTransform(smoothProgress, [0, 0.8], [0.04, 0.09]) }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none z-0 overflow-hidden"
        >
          <span className="font-serif italic text-[26vw] leading-none text-rose-300 whitespace-nowrap">
            {recipient.name}
          </span>
        </motion.div>

        {/* Floating Outer Orbiting Cards (Scrub-driven 3D explosion) */}
        {heroConstellation.length >= 7 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
            {/* Top-Left Orbit Card */}
            <motion.div
              style={{ x: card0X, y: card0Y, rotateZ: card0Rot }}
              className="pointer-events-auto hidden sm:block absolute w-36 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900"
            >
              <img
                src={heroConstellation[3].url}
                alt={`${recipient.name} memory`}
                width={heroConstellation[3].width || 480}
                height={heroConstellation[3].height || 640}
                onClick={() => onSelectAsset(heroConstellation[3])}
                decoding="async"
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Top-Right Orbit Card */}
            <motion.div
              style={{ x: card1X, y: card1Y, rotateZ: card1Rot }}
              className="pointer-events-auto hidden sm:block absolute w-36 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900"
            >
              <img
                src={heroConstellation[4].url}
                alt={`${recipient.name} memory`}
                width={heroConstellation[4].width || 480}
                height={heroConstellation[4].height || 640}
                onClick={() => onSelectAsset(heroConstellation[4])}
                decoding="async"
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Bottom-Left Orbit Card */}
            <motion.div
              style={{ x: card2X, y: card2Y, rotateZ: card2Rot }}
              className="pointer-events-auto hidden md:block absolute w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900"
            >
              <img
                src={heroConstellation[5].url}
                alt={`${recipient.name} memory`}
                width={heroConstellation[5].width || 480}
                height={heroConstellation[5].height || 640}
                onClick={() => onSelectAsset(heroConstellation[5])}
                decoding="async"
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Bottom-Right Orbit Card */}
            <motion.div
              style={{ x: card3X, y: card3Y, rotateZ: card3Rot }}
              className="pointer-events-auto hidden md:block absolute w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900"
            >
              <img
                src={heroConstellation[6].url}
                alt={`${recipient.name} memory`}
                width={heroConstellation[6].width || 480}
                height={heroConstellation[6].height || 640}
                onClick={() => onSelectAsset(heroConstellation[6])}
                decoding="async"
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </div>
        )}

        {/* Sculptural Typography & Central 3D Portal */}
        <div className="relative z-20 max-w-4xl w-full mx-auto flex flex-col items-center text-center">
          <motion.div style={{ scale: titleScale, y: titleY, opacity: titleOpacity }}>
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 0.85, letterSpacing: '0.35em' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="text-[11px] sm:text-xs uppercase text-rose-300/90 font-light mb-3"
            >
              {getRomanticText(hero.dateBadge, locale)}
            </motion.p>

            <h1 className="font-serif text-3xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.05] mb-3">
              <span className="block font-light text-slate-100/95 text-xl sm:text-3xl md:text-4xl mb-1">
                {locale === 'id' ? 'Selamat Ulang Tahun' : 'Happy Birthday'}
              </span>
              <span className="font-script text-5xl sm:text-7xl md:text-8xl bg-gradient-to-r from-rose-300 via-pink-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_8px_30px_rgba(244,63,94,0.45)] block py-1">
                {recipient.fullName}
              </span>
              <span className="block font-serif italic text-rose-300/85 text-sm sm:text-xl font-light mt-1">
                (Saa) &bull; 26 Oktober 2005
              </span>
            </h1>

            <p className="font-serif italic text-rose-100/80 max-w-xl mx-auto text-base sm:text-xl leading-relaxed px-2">
              {getRomanticText(hero.poeticHook, locale)}
            </p>
          </motion.div>

          {/* Center 3D Expanding Triptych */}
          {heroConstellation.length >= 3 && (
            <motion.div
              style={{ scale: centerScale, y: centerY }}
              className="relative w-full max-w-md h-60 sm:h-72 flex items-center justify-center mt-6 perspective-1000 preserve-3d"
            >
              {/* Left Wing */}
              <motion.div
                style={{ x: leftWingX, rotateZ: leftWingRot }}
                className="absolute w-32 sm:w-44 aspect-[3/4] z-10 preserve-3d"
              >
                <Card3DTilt onClick={() => onSelectAsset(heroConstellation[0])} className="w-full h-full">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-rose-300/30 bg-slate-900 shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
                    <img
                      src={heroConstellation[0].url}
                      alt={`${recipient.name} portrait 1`}
                      width={heroConstellation[0].width || 480}
                      height={heroConstellation[0].height || 640}
                      {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card3DTilt>
              </motion.div>

              {/* Center Star */}
              <div className="relative w-40 sm:w-52 aspect-[3/4] z-20 preserve-3d">
                <Card3DTilt onClick={() => onSelectAsset(heroConstellation[1])} className="w-full h-full">
                  <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-rose-300/50 bg-slate-900 shadow-[0_0_55px_rgba(244,63,94,0.4)]">
                    <img
                      src={heroConstellation[1].url}
                      alt={`${recipient.name} and ${recipient.partnerName}`}
                      width={heroConstellation[1].width || 600}
                      height={heroConstellation[1].height || 800}
                      {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card3DTilt>
              </div>

              {/* Right Wing */}
              <motion.div
                style={{ x: rightWingX, rotateZ: rightWingRot }}
                className="absolute w-32 sm:w-44 aspect-[3/4] z-10 preserve-3d"
              >
                <Card3DTilt onClick={() => onSelectAsset(heroConstellation[2])} className="w-full h-full">
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-rose-300/30 bg-slate-900 shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
                    <img
                      src={heroConstellation[2].url}
                      alt={`${recipient.name} portrait 2`}
                      width={heroConstellation[2].width || 480}
                      height={heroConstellation[2].height || 640}
                      {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card3DTilt>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Subtle Whispered Scroll Line */}
        <motion.a
          href="#stage-isha-story"
          style={{ opacity: titleOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-rose-200/70 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <span className="text-[11px] tracking-[0.22em] uppercase font-light">
            {getRomanticText(hero.scrollHint, locale)}
          </span>
          <ArrowDown className="w-4 h-4 text-rose-400 animate-bounce" aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  );
};
