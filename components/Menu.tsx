'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore, MenuItem } from '@/store/playerStore';
import AlbumArt from './AlbumArt';
import NowPlaying from './NowPlaying';

const SCREEN_FONT = '-apple-system, "Helvetica Neue", Arial, sans-serif';

interface ScreenTitleBarProps {
  title: string;
  isPlaying?: boolean;
}

function TitleBar({ title, isPlaying }: ScreenTitleBarProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #6ca0d4 0%, #4a80b8 100%)',
        padding: '2px 6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        borderBottom: '1px solid #3a6a9a',
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#fff',
        fontFamily: SCREEN_FONT, letterSpacing: '0.2px',
        textShadow: '0 1px 1px rgba(0,0,0,0.3)',
      }}>
        {title}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {isPlaying && (
          <span style={{ fontSize: 8, color: '#fff', opacity: 0.9 }}>▶</span>
        )}
        {/* Battery */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <div style={{
            width: 16, height: 8, border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 2, padding: '1px',
            position: 'relative',
          }}>
            <div style={{
              width: '75%', height: '100%',
              background: '#4ade80',
              borderRadius: 1,
            }} />
            <div style={{
              position: 'absolute', right: -3, top: '50%',
              transform: 'translateY(-50%)',
              width: 2, height: 4,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '0 1px 1px 0',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MenuListProps {
  items: MenuItem[];
  selectedIndex: number;
  artUrl?: string;
}

function MenuList({ items, selectedIndex, artUrl }: MenuListProps) {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemsRef.current[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  const VISIBLE = 7;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Menu list — left side */}
      <div
        style={{
          width: artUrl ? '54%' : '100%',
          borderRight: artUrl ? '1px solid #bbb' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="no-scrollbar"
          style={{ overflow: 'hidden', flex: 1 }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              ref={el => { itemsRef.current[i] = el; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 6px',
                background: i === selectedIndex
                  ? 'linear-gradient(180deg, #5b9bf8 0%, #2563eb 60%, #1d4ed8 100%)'
                  : 'transparent',
                cursor: 'pointer',
                minHeight: 20,
              }}
            >
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: 10.5,
                  fontFamily: SCREEN_FONT,
                  color: i === selectedIndex ? '#fff' : '#111',
                  fontWeight: i === selectedIndex ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textShadow: i === selectedIndex ? '0 1px 1px rgba(0,0,0,0.2)' : 'none',
                }}>
                  {item.label}
                </div>
                {item.subLabel && (
                  <div style={{
                    fontSize: 8,
                    fontFamily: SCREEN_FONT,
                    color: i === selectedIndex ? 'rgba(255,255,255,0.75)' : '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.subLabel}
                  </div>
                )}
              </div>
              {item.hasArrow && (
                <span style={{
                  fontSize: 9,
                  color: i === selectedIndex ? 'rgba(255,255,255,0.8)' : '#999',
                  marginLeft: 2,
                  flexShrink: 0,
                }}>▶</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Album art — right side (only when there's art) */}
      {artUrl && (
        <div style={{ width: '46%', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={artUrl}
            alt="album"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

export default function Screen() {
  const {
    currentView, menuItems, selectedIndex, isPlaying, currentTrack,
    notification,
  } = usePlayerStore();

  const artUrl = currentTrack?.album?.images?.[0]?.url || '';

  const viewTitles: Record<string, string> = {
    'main': 'iPod',
    'music': 'Music',
    'playlists': 'Playlists',
    'playlist-tracks': 'Songs',
    'search': 'Search',
    'queue': 'Queue',
    'recommendations': 'Genius',
    'now-playing': 'Now Playing',
    'settings': 'Settings',
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#d4dfe6',
        position: 'relative',
      }}
    >
      <TitleBar title={viewTitles[currentView] || 'iPod'} isPlaying={isPlaying} />

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ height: '100%', width: '100%' }}
          >
            {currentView === 'now-playing' ? (
              <NowPlaying />
            ) : (
              <MenuList
                items={menuItems}
                selectedIndex={selectedIndex}
                artUrl={['main', 'music'].includes(currentView) ? artUrl : undefined}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Notification overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: 4, left: 4, right: 4,
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: 9,
              fontFamily: SCREEN_FONT,
              padding: '2px 6px',
              borderRadius: 3,
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
