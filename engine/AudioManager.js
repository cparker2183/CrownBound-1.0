// src/engine/AudioManager.js
// Cross-platform web audio manager for background music and sound effects.
//
// Features:
// - Parcel-friendly static audio imports
// - Persistent music and SFX volume settings
// - Browser autoplay-policy handling
// - Smooth music fading
// - Playlist playback without overlapping tracks
// - Cancellation of outdated music transitions
// - UI subscriptions for volume and playback state

const MUSIC_VOLUME_KEY = "crownbound_music_volume_v1";
const SFX_VOLUME_KEY = "crownbound_sfx_volume_v1";

const DEFAULT_MUSIC_VOL = 80;
const DEFAULT_SFX_VOL = 80;

const FADE_MS = 2500;
const END_FADE_MS = 4000;
const SILENCE_BETWEEN_MS = 800;

import {
  MUSIC_TRACKS,
  SOUND_EFFECTS,
  SOUND_EFFECT_NAMES,
} from "../assets/sounds/audioRegistry.js";

const DEFAULT_TRACKS = MUSIC_TRACKS;

const AudioManager = (() => {
  let musicVolume = DEFAULT_MUSIC_VOL;
  let sfxVolume = DEFAULT_SFX_VOL;
  let testEffectIndex = 0;
  
  let tracks = [];
  let currentIndex = 0;

  let bgAudio = null;
  let bgNextTimeout = null;
  let bgEndFadeTimeout = null;

  let isPlaying = false;
  let hasUserInteracted = false;
  let isInitialized = false;
  let lastAudioError = "";

  // Every start or stop operation changes this number.
  // Older asynchronous transitions stop when their ID is no longer current.
  let playbackRunId = 0;

  const subscribers = new Set();
  const activeFadeFrames = new WeakMap();

  const clamp = (value, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));

  const wait = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });

    const shuffleTracks = (trackList) => {
  const shuffled = trackList.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

  const readInt = (key, defaultValue) => {
    try {
      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
        return defaultValue;
      }

      const parsedValue = Number(rawValue);

      if (!Number.isFinite(parsedValue)) {
        return defaultValue;
      }

      return Math.max(0, Math.min(100, Math.floor(parsedValue)));
    } catch {
      return defaultValue;
    }
  };

  const writeInt = (key, value) => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // The game should continue even when localStorage is unavailable.
    }
  };

  const notify = () => {
    subscribers.forEach((subscriber) => {
      try {
        subscriber({
  musicVolume,
  sfxVolume,
  isPlaying,
  currentIndex,
  lastAudioError,
});
      } catch (error) {
        console.warn("[AudioManager] Subscriber error:", error);
      }
    });
  };

  const clearNextTrackTimeout = () => {
    if (bgNextTimeout !== null) {
      clearTimeout(bgNextTimeout);
      bgNextTimeout = null;
    }
  };

  const clearEndFadeTimeout = () => {
  if (bgEndFadeTimeout !== null) {
    clearTimeout(bgEndFadeTimeout);
    bgEndFadeTimeout = null;
  }
};

  const cancelFade = (audio) => {
    if (!audio) {
      return;
    }

    const frameId = activeFadeFrames.get(audio);

    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
      activeFadeFrames.delete(audio);
    }
  };

  /**
   * Fades an audio element between two volume levels.
   *
   * targetVolume may be a number or a function. Using a function allows
   * changes made with the music volume slider to take effect during fade-in.
   */
  const fadeAudio = (
    audio,
    startVolume,
    targetVolume,
    milliseconds = FADE_MS
  ) => {
    if (!audio) {
      return Promise.resolve();
    }

    cancelFade(audio);

    const safeDuration = Math.max(0, Number(milliseconds) || 0);
    const startedAt = performance.now();

    return new Promise((resolve) => {
      const finish = () => {
        activeFadeFrames.delete(audio);
        resolve();
      };

      const tick = (now) => {
        const elapsed = now - startedAt;
        const progress =
          safeDuration === 0 ? 1 : clamp(elapsed / safeDuration, 0, 1);

        const resolvedTarget =
          typeof targetVolume === "function"
            ? targetVolume()
            : targetVolume;

        const safeStart = clamp(startVolume, 0, 1);
        const safeTarget = clamp(resolvedTarget, 0, 1);

        try {
          audio.volume =
            safeStart + (safeTarget - safeStart) * progress;
        } catch {
          finish();
          return;
        }

        if (progress < 1) {
          const frameId = requestAnimationFrame(tick);
          activeFadeFrames.set(audio, frameId);
        } else {
          finish();
        }
      };

      const frameId = requestAnimationFrame(tick);
      activeFadeFrames.set(audio, frameId);
    });
  };

  const fadeOutAndStop = async (audio, milliseconds = FADE_MS) => {
    if (!audio) {
      return;
    }

    const startingVolume =
      typeof audio.volume === "number" ? audio.volume : 1;

    await fadeAudio(audio, startingVolume, 0, milliseconds);

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore browser-specific media cleanup failures.
    }
  };

  const fadeInAndPlay = async (audio, milliseconds = FADE_MS) => {
    if (!audio) {
      return false;
    }

    try {
      audio.volume = 0;

      // Calling play once is sufficient. Calling it again later can create
      // inconsistent behavior in some mobile browsers.
      await audio.play();
    } catch (error) {
      lastAudioError = `${error?.name || "AudioError"}: ${
  error?.message || "Background music could not start."
}`;

console.warn(
  "[AudioManager] Background music play failed:",
  error?.name,
  error?.message,
  error
);

notify();
return false;
    }

    await fadeAudio(
      audio,
      0,
      () => clamp(musicVolume / 100, 0, 1),
      milliseconds
    );

    return true;
  };

  const scheduleNextTrack = (finishedAudio, runId) => {
    if (
      !isPlaying ||
      runId !== playbackRunId ||
      bgAudio !== finishedAudio
    ) {
      return;
    }

    bgAudio = null;

    clearNextTrackTimeout();

    bgNextTimeout = setTimeout(() => {
      bgNextTimeout = null;

      if (!isPlaying || runId !== playbackRunId) {
        return;
      }

      const nextIndex =
        tracks.length > 0
          ? (currentIndex + 1) % tracks.length
          : 0;

      playTrackAt(nextIndex, runId);
    }, SILENCE_BETWEEN_MS);
  };

  const playTrackAt = async (index, runId = playbackRunId) => {
    if (
      !isPlaying ||
      runId !== playbackRunId ||
      tracks.length === 0
    ) {
      return;
    }

    clearNextTrackTimeout();
    clearEndFadeTimeout();

    const normalizedIndex =
      ((Number(index) || 0) % tracks.length + tracks.length) %
      tracks.length;

    const source = tracks[normalizedIndex];

    if (!source) {
      console.warn(
        `[AudioManager] No music source found at index ${normalizedIndex}.`
      );

      isPlaying = false;
      notify();
      return;
    }

    const previousAudio = bgAudio;

    // Remove the previous audio object from active state immediately.
    // This prevents an old onended event from scheduling another track.
    bgAudio = null;

    if (previousAudio) {
      previousAudio.onended = null;

      await fadeOutAndStop(previousAudio, FADE_MS);

      if (!isPlaying || runId !== playbackRunId) {
        return;
      }

      await wait(SILENCE_BETWEEN_MS);

      if (!isPlaying || runId !== playbackRunId) {
        return;
      }
    }

    const newAudio = new Audio(source);

    newAudio.loop = false;
    newAudio.preload = "auto";
    newAudio.volume = 0;

    currentIndex = normalizedIndex;
    bgAudio = newAudio;

    newAudio.onloadedmetadata = () => {
  clearEndFadeTimeout();

  if (
    !Number.isFinite(newAudio.duration) ||
    newAudio.duration <= 0
  ) {
    return;
  }

  const fadeDelay = Math.max(
    0,
    newAudio.duration * 1000 - END_FADE_MS
  );

  bgEndFadeTimeout = setTimeout(() => {
    bgEndFadeTimeout = null;

    if (
      !isPlaying ||
      runId !== playbackRunId ||
      bgAudio !== newAudio
    ) {
      return;
    }

    fadeAudio(
      newAudio,
      newAudio.volume,
      0,
      END_FADE_MS
    );
  }, fadeDelay);
};

    newAudio.onended = () => {
      scheduleNextTrack(newAudio, runId);
    };

    newAudio.onerror = () => {
      console.warn(
        `[AudioManager] Failed to load background track at index ${normalizedIndex}.`
      );

      if (bgAudio === newAudio) {
        bgAudio = null;
      }

      if (isPlaying && runId === playbackRunId) {
        scheduleNextTrack(newAudio, runId);
      }
    };

    const startedSuccessfully = await fadeInAndPlay(
      newAudio,
      FADE_MS
    );

    if (!isPlaying || runId !== playbackRunId) {
      cancelFade(newAudio);

      try {
        newAudio.pause();
      } catch {
        // Ignore cleanup failure.
      }

      return;
    }

    if (!startedSuccessfully) {
      if (bgAudio === newAudio) {
        bgAudio = null;
      }

      isPlaying = false;
      notify();
      return;
    }

    notify();
  };

  const startBackgroundMusic = () => {
    if (!tracks.length || isPlaying) {
      return;
    }

    

    isPlaying = true;
    playbackRunId += 1;

    const runId = playbackRunId;

    playTrackAt(currentIndex, runId);
    notify();
  };

  const stopBackgroundMusic = async () => {
    isPlaying = false;
    playbackRunId += 1;

    clearNextTrackTimeout();
    clearEndFadeTimeout();

    const audioToStop = bgAudio;
    bgAudio = null;

    if (audioToStop) {
      audioToStop.onended = null;
      audioToStop.onerror = null;

      await fadeOutAndStop(audioToStop, FADE_MS);
    }

    currentIndex = 0;
    notify();
  };

  const onFirstInteraction = () => {
    if (hasUserInteracted) {
      return;
    }

    hasUserInteracted = true;

    // Background music begins from the later click event.
    // Mobile browsers may reject playback during pointerdown.

window.removeEventListener(
  "keydown",
  onFirstInteraction,
  true
);

window.removeEventListener(
  "click",
  onFirstInteraction,
  true
);

    startBackgroundMusic();
  };

  const init = (options = {}) => {
    musicVolume = readInt(
      MUSIC_VOLUME_KEY,
      DEFAULT_MUSIC_VOL
    );

    sfxVolume = readInt(
      SFX_VOLUME_KEY,
      DEFAULT_SFX_VOL
    );

    const availableTracks =
  Array.isArray(options.tracks) && options.tracks.length
    ? options.tracks.filter(Boolean)
    : DEFAULT_TRACKS.slice();

tracks = shuffleTracks(availableTracks);
currentIndex = 0;

    if (!isInitialized) {
      window.addEventListener(
  "pointerdown",
  onFirstInteraction,
  {
    passive: true,
    capture: true,
  }
);

window.addEventListener(
  "keydown",
  onFirstInteraction,
  {
    passive: true,
    capture: true,
  }
);

window.addEventListener(
  "click",
  onFirstInteraction,
  {
    passive: true,
    capture: true,
  }
);

      isInitialized = true;
    }

    notify();
  };

const playEffect = (name) => {
  const source = SOUND_EFFECTS[name];

  if (!source) {
    console.warn(
      `[AudioManager] Unknown sound effect: ${name}`
    );
    return null;
  }

  return playSound(source, "sfx");
};

const playNextTestEffect = () => {
  if (!SOUND_EFFECT_NAMES.length) {
    console.warn("[AudioManager] No sound effects are registered.");
    return null;
  }

  if (testEffectIndex >= SOUND_EFFECT_NAMES.length) {
    testEffectIndex = 0;
  }

  const effectName = SOUND_EFFECT_NAMES[testEffectIndex];

  testEffectIndex =
    (testEffectIndex + 1) % SOUND_EFFECT_NAMES.length;

  playEffect(effectName);

  return effectName;
};

  const playSound = (source, type = "sfx") => {
    if (!source) {
      return null;
    }

    try {
      const audio = new Audio(source);

      const selectedVolume =
        type === "music" ? musicVolume : sfxVolume;

      audio.volume = clamp(selectedVolume / 100, 0, 1);
      audio.preload = "auto";

      audio.play().catch((error) => {
        console.warn(
          "[AudioManager] Sound effect play failed:",
          error
        );
      });

      return audio;
    } catch (error) {
      console.warn("[AudioManager] playSound error:", error);
      return null;
    }
  };

  const setMusicVolume = (value) => {
    const numericValue = Number(value);

    musicVolume = Number.isFinite(numericValue)
      ? Math.max(0, Math.min(100, Math.floor(numericValue)))
      : 0;

    writeInt(MUSIC_VOLUME_KEY, musicVolume);

    if (bgAudio) {
      try {
        bgAudio.volume = clamp(musicVolume / 100, 0, 1);
      } catch {
        // Ignore unsupported media volume behavior.
      }
    }

    notify();
    return musicVolume;
  };

  const setSfxVolume = (value) => {
    const numericValue = Number(value);

    sfxVolume = Number.isFinite(numericValue)
      ? Math.max(0, Math.min(100, Math.floor(numericValue)))
      : 0;

    writeInt(SFX_VOLUME_KEY, sfxVolume);

    notify();
    return sfxVolume;
  };

  const setTracks = (newTracks) => {
    if (!Array.isArray(newTracks)) {
      return;
    }

    tracks = newTracks.filter(Boolean);

    if (currentIndex >= tracks.length) {
      currentIndex = 0;
    }

    notify();
  };

  const subscribe = (subscriber) => {
    if (typeof subscriber !== "function") {
      return () => {};
    }

    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  return {
    init,
    startBackgroundMusic,
    stopBackgroundMusic,
    playSound,
    playEffect,
    playNextTestEffect,

    setMusicVolume,
    setSfxVolume,

    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,

    isPlaying: () => isPlaying,
    getLastAudioError: () => lastAudioError,

    subscribe,

    setTracks,
    getTracks: () => tracks.slice(),
  };
})();

export default AudioManager;