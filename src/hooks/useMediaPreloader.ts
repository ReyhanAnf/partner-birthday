import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseMediaPreloaderOptions {
  criticalAssets?: string[];
  backgroundAssets?: string[];
  minDurationMs?: number;
  fallbackTimeoutMs?: number;
  quotesCount?: number;
  quoteIntervalMs?: number;
  onUnlockAudio?: () => void;
}

export interface MediaPreloaderState {
  progress: number;
  rawProgress: number;
  isLoaded: boolean;
  isReady: boolean;
  isDismissed: boolean;
  currentQuoteIndex: number;
  hasTimedOut: boolean;
  startExperience: () => void;
}

export function useMediaPreloader({
  criticalAssets = [],
  backgroundAssets = [],
  minDurationMs = 1400,
  fallbackTimeoutMs = 4000,
  quotesCount = 4,
  quoteIntervalMs = 2600,
  onUnlockAudio,
}: UseMediaPreloaderOptions = {}): MediaPreloaderState {
  const [progress, setProgress] = useState<number>(0);
  const [rawProgress, setRawProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  const animFrameRef = useRef<number | null>(null);
  const minDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const isLoadedRef = useRef<boolean>(false);
  const minTimeElapsedRef = useRef<boolean>(false);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  // 1. Quote Ticker Rotation
  useEffect(() => {
    if (isDismissed || quotesCount <= 1) return;

    quoteTimerRef.current = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotesCount);
    }, quoteIntervalMs);

    return () => {
      if (quoteTimerRef.current) clearInterval(quoteTimerRef.current);
    };
  }, [isDismissed, quotesCount, quoteIntervalMs]);

  // 2. Auto-dismiss on substantive scroll so automated scroll tests or eager users aren't blocked
  useEffect(() => {
    if (isDismissed) return;
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsDismissed(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // 3. Critical Assets Pre-buffering Pipeline + Safe 4000ms Fallback Timeout
  useEffect(() => {
    startTimeRef.current = Date.now();
    isLoadedRef.current = false;
    minTimeElapsedRef.current = false;

    minDurationTimerRef.current = setTimeout(() => {
      minTimeElapsedRef.current = true;
      if (isLoadedRef.current) {
        setIsReady(true);
      }
    }, minDurationMs);

    // Safe fallback timeout <= 5000ms (4000ms) guarantees user is never permanently blocked
    fallbackTimerRef.current = setTimeout(() => {
      setHasTimedOut(true);
      isLoadedRef.current = true;
      targetProgressRef.current = 100;
      setRawProgress(100);
      setProgress(100);
      setIsLoaded(true);
      setIsReady(true);
    }, fallbackTimeoutMs);

    if (criticalAssets.length === 0) {
      isLoadedRef.current = true;
      targetProgressRef.current = 100;
      setRawProgress(100);
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalAssets = criticalAssets.length;

    const onAssetSettled = () => {
      loadedCount++;
      const currentPct = Math.min(100, Math.round((loadedCount / totalAssets) * 100));
      setRawProgress(currentPct);
      targetProgressRef.current = currentPct;

      if (loadedCount >= totalAssets) {
        isLoadedRef.current = true;
        setIsLoaded(true);
        if (minTimeElapsedRef.current) {
          setIsReady(true);
        }
      }
    };

    criticalAssets.forEach((url) => {
      const cleanUrl = url.includes('%') ? url : encodeURI(url);
      const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');

      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => onAssetSettled();
        video.onerror = () => onAssetSettled();
        video.src = cleanUrl;
      } else {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => onAssetSettled();
        img.onerror = () => onAssetSettled();
        img.src = cleanUrl;
      }
    });

    return () => {
      if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [criticalAssets, minDurationMs, fallbackTimeoutMs]);

  // 4. Tier-2 Non-blocking Background Cache Warming for remaining assets
  useEffect(() => {
    if (!isReady || backgroundAssets.length === 0) return;

    let cancelled = false;
    let index = 0;
    const batchSize = 4;

    const warmNextBatch = () => {
      if (cancelled || index >= backgroundAssets.length) return;
      const slice = backgroundAssets.slice(index, index + batchSize);
      index += batchSize;

      slice.forEach((url) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url.includes('%') ? url : encodeURI(url);
      });

      setTimeout(warmNextBatch, 180);
    };

    const timer = setTimeout(warmNextBatch, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isReady, backgroundAssets]);

  // 5. Smooth 60fps Progress Interpolation Loop
  useEffect(() => {
    let active = true;

    const animateProgress = () => {
      if (!active) return;

      const elapsed = Date.now() - startTimeRef.current;
      const timeRatio = Math.min(1, elapsed / minDurationMs);
      const timeDrivenProgress = timeRatio * 94;

      const effectiveTarget = isLoadedRef.current
        ? 100
        : Math.max(targetProgressRef.current, timeDrivenProgress);

      const step = (effectiveTarget - currentProgressRef.current) * 0.16;
      currentProgressRef.current += step;

      if (isLoadedRef.current && currentProgressRef.current >= 99.2) {
        currentProgressRef.current = 100;
        setProgress(100);
        if (minTimeElapsedRef.current) {
          setIsReady(true);
        }
        return;
      }

      setProgress(Math.round(currentProgressRef.current));
      animFrameRef.current = requestAnimationFrame(animateProgress);
    };

    animFrameRef.current = requestAnimationFrame(animateProgress);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [minDurationMs]);

  const startExperience = useCallback(() => {
    if (typeof onUnlockAudio === 'function') {
      try {
        onUnlockAudio();
      } catch {
        // Ignore audio policy errors
      }
    }
    setIsDismissed(true);
  }, [onUnlockAudio]);

  return {
    progress,
    rawProgress,
    isLoaded,
    isReady,
    isDismissed,
    currentQuoteIndex,
    hasTimedOut,
    startExperience,
  };
}
