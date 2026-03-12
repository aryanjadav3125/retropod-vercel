'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exchangeCodeForToken } from '@/spotify/auth';
import { usePlayerStore } from '@/store/playerStore';

export default function CallbackPage() {
  const router = useRouter();
  const { setAuthenticated } = usePlayerStore();
  const [status, setStatus] = useState('Connecting to Spotify…');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Spotify declined access: ' + errorParam);
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    exchangeCodeForToken(code)
      .then((token) => {
        setAuthenticated(true, token);
        setStatus('Connected! Loading RetroPod…');
        router.push('/');
      })
      .catch((err) => {
        setError('Authentication failed: ' + err.message);
        setTimeout(() => router.push('/'), 3000);
      });
  }, [router, setAuthenticated]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse, #1a1713 0%, #0d0c0a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: 'Courier New, monospace',
    }}>
      <div style={{ fontSize: 40 }}>🎵</div>
      <div style={{ fontSize: 14, color: '#f0eeea', letterSpacing: '2px' }}>RETROPOD</div>
      {error ? (
        <div style={{ fontSize: 11, color: '#e05a5a', maxWidth: 320, textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#555' }}>
          {status}
        </div>
      )}
      <div style={{
        width: 32, height: 32, border: '2px solid #1DB954',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
