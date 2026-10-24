import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { MediaAsset } from '../../data/assetsManifest';
import { enterFullscreen } from '../../hooks/useFullscreen';

export interface LightboxModalProps {
  asset: MediaAsset | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const ctrlClass =
  'min-w-[44px] min-h-[44px] rounded-full bg-slate-900/85 border border-rose-500/30 text-slate-200 hover:text-white flex items-center justify-center cursor-pointer z-20';

/**
 * Portalled to <body>: the app root uses CSS `perspective`, which makes it the
 * containing block for `position: fixed`. Rendering inline caused the modal to
 * be positioned against the full page height — the user only saw the dark
 * backdrop ("black blank") while the photo sat far off-screen.
 */
export const LightboxModal: React.FC<LightboxModalProps> = ({
  asset,
  onClose,
  onPrev,
  onNext,
}) => {
  const mediaWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!asset) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [asset, onClose, onPrev, onNext]);

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = mediaWrapRef.current?.querySelector('video') as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    // iOS Safari only supports fullscreen on <video> via webkitEnterFullscreen
    if (video && !video.requestFullscreen && video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }
    if (mediaWrapRef.current) void enterFullscreen(mediaWrapRef.current);
  };

  return createPortal(
    <AnimatePresence>
      {asset && (
        <motion.div
          key="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-[#070A12]/92 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 z-20">
            <button type="button" onClick={handleFullscreen} aria-label="Fullscreen" className={ctrlClass}>
              <Maximize2 className="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} aria-label="Close preview" className={ctrlClass}>
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {onPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous"
              className={`${ctrlClass} absolute left-3 sm:left-6 top-1/2 -translate-y-1/2`}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next"
              className={`${ctrlClass} absolute right-3 sm:right-6 top-1/2 -translate-y-1/2`}
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          <motion.div
            key={asset.id}
            ref={mediaWrapRef}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center bg-transparent"
          >
            {asset.type === 'video' ? (
              <video
                src={asset.url}
                poster={asset.posterUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[82vh] w-auto max-w-full rounded-2xl border border-rose-500/25 shadow-[0_0_50px_rgba(244,63,94,0.2)] bg-black"
              />
            ) : (
              <img
                src={asset.url}
                alt={`Memory ${asset.id}`}
                className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl border border-rose-500/25 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
