import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { romanticConfig, Locale } from './config/romanticConfig';
import {
  ALL_ASSETS,
  ISHA_ASSETS,
  REYHAN_ISHA_ASSETS,
  EXCLUSIVE_VIDEO,
  MediaAsset,
} from './data/assetsManifest';
import { useAudioAmbiance } from './hooks/useAudioAmbiance';
import { PreloaderGimmick } from './components/PreloaderGimmick';
import { AudioFloatingToggle } from './components/AudioFloatingToggle';
import { LightboxModal } from './components/ui/LightboxModal';
import { InteractiveStarfieldCanvas } from './components/ui/InteractiveStarfieldCanvas';
import { Section1_HeroSpotlight } from './components/sections/Section1_HeroSpotlight';
import { SectionChildhoodHighlight } from './components/sections/SectionChildhoodHighlight';
import { LifeJourneyCounter } from './components/ui/LifeJourneyCounter';
import { Section2_IshaStoryTimeline } from './components/sections/Section2_IshaStoryTimeline';
import { Section3_ReyhanIshaMemoryVault } from './components/sections/Section3_ReyhanIshaMemoryVault';
import { Section4_ExclusiveCinemaReel } from './components/sections/Section4_ExclusiveCinemaReel';
import { Section5_LoveLetterFinale } from './components/sections/Section5_LoveLetterFinale';

export default function App() {
  const [locale, setLocale] = useState<Locale>('id');
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);

  const { isPlaying, isMuted, toggleMute, unlockAndPlay, fadeTo } = useAudioAmbiance(
    romanticConfig.audio.trackUrl
  );

  // Top subtle scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Tier 1 critical assets for preloader gimmick (Hero constellation + video metadata)
  const criticalAssets = useMemo(() => {
    return [
      ISHA_ASSETS[0]?.url,
      REYHAN_ISHA_ASSETS[0]?.url,
      ISHA_ASSETS[1]?.url,
      ISHA_ASSETS[2]?.url,
      ISHA_ASSETS[3]?.url,
      ISHA_ASSETS[4]?.url,
      EXCLUSIVE_VIDEO.url,
    ].filter(Boolean) as string[];
  }, []);

  // Tier 2 background assets warmed progressively after initial ready
  const backgroundAssets = useMemo(() => {
    const critSet = new Set(criticalAssets);
    return ALL_ASSETS.map((a) => a.url).filter((u) => !critSet.has(u));
  }, [criticalAssets]);

  const handleSelectAsset = (asset: MediaAsset) => {
    const idx = ALL_ASSETS.findIndex((item) => item.id === asset.id);
    if (idx !== -1) {
      setSelectedAssetIndex(idx);
    }
  };

  const selectedAsset =
    selectedAssetIndex !== null ? ALL_ASSETS[selectedAssetIndex] || null : null;

  // Duck background music while a video with sound is open in the lightbox.
  const isVideoOpen = selectedAsset?.type === 'video';
  useEffect(() => {
    if (isPlaying) fadeTo(isVideoOpen ? 0.05 : 0.65, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideoOpen]);

  return (
    <div
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="relative min-h-screen w-full max-w-full bg-[#060811] text-slate-100 overflow-x-clip selection:bg-rose-500/30 selection:text-rose-200 perspective-1000 preserve-3d"
    >
      {/* Living 60fps Starfield Canvas strictly in background behind photos */}
      <InteractiveStarfieldCanvas />

      {/* Top Luminous Scroll Progress Filament (portalled: root perspective breaks position:fixed) */}
      {createPortal(
        <motion.div
          aria-hidden="true"
          style={{ scaleX }}
          className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 shadow-[0_0_12px_rgba(244,63,94,0.8)] origin-left z-[55]"
        />,
        document.body
      )}

      {/* Interactive Preloader Gimmick (3D Orbiting Constellation) */}
      {createPortal(
        <PreloaderGimmick
          criticalAssets={criticalAssets}
          backgroundAssets={backgroundAssets}
          locale={locale}
          onUnlockAudio={() => {
            unlockAndPlay();
          }}
        />,
        document.body
      )}

      {/* Floating Audio & Locale Controls */}
      <AudioFloatingToggle
        isPlaying={isPlaying}
        isMuted={isMuted}
        onToggle={toggleMute}
        locale={locale}
        onToggleLocale={() => setLocale((prev) => (prev === 'id' ? 'en' : 'id'))}
      />

      {/* Main 5-Stage Aceternity Scrollytelling Narrative */}
      <main className="relative z-10 w-full max-w-full overflow-x-clip">
        {/* Stage 1: Sticky 3D Portal & Exploding 7-Photo Orbital Constellation */}
        <Section1_HeroSpotlight
          locale={locale}
          onSelectAsset={handleSelectAsset}
        />

        {/* Childhood highlight: kindergarten photos drift together and bloom into colour */}
        <LifeJourneyCounter locale={locale} />

        <SectionChildhoodHighlight locale={locale} onSelectAsset={handleSelectAsset} />

        {/* Stage 2: 3-Act Exhibition (Horizontal Scroll-Jacking + 3D Dealing Deck + Editorial Spread + Dual Wave) */}
        <Section2_IshaStoryTimeline
          locale={locale}
          onSelectAsset={handleSelectAsset}
        />

        {/* Stage 3: Aceternity HeroParallax 3D Isometric Plane (All 36 Couple Memories) */}
        <Section3_ReyhanIshaMemoryVault
          locale={locale}
          onSelectAsset={handleSelectAsset}
        />

        {/* Stage 4: 3D Expanding Ambilight Video Portal & Velocity-Skewed Filmstrips (All 91 Exclusive Assets) */}
        <Section4_ExclusiveCinemaReel
          locale={locale}
          onSelectAsset={handleSelectAsset}
        />

        {/* Stage 5: 3D Origami Love Letter, Tracing Beam & Multi-Wave Fireworks */}
        <Section5_LoveLetterFinale locale={locale} />
      </main>

      {/* Lightbox Modal for Fullscreen Photo Inspection */}
      <LightboxModal
        asset={selectedAsset}
        onClose={() => setSelectedAssetIndex(null)}
        onPrev={
          selectedAssetIndex !== null
            ? () =>
                setSelectedAssetIndex(
                  (selectedAssetIndex - 1 + ALL_ASSETS.length) % ALL_ASSETS.length
                )
            : undefined
        }
        onNext={
          selectedAssetIndex !== null
            ? () =>
                setSelectedAssetIndex((selectedAssetIndex + 1) % ALL_ASSETS.length)
            : undefined
        }
      />
    </div>
  );
}
