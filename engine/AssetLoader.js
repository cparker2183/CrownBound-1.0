// src/engine/AssetLoader.js
import { Platform } from "./RNCompat";

/**
 * Cross-platform asset resolver.
 * On web -> returns bundled URL (Parcel / Vite)
 * On native -> returns require() reference for React Native bundler
 */
export function loadAsset(path) {
  if (Platform.OS === "web") {
    // Web: dynamic import gives us the processed asset URL
    return import(`../assets/${path}`).then((mod) => mod.default || mod);
  } else {
    // Native (Expo): require must be static at build-time
    // so we handle common folders manually
    return Promise.resolve(require(`../assets/${path}`));
  }
}
