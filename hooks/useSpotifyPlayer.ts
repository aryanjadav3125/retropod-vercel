'use client';
import { useEffect, useRef, useCallback } from 'react';
import { loadSpotifySDK, SpotifySDKPlayer, SpotifyPlayerState } from '@/spotify/player';
import { usePlayerStore } from '@/store/playerStore';
import { transferPlayback } from '@/spotify/api';

export function useSpotifyPlayer(accessToken: string | null) {
  const playerRef = useRef<SpotifySDKPlayer | null>(null);
  const {
    setDeviceId, setIsPlaying, setCurrentTrack,
    setPosition, setDuration, setShuffleOn, setRepeatMode,
    showNotification, isDemoMode,
  } = usePlayerStore();

  const handleStateChange = useCallback((state: SpotifyPlayerState | null) => {
    if (!state) return;

    const { paused, position, duration, shuffle, repeat_mode, track_window } = state;
    const track = track_window?.current_track;

    setIsPlaying(!paused);
    setPosition(position);
    setDuration(duration);
    setShuffleOn(shuffle);
    setRepeatMode(repeat_mode === 0 ? 'off' : repeat_mode === 1 ? 'context' : 'track');

    if (track) {
      setCurrentTrack({
        id: track.id,
        uri: track.uri,
        name: track.name,
        duration_ms: duration,
        artists: track.artists.map((a: any) => ({ name: a.name, uri: a.uri, id: '' })),
        album: {
          id: '',
          name: track.album.name,
          images: track.album.images.map((img: any) => ({ url: img.url, width: 300, height: 300 })),
        },
      });
    }
  }, [setIsPlaying, setPosition, setDuration, setShuffleOn, setRepeatMode, setCurrentTrack]);

  useEffect(() => {
    if (!accessToken || isDemoMode) return;

    let mounted = true;

    const initPlayer = async () => {
      try {
        await loadSpotifySDK();
        if (!mounted) return;

        const player = new window.Spotify.Player({
          name: 'RetroPod 🎵',
          getOAuthToken: (cb) => cb(accessToken),
          volume: 0.7,
        });

        player.addListener('ready', async ({ device_id }: { device_id: string }) => {
          if (!mounted) return;
          setDeviceId(device_id);
          localStorage.setItem('spotify_device_id', device_id);
          showNotification('Connected to RetroPod');
          try { await transferPlayback(device_id); } catch {}
        });

        player.addListener('not_ready', () => {
          showNotification('Player went offline');
        });

        player.addListener('player_state_changed', handleStateChange);

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Spotify init error:', message);
          showNotification('Player error');
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Spotify auth error:', message);
          showNotification('Auth error — reconnect');
        });

        player.addListener('account_error', () => {
          showNotification('Premium required for playback');
        });

        await player.connect();
        playerRef.current = player;
      } catch (err) {
        console.error('Failed to init Spotify player:', err);
      }
    };

    initPlayer();

    return () => {
      mounted = false;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [accessToken, isDemoMode, setDeviceId, showNotification, handleStateChange]);

  // Poll position while playing
  useEffect(() => {
    const { isPlaying } = usePlayerStore.getState();
    if (!isPlaying || !playerRef.current) return;

    const interval = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (state) {
        setPosition(state.position);
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  return playerRef;
}
