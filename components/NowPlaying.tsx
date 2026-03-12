'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration, getAlbumArt, getArtistNames, truncate } from '@/utils/spotifyHelpers';
import { seekTrack } from '@/spotify/api';

export default function NowPlaying() {
  const {
    currentTrack, isPlaying, position, duration,
    shuffleOn, repeatMode, deviceId, isDemoMode,
    setPosition,
  } = usePlayerStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posRef = useRef(position);
  posRef.current = position;

  // Advance position locally when playing
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlaying && duration > 0) {
      timerRef.current = setInterval(() => {
        setPosition(Math.min(posRef.current + 1000, duration));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, duration, setPosition]);

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!deviceId || isDemoMode || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const ms = Math.floor(pct * duration);
    setPosition(ms);
    seekTrack(ms, deviceId).catch(() => {});
  };

  const artUrl = getAlbumArt(currentTrack, 'large');

  return (
    <div className="flex flex-col h-full w-full" style={{ background: '#d4dfe6' }}>
      {/* Album art — top half */}
      <div className="flex-shrink-0" style={{ height: '52%', position: 'relative', overflow: 'hidden' }}>
        {artUrl ? (
          <img
            src={artUrl}
            alt="album art"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #2a3a4a, #1a2530)',
            }}
          >
            <span style={{ fontSize: 32, opacity: 0.5, color: '#fff' }}>♫</span>
          </div>
        )}
        {/* gloss */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 55%)',
        }} />
      </div>

      {/* Track info */}
      <div className="flex-1 flex flex-col justify-between px-2 py-1.5" style={{ minHeight: 0 }}>
        <div>
          <div
            style={{
              fontSize: 10, fontWeight: 700, color: '#111',
              fontFamily: '-apple-system, Helvetica Neue, Arial, sans-serif',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              lineHeight: 1.3,
            }}
          >
            {currentTrack ? truncate(currentTrack.name, 26) : 'Not Playing'}
          </div>
          <div
            style={{
              fontSize: 9, color: '#555',
              fontFamily: '-apple-system, Helvetica Neue, Arial, sans-serif',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {currentTrack ? truncate(getArtistNames(currentTrack.artists), 26) : '—'}
          </div>
          <div
            style={{
              fontSize: 8, color: '#888',
              fontFamily: '-apple-system, Helvetica Neue, Arial, sans-serif',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {currentTrack ? truncate(currentTrack.album.name, 26) : '—'}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div
            onClick={handleSeek}
            style={{
              height: 4, background: '#aab8c2', borderRadius: 2,
              overflow: 'hidden', cursor: 'pointer', marginBottom: 2,
            }}
          >
            <motion.div
              style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #2a6496, #3478f6)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 8, color: '#555',
            fontFamily: '-apple-system, Helvetica Neue, Arial, sans-serif',
          }}>
            <span>{formatDuration(position)}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              {shuffleOn && <span style={{ color: '#3478f6' }}>⇄</span>}
              {repeatMode !== 'off' && <span style={{ color: '#3478f6' }}>↻</span>}
              <span>{isPlaying ? '▶' : '⏸'}</span>
            </span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
