'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface PlayerTrack {
  id: string;
  title: string;
  speaker: string | null;
  coverUrl: string | null;
  src: string;
  seriesId?: string | null;
  seriesTitle?: string | null;
  description?: string | null;
  date?: string | null;
  tags?: string[];
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const STORAGE_KEY = 'overflow:player-state';
const PERSIST_INTERVAL_SECONDS = 5;

interface PersistedPlayerState {
  track: PlayerTrack;
  currentTime: number;
  playbackRate: number;
  volume: number;
}

function loadPersistedState(): PersistedPlayerState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedPlayerState>;
    if (!parsed?.track?.id || !parsed.track.src) return null;
    return {
      track: parsed.track,
      currentTime: typeof parsed.currentTime === 'number' ? parsed.currentTime : 0,
      playbackRate: typeof parsed.playbackRate === 'number' ? parsed.playbackRate : 1,
      volume: typeof parsed.volume === 'number' ? parsed.volume : 1,
    };
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedPlayerState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or disabled — resume-on-refresh is a nicety, not critical.
  }
}

function clearPersistedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface PlayerContextValue {
  current: PlayerTrack | null;
  playing: boolean;
  buffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  play: (track: PlayerTrack) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  skip: (deltaSeconds: number) => void;
  cyclePlaybackRate: () => void;
  setVolume: (volume: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}

const PLAY_RECORD_THRESHOLD_SECONDS = 30;

function recordPlay(sermonId: string) {
  fetch('/api/plays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sermonId }),
    keepalive: true,
  }).catch(() => {
    // Analytics ping — never block or surface errors to the listener.
  });
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPersistTimeRef = useRef(0);
  const playRecordedForRef = useRef<string | null>(null);

  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);

  // Restore whatever was playing before a refresh — paused, not autoplaying
  // (browsers block unsolicited audio without a user gesture anyway).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const saved = loadPersistedState();
    if (!saved) return;

    audio.src = saved.track.src;
    audio.playbackRate = saved.playbackRate;
    audio.volume = saved.volume;
    const onLoadedMetadata = () => {
      audio.currentTime = saved.currentTime;
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.load();

    lastPersistTimeRef.current = saved.currentTime;
    setCurrent(saved.track);
    setCurrentTime(saved.currentTime);
    setPlaybackRateState(saved.playbackRate);
    setVolumeState(saved.volume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(
    (track: PlayerTrack) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (current?.id === track.id) {
        audio.play().catch(() => {});
        return;
      }

      audio.pause();
      audio.src = track.src;
      audio.currentTime = 0;
      audio.playbackRate = playbackRate;
      audio.volume = volume;
      audio.load();
      audio.play().catch(() => {});

      setCurrent(track);
      setCurrentTime(0);
      setDuration(0);
      lastPersistTimeRef.current = 0;
      playRecordedForRef.current = null;
      savePersistedState({ track, currentTime: 0, playbackRate, volume });
    },
    [current, playbackRate, volume]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [current]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = audio.duration || Infinity;
    const clamped = Math.max(0, Math.min(seconds, max));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const skip = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo(audio.currentTime + deltaSeconds);
    },
    [seekTo]
  );

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRateState((prev) => {
      const idx = PLAYBACK_RATES.indexOf(prev as (typeof PLAYBACK_RATES)[number]);
      const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }, []);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(1, next));
    if (audioRef.current) audioRef.current.volume = clamped;
    setVolumeState(clamped);
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setCurrent(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    clearPersistedState();
  }, []);

  // Media Session API — lock-screen / hardware-button controls on mobile.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !current) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.speaker ?? undefined,
      album: current.seriesTitle ?? undefined,
      artwork: current.coverUrl ? [{ src: current.coverUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play().catch(() => {}));
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(15));

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [current, skip]);

  // Flush the exact position right before a refresh/close, rather than
  // relying only on the periodic throttled write in onTimeUpdate. Reads from
  // a ref (kept fresh below) so the listener itself is only attached once.
  const latestStateRef = useRef({ current, currentTime, playbackRate, volume });
  useEffect(() => {
    latestStateRef.current = { current, currentTime, playbackRate, volume };
  }, [current, currentTime, playbackRate, volume]);

  useEffect(() => {
    function handleBeforeUnload() {
      const { current, currentTime, playbackRate, volume } = latestStateRef.current;
      if (current) {
        savePersistedState({ track: current, currentTime, playbackRate, volume });
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        current,
        playing,
        buffering,
        currentTime,
        duration,
        playbackRate,
        volume,
        play,
        togglePlay,
        seekTo,
        skip,
        cyclePlaybackRate,
        setVolume,
        close,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const t = audioRef.current?.currentTime ?? 0;
          setCurrentTime(t);
          if (current && Math.abs(t - lastPersistTimeRef.current) >= PERSIST_INTERVAL_SECONDS) {
            lastPersistTimeRef.current = t;
            savePersistedState({ track: current, currentTime: t, playbackRate, volume });
          }
          if (current && t >= PLAY_RECORD_THRESHOLD_SECONDS && playRecordedForRef.current !== current.id) {
            playRecordedForRef.current = current.id;
            recordPlay(current.id);
          }
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          clearPersistedState();
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        style={{ display: 'none' }}
      />
    </PlayerContext.Provider>
  );
}
