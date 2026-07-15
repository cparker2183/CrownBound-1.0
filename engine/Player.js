// src/engine/Player.js
// Player state shape & helpers

export const defaultPlayer = {
  name: "Hero",
  level: 1,
  health: 100,
  maxHealth: 100,
  xp: 0,
  maxXP: 100,
  gold: 50,
  crowns: 0,
  weapon: { name: "Rusty Sword", damageBonus: 0 },
  armor: { name: "Cloth Armor", defenseBonus: 0 },
  inventory: [],
  xpMultiplier: 1,
  goldMultiplier: 1,
  regenPerTurn: 0,
  goldenBuff: false,
  referralCode: "",
  usedReferralCodes: [],
};

const UID_KEY = "crownbound_uid_v1";

export const getOrCreateUID = () => {
  try {
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
      uid = "uid_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(UID_KEY, uid);
    }
    return uid;
  } catch (e) {
    console.warn("getOrCreateUID fallback", e);
    return "uid_local_fallback";
  }
};

export default defaultPlayer;
