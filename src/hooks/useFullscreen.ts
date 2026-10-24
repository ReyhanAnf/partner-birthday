import { useCallback, useEffect, useState } from 'react';

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

/** Requests fullscreen on an element, with Safari (webkit) fallback. Never throws. */
export async function enterFullscreen(el: HTMLElement = document.documentElement): Promise<void> {
  const target = el as FsElement;
  try {
    if (target.requestFullscreen) await target.requestFullscreen();
    else if (target.webkitRequestFullscreen) await target.webkitRequestFullscreen();
  } catch {
    // Fullscreen denied (e.g. iOS Safari for non-video elements) — fail silently.
  }
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as FsDocument;
  try {
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
  } catch {
    // ignore
  }
}

/** Tracks whether the page is currently fullscreen and offers a toggle. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const doc = document as FsDocument;
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) void exitFullscreen();
    else void enterFullscreen();
  }, [isFullscreen]);

  const isSupported =
    typeof document !== 'undefined' &&
    Boolean(
      document.documentElement.requestFullscreen ||
        (document.documentElement as FsElement).webkitRequestFullscreen
    );

  return { isFullscreen, toggle, isSupported };
}
