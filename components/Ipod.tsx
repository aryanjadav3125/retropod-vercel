'use client';
import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import ClickWheel from './ClickWheel';
import Screen from './Menu';
import { usePlayerStore, MenuItem } from '@/store/playerStore';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import {
  getPlaylists, getPlaylistTracks, getRecentlyPlayed,
  getTopTracks, getRecommendations, getQueue,
  playTrack, nextTrack as apiNextTrack, prevTrack as apiPrevTrack,
  pausePlayer, resumePlayer, setShuffle, setRepeat,
} from '@/spotify/api';
import { DEMO_TRACKS, getArtistNames, truncate } from '@/utils/spotifyHelpers';
import { SpotifyTrack } from '@/spotify/api';

// ── Demo state ───────────────────────────────────────────────────
let demoIdx = 0;
let demoPlaying = false;

export default function Ipod() {
  const {
    accessToken, isAuthenticated, isDemoMode,
    currentView, menuItems, selectedIndex,
    navigateTo, navigateBack, setSelectedIndex, setMenuItems,
    deviceId, isPlaying, currentTrack, shuffleOn, repeatMode,
    setIsPlaying, setCurrentTrack, setPosition, setDuration,
    setShuffleOn, setRepeatMode,
    setActivePlaylist, activePlaylistId,
    showNotification,
    theme, isLocked, clickSoundEnabled, setTheme, setIsLocked, setClickSoundEnabled,
    stickers, addSticker, updateSticker, removeSticker,
  } = usePlayerStore();

  // Init Spotify Web Playback SDK
  useSpotifyPlayer(accessToken);

  // ── Menu builders ────────────────────────────────────────────
  const buildMainMenu = useCallback(() => {
    setMenuItems([
      { id: 'music',   label: 'Music',           hasArrow: true },
      { id: 'playlists', label: 'Playlists',      hasArrow: true },
      { id: 'queue',   label: 'Queue',            hasArrow: true },
      { id: 'recs',    label: 'Genius',           hasArrow: true },
      { id: 'nowplay', label: 'Now Playing',      hasArrow: true, subLabel: currentTrack ? truncate(currentTrack.name, 20) : undefined },
      { id: 'settings',label: 'Settings',         hasArrow: true },
    ]);
  }, [setMenuItems, currentTrack]);

  const buildMusicMenu = useCallback(() => {
    setMenuItems([
      { id: 'search',  label: 'Search',           hasArrow: true },
      { id: 'recent',  label: 'Recently Played',  hasArrow: true },
      { id: 'playlists', label: 'Playlists',      hasArrow: true },
    ]);
  }, [setMenuItems]);

  const buildSettingsMenu = useCallback(() => {
    setMenuItems([
      { id: 'shuffle', label: 'Shuffle', subLabel: shuffleOn ? 'On' : 'Off' },
      { id: 'repeat',  label: 'Repeat',  subLabel: repeatMode === 'off' ? 'Off' : repeatMode === 'track' ? 'One' : 'All' },
      { id: 'theme',   label: 'Theme',   subLabel: theme, hasArrow: true },
      { id: 'clicksound', label: 'Click Sound', subLabel: clickSoundEnabled ? 'On' : 'Off' },
      { id: 'lock',    label: 'Lock Screen', subLabel: isLocked ? 'On' : 'Off' },
      { id: 'popout',  label: 'Mini Player', hasArrow: false },
      { id: 'stickers',label: 'Stickers', hasArrow: true },
      { id: 'about',   label: 'About RetroPod', subLabel: 'v2.0' },
    ]);
  }, [setMenuItems, shuffleOn, repeatMode, theme, isLocked, clickSoundEnabled]);

  const buildThemesMenu = useCallback(() => {
    setMenuItems([
      { id: 'thm-Classic White', label: 'Classic White' },
      { id: 'thm-Space Grey',    label: 'Space Grey' },
      { id: 'thm-Midnight Black',label: 'Midnight Black' },
      { id: 'thm-Retro Pink',    label: 'Retro Pink' },
      { id: 'thm-Sky Blue',      label: 'Sky Blue' },
      { id: 'thm-Lime Green',    label: 'Lime Green' },
    ]);
  }, [setMenuItems]);

  // ── Load data ────────────────────────────────────────────────
  const loadPlaylists = useCallback(async () => {
    if (isDemoMode) {
      setMenuItems([
        { id: 'dp1', label: 'Demo Playlist',  subLabel: '8 songs', hasArrow: true },
        { id: 'dp2', label: 'Workout Mix',    subLabel: '8 songs', hasArrow: true },
      ]);
      return;
    }
    try {
      const data = await getPlaylists(20);
      const items: MenuItem[] = (data.items || [])
        .filter(p => !!p)
        .map(p => ({
          id: p.id,
          label: truncate(p.name || 'Unknown', 24),
          subLabel: `${p.tracks?.total || 0} songs`,
          hasArrow: true,
        }));
      setMenuItems(items.length ? items : [{ id: 'empty', label: 'No playlists', hasArrow: false }]);
    } catch (e) {
      console.error('getPlaylists error:', e);
      showNotification('Error loading playlists');
      setMenuItems([{ id: 'err', label: 'Error loading playlists' }]);
    }
  }, [isDemoMode, setMenuItems, showNotification]);

  const loadPlaylistTracks = useCallback(async (playlistId: string) => {
    if (isDemoMode) {
      const items: MenuItem[] = DEMO_TRACKS.map(t => ({
        id: t.id,
        label: truncate(t.name, 24),
        subLabel: getArtistNames(t.artists),
        hasArrow: false,
      }));
      setMenuItems(items);
      return;
    }
    try {
      const data = await getPlaylistTracks(playlistId);
      const items: MenuItem[] = (data.items || [])
        .map(i => i.track)
        .filter(Boolean)
        .map(t => ({
          id: t.id || String(Math.random()),
          label: truncate(t.name || 'Unknown Track', 24),
          subLabel: getArtistNames(t.artists || []),
          hasArrow: false,
        }));
      setMenuItems(items.length ? items : [{ id: 'empty', label: 'No tracks' }]);
    } catch (e) {
      console.error('getPlaylistTracks error:', e);
      showNotification('Error loading tracks');
    }
  }, [isDemoMode, setMenuItems, showNotification]);

  const loadRecent = useCallback(async () => {
    if (isDemoMode) {
      const items: MenuItem[] = DEMO_TRACKS.slice(0, 5).map(t => ({
        id: t.id,
        label: truncate(t.name, 24),
        subLabel: getArtistNames(t.artists),
        hasArrow: false,
      }));
      setMenuItems(items);
      return;
    }
    try {
      const data = await getRecentlyPlayed(15);
      const seen = new Set<string>();
      const items: MenuItem[] = (data.items || [])
        .map(i => i.track)
        .filter(t => !seen.has(t.id) && seen.add(t.id))
        .map(t => ({
          id: t.id,
          label: truncate(t.name, 24),
          subLabel: getArtistNames(t.artists),
          hasArrow: false,
        }));
      setMenuItems(items.length ? items : [{ id: 'empty', label: 'Nothing played yet' }]);
    } catch {
      showNotification('Error loading history');
    }
  }, [isDemoMode, setMenuItems, showNotification]);

  const loadRecommendations = useCallback(async () => {
    if (isDemoMode) {
      const shuffled = [...DEMO_TRACKS].sort(() => Math.random() - 0.5);
      setMenuItems(shuffled.map(t => ({
        id: t.id,
        label: truncate(t.name, 24),
        subLabel: getArtistNames(t.artists),
        hasArrow: false,
      })));
      return;
    }
    try {
      const top = await getTopTracks(5);
      const seedTracks = (top.items || []).map(t => t.id);
      if (!seedTracks.length) {
        showNotification('Play some music first');
        setMenuItems([{ id: 'tip', label: 'Play some music first!' }]);
        return;
      }
      const recs = await getRecommendations(seedTracks, 20);
      const items: MenuItem[] = (recs.tracks || []).map(t => ({
        id: t.id,
        label: truncate(t.name, 24),
        subLabel: getArtistNames(t.artists),
        hasArrow: false,
      }));
      setMenuItems(items.length ? items : [{ id: 'empty', label: 'No recommendations' }]);
    } catch {
      showNotification('Error loading recommendations');
    }
  }, [isDemoMode, setMenuItems, showNotification]);

  const loadQueue = useCallback(async () => {
    if (isDemoMode) {
      const items: MenuItem[] = DEMO_TRACKS.map((t, i) => ({
        id: t.id,
        label: (i === demoIdx ? '▶ ' : '') + truncate(t.name, 22),
        subLabel: getArtistNames(t.artists),
      }));
      setMenuItems(items);
      return;
    }
    try {
      const data = await getQueue();
      const tracks: SpotifyTrack[] = [
        ...(data.currently_playing ? [data.currently_playing] : []),
        ...(data.queue || []),
      ].slice(0, 20);
      const items: MenuItem[] = tracks.map((t, i) => ({
        id: t.id + i,
        label: (i === 0 && isPlaying ? '▶ ' : '') + truncate(t.name, 22),
        subLabel: getArtistNames(t.artists),
      }));
      setMenuItems(items.length ? items : [{ id: 'empty', label: 'Queue is empty' }]);
    } catch {
      showNotification('Error loading queue');
      setMenuItems([{ id: 'empty', label: 'No queue available' }]);
    }
  }, [isDemoMode, isPlaying, setMenuItems, showNotification]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const loadSearchResults = useCallback(async (q: string) => {
    if (!q.trim()) return;
    if (isDemoMode) {
      const results = DEMO_TRACKS.filter(t =>
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.artists[0].name.toLowerCase().includes(q.toLowerCase())
      );
      setMenuItems(results.length
        ? results.map(t => ({ id: t.id, label: truncate(t.name, 24), subLabel: getArtistNames(t.artists) }))
        : [{ id: 'none', label: 'No results' }]
      );
      return;
    }
    try {
      const { searchTracks } = await import('@/spotify/api');
      const data = await searchTracks(q);
      const items: MenuItem[] = (data.tracks?.items || []).map(t => ({
        id: t.id,
        label: truncate(t.name || 'Unknown', 24),
        subLabel: getArtistNames(t.artists || []),
        hasArrow: false,
      }));
      setMenuItems(items.length ? items : [{ id: 'none', label: 'No results' }]);
    } catch (e) {
      console.error('Search error:', e);
      showNotification('Search error');
    }
  }, [isDemoMode, setMenuItems, showNotification]);

  // ── On view change ───────────────────────────────────────────
  useEffect(() => {
    switch (currentView) {
      case 'main':          buildMainMenu(); break;
      case 'music':         buildMusicMenu(); break;
      case 'settings':      buildSettingsMenu(); break;
      case 'themes':        buildThemesMenu(); break;
      case 'stickers':
        setMenuItems([
          { id: 'stk-music', label: 'Add Music Sticker' },
          { id: 'stk-pixel', label: 'Add Pixel Heart' },
          { id: 'stk-star',  label: 'Add Star Sticker' },
          { id: 'stk-clear', label: 'Clear All Stickers' },
        ]);
        break;
      case 'playlists':     loadPlaylists(); break;
      case 'queue':         loadQueue(); break;
      case 'recommendations': loadRecommendations(); break;
      case 'now-playing':   break; // handled by NowPlaying component
      case 'playlist-tracks':
        if (activePlaylistId) loadPlaylistTracks(activePlaylistId);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  // ── Playback helpers ─────────────────────────────────────────
  const playDemoTrack = useCallback((idx: number) => {
    demoIdx = idx;
    demoPlaying = true;
    const track = DEMO_TRACKS[idx];
    setCurrentTrack(track as SpotifyTrack);
    setDuration(track.duration_ms);
    setPosition(0);
    setIsPlaying(true);
    showNotification('▶ ' + truncate(track.name, 18));
  }, [setCurrentTrack, setDuration, setPosition, setIsPlaying, showNotification]);

  const handlePlayTrack = useCallback(async (trackId: string) => {
    if (isDemoMode) {
      const idx = DEMO_TRACKS.findIndex(t => t.id === trackId);
      if (idx >= 0) playDemoTrack(idx);
      return;
    }
    if (!deviceId) { showNotification('No device connected'); return; }

    // Find the URI from current menu items context
    const uri = `spotify:track:${trackId}`;
    try {
      await playTrack([uri], deviceId);
      navigateTo('now-playing');
      showNotification('▶ Playing');
    } catch (e: any) {
      showNotification(e.message?.includes('Premium') ? 'Premium required' : 'Playback error');
    }
  }, [isDemoMode, deviceId, navigateTo, playDemoTrack, showNotification]);

  const handlePlayPlaylist = useCallback(async (playlistId: string) => {
    if (isDemoMode || !deviceId) return;
    try {
      const { playContext } = await import('@/spotify/api');
      await playContext(`spotify:playlist:${playlistId}`, deviceId);
      navigateTo('now-playing');
    } catch {}
  }, [isDemoMode, deviceId, navigateTo]);

  // ── Wheel handlers ───────────────────────────────────────────
  const handleScrollUp = useCallback(() => {
    if (currentView === 'now-playing') return;
    const newIdx = Math.max(0, selectedIndex - 1);
    setSelectedIndex(newIdx);
  }, [currentView, selectedIndex, setSelectedIndex]);

  const handleScrollDown = useCallback(() => {
    if (currentView === 'now-playing') return;
    const newIdx = Math.min(menuItems.length - 1, selectedIndex + 1);
    setSelectedIndex(newIdx);
  }, [currentView, menuItems.length, selectedIndex, setSelectedIndex]);

  const handleCenter = useCallback(async () => {
    const item = menuItems[selectedIndex];
    if (!item) {
      if (currentView === 'now-playing') return;
      return;
    }

    switch (currentView) {
      case 'main':
        if (item.id === 'music')    { navigateTo('music'); }
        else if (item.id === 'playlists') { navigateTo('playlists'); }
        else if (item.id === 'queue')     { navigateTo('queue'); }
        else if (item.id === 'recs')      { navigateTo('recommendations'); }
        else if (item.id === 'nowplay')   { navigateTo('now-playing'); }
        else if (item.id === 'settings')  { navigateTo('settings'); }
        break;

      case 'music':
        if (item.id === 'search')    { navigateTo('search'); setMenuItems([]); }
        else if (item.id === 'recent') { navigateTo('playlist-tracks'); setActivePlaylist('__recent', 'Recently Played'); loadRecent(); }
        else if (item.id === 'playlists') { navigateTo('playlists'); }
        break;

      case 'playlists':
        setActivePlaylist(item.id, item.label);
        navigateTo('playlist-tracks');
        loadPlaylistTracks(item.id);
        break;

      case 'playlist-tracks':
        handlePlayTrack(item.id);
        break;

      case 'search':
        handlePlayTrack(item.id);
        break;

      case 'recommendations':
        handlePlayTrack(item.id);
        break;

      case 'queue':
        // tap to go to now playing
        navigateTo('now-playing');
        break;

      case 'settings':
        if (item.id === 'shuffle') {
          const newState = !shuffleOn;
          setShuffleOn(newState);
          if (!isDemoMode && deviceId) setShuffle(newState, deviceId).catch(() => {});
          showNotification('Shuffle: ' + (newState ? 'On' : 'Off'));
          buildSettingsMenu();
        } else if (item.id === 'repeat') {
          const modes: ('off' | 'track' | 'context')[] = ['off', 'track', 'context'];
          const cur = modes.indexOf(repeatMode);
          const next = modes[(cur + 1) % 3];
          setRepeatMode(next);
          if (!isDemoMode && deviceId) setRepeat(next, deviceId).catch(() => {});
          showNotification('Repeat: ' + (next === 'off' ? 'Off' : next === 'track' ? 'One' : 'All'));
          buildSettingsMenu();
        } else if (item.id === 'theme') {
          navigateTo('themes');
        } else if (item.id === 'clicksound') {
          setClickSoundEnabled(!clickSoundEnabled);
          buildSettingsMenu();
        } else if (item.id === 'lock') {
          setIsLocked(!isLocked);
          buildSettingsMenu();
        } else if (item.id === 'popout') {
          window.open('/mini', '_blank', 'width=320,height=568');
        } else if (item.id === 'stickers') {
           navigateTo('stickers');
        }
        break;

      case 'themes':
        if (item.id.startsWith('thm-')) {
          setTheme(item.id.replace('thm-', ''));
          showNotification('Theme saved');
        }
        break;

      case 'stickers':
        if (item.id === 'stk-clear') {
          stickers.forEach(s => removeSticker(s.id));
          showNotification('Stickers cleared');
        } else if (item.id.startsWith('stk-')) {
          const id = 'stk_' + Date.now();
          const urls: Record<string, string> = {
            'stk-music': '🎵',
            'stk-pixel': '❤️',
            'stk-star':  '⭐',
          };
          addSticker({
            id,
            url: urls[item.id] || '✨',
            x: Math.random() * 100 + 50,
            y: Math.random() * 100 + 50,
            width: 40,
            height: 40,
            rotation: (Math.random() - 0.5) * 40,
          });
          showNotification('Sticker added');
        }
        break;
    }
  }, [
    currentView, menuItems, selectedIndex, navigateTo,
    setMenuItems, setActivePlaylist, loadRecent, loadPlaylistTracks,
    handlePlayTrack, shuffleOn, repeatMode, setShuffleOn, setRepeatMode,
    isDemoMode, deviceId, showNotification, buildSettingsMenu,
    theme, setTheme, clickSoundEnabled, setClickSoundEnabled, isLocked, setIsLocked,
  ]);

  const handleMenu = useCallback(() => {
    if (currentView === 'main') { showNotification('Already at main menu'); return; }
    navigateBack();
    buildMainMenu(); // will be rebuilt in the useEffect
  }, [currentView, navigateBack, showNotification, buildMainMenu]);

  const handlePlayPause = useCallback(async () => {
    if (isDemoMode) {
      if (isPlaying) {
        setIsPlaying(false);
        demoPlaying = false;
      } else {
        if (!currentTrack) playDemoTrack(0);
        else { setIsPlaying(true); demoPlaying = true; }
      }
      return;
    }
    if (!deviceId) { showNotification('No device'); return; }
    try {
      if (isPlaying) await pausePlayer(deviceId);
      else await resumePlayer(deviceId);
    } catch {}
  }, [isDemoMode, isPlaying, deviceId, setIsPlaying, currentTrack, playDemoTrack, showNotification]);

  const handleNext = useCallback(async () => {
    if (isDemoMode) { playDemoTrack((demoIdx + 1) % DEMO_TRACKS.length); return; }
    if (!deviceId) return;
    try { await apiNextTrack(deviceId); } catch {}
  }, [isDemoMode, deviceId, playDemoTrack]);

  const handlePrev = useCallback(async () => {
    if (isDemoMode) { playDemoTrack((demoIdx - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length); return; }
    if (!deviceId) return;
    try { await apiPrevTrack(deviceId); } catch {}
  }, [isDemoMode, deviceId, playDemoTrack]);

  // Search view: keyboard input
  const [searchInputVal, setSearchInputVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInputVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInputVal]);

  useEffect(() => {
    if (currentView === 'search') {
      loadSearchResults(debouncedSearch);
    }
  }, [debouncedSearch, currentView, loadSearchResults]);

  const getThemeBackground = () => {
    switch (theme) {
      case 'Space Grey': return 'linear-gradient(170deg, #5b5f63 0%, #3a3f44 45%, #2a2e33 100%)';
      case 'Midnight Black': return 'linear-gradient(170deg, #2b2b2b 0%, #151515 45%, #0a0a0a 100%)';
      case 'Retro Pink': return 'linear-gradient(170deg, #f9c0c8 0%, #f09ea9 45%, #d87886 100%)';
      case 'Sky Blue': return 'linear-gradient(170deg, #b0d8f0 0%, #80bedb 45%, #56a5c7 100%)';
      case 'Lime Green': return 'linear-gradient(170deg, #cbe2ab 0%, #a4c979 45%, #7ea552 100%)';
      case 'Classic White':
      default: return 'linear-gradient(170deg, #f0eeea 0%, #e4e1db 45%, #d8d5cf 100%)';
    }
  };

  return (
    <div
      style={{
        // iPod body
        width: 270,
        background: getThemeBackground(),
        borderRadius: 32,
        padding: '16px 16px 24px',
        boxShadow: [
          '0 30px 80px rgba(0,0,0,0.55)',
          '0 8px 24px rgba(0,0,0,0.3)',
          'inset 0 1px 0 rgba(255,255,255,0.85)',
          'inset 0 -2px 0 rgba(0,0,0,0.12)',
          '2px 0 8px rgba(0,0,0,0.15)',
          '-2px 0 8px rgba(0,0,0,0.08)',
        ].join(', '),
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Stickers Overlay */}
      {stickers.map((stk) => (
        <motion.div
          key={stk.id}
          drag
          dragMomentum={false}
          dragConstraints={{ left: -10, right: 230, top: -10, bottom: 450 }}
          onDragEnd={(_, info) => {
             updateSticker(stk.id, { x: stk.x + info.offset.x, y: stk.y + info.offset.y });
          }}
          onDoubleClick={() => removeSticker(stk.id)}
          style={{
            position: 'absolute',
            left: stk.x,
            top: stk.y,
            width: stk.width,
            height: stk.height,
            fontSize: stk.width * 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            rotate: stk.rotation,
            cursor: 'grab',
            zIndex: 1,
            userSelect: 'none',
          }}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        >
          {stk.url}
        </motion.div>
      ))}

      {/* Shine overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '45%',
          borderRadius: '32px 32px 0 0',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Headphone jack top */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: '#111', border: '1px solid #888',
        margin: '0 auto 8px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
      }} />

      {/* Screen bezel */}
      <div
        style={{
          background: '#1a1713',
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          position: 'relative',
          zIndex: 10,
          boxShadow: [
            'inset 0 3px 10px rgba(0,0,0,0.95)',
            'inset 0 1px 3px rgba(0,0,0,0.9)',
            '0 1px 0 rgba(255,255,255,0.25)',
          ].join(', '),
        }}
      >
        <div
          style={{
            width: '100%',
            height: 168,
            borderRadius: 7,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Search input overlay */}
          {currentView === 'search' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              zIndex: 20, background: '#d4dfe6',
              borderBottom: '1px solid #aab',
              padding: '3px 6px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 9, color: '#555' }}>🔍</span>
              <input
                autoFocus
                value={searchInputVal}
                onChange={e => {
                  setSearchInputVal(e.target.value);
                }}
                placeholder="Search Spotify..."
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', fontSize: 10, color: '#111',
                  fontFamily: '-apple-system, Helvetica Neue, sans-serif',
                }}
              />
            </div>
          )}
          <Screen />
        </div>
      </div>

      {/* Click Wheel section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 10 }}>
        <ClickWheel
          onScrollUp={handleScrollUp}
          onScrollDown={handleScrollDown}
          onCenter={handleCenter}
          onMenu={handleMenu}
          onNext={handleNext}
          onPrev={handlePrev}
          onPlayPause={handlePlayPause}
        />

        {/* iPod wordmark */}
        <div style={{
          fontSize: 11,
          fontFamily: '-apple-system, Helvetica Neue, sans-serif',
          color: '#888',
          letterSpacing: '1.5px',
          fontWeight: 300,
          marginTop: 2,
        }}>
          iPod
        </div>

        {/* Dock connector */}
        <div style={{
          width: 64, height: 7,
          background: 'linear-gradient(90deg, #b8b5b0, #e0ddd8 50%, #b8b5b0)',
          borderRadius: 3,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 8, right: 8, top: 1, bottom: 1,
            background: 'repeating-linear-gradient(90deg, #aaa, #aaa 1.5px, #c8c5c0 1.5px, #c8c5c0 4px)',
          }} />
        </div>
      </div>
    </div>
  );
}
