import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface PlaybackContextValue {
  /** Current playing state. */
  isPlaying: boolean;
  /** Play/pause toggle. */
  togglePlayback: () => void;
  /** Current global frame number. */
  currentFrame: number;
  /** Seek to a specific frame. */
  seekToFrame: (frame: number) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export const PlaybackProvider = PlaybackContext.Provider;

export function usePlaybackContext() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error('usePlaybackContext must be used within a PlaybackProvider');
  }
  return ctx;
}
