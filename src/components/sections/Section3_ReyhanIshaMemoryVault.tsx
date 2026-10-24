import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import { REYHAN_ISHA_ASSETS, MediaAsset } from '../../data/assetsManifest';
import { Card3DTilt } from '../ui/Card3DTilt';

export interface Section3ReyhanIshaMemoryVaultProps {
  locale: Locale;
  onSelectAsset: (asset: MediaAsset) => void;
}

export const Section3_ReyhanIshaMemoryVault: React.FC<Section3ReyhanIshaMemoryVaultProps> = ({
  locale,
  onSelectAsset,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const { stage3ReyhanIsha, recipient } = romanticConfig;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // Aceternity HeroParallax 3D Isometric Plane Unfold
  const planeRotateX = useTransform(smoothScroll, [0.05, 0.38], [22, 0]);
  const planeRotateZ = useTransform(smoothScroll, [0.05, 0.38], [-8, 0]);
  const planeScale = useTransform(smoothScroll, [0.05, 0.38], [0.9, 1]);

  // Differential 3-Column Parallax Velocities
  const col1Y = useTransform(smoothScroll, [0, 1], [60, -90]);
  const col2Y = useTransform(smoothScroll, [0, 1], [-40, 70]);
  const col3Y = useTransform(smoothScroll, [0, 1], [90, -110]);

  // All 36 REYHAN_ISHA_ASSETS distributed across 3 dynamic streams (12 + 12 + 12 = 36)
  const col1 = REYHAN_ISHA_ASSETS.slice(0, 12);
  const col2 = REYHAN_ISHA_ASSETS.slice(12, 24);
  const col3 = REYHAN_ISHA_ASSETS.slice(24, 36);

  return (
    <section
      ref={containerRef}
      id="stage-memory-vault"
      data-stage="stage-memory-vault"
      className="stage-memory-vault relative w-full py-28 sm:py-40 px-4 sm:px-8 bg-gradient-to-b from-transparent via-[#0E0B1B]/65 to-transparent overflow-hidden"
    >
      {/* Ambient Radial Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[750px] h-[360px] sm:h-[750px] bg-rose-600/10 rounded-full blur-[150px]"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Sculptural Editorial Intro (No Badges, No Sticker Pills!) */}
        <div className="max-w-3xl mx-auto text-center mb-20 sm:mb-28">
          <p className="font-script text-3xl sm:text-5xl text-rose-300/90 mb-3">
            Birthday Saa 💖
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-white tracking-tight leading-[1.06] mb-6">
            {getRomanticText(stage3ReyhanIsha.sectionTitle, locale)}
          </h2>
          <p className="font-serif italic text-lg sm:text-2xl text-slate-300/85 leading-relaxed">
            {getRomanticText(stage3ReyhanIsha.description, locale)}
          </p>
        </div>

        {/* Aceternity 3D Isometric Plane Unfolding into 3-Speed Parallax Vault */}
        <div className="perspective-1000 w-full">
          <motion.div
            style={{
              rotateX: planeRotateX,
              rotateZ: planeRotateZ,
              scale: planeScale,
            }}
            className="preserve-3d w-full gpu-accelerated"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-7">
              {/* Stream 1 (12 Photos + Calligraphic Interludes) */}
              <motion.div style={{ y: col1Y }} className="space-y-5 sm:space-y-8">
                {col1.map((asset, idx) => (
                  <React.Fragment key={asset.id}>
                    {idx === 3 && stage3ReyhanIsha.stickers[0] && (
                      <div className="py-6 px-4 text-center">
                        <p className="font-script text-2xl sm:text-4xl text-rose-200/85 leading-snug">
                          &ldquo;{getRomanticText(stage3ReyhanIsha.stickers[0], locale)}&rdquo;
                        </p>
                      </div>
                    )}
                    <Card3DTilt onClick={() => onSelectAsset(asset)}>
                      <div className="group relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-white/10 hover:border-rose-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                        <img
                          src={asset.url}
                          alt={`${recipient.partnerName} and ${recipient.name} ${asset.id}`}
                          width={asset.width || 600}
                          height={asset.height || 800}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </Card3DTilt>
                  </React.Fragment>
                ))}
              </motion.div>

              {/* Stream 2 (12 Photos + Calligraphic Interludes, Counter-Velocity) */}
              <motion.div style={{ y: col2Y }} className="space-y-5 sm:space-y-8 pt-8 sm:pt-16">
                {col2.map((asset, idx) => (
                  <React.Fragment key={asset.id}>
                    {idx === 5 && stage3ReyhanIsha.stickers[1] && (
                      <div className="py-6 px-4 text-center">
                        <p className="font-script text-2xl sm:text-4xl text-amber-200/85 leading-snug">
                          &ldquo;{getRomanticText(stage3ReyhanIsha.stickers[1], locale)}&rdquo;
                        </p>
                      </div>
                    )}
                    <Card3DTilt onClick={() => onSelectAsset(asset)}>
                      <div className="group relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-white/10 hover:border-rose-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                        <img
                          src={asset.url}
                          alt={`${recipient.partnerName} and ${recipient.name} ${asset.id}`}
                          width={asset.width || 600}
                          height={asset.height || 800}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </Card3DTilt>
                  </React.Fragment>
                ))}
              </motion.div>

              {/* Stream 3 (12 Photos + Calligraphic Interludes) */}
              <motion.div
                style={{ y: col3Y }}
                className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4 sm:gap-8 md:space-y-0"
              >
                {col3.map((asset, idx) => (
                  <React.Fragment key={asset.id}>
                    {idx === 4 && stage3ReyhanIsha.stickers[3] && (
                      <div className="col-span-2 md:col-span-1 py-6 px-4 text-center">
                        <p className="font-script text-2xl sm:text-4xl text-rose-200/85 leading-snug">
                          &ldquo;{getRomanticText(stage3ReyhanIsha.stickers[3], locale)}&rdquo;
                        </p>
                      </div>
                    )}
                    <Card3DTilt onClick={() => onSelectAsset(asset)}>
                      <div className="group relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-white/10 hover:border-rose-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                        <img
                          src={asset.url}
                          alt={`${recipient.partnerName} and ${recipient.name} ${asset.id}`}
                          width={asset.width || 600}
                          height={asset.height || 800}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </Card3DTilt>
                  </React.Fragment>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
