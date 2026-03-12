export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getAlbumArt(track: { album?: { images?: { url: string }[] } } | null, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const images = track?.album?.images;
  if (!images?.length) return '';
  const idx = size === 'small' ? 2 : size === 'medium' ? 1 : 0;
  return images[Math.min(idx, images.length - 1)]?.url || images[0]?.url || '';
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function getArtistNames(artists: { name: string }[]): string {
  return artists.map(a => a.name).join(', ');
}

// Demo tracks for non-premium / demo mode
export const DEMO_TRACKS = [
  {
    id: 'd1', uri: 'spotify:track:d1', name: 'Bohemian Rhapsody',
    duration_ms: 354000,
    artists: [{ id: 'a1', name: 'Queen' }],
    album: { id: 'al1', name: 'A Night at the Opera', images: [{ url: 'https://picsum.photos/seed/queen/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd2', uri: 'spotify:track:d2', name: 'Hotel California',
    duration_ms: 391000,
    artists: [{ id: 'a2', name: 'Eagles' }],
    album: { id: 'al2', name: 'Hotel California', images: [{ url: 'https://picsum.photos/seed/eagles/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd3', uri: 'spotify:track:d3', name: 'Stairway to Heaven',
    duration_ms: 482000,
    artists: [{ id: 'a3', name: 'Led Zeppelin' }],
    album: { id: 'al3', name: 'Led Zeppelin IV', images: [{ url: 'https://picsum.photos/seed/zeppelin/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd4', uri: 'spotify:track:d4', name: 'Smells Like Teen Spirit',
    duration_ms: 301000,
    artists: [{ id: 'a4', name: 'Nirvana' }],
    album: { id: 'al4', name: 'Nevermind', images: [{ url: 'https://picsum.photos/seed/nirvana/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd5', uri: 'spotify:track:d5', name: 'Purple Rain',
    duration_ms: 520000,
    artists: [{ id: 'a5', name: 'Prince' }],
    album: { id: 'al5', name: 'Purple Rain', images: [{ url: 'https://picsum.photos/seed/prince/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd6', uri: 'spotify:track:d6', name: 'Blinding Lights',
    duration_ms: 200000,
    artists: [{ id: 'a6', name: 'The Weeknd' }],
    album: { id: 'al6', name: 'After Hours', images: [{ url: 'https://picsum.photos/seed/weeknd/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd7', uri: 'spotify:track:d7', name: 'Shape of You',
    duration_ms: 234000,
    artists: [{ id: 'a7', name: 'Ed Sheeran' }],
    album: { id: 'al7', name: '÷ Divide', images: [{ url: 'https://picsum.photos/seed/edsheeran/300/300', width: 300, height: 300 }] },
  },
  {
    id: 'd8', uri: 'spotify:track:d8', name: 'Lose Yourself',
    duration_ms: 326000,
    artists: [{ id: 'a8', name: 'Eminem' }],
    album: { id: 'al8', name: '8 Mile', images: [{ url: 'https://picsum.photos/seed/eminem/300/300', width: 300, height: 300 }] },
  },
];
