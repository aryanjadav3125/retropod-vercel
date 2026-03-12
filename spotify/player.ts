// Spotify Web Playback SDK types and initialization

export interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat_mode: number;
  track_window: {
    current_track: {
      id: string;
      uri: string;
      name: string;
      duration_ms: number;
      artists: { name: string; uri: string }[];
      album: {
        name: string;
        uri: string;
        images: { url: string }[];
      };
    };
    next_tracks: Array<{
      id: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string }[] };
    }>;
    previous_tracks: Array<{
      id: string;
      name: string;
      artists: { name: string }[];
    }>;
  };
}

export type SpotifySDKPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, cb: (data: any) => void) => void;
  removeListener: (event: string, cb?: (data: any) => void) => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
};

declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifySDKPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Spotify) { resolve(); return; }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const existing = document.getElementById('spotify-sdk');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }
  });
}
