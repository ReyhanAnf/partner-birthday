import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
} from 'framer-motion';
import { Play, Pause, Sparkles, Maximize2 } from 'lucide-react';
import { romanticConfig, Locale, getRomanticText } from '../../config/romanticConfig';
import {
  EXCLUSIVE_IMAGES,
  EXCLUSIVE_VIDEO,
  EXCLUSIVE_VIDEOS,
  CHILDHOOD_ASSETS,
  MediaAsset,
} from '../../data/assetsManifest';

export interface Section4ExclusiveCinemaReelProps {
  locale: Locale;
  onSelectAsset: (asset: MediaAsset) => void;
}

/** Muted inline clip with clean mobile 2x2 & desktop 4-column alignment */
const VideoTile: React.FC<{ asset: MediaAsset; index: number; onOpen: () => void }> = ({
  asset,
  index,
  onOpen,
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.muted = true;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.25, rootMargin: '100px 0px' }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const durationFormatted = asset.duration ? `${Math.round(asset.duration)}s` : '';

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '120px' }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Buka video ${index + 1} layar penuh`}
      className="group relative w-full aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-white/10 hover:border-rose-400/70 shadow-[0_15px_40px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_50px_rgba(244,63,94,0.3)] cursor-pointer transition-all duration-300 text-left"
    >
      <video
        ref={ref}
        src={asset.url}
        poster={asset.posterUrl}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      {/* Top Bar: Clip tag & duration */}
      <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          CLIP {index + 1}
        </span>
        {durationFormatted && (
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-200">
            {durationFormatted}
          </span>
        )}
      </div>

      {/* Center Frosted Glass Play Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/55 backdrop-blur-md border border-white/20 group-hover:border-rose-400/80 group-hover:bg-rose-500/80 text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
          <Play className="w-5 h-5 ml-0.5 text-white" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom Gradient Overlay & Tap Hint */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between z-10 pointer-events-none">
        <span className="text-[11px] sm:text-xs font-serif italic text-rose-100/90 line-clamp-1">
          Sentuh untuk suara
        </span>
        <Maximize2 className="w-3.5 h-3.5 text-rose-300 shrink-0 mb-0.5" aria-hidden="true" />
      </div>
    </motion.button>
  );
};

export const Section4_ExclusiveCinemaReel: React.FC<Section4ExclusiveCinemaReelProps> = ({
  locale,
  onSelectAsset,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { stage4Exclusive, recipient } = romanticConfig;

  // Scroll-scrubbed 3D Cinema Portal expansion
  const { scrollYProgress: portalProgress } = useScroll({
    target: portalRef,
    offset: ['start end', 'center center'],
  });
  const smoothPortal = useSpring(portalProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const portalScale = useTransform(smoothPortal, [0, 1], [0.82, 1]);
  const portalRotateX = useTransform(smoothPortal, [0, 1], [18, 0]);
  const portalGlowScale = useTransform(smoothPortal, [0, 1], [0.75, 1.18]);
  const wingLeftY = useTransform(smoothPortal, [0, 1], [90, -25]);
  const wingRightY = useTransform(smoothPortal, [0, 1], [-80, 30]);

  // Global scroll velocity for dynamic filmstrip skew
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 320,
  });
  const velocitySkew = useTransform(smoothVelocity, [-1800, 0, 1800], [-7, 0, 7]);
  const velocitySkewReverse = useTransform(smoothVelocity, [-1800, 0, 1800], [7, 0, -7]);

  // Viewport-aware autoplay/pause via IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            video.muted = true;
            video
              .play()
              .then(() => setIsVideoPlaying(true))
              .catch(() => setIsVideoPlaying(false));
          } else {
            video.pause();
            setIsVideoPlaying(false);
          }
        });
      },
      { threshold: [0, 0.25, 0.6], rootMargin: '80px 0px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const handleToggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = true;
      video
        .play()
        .then(() => setIsVideoPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  // Childhood photos get their own highlight section, so the reels show the remaining 88.
  const childhoodIds = new Set(CHILDHOOD_ASSETS.map((a) => a.id));
  const reelImages = EXCLUSIVE_IMAGES.filter((a) => !childhoodIds.has(a.id));
  const third = Math.ceil(reelImages.length / 3);
  const band1 = reelImages.slice(0, third);
  const band2 = reelImages.slice(third, third * 2);
  const band3 = reelImages.slice(third * 2);
  const extraVideos = EXCLUSIVE_VIDEOS.slice(1);

  return (
    <section
      ref={sectionRef}
      id="stage-velocity-cinema"
      data-stage="stage-velocity-cinema"
      className="stage-velocity-cinema relative w-full py-24 sm:py-36 bg-transparent overflow-hidden"
    >
      {/* Ambient Volumetric Theatre Spotlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[340px] sm:w-[760px] h-[300px] bg-gradient-to-b from-rose-500/15 via-amber-500/10 to-transparent rounded-full blur-[130px]"
      />

      {/* Editorial Header (Zero Badges) */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 mb-16 sm:mb-24 text-center">
        <p className="font-script text-2xl sm:text-4xl text-amber-300/90 mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
          {getRomanticText(stage4Exclusive.sectionBadge, locale)}
        </p>
        <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-semibold text-white tracking-tight leading-[1.06] mb-5">
          {getRomanticText(stage4Exclusive.sectionTitle, locale)}
        </h2>
        <p className="text-slate-300/80 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
          {getRomanticText(stage4Exclusive.marqueeDescription, locale)}
        </p>
      </div>

      {/* 3D Scroll-Expanding Holographic Ambilight Cinema Portal */}
      <div
        ref={portalRef}
        style={{ perspective: '1200px' }}
        className="relative max-w-5xl mx-auto px-4 mb-24 sm:mb-32 flex items-center justify-center"
      >
        {/* Left Floating Parallax Wing (Desktop Accent) */}
        <motion.div
          style={{ y: wingLeftY, rotateZ: -6 }}
          aria-hidden="true"
          className="hidden lg:flex flex-col gap-5 mr-8 opacity-75 pointer-events-none"
        >
          {EXCLUSIVE_IMAGES.slice(0, 2).map((wingAsset) => (
            <div
              key={`wing-l-${wingAsset.id}`}
              className="w-40 aspect-[4/5] rounded-2xl overflow-hidden border border-rose-400/25 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              <img
                src={wingAsset.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>

        {/* Centerpiece 3D Video Frame */}
        <motion.div
          style={{
            scale: portalScale,
            rotateX: portalRotateX,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full max-w-md z-20"
        >
          {/* Breathing Ambilight Halo */}
          <motion.div
            aria-hidden="true"
            style={{ scale: portalGlowScale }}
            className="pointer-events-none absolute -inset-6 bg-gradient-to-tr from-rose-500/35 via-pink-500/20 to-amber-400/30 rounded-[3rem] blur-2xl"
          />

          {/* Outer Glass Cinema Frame */}
          <div className="relative rounded-[2.2rem] overflow-hidden bg-gradient-to-b from-white/15 via-white/5 to-rose-500/15 p-2.5 sm:p-3 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_60px_rgba(244,63,94,0.28)] backdrop-blur-xl">
            <div className="relative rounded-[1.7rem] overflow-hidden aspect-[2/3] bg-slate-950">
              <video
                ref={videoRef}
                src={EXCLUSIVE_VIDEO.url}
                poster={EXCLUSIVE_VIDEO.posterUrl}
                width={EXCLUSIVE_VIDEO.width || 1200}
                height={EXCLUSIVE_VIDEO.height || 1800}
                muted
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover"
              />

              {/* Subtle top fade */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent"
              />

              {/* Bottom Interactive Control Bar */}
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex items-end justify-between gap-4">
                <div className="text-left">
                  <p className="font-serif italic text-base sm:text-lg text-white flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                    {getRomanticText(stage4Exclusive.videoHeading, locale)}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-300/85 font-light line-clamp-1">
                    {getRomanticText(stage4Exclusive.videoAudioHint, locale)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectAsset(EXCLUSIVE_VIDEO)}
                    aria-label="Open video fullscreen with sound"
                    className="min-w-[46px] min-h-[46px] rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center cursor-pointer transition-all duration-300"
                  >
                    <Maximize2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                <button
                  type="button"
                  onClick={handleToggleVideo}
                  aria-label={isVideoPlaying ? 'Pause memory video' : 'Play memory video'}
                  className="min-w-[46px] min-h-[46px] rounded-full bg-rose-500/85 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  {isVideoPlaying ? (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  )}
                </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Floating Parallax Wing (Desktop Accent) */}
        <motion.div
          style={{ y: wingRightY, rotateZ: 6 }}
          aria-hidden="true"
          className="hidden lg:flex flex-col gap-5 ml-8 opacity-75 pointer-events-none"
        >
          {EXCLUSIVE_IMAGES.slice(2, 4).map((wingAsset) => (
            <div
              key={`wing-r-${wingAsset.id}`}
              className="w-40 aspect-[4/5] rounded-2xl overflow-hidden border border-amber-300/25 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              <img
                src={wingAsset.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Additional clips: Clean 2x2 on Mobile, 4-column row on Desktop */}
      {extraVideos.length > 0 && (
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 mb-20 sm:mb-28">
          <div className="text-center mb-6">
            <p className="font-script text-2xl sm:text-3xl text-rose-300/90">
              Koleksi Video Cerita Kita
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
              Sentuh video mana saja untuk memutar dengan suara penuh
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 items-stretch">
            {extraVideos.map((v, i) => (
              <VideoTile key={v.id} asset={v} index={i} onOpen={() => onSelectAsset(v)} />
            ))}
          </div>
        </div>
      )}

      {/* Scroll-Velocity-Reactive Skewed Filmstrip Waves (All 90 Exclusive Images) */}
      <div className="space-y-7 sm:space-y-9 w-full overflow-hidden py-4">
        {/* Wave 1: Left-to-Right Velocity-Skewed Stream (30 Photos) */}
        <motion.div
          style={{ skewX: velocitySkew }}
          className="relative w-full overflow-hidden py-2"
        >
          <div className="flex w-max gap-4 sm:gap-5 animate-marquee hover:[animation-play-state:paused]">
            {band1.map((asset, i) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelectAsset(asset)}
                aria-label={`View candid photo ${asset.id}`}
                style={{
                  transform: `translateY(${i % 2 === 0 ? '0px' : '10px'}) rotate(${
                    i % 3 === 0 ? '-1.2deg' : i % 3 === 1 ? '1.2deg' : '0deg'
                  })`,
                }}
                className="group relative w-40 sm:w-52 aspect-[4/5] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-rose-400/70 shadow-[0_14px_35px_rgba(0,0,0,0.65)] cursor-pointer transition-all duration-300"
              >
                <img
                  src={asset.url}
                  alt={`${recipient.name} candid ${asset.id}`}
                  width={asset.width || 480}
                  height={asset.height || 600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Wave 2: Right-to-Left Counter-Velocity Stream (30 Photos) */}
        <motion.div
          style={{ skewX: velocitySkewReverse }}
          className="relative w-full overflow-hidden py-2"
        >
          <div className="flex w-max gap-4 sm:gap-5 animate-marquee-reverse hover:[animation-play-state:paused]">
            {band2.map((asset, i) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelectAsset(asset)}
                aria-label={`View candid photo ${asset.id}`}
                style={{
                  transform: `translateY(${i % 2 === 0 ? '8px' : '-6px'}) rotate(${
                    i % 2 === 0 ? '1.4deg' : '-1.4deg'
                  })`,
                }}
                className="group relative w-44 sm:w-56 aspect-[3/4] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-amber-300/70 shadow-[0_14px_35px_rgba(0,0,0,0.65)] cursor-pointer transition-all duration-300"
              >
                <img
                  src={asset.url}
                  alt={`${recipient.name} candid ${asset.id}`}
                  width={asset.width || 480}
                  height={asset.height || 600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Wave 3: Left-to-Right Velocity Stream (30 Photos -> Completes all 90 Exclusive Images) */}
        <motion.div
          style={{ skewX: velocitySkew }}
          className="relative w-full overflow-hidden py-2"
        >
          <div className="flex w-max gap-4 sm:gap-5 animate-marquee hover:[animation-play-state:paused]">
            {band3.map((asset, i) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelectAsset(asset)}
                aria-label={`View candid photo ${asset.id}`}
                style={{
                  transform: `translateY(${i % 2 === 0 ? '-6px' : '8px'}) rotate(${
                    i % 3 === 0 ? '1deg' : '-1deg'
                  })`,
                }}
                className="group relative w-40 sm:w-52 aspect-[4/5] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-rose-400/70 shadow-[0_14px_35px_rgba(0,0,0,0.65)] cursor-pointer transition-all duration-300"
              >
                <img
                  src={asset.url}
                  alt={`${recipient.name} candid ${asset.id}`}
                  width={asset.width || 480}
                  height={asset.height || 600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
