'use client';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { pausePlayer, resumePlayer, nextTrack, prevTrack } from '@/spotify/api';

export default function MiniPlayer() {
  const {
    accessToken, deviceId, isPlaying, currentTrack, position, duration,
  } = usePlayerStore();
  
  useSpotifyPlayer(accessToken);

  const [localPos, setLocalPos] = useState(position);

  // Sync state from localStorage for multi-window support
  useEffect(() => {
    const handleStorage = () => {
      const stateStr = localStorage.getItem('playerstore-storage');
      if (stateStr) {
        try {
          const parsed = JSON.parse(stateStr).state;
          if (parsed && parsed.currentTrack?.id !== currentTrack?.id) {
            usePlayerStore.setState({
              currentTrack: parsed.currentTrack,
              isPlaying: parsed.isPlaying,
              position: parsed.position,
              duration: parsed.duration,
              deviceId: parsed.deviceId,
              theme: parsed.theme,
            });
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    // Initial sync
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentTrack?.id]);

  useEffect(() => {
    setLocalPos(position);
  }, [position]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setLocalPos(p => Math.min(p + 1000, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = async () => {
    if (!deviceId) return;
    if (isPlaying) await pausePlayer(deviceId);
    else await resumePlayer(deviceId);
  };

  const handleNext = async () => { if (deviceId) await nextTrack(deviceId); };
  const handlePrev = async () => { if (deviceId) await prevTrack(deviceId); };

  if (!currentTrack) {
    return (
      <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>RetroPod Mini</h2>
        <p>No track is currently playing. Go play something on your RetroPod!</p>
      </div>
    );
  }

  const artUrl = currentTrack.album?.images?.[0]?.url;

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#1a1a1a', color: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, sans-serif',
      padding: 16, boxSizing: 'border-box'
    }}>
      {artUrl ? (
        <img
          src={artUrl}
          alt="Album Art"
          style={{ width: 180, height: 180, borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}
        />
      ) : (
        <div style={{ width: 180, height: 180, background: '#333', borderRadius: 12 }} />
      )}

      <div style={{ marginTop: 24, textAlign: 'center', width: '100%' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentTrack.name}
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentTrack.artists.map(a => a.name).join(', ')}
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 220, marginTop: 16 }}>
        <div style={{ width: '100%', height: 4, background: '#333', borderRadius: 2, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            background: '#1DB954', borderRadius: 2,
            width: `${duration ? (localPos / duration) * 100 : 0}%`,
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 32, alignItems: 'center' }}>
        <button onClick={handlePrev} style={btnStyle}>⏮</button>
        <button onClick={togglePlay} style={{ ...btnStyle, fontSize: 32 }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={handleNext} style={btnStyle}>⏭</button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 24,
  cursor: 'pointer',
  padding: 8,
  outline: 'none',
};
