import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveAssetUrl } from '@/data/assetsManifest';

export interface AudioAmbianceState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isUnlocked: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  unlockAndPlay: () => Promise<void>;
  setVolume: (vol: number) => void;
  fadeTo: (targetVol: number, durationMs?: number) => void;
}

const DEFAULT_TRACK_URL = '/audio/romantic_ambiance.mp3';

export function useAudioAmbiance(trackUrl = DEFAULT_TRACK_URL): AudioAmbianceState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.65);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.src = resolveAssetUrl(trackUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.65;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      // Suppress uncaught audio load errors in headless environments
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Autoplay: try immediately; browsers that block unmuted autoplay will reject,
    // so we retry on the very first user gesture anywhere on the page.
    const gestureEvents: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'keydown', 'click'];
    const removeGestureListeners = () =>
      gestureEvents.forEach((evt) => window.removeEventListener(evt, tryStart));
    function tryStart() {
      if (!audio.paused) {
        removeGestureListeners();
        return;
      }
      audio.muted = false;
      audio
        .play()
        .then(() => {
          setIsUnlocked(true);
          setIsMuted(false);
          removeGestureListeners();
        })
        .catch(() => {
          // Still blocked — keep waiting for a real gesture.
        });
    }
    gestureEvents.forEach((evt) => window.addEventListener(evt, tryStart, { passive: true }));
    tryStart();

    return () => {
      removeGestureListeners();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [trackUrl]);

  const fadeTo = useCallback((targetVol: number, durationMs = 800) => {
    if (!audioRef.current) return;
    const clampedTarget = Math.max(0, Math.min(1, targetVol));
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const steps = 16;
    const stepDuration = durationMs / steps;
    const startVol = audioRef.current.volume;
    const delta = (clampedTarget - startVol) / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      if (!audioRef.current || currentStep >= steps) {
        if (audioRef.current) audioRef.current.volume = clampedTarget;
        setVolumeState(clampedTarget);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        const nextVol = Math.max(0, Math.min(1, startVol + delta * currentStep));
        audioRef.current.volume = nextVol;
        setVolumeState(nextVol);
      }
    }, stepDuration);
  }, []);

  const unlockAndPlay = useCallback(async () => {
    setIsUnlocked(true);
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = false;
      setIsMuted(false);
      audio.volume = 0.05;
      await audio.play();
      setIsPlaying(true);
      fadeTo(0.65, 1200);
    } catch {
      // Autoplay blocked until direct gesture; keep state clean without console error
    }
  }, [fadeTo]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.muted = false;
      setIsMuted(false);
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsUnlocked(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      togglePlay();
      return;
    }

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
      fadeTo(0.65, 400);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, isPlaying, fadeTo, togglePlay]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setVolumeState(clamped);
  }, []);

  return {
    isPlaying,
    isMuted,
    volume,
    isUnlocked,
    togglePlay,
    toggleMute,
    unlockAndPlay,
    setVolume,
    fadeTo,
  };
}
