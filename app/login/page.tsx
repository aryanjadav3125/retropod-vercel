'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initiateSpotifyLogin } from '@/spotify/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    initiateSpotifyLogin().catch(() => router.push('/'));
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0c0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#555', fontFamily: 'Courier New, monospace', fontSize: 12,
    }}>
      Redirecting to Spotify…
    </div>
  );
}
