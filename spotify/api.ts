import { getAccessToken, refreshAccessToken } from './auth';

async function getValidToken(): Promise<string> {
  let token = getAccessToken();
  if (!token) {
    token = await refreshAccessToken();
  }
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function spotifyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidToken();
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) return {} as T;
  if (!response.ok) {
    if (response.status === 401) {
      // Force token refresh on 401
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(`https://api.spotify.com/v1${path}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        }).then(res => res.json());
      }
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ─── Types ───────────────────────────────────────────────────────
export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export interface PlayerState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  device: { id: string; name: string; volume_percent: number } | null;
}

// ─── User ────────────────────────────────────────────────────────
export const getMe = () => spotifyFetch<SpotifyUser>('/me');

// ─── Playlists ───────────────────────────────────────────────────
export const getPlaylists = (limit = 20) =>
  spotifyFetch<{ items: SpotifyPlaylist[] }>(`/me/playlists?limit=${limit}`);

export const getPlaylistTracks = (playlistId: string, limit = 30) =>
  spotifyFetch<{ items: { track: SpotifyTrack }[] }>(
    `/playlists/${playlistId}/tracks?limit=${limit}&fields=items(track(id,uri,name,duration_ms,artists,album))`
  );

// ─── Search ──────────────────────────────────────────────────────
export const searchTracks = (query: string, limit = 20) =>
  spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=${limit}`
  );

// ─── Recommendations ─────────────────────────────────────────────
export const getTopTracks = (limit = 5) =>
  spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?limit=${limit}&time_range=short_term`
  );

export const getRecommendations = (seedTracks: string[], limit = 20) =>
  spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/recommendations?seed_tracks=${seedTracks.slice(0, 5).join(',')}&limit=${limit}`
  );

export const getRecentlyPlayed = (limit = 20) =>
  spotifyFetch<{ items: { track: SpotifyTrack }[] }>(
    `/me/player/recently-played?limit=${limit}`
  );

// ─── Player ──────────────────────────────────────────────────────
export const getPlayerState = () =>
  spotifyFetch<PlayerState>('/me/player');

export const getQueue = () =>
  spotifyFetch<{ currently_playing: SpotifyTrack | null; queue: SpotifyTrack[] }>(
    '/me/player/queue'
  );

export const playTrack = (uris: string[], deviceId: string) =>
  spotifyFetch('/me/player/play?device_id=' + deviceId, {
    method: 'PUT',
    body: JSON.stringify({ uris }),
  });

export const playContext = (contextUri: string, deviceId: string, offsetIndex = 0) =>
  spotifyFetch('/me/player/play?device_id=' + deviceId, {
    method: 'PUT',
    body: JSON.stringify({ context_uri: contextUri, offset: { position: offsetIndex } }),
  });

export const pausePlayer = (deviceId: string) =>
  spotifyFetch(`/me/player/pause?device_id=${deviceId}`, { method: 'PUT' });

export const resumePlayer = (deviceId: string) =>
  spotifyFetch(`/me/player/play?device_id=${deviceId}`, { method: 'PUT' });

export const nextTrack = (deviceId: string) =>
  spotifyFetch(`/me/player/next?device_id=${deviceId}`, { method: 'POST' });

export const prevTrack = (deviceId: string) =>
  spotifyFetch(`/me/player/previous?device_id=${deviceId}`, { method: 'POST' });

export const seekTrack = (positionMs: number, deviceId: string) =>
  spotifyFetch(`/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`, { method: 'PUT' });

export const setVolume = (volumePercent: number, deviceId: string) =>
  spotifyFetch(`/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`, { method: 'PUT' });

export const setShuffle = (state: boolean, deviceId: string) =>
  spotifyFetch(`/me/player/shuffle?state=${state}&device_id=${deviceId}`, { method: 'PUT' });

export const setRepeat = (state: 'off' | 'track' | 'context', deviceId: string) =>
  spotifyFetch(`/me/player/repeat?state=${state}&device_id=${deviceId}`, { method: 'PUT' });

export const addToQueue = (uri: string, deviceId: string) =>
  spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(uri)}&device_id=${deviceId}`, { method: 'POST' });

export const transferPlayback = (deviceId: string) =>
  spotifyFetch('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
