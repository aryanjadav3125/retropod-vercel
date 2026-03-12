'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { getAccessToken, logout } from '@/spotify/auth';
import Ipod from '@/components/Ipod';

export default function HomePage() {
  const { isAuthenticated, isDemoMode, setAuthenticated, setDemoMode } = usePlayerStore();
  const [checked, setChecked] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setAuthenticated(true, token);
      setShowApp(true);
    }
    setChecked(true);
  }, [setAuthenticated]);

  useEffect(() => {
    if (isDemoMode) setShowApp(true);
  }, [isDemoMode]);

  if (!checked) return null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 25% 20%, #3a3530 0%, #1a1713 55%, #0d0c0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '15%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52, 120, 246, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%', right: '10%',
        width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29, 185, 84, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <AnimatePresence mode="wait">
        {showApp ? (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <Ipod />
            <div style={{
              color: '#555',
              fontSize: 9,
              fontFamily: 'Courier New, monospace',
              textAlign: 'center',
              letterSpacing: '0.5px',
              lineHeight: 1.8,
            }}>
              ↑↓ scroll · Enter select · Esc back · Space play/pause · ←→ skip
              {isDemoMode && (
                <span style={{ color: 'rgba(255,160,0,0.7)', marginLeft: 8 }}>
                  [DEMO MODE]
                </span>
              )}
              {isAuthenticated && (
                <span
                  onClick={() => { logout(); window.location.reload(); }}
                  style={{ color: '#444', marginLeft: 8, cursor: 'pointer' }}
                >
                  [disconnect]
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <LoginScreen onDemo={() => { setDemoMode(true); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function LoginScreen({ onDemo }: { onDemo: () => void }) {
  const [clientId, setClientId] = useState(
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ''
  );
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!clientId.trim()) { setError('Enter your Spotify Client ID'); return; }

    // Temporarily override with user-provided ID if not in env
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) {
      localStorage.setItem('spotify_client_id_override', clientId.trim());
    }

    const { initiateSpotifyLogin } = await import('@/spotify/auth');
    await initiateSpotifyLogin();
  };

  return (
    <div style={{
      background: 'linear-gradient(160deg, #1c1c1c, #0e0e0e)',
      border: '1px solid #2a2a2a',
      borderRadius: 24,
      padding: '36px 32px',
      maxWidth: 380,
      width: '100%',
      boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{ fontSize: 48, marginBottom: 8 }}>🎵</div>
      <h1 style={{
        fontSize: 24, fontWeight: 700, color: '#f0eeea',
        fontFamily: '-apple-system, Helvetica Neue, sans-serif',
        letterSpacing: '3px', marginBottom: 6, margin: '0 0 6px',
      }}>
        RETROPOD
      </h1>
      <p style={{
        fontSize: 11, color: '#555',
        fontFamily: 'Courier New, monospace',
        marginBottom: 28, lineHeight: 1.6,
      }}>
        A nostalgic iPod interface<br />powered by Spotify streaming
      </p>

      {/* Client ID input */}
      {!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID && (
        <div style={{ marginBottom: 14, textAlign: 'left' }}>
          <label style={{
            display: 'block', fontSize: 9, color: '#555',
            fontFamily: 'Courier New, monospace',
            letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Spotify Client ID
          </label>
          <input
            type="text"
            value={clientId}
            onChange={e => { setClientId(e.target.value); setError(''); }}
            placeholder="Paste your Client ID here"
            style={{
              width: '100%', background: '#111', border: '1px solid #333',
              borderRadius: 8, padding: '10px 14px', color: '#f0eeea',
              fontFamily: 'Courier New, monospace', fontSize: 11,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ fontSize: 9, color: '#e05a5a', margin: '4px 0 0', fontFamily: 'Courier New, monospace' }}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* Connect button */}
      <button
        onClick={handleConnect}
        style={{
          width: '100%', padding: '12px',
          background: '#1DB954', border: 'none', borderRadius: 50,
          color: '#000', fontFamily: '-apple-system, sans-serif',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.5px',
          cursor: 'pointer', marginBottom: 10,
          transition: 'transform 0.1s, background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1ed760')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1DB954')}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        CONNECT SPOTIFY
      </button>

      {/* Demo button */}
      <button
        onClick={onDemo}
        style={{
          width: '100%', padding: '10px',
          background: 'transparent', border: '1px solid #333',
          borderRadius: 50, color: '#666',
          fontFamily: '-apple-system, sans-serif',
          fontSize: 12, cursor: 'pointer',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#888'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#666'; }}
      >
        Try Demo Mode
      </button>

      {/* Setup note */}
      <div style={{
        marginTop: 20, fontSize: 9, color: '#3a3a3a',
        fontFamily: 'Courier New, monospace', lineHeight: 1.8,
      }}>
        Get a free Client ID at{' '}
        <a
          href="https://developer.spotify.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1DB954', textDecoration: 'none' }}
        >
          developer.spotify.com
        </a>
        <br />
        Set redirect URI: <span style={{ color: '#555' }}>{typeof window !== 'undefined' ? window.location.origin + '/callback' : '/callback'}</span>
        <br />
        Spotify Premium required for playback.
      </div>
    </div>
  );
}
