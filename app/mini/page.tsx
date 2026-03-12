'use client';
import Ipod from '@/components/Ipod';
import { useEffect, useState } from 'react';

export default function MiniPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ background: '#000', width: '100vw', height: '100vh' }} />;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      background: '#0d0c0a',
      overflow: 'hidden',
    }}>
      <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginTop: 32 }}>
        <Ipod />
      </div>
    </div>
  );
}
