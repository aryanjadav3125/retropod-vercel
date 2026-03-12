'use client';
import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';

interface UseClickWheelOptions {
  onScrollUp: () => void;
  onScrollDown: () => void;
  onCenter: () => void;
  onMenu: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
}

export function useClickWheel(
  wheelRef: React.RefObject<HTMLElement>,
  options: UseClickWheelOptions
) {
  const {
    onScrollUp, onScrollDown, onCenter,
    onMenu, onNext, onPrev, onPlayPause,
  } = options;

  const { isLocked, clickSoundEnabled } = usePlayerStore();

  const playClickSound = useCallback(() => {
    if (!clickSoundEnabled) return;
    const audio = new Audio('/click.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }, [clickSoundEnabled]);

  const dragRef = useRef({
    isDragging: false,
    lastAngle: 0,
    accumulated: 0,
    startTime: 0,
  });

  const getAngle = useCallback((e: MouseEvent | Touch, rect: DOMRect): number => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  }, []);

  const isInRingZone = useCallback((e: MouseEvent | Touch, rect: DOMRect): boolean => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerR = rect.width / 2;
    const innerR = outerR * 0.34; // center button is ~34% of total radius
    return dist >= innerR && dist <= outerR;
  }, []);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (!isInRingZone(e, rect)) return;
      e.preventDefault();
      dragRef.current = {
        isDragging: true,
        lastAngle: getAngle(e, rect),
        accumulated: 0,
        startTime: Date.now(),
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const angle = getAngle(e, rect);
      let delta = angle - dragRef.current.lastAngle;

      // Handle wrap-around
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      dragRef.current.lastAngle = angle;
      dragRef.current.accumulated += delta;

      const threshold = 18; // degrees per scroll step
      while (dragRef.current.accumulated >= threshold) {
        onScrollDown();
        playClickSound();
        dragRef.current.accumulated -= threshold;
      }
      while (dragRef.current.accumulated <= -threshold) {
        onScrollUp();
        playClickSound();
        dragRef.current.accumulated += threshold;
      }
    };

    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      if (!isInRingZone(touch, rect)) return;
      dragRef.current = {
        isDragging: true,
        lastAngle: getAngle(touch, rect),
        accumulated: 0,
        startTime: Date.now(),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const angle = getAngle(touch, rect);
      let delta = angle - dragRef.current.lastAngle;

      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      dragRef.current.lastAngle = angle;
      dragRef.current.accumulated += delta;

      const threshold = 18;
      while (dragRef.current.accumulated >= threshold) {
        onScrollDown();
        playClickSound();
        dragRef.current.accumulated -= threshold;
      }
      while (dragRef.current.accumulated <= -threshold) {
        onScrollUp();
        playClickSound();
        dragRef.current.accumulated += threshold;
      }
    };

    const handleTouchEnd = () => {
      dragRef.current.isDragging = false;
    };

    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [wheelRef, getAngle, isInRingZone, onScrollUp, onScrollDown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (isLocked) return;

      switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); onScrollUp();   playClickSound(); break;
        case 'ArrowDown':  e.preventDefault(); onScrollDown(); playClickSound(); break;
        case 'Enter':      e.preventDefault(); onCenter();     playClickSound(); break;
        case 'Backspace':
        case 'Escape':     e.preventDefault(); onMenu();       playClickSound(); break;
        case ' ':          e.preventDefault(); onPlayPause();  break;
        case 'ArrowRight': e.preventDefault(); onNext();       break;
        case 'ArrowLeft':  e.preventDefault(); onPrev();       break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLocked, onScrollUp, onScrollDown, onCenter, onMenu, onPlayPause, onNext, onPrev, playClickSound]);

  // Expose playSound wrapped handlers
  const wrapHandler = useCallback((fn: () => void) => () => {
    if (isLocked) return;
    playClickSound();
    fn();
  }, [isLocked, playClickSound]);

  return {
    handlers: {
      onCenter: wrapHandler(onCenter),
      onMenu: wrapHandler(onMenu),
      onNext: wrapHandler(onNext),
      onPrev: wrapHandler(onPrev),
      onPlayPause: wrapHandler(onPlayPause),
    },
  };
}
