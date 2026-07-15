// src/engine/Persistence.js

export const STORAGE_KEY = "crownbound_save_v1";

export const saveToLocal = (player, quests, achievements, storyEvents) => {
  try {
    const payload = { player, quests, achievements, storyEvents };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn("Save failed:", e);
    return false;
  }
};

export const loadFromLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Load failed:", e);
    return null;
  }
};
