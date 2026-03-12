import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SpotifyTrack } from '@/spotify/api';

export type MenuView =
  | 'main'
  | 'music'
  | 'playlists'
  | 'playlist-tracks'
  | 'search'
  | 'queue'
  | 'recommendations'
  | 'now-playing'
  | 'settings'
  | 'themes'
  | 'stickers';

export interface MenuItem {
  id: string;
  label: string;
  action?: () => void;
  hasArrow?: boolean;
  subLabel?: string;
}

export interface Sticker {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PlayerStore {
  // Auth
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuthenticated: (val: boolean, token?: string) => void;

  // Player
  deviceId: string | null;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;
  duration: number;
  volume: number;
  shuffleOn: boolean;
  repeatMode: 'off' | 'track' | 'context';

  setDeviceId: (id: string) => void;
  setIsPlaying: (val: boolean) => void;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  setVolume: (vol: number) => void;
  setShuffleOn: (val: boolean) => void;
  setRepeatMode: (mode: 'off' | 'track' | 'context') => void;

  // Navigation
  currentView: MenuView;
  viewStack: MenuView[];
  selectedIndex: number;
  menuItems: MenuItem[];

  navigateTo: (view: MenuView) => void;
  navigateBack: () => void;
  setSelectedIndex: (idx: number) => void;
  setMenuItems: (items: MenuItem[]) => void;

  // Active playlist
  activePlaylistId: string | null;
  activePlaylistName: string;
  setActivePlaylist: (id: string, name: string) => void;

  // Queue
  queue: SpotifyTrack[];
  setQueue: (tracks: SpotifyTrack[]) => void;

  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;

  // Notifications
  notification: string | null;
  showNotification: (msg: string) => void;

  // Realism & Customization
  theme: string;
  setTheme: (theme: string) => void;
  stickers: Sticker[];
  setStickers: (stickers: Sticker[]) => void;
  addSticker: (sticker: Sticker) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, partial: Partial<Sticker>) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  clickSoundEnabled: boolean;
  setClickSoundEnabled: (val: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      accessToken: null,
  setAuthenticated: (val, token) => set({ isAuthenticated: val, accessToken: token || null }),

  // Player
  deviceId: null,
  isPlaying: false,
  currentTrack: null,
  position: 0,
  duration: 0,
  volume: 70,
  shuffleOn: false,
  repeatMode: 'off',

  setDeviceId: (id) => set({ deviceId: id }),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setPosition: (pos) => set({ position: pos }),
  setDuration: (dur) => set({ duration: dur }),
  setVolume: (vol) => set({ volume: vol }),
  setShuffleOn: (val) => set({ shuffleOn: val }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),

  // Navigation
  currentView: 'main',
  viewStack: [],
  selectedIndex: 0,
  menuItems: [],

  navigateTo: (view) => {
    const stack = get().viewStack;
    set({
      viewStack: [...stack, get().currentView],
      currentView: view,
      selectedIndex: 0,
    });
  },

  navigateBack: () => {
    const stack = get().viewStack;
    if (!stack.length) return;
    const prev = stack[stack.length - 1];
    set({
      viewStack: stack.slice(0, -1),
      currentView: prev,
      selectedIndex: 0,
    });
  },

  setSelectedIndex: (idx) => set({ selectedIndex: idx }),
  setMenuItems: (items) => set({ menuItems: items }),

  // Playlist
  activePlaylistId: null,
  activePlaylistName: '',
  setActivePlaylist: (id, name) => set({ activePlaylistId: id, activePlaylistName: name }),

  // Queue
  queue: [],
  setQueue: (tracks) => set({ queue: tracks }),

  // Demo
  isDemoMode: false,
  setDemoMode: (val) => set({ isDemoMode: val }),

  // Notifications
  notification: null,
  showNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: null }), 2000);
  },

  // Realism & Customization
  theme: 'Classic White',
  setTheme: (theme) => set({ theme }),
  stickers: [],
  setStickers: (stickers) => set({ stickers }),
  addSticker: (sticker) => set((state) => ({ stickers: [...state.stickers, sticker] })),
  removeSticker: (id) => set((state) => ({ stickers: state.stickers.filter((s) => s.id !== id) })),
  updateSticker: (id, partial) =>
    set((state) => ({
      stickers: state.stickers.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    })),
      isLocked: false,
      setIsLocked: (val) => set({ isLocked: val }),
      clickSoundEnabled: true,
      setClickSoundEnabled: (val) => set({ clickSoundEnabled: val }),
    }),
    {
      name: 'retropod-state',
      partialize: (state) => ({
        // Define what fields to sync between windows. Exclude active transient state like 'position' or 'duration'
        // if they update too fast for localStorage, or keep them to sync the MiniPlayer.
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        position: state.position,
        duration: state.duration,
        deviceId: state.deviceId,
        theme: state.theme,
      }),
    }
  )
);
