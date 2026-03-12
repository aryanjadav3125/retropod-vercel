import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'RetroPod — Spotify iPod Player',
  description: 'A nostalgic iPod interface powered by Spotify streaming. Open source, free, deployable on Vercel.',
  keywords: ['iPod', 'Spotify', 'music player', 'retro', 'open source'],
  openGraph: {
    title: 'RetroPod',
    description: 'Retro iPod music player powered by Spotify',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
