// engine/Utils.js
import { Animated, Easing } from "react-native-web";

/**
 * Utility functions used across engine modules
 */
export const clampNumber = (value, min = 0) => Math.max(Number.isFinite(Number(value)) ? Number(value) : 0, min);

export const animateStat = (anim, newValue, duration = 500) => {
  try {
    Animated.timing(anim, { toValue: newValue, duration, useNativeDriver: false, easing: Easing.linear }).start();
  } catch (e) {
    // environment may not have Animated in tests — safe fallback
    // console.warn kept for debugging
    console.warn("animateStat failed (fallback)", e && e.message ? e.message : e);
  }
};

export default {
  clampNumber,
  animateStat,
};
