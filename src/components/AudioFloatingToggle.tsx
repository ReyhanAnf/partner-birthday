import React from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Disc3, Globe, Maximize2, Minimize2 } from 'lucide-react';
import { Locale } from '../config/romanticConfig';
import { useFullscreen } from '../hooks/useFullscreen';

export interface AudioFloatingToggleProps {
  isPlaying: boolean;
  isMuted: boolean;
  onToggle: () => void;
  locale: Locale;
  onToggleLocale: () => void;
}

const pillClass =
  'min-h-[44px] min-w-[44px] rounded-full bg-[#0F1424]/85 backdrop-blur-md border border-rose-500/25 text-slate-200 hover:text-white hover:border-rose-400/50 shadow-lg flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400';

/**
 * Floating controls are portalled to <body> because the app root uses
 * `perspective`, which turns it into the containing block for `position: fixed`
 * descendants (they would otherwise scroll away with the page).
 */
export const AudioFloatingToggle: React.FC<AudioFloatingToggleProps> = ({
  isPlaying,
  isMuted,
  onToggle,
  locale,
  onToggleLocale,
}) => {
  const activeSound = isPlaying && !isMuted;
  const { isFullscreen, toggle: toggleFullscreen, isSupported } = useFullscreen();

  return createPortal(
    <div
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <button
        type="button"
        onClick={onToggleLocale}
        aria-label={locale === 'id' ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'}
        className={`${pillClass} px-3.5`}
      >
        <Globe className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
        <span className="uppercase tracking-wider">{locale}</span>
      </button>

      {isSupported && (
        <button
          type="button"
          data-testid="fullscreen-toggle"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-pressed={isFullscreen}
          className={pillClass}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-rose-300" aria-hidden="true" />
          ) : (
            <Maximize2 className="w-4 h-4 text-rose-300" aria-hidden="true" />
          )}
        </button>
      )}

      <button
        type="button"
        id="audio-toggle"
        data-testid="audio-toggle"
        onClick={onToggle}
        aria-label={activeSound ? 'Mute background audio music' : 'Play background audio music'}
        aria-pressed={activeSound}
        className={`${pillClass} px-4 gap-2.5 border-rose-500/35 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.25)]`}
      >
        <Disc3
          className={`w-4 h-4 text-rose-400 ${activeSound ? 'animate-spin-slow' : 'opacity-60'}`}
          aria-hidden="true"
        />
        {activeSound ? (
          <Volume2 className="w-4 h-4 text-rose-300" aria-hidden="true" />
        ) : (
          <VolumeX className="w-4 h-4 text-slate-400" aria-hidden="true" />
        )}
      </button>
    </div>,
    document.body
  );
};
