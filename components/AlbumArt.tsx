'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getAlbumArt } from '@/utils/spotifyHelpers';
import { usePlayerStore } from '@/store/playerStore';

interface AlbumArtProps {
  size?: 'full' | 'half';
}

export default function AlbumArt({ size = 'half' }: AlbumArtProps) {
  const { currentTrack, isPlaying } = usePlayerStore();
  const artUrl = getAlbumArt(currentTrack, 'large');

  return (
    <div
      className={`relative overflow-hidden bg-gray-900 ${
        size === 'full' ? 'w-full h-full' : 'w-full h-full'
      }`}
      style={{ aspectRatio: '1/1' }}
    >
      <AnimatePresence mode="wait">
        {artUrl ? (
          <motion.div
            key={artUrl}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={artUrl}
              alt={currentTrack?.album?.name || 'Album Art'}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' }}
          >
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={isPlaying ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
              className="text-4xl opacity-60"
            >
              ♫
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflection gloss on art */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
