'use client';
import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useClickWheel } from '@/hooks/useClickWheel';

interface ClickWheelProps {
  onScrollUp: () => void;
  onScrollDown: () => void;
  onCenter: () => void;
  onMenu: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayPause: () => void;
}

type WheelButton = 'menu' | 'prev' | 'next' | 'playpause' | 'center' | null;

export default function ClickWheel({
  onScrollUp, onScrollDown, onCenter,
  onMenu, onNext, onPrev, onPlayPause,
}: ClickWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [pressedBtn, setPressedBtn] = useState<WheelButton>(null);

  const flashButton = useCallback((btn: WheelButton, fn: () => void) => {
    setPressedBtn(btn);
    fn();
    setTimeout(() => setPressedBtn(null), 150);
  }, []);

  useClickWheel(wheelRef, {
    onScrollUp, onScrollDown, onCenter,
    onMenu, onNext, onPrev, onPlayPause,
  });

  const WHEEL_SIZE = 168;
  const CENTER_SIZE = 64;

  // Button label positions
  const btnStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'opacity 0.1s',
    opacity: active ? 0.5 : 1,
    zIndex: 2,
  });

  return (
    <div
      style={{
        position: 'relative',
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'block',
      }}
    >
      {/* Outer ring */}
      <div
        ref={wheelRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 38% 28%, #ffffff 0%, #f0eeea 25%, #e0ddd8 55%, #c8c5c0 100%)',
          boxShadow: [
            'inset 0 2px 6px rgba(255,255,255,0.8)',
            'inset 0 -3px 8px rgba(0,0,0,0.18)',
            '0 4px 16px rgba(0,0,0,0.35)',
            '0 1px 3px rgba(255,255,255,0.5)',
            '0 -1px 2px rgba(0,0,0,0.12)',
          ].join(', '),
        }}
      />

      {/* Wheel button zones */}

      {/* MENU — top */}
      <div
        onClick={() => flashButton('menu', onMenu)}
        style={{ ...btnStyle(pressedBtn === 'menu'), top: 10, left: '50%', transform: 'translateX(-50%)', width: 60, height: 28 }}
      >
        <span style={{ fontSize: 9, fontFamily: '-apple-system, Helvetica Neue, sans-serif', color: '#555', fontWeight: 600, letterSpacing: '0.5px' }}>
          MENU
        </span>
      </div>

      {/* ⏮ — left */}
      <div
        onClick={() => flashButton('prev', onPrev)}
        style={{ ...btnStyle(pressedBtn === 'prev'), left: 10, top: '50%', transform: 'translateY(-50%)', width: 28, height: 56 }}
      >
        <span style={{ fontSize: 13, color: '#555' }}>⏮</span>
      </div>

      {/* ⏭ — right */}
      <div
        onClick={() => flashButton('next', onNext)}
        style={{ ...btnStyle(pressedBtn === 'next'), right: 10, top: '50%', transform: 'translateY(-50%)', width: 28, height: 56 }}
      >
        <span style={{ fontSize: 13, color: '#555' }}>⏭</span>
      </div>

      {/* ▶⏸ — bottom */}
      <div
        onClick={() => flashButton('playpause', onPlayPause)}
        style={{ ...btnStyle(pressedBtn === 'playpause'), bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 60, height: 28 }}
      >
        <span style={{ fontSize: 12, color: '#555' }}>▶⏸</span>
      </div>

      {/* Center button */}
      <motion.div
        onClick={() => flashButton('center', onCenter)}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginLeft: -(CENTER_SIZE / 2),
          marginTop: -(CENTER_SIZE / 2),
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 40% 30%, #f8f6f2 0%, #e8e5e0 40%, #d5d2cc 100%)',
          boxShadow: [
            '0 2px 8px rgba(0,0,0,0.25)',
            'inset 0 1px 3px rgba(255,255,255,0.9)',
            'inset 0 -2px 4px rgba(0,0,0,0.12)',
          ].join(', '),
          cursor: 'pointer',
          zIndex: 3,
        }}
      >
        {/* Center button subtle indentation dot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginLeft: -3,
          marginTop: -3,
          width: 6, height: 6, borderRadius: '50%',
          background: 'radial-gradient(ellipse, #bbb, #999)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
        }} />
      </motion.div>
    </div>
  );
}
