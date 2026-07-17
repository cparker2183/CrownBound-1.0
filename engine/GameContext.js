// src/engine/GameContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "./RNCompat.js";
import { showRewardedAd, Banner } from "./Ads";
import AudioManager from "./AudioManager.js";
import {
  loadAccount,
  saveAccount,
} from "./Account.js";

// --------------------------------------------------------------------
// GameContext: central game state, actions, save/load, economy, ads, etc.
// Music/audio responsibilities moved to AudioManager.
// --------------------------------------------------------------------

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

// -------------------- Configuration/constants --------------------
const STORAGE_KEY = "crownbound_player_v1_snapshot_v2";
const DEFAULT_SAVE_INTERVAL_MS = 5000;

const DAILY_USD_LIMIT = 2.0; // daily payout cap (simulation)
const CROWN_TO_USD = 0.10; // conversion rate for simulation: 1 Crown = $0.10
const MAX_CROWNS_FROM_ADS_PER_DAY = 5; // crowns via ads per day
const MAX_AD_REWARDS_PER_DAY = 5; // limits non-crown ad rewards
const MAX_INVENTORY = 100;
const createStartingPlayer = (name = "Hero") => ({
  name: String(name).trim() || "Hero",
  level: 1,
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpToNextLevel: 100,
  gold: 10,
  crowns: 0,
});

// -------------------- Utilities --------------------
const now = () => Date.now();
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const startOfDayTs = (t = Date.now()) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Load/save snapshot helpers
const loadSavedSnapshot = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse saved snapshot:", e);
    return null;
  }
};

const saveSnapshotToStorage = (snapshot) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn("Failed to save snapshot:", e);
  }
};

// Normalization for player object to avoid NaN/invalid numbers
const normalizePlayer = (p) => {
  if (!p || typeof p !== "object") {
  return createStartingPlayer();
}
  return {
    name: p.name || "Hero",
    level: Number.isFinite(p.level) ? Math.max(1, Math.floor(p.level)) : 1,
    hp: Math.max(0, Number.isFinite(p.hp) ? Math.floor(p.hp) : 100),
    maxHp: Math.max(1, Number.isFinite(p.maxHp) ? Math.floor(p.maxHp) : 100),
    xp: Number.isFinite(p.xp) ? Math.floor(p.xp) : 0,
    xpToNextLevel: Math.max(10, Number.isFinite(p.xpToNextLevel) ? Math.floor(p.xpToNextLevel) : 100),
    gold: Number.isFinite(p.gold) ? Math.floor(p.gold) : 0,
    crowns: Number.isFinite(p.crowns) ? Math.floor(p.crowns) : 0,
    // keep other fields
    ...Object.keys(p).reduce((acc, k) => {
      if (!["name","level","hp","maxHp","xp","xpToNextLevel","gold","crowns"].includes(k)) {
        acc[k] = p[k];
      }
      return acc;
    }, {}),
  };
};

// -------------------- Provider --------------------
export const GameProvider = ({ children }) => {
  // Initialize AudioManager ASAP
  const audioInitialized = useRef(false);

  if (!audioInitialized.current) {
    AudioManager.init();
    audioInitialized.current = true;
  }

  // Load character and account data.
  const saved = loadSavedSnapshot();
  const savedAccount = loadAccount();

  const [account, setAccount] = useState(savedAccount);

  const [hasCharacter, setHasCharacter] = useState(
    Boolean(saved?.player?.name)
  );

  const isResettingRef = useRef(false);

  // Core states
  const [player, setPlayerRaw] = useState(normalizePlayer(saved?.player));
  const [inventory, setInventory] = useState(Array.isArray(saved?.inventory) ? saved.inventory : []);
  const [equipment, setEquipment] = useState(saved?.equipment || { weapon: null, armor: null, head: null, body: null, boots: null });

  // UI/logging
  const [activityLog, setActivityLog] = useState(Array.isArray(saved?.activityLog) ? saved.activityLog : []);
  const [floatingText, setFloatingText] = useState([]);
  const [potionEffect, setPotionEffect] = useState(saved?.potionEffect || null);

  // Crowns & ad accounting (daily counters)
  const [crownsConvertedToday, setCrownsConvertedToday] = useState(Number.isFinite(saved?.crownsConvertedToday) ? saved.crownsConvertedToday : 0);
  const [crownsFromAdsToday, setCrownsFromAdsToday] = useState(Number.isFinite(saved?.crownsFromAdsToday) ? saved.crownsFromAdsToday : 0);
  const [dailyResetTs, setDailyResetTs] = useState(Number.isFinite(saved?.dailyResetTs) ? saved.dailyResetTs : startOfDayTs());
  const [adsWatchedToday, setAdsWatchedToday] = useState(Number.isFinite(saved?.adsWatchedToday) ? saved.adsWatchedToday : 0);

  // audio-related: delegate to AudioManager (volumes persist in AudioManager)
  const [musicVolume, setMusicVolumeLocal] = useState(AudioManager.getMusicVolume ? AudioManager.getMusicVolume() : 80);
  const [sfxVolume, setSfxVolumeLocal] = useState(AudioManager.getSfxVolume ? AudioManager.getSfxVolume() : 80);

  // subscribe to AudioManager changes (keeps UI in sync)
  useEffect(() => {
    const unsub = AudioManager.subscribe
      ? AudioManager.subscribe(({ musicVolume: mv, sfxVolume: sv }) => {
          setMusicVolumeLocal(mv);
          setSfxVolumeLocal(sv);
        })
      : () => {};
    return () => unsub();
  }, []);

  // ---------- helper to set player safely with normalization ----------
  // Accept either object or functional update.
  const setPlayer = (update) => {
    setPlayerRaw((prev) => {
      const incoming = typeof update === "function" ? update(prev) : update;
      return normalizePlayer(incoming);
    });
  };

    // ---------- auto-save character snapshot periodically ----------
  useEffect(() => {
    const handler = setInterval(() => {
      if (!hasCharacter || isResettingRef.current) {
        return;
      }

      try {
        const snapshot = {
          player,
          inventory,
          equipment,
          activityLog,
          potionEffect,
          crownsConvertedToday,
          crownsFromAdsToday,
          dailyResetTs,
          adsWatchedToday,
          musicVolume: AudioManager.getMusicVolume
            ? AudioManager.getMusicVolume()
            : musicVolume,
          sfxVolume: AudioManager.getSfxVolume
            ? AudioManager.getSfxVolume()
            : sfxVolume,
          musicTrackIndex: 0,
          hasCharacter,
        };

        saveSnapshotToStorage(snapshot);
      } catch (error) {
        console.warn("Periodic character save failed:", error);
      }
    }, DEFAULT_SAVE_INTERVAL_MS);

    return () => clearInterval(handler);
  }, [
    hasCharacter,
    player,
    inventory,
    equipment,
    activityLog,
    potionEffect,
    crownsConvertedToday,
    crownsFromAdsToday,
    dailyResetTs,
    adsWatchedToday,
    musicVolume,
    sfxVolume,
  ]);

  // Save account independently whenever permanent account data changes.
  useEffect(() => {
    saveAccount(account);
  }, [account]);

  // Save the current character snapshot before closing or refreshing.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (!hasCharacter || isResettingRef.current) {
        return;
      }

      try {
        const snapshot = {
          player,
          inventory,
          equipment,
          activityLog,
          potionEffect,
          crownsConvertedToday,
          crownsFromAdsToday,
          dailyResetTs,
          adsWatchedToday,
          musicVolume: AudioManager.getMusicVolume
            ? AudioManager.getMusicVolume()
            : musicVolume,
          sfxVolume: AudioManager.getSfxVolume
            ? AudioManager.getSfxVolume()
            : sfxVolume,
          musicTrackIndex: 0,
          hasCharacter,
        };

        saveSnapshotToStorage(snapshot);
      } catch (error) {
        console.warn("Final character save failed:", error);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [
    hasCharacter,
    player,
    inventory,
    equipment,
    activityLog,
    potionEffect,
    crownsConvertedToday,
    crownsFromAdsToday,
    dailyResetTs,
    adsWatchedToday,
    musicVolume,
    sfxVolume,
  ]);
  
  const addToLog = (message, notable = false) => {
    if (!message) return;
    const entry = { text: String(message), timestamp: now(), notable: !!notable };
    // newest-first
    setActivityLog((prev) => [entry, ...prev].slice(0, 500));
  };

  const addNotableLog = (type, message) => {
    if (!message) return;
    const entry = { text: String(message), type, notable: true, timestamp: now() };
    setActivityLog((prev) => [entry, ...prev].slice(0, 500));
  };

  // ---------- floating text ----------
  const addFloatingText = (msg, explicitType = "default") => {
    if (!msg) return;
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingText((prev) => [...prev, { id, text: String(msg), type: explicitType }]);
    // remove after animation time
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((f) => f.id !== id));
    }, 1800);
  };

  // ---------- audio wrappers that delegate to AudioManager ----------
  const playSound = (src, type = "sfx") => {
    try {
      return AudioManager.playSound(src, type);
    } catch (e) {
      console.warn("playSound wrapper error:", e);
      return null;
    }
  };

  const playEffect = (name) => {
  try {
    return AudioManager.playEffect(name);
  } catch (error) {
    console.warn("playEffect wrapper error:", error);
    return null;
  }
};

  const playNextTestEffect = () => {
  try {
    return AudioManager.playNextTestEffect();
  } catch (error) {
    console.warn("playNextTestEffect wrapper error:", error);
    return null;
  }
};

  const startBackgroundMusic = () => {
    try {
      AudioManager.startBackgroundMusic();
    } catch (e) {
      console.warn("startBackgroundMusic error:", e);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      await AudioManager.stopBackgroundMusic();
    } catch (e) {
      console.warn("stopBackgroundMusic error:", e);
    }
  };

  const setMusicVolume = (v) => {
    const nv = AudioManager.setMusicVolume ? AudioManager.setMusicVolume(v) : v;
    setMusicVolumeLocal(nv);
    return nv;
  };

  const setSfxVolume = (v) => {
    const nv = AudioManager.setSfxVolume ? AudioManager.setSfxVolume(v) : v;
    setSfxVolumeLocal(nv);
    return nv;
  };

  // ---------- wrapper to safely show rewarded ad ----------
  const showAdAndReward = async () => {
    try {
      await stopBackgroundMusic();
      await showRewardedAd(() => {
        watchAdReward(); // grant in-game reward
      });
    } catch (e) {
      console.warn("Ad failed:", e);
      if (Platform.OS === "web") {
        watchAdReward();
      }
    } finally {
      startBackgroundMusic();
    }
  };

  // ---------- daily reset helper ----------
  const ensureDailyReset = () => {
    const today = startOfDayTs();
    if ((dailyResetTs || 0) < today) {
      setDailyResetTs(today);
      setCrownsConvertedToday(0);
      setCrownsFromAdsToday(0);
      setAdsWatchedToday(0);
      addToLog("🔁 Daily reset applied.");
    }
  };

  // ---------- item generation (scales with level) ----------
  const generateScaledItem = (levelBias = 0) => {
    const lvl = Math.max(1, player?.level || 1) + (Number.isFinite(levelBias) ? levelBias : 0);
    const base = 1 + Math.floor(lvl * 0.5);
    const dmg = base + Math.floor(Math.random() * 3); // 0..2 extra
    const def = base + Math.floor(Math.random() * 3);
    const rarityRoll = Math.random();

    if (rarityRoll > 0.995) {
      return { name: `Legendary Blade +${dmg}`, type: "weapon", damageBonus: dmg + 3, rarity: "legendary", crowns: 3, special: true };
    }
    if (rarityRoll > 0.95) {
      return { name: `Rare Sword +${dmg}`, type: "weapon", damageBonus: dmg + 1, rarity: "rare" };
    }

    const pool = [
      { name: `Sword +${dmg}`, type: "weapon", damageBonus: dmg, rarity: "common" },
      { name: `Armor +${def}`, type: "armor", defenseBonus: def, rarity: "common" },
      { name: "Health Potion", type: "potion", heal: Math.min(200, 25 + Math.floor(lvl * 2)), rarity: "common" },
      { name: "Golden Potion", type: "potion", effect: "golden", rarity: "rare" },
      { name: "Lucky Ring", type: "accessory", crowns: 1, rarity: "uncommon" },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // ---------- Auto-equip ----------
  const tryAutoEquip = (item) => {
    if (!item || !item.type) return false;
    const slot = item.type === "weapon" ? "weapon" : item.type === "armor" ? "armor" : null;
    if (!slot) return false;

    let equipped = false;
    setEquipment((prevEquip) => {
      const updated = { ...prevEquip };
      const current = prevEquip[slot];
      let shouldEquip = false;

      if (!current) shouldEquip = true;
      else if ((item.damageBonus || 0) > (current.damageBonus || 0)) shouldEquip = true;
      else if ((item.defenseBonus || 0) > (current.defenseBonus || 0)) shouldEquip = true;

      if (shouldEquip) {
        // remove item from inventory (if present), swap old equip into inventory (if room)
        setInventory((prevInv) => {
          const clone = [...prevInv];
          const idx = clone.findIndex((i) => i === item || (i && i.name === item.name && i.damageBonus === item.damageBonus));
          if (idx > -1) clone.splice(idx, 1);
          if (current) {
            if (clone.length < MAX_INVENTORY) clone.push(current);
            else addToLog("⚠️ Inventory full — old equipment dropped when auto-equipping.");
          }
          return clone;
        });

        updated[slot] = item;
        addToLog(`🛠 Auto-equipped ${item.name} in ${slot}.`);
        addFloatingText(`Equipped ${item.name}`, "equip");
        try { playEffect("equip"); } catch (e) {}
        equipped = true;
      }

      return updated;
    });

    return equipped;
  };

  // ---------- potions helpers ----------
  const countPotionsByName = (name) => {
    return inventory.filter((i) => i?.type === "potion" && i?.name === name).length;
  };

  const useFirstPotionByName = (name) => {
    const idx = inventory.findIndex((i) => i?.type === "potion" && i?.name === name);
    if (idx === -1) {
      addToLog(`No ${name} left.`);
      addFloatingText("No potions!", "error");
      try { playEffect("error"); } catch (e) {}
      return false;
    }
    usePotion(idx);
    return true;
  };

  // ---------- crowns & economy ----------
  const addCrowns = (amount, note = "gameplay") => {
    if (!amount || amount <= 0) return 0;
    const delta = Math.floor(amount);
    setPlayer((p) => normalizePlayer({ ...p, crowns: (p.crowns || 0) + delta }));
    addToLog(`👑 +${delta} Crown(s) (${note}).`, true);
    addFloatingText(`+${delta} Crown`, "gold");
    return delta;
  };

  // awarding crowns with ad-specific caps
  const awardCrowns = (amount, source = "gameplay") => {
    ensureDailyReset();
    if (!amount || amount <= 0) return 0;
    if (source === "ads") {
      const remaining = Math.max(0, MAX_CROWNS_FROM_ADS_PER_DAY - (crownsFromAdsToday || 0));
      const toGive = Math.min(amount, remaining);
      if (toGive <= 0) {
        addToLog("⚠️ Crown-from-ad limit reached for today.");
        return 0;
      }
      setCrownsFromAdsToday((n) => (n || 0) + toGive);
      return addCrowns(toGive, "ads");
    }
    return addCrowns(amount, source);
  };

  // convert crowns to USD (simulation) - enforces daily USD cap
  const convertCrownsToUsd = (crownsRequested) => {
    ensureDailyReset();
    const dailyCrownsCap = Math.floor(DAILY_USD_LIMIT / CROWN_TO_USD);
    const remainingConvertible = Math.max(0, dailyCrownsCap - (crownsConvertedToday || 0));
    if (remainingConvertible <= 0) {
      return { success: false, converted: 0, usd: 0, message: "Daily payout limit reached." };
    }
    const available = player.crowns || 0;
    const toConvert = Math.min(Math.floor(crownsRequested || 0), available, remainingConvertible);
    if (toConvert <= 0) {
      return { success: false, converted: 0, usd: 0, message: "Insufficient crowns or daily cap." };
    }

    setPlayer((p) => normalizePlayer({ ...p, crowns: Math.max(0, (p.crowns || 0) - toConvert) }));
    setCrownsConvertedToday((n) => (n || 0) + toConvert);
    const usd = toConvert * CROWN_TO_USD;
    addNotableLog("CROWN_CONVERT", `Converted ${toConvert} Crowns into $${usd.toFixed(2)} (simulation)`);
    addFloatingText(`Converted ${toConvert} → $${usd.toFixed(2)}`, "gold");
    try { playEffect("coin"); } catch (e) {}
    return { success: true, converted: toConvert, usd, message: "Converted." };
  };

  // ---------- Ads / rewarded flow ----------
  // watchAdReward: gives xp/gold/items with probabilities; rare chance for crowns (capped)
  const watchAdReward = () => {
    ensureDailyReset();
    setAdsWatchedToday((n) => Math.min(MAX_AD_REWARDS_PER_DAY, (n || 0) + 1));
    const r = Math.random();
    if (r < 0.4) {
      // XP
      const xp = Math.floor(Math.random() * 8) + 2;
      setPlayer((p) => normalizePlayer({ ...p, xp: (p.xp || 0) + xp }));
      addToLog(`📺 Watched ad — +${xp} XP`);
      addFloatingText(`+${xp} XP`, "xp");
      // try { playSound("/sounds/xp.mp3", "sfx"); } catch (e) {}
      return { type: "xp", amount: xp };
    }
    if (r < 0.75) {
      // gold
      const g = Math.floor(Math.random() * 12) + 2;
      setPlayer((p) => normalizePlayer({ ...p, gold: (p.gold || 0) + g }));
      addToLog(`📺 Watched ad — +${g} gold`);
      addFloatingText(`+${g} G`, "gold");
      try { playEffect("coin"); } catch (e) {}
      return { type: "gold", amount: g };
    }
    if (r < 0.95) {
      // item
      const item = generateScaledItem(0);
      setInventory((prev) => {
        if (prev.length >= MAX_INVENTORY) {
          addToLog("⚠️ Inventory full — new item lost.");
          return prev;
        }
        return [...prev, item];
      });
      addToLog(`📺 Watched ad — found item: ${item.name}`);
      addFloatingText(`+Item: ${item.name}`, "item");
      tryAutoEquip(item);
      // try { playSound("/sounds/item_found.mp3", "sfx"); } catch (e) {}
      return { type: "item", item };
    }
    // rare crown
    const given = awardCrowns(1, "ads");
    if (given > 0) {
      addFloatingText(`+${given} Crown`, "gold");
      // try { playSound("/sounds/crown.mp3", "sfx"); } catch (e) {}
      return { type: "crown", amount: given };
    } else {
      addToLog("📺 Watched ad — no more crowns available today.");
      return { type: "none" };
    }
  };

  // ---------- Leveling ----------
  const applyLevelUpIfNeeded = (p) => {
    let next = normalizePlayer(p);
    let leveled = false;
    while (next.xp >= next.xpToNextLevel) {
      next.xp -= next.xpToNextLevel;
      next.level += 1;
      next.xpToNextLevel = Math.max(10, Math.floor(next.xpToNextLevel * 1.5));
      next.maxHp += 20;
      next.hp = next.maxHp; // heal to full on level up
      addCrowns(1, "levelup"); // award 1 crown on level up
      addNotableLog("LEVEL_UP", `${next.name} reached Level ${next.level}!`);
      leveled = true;
    }
    if (leveled) {
      addFloatingText("LEVEL UP!", "level");
      try { playEffect("levelUp"); } catch (e) {}
    }
    return normalizePlayer(next);
  };

  // ---------- Combat & Actions ----------
  const getPlayerAttack = (p) => {
    const base = 3;
    return base + (equipment?.weapon?.damageBonus || 0) + (p?.level ? Math.floor(p.level / 4) : 0);
  };

  const getPlayerDefense = () => {
    return equipment?.armor?.defenseBonus || 0;
  };

  const fight = () => {
    if ((player.hp || 0) <= 0) {
      addToLog("❌ Too weak to fight!");
      addFloatingText("Too Weak!", "error");
      try { playEffect("error"); } catch (e) {}
      return;
    }

    const playerAttack = getPlayerAttack(player);
    const enemyDamage = Math.floor(Math.random() * (6 + player.level)) + 2;
    const damageTaken = Math.max(0, enemyDamage - getPlayerDefense());
    const goldFound = Math.floor(Math.random() * (8 + player.level)) + 1;
    const xpGained = Math.floor(Math.random() * (10 + player.level)) + 5 + Math.floor(playerAttack / 2);

    const previousHp = player.hp || 0;
const nextHp = Math.max(0, previousHp - damageTaken);
const wasKnockedOut = previousHp > 0 && nextHp === 0;

setPlayer((prev) => {
  const updated = normalizePlayer({
    ...prev,
    hp: nextHp,
    gold: (prev.gold || 0) + goldFound,
    xp: (prev.xp || 0) + xpGained,
  });

  return applyLevelUpIfNeeded(updated);
});

addToLog(
  `⚔️ Fought — -${damageTaken} HP, +${xpGained} XP, +${goldFound} gold.`
);

addFloatingText(`-${damageTaken} HP`, "damage");
addFloatingText(`+${xpGained} XP`, "xp");
addFloatingText(`+${goldFound} G`, "gold");

if (wasKnockedOut) {
  addToLog("💀 You were knocked out in battle!");
  addFloatingText("KO!", "damage");
  playEffect("ko");
} else {
  playEffect("hit");
}

    // boss chance (rare)
    if (Math.random() < 0.05) {
      const bossCrowns = 2 + Math.floor(Math.random() * 2);
      addCrowns(bossCrowns, "boss");
      addNotableLog("BOSS_DEFEAT", `${player.name} defeated a fearsome boss! +${bossCrowns} Crowns`);
      addFloatingText(`Boss Defeated!`, "level");
      try { playEffect("boss"); } catch (e) {}
    }

    // drop chance
    if (Math.random() < 0.3) {
      const item = generateScaledItem(0);
      setInventory((prev) => {
        if (prev.length >= MAX_INVENTORY) {
          addToLog("⚠️ Inventory full — new item lost.");
          return prev;
        }
        return [...prev, item];
      });
      addToLog(`🎁 Loot: ${item.name}`);
      addFloatingText(`+Item: ${item.name}`, "item");
      tryAutoEquip(item);
    }
  };

  const rest = () => {
    const cost = Math.max(5, Math.floor(player.level * 2 + 5));
    const healAmount = Math.max(1, Math.floor(player.maxHp * 0.25) + Math.floor(player.level * 1.5));
    if ((player.gold || 0) < cost) {
      addToLog(`❌ Not enough gold to rest (${cost}g).`);
      addFloatingText("Need more gold!", "error");
      try { playEffect("error"); } catch (e) {}
      return;
    }
    setPlayer((prev) => {
      const newHp = Math.min(prev.maxHp, (prev.hp || 0) + healAmount);
      addToLog(`🛌 Rested and recovered ${newHp - prev.hp} HP (cost ${cost}g).`);
      addFloatingText(`+${newHp - prev.hp} HP`, "heal");
      try { playEffect("rest"); } catch (e) {}
      return normalizePlayer({ ...prev, hp: newHp, gold: prev.gold - cost });
    });
  };

  const explore = () => {
    if ((player.hp || 0) <= 0) {
      addToLog("❌ Too weak to explore!");
      addFloatingText("Too Weak!", "error");
      try { playEffect("error"); } catch (e) {}
      return;
    }

    // mishap chance
    if (Math.random() < 0.1) {
      setPlayer((prev) => {
        addToLog("💀 Exploration mishap! You were knocked out!");
        addFloatingText("KO!", "damage");
        try { playEffect("ko"); } catch (e) {}
        return normalizePlayer({ ...prev, hp: 0 });
      });
      return;
    }

    const foundGold = Math.random() < 0.5 ? Math.floor(Math.random() * (10 + player.level)) + 1 : 0;
    const xpFound = Math.random() < 0.75 ? Math.floor(Math.random() * (6 + player.level)) + 1 : 0;

    setPlayer((prev) => {
      const updated = normalizePlayer({ ...prev, gold: (prev.gold || 0) + foundGold, xp: (prev.xp || 0) + xpFound });
      if (foundGold > 0) {
        addToLog(`🌍 Explored and found ${foundGold} gold!`);
        addFloatingText(`+${foundGold} G`, "gold");
      }
      if (xpFound > 0) {
        addToLog(`🌍 Exploration gained ${xpFound} XP.`);
        addFloatingText(`+${xpFound} XP`, "xp");
      }
      try { playEffect("explore"); } catch (e) {}
      return applyLevelUpIfNeeded(updated);
    });

    // item drop chance
    if (Math.random() < 0.3) {
      const item = generateScaledItem(0);
      setInventory((prev) => {
        if (prev.length >= MAX_INVENTORY) {
          addToLog("⚠️ Inventory full — new item lost.");
          return prev;
        }
        return [...prev, item];
      });
      addToLog(`🎁 Exploration found: ${item.name}`);
      addFloatingText(`+Item: ${item.name}`, "item");
      tryAutoEquip(item);
    }
  };

  // ---------- Inventory actions ----------
  const addItem = (item) => {
    if (!item) return false;
    let wasAdded = false;
    setInventory((prev) => {
      if (prev.length >= MAX_INVENTORY) {
        addToLog("⚠️ Inventory full — item lost.");
        return prev;
      }
      wasAdded = true;
      return [...prev, item];
    });
    if (wasAdded) {
      addToLog(`🎁 Added ${item.name} to inventory.`);
      addFloatingText(`+Item: ${item.name}`, "item");
      tryAutoEquip(item);
      if (item.crowns) awardCrowns(item.crowns, "special_drop");
    }
    return wasAdded;
  };

  const usePotion = (index) => {
    setInventory((prev) => {
      const inv = [...prev];
      if (index < 0 || index >= inv.length) return prev;
      const item = inv.splice(index, 1)[0];
      if (!item) return prev;

      if (item.heal) {
        setPlayer((p) => {
          const healed = Math.min(p.maxHp, (p.hp || 0) + item.heal);
          addToLog(`🧪 Used ${item.name}, healed ${healed - p.hp} HP.`);
          addFloatingText(`+${healed - p.hp} HP`, "heal");
          try { playEffect("potion"); } catch (e) {}
          return normalizePlayer({ ...p, hp: healed });
        });
      } else if (item.effect === "golden") {
        setPotionEffect("golden");
        playEffect("goldenPotion");
        // golden effect lasts for 30s
        setTimeout(() => setPotionEffect(null), 30000);
        addToLog("✨ Golden Potion used — next item drop chance doubled!");
        addFloatingText("Golden Luck!", "buff");
      } else {
        addToLog(`🧪 Used ${item.name}.`);
      }
      return inv;
    });
  };

  const sellItem = (index) => {
    setInventory((prev) => {
      const inv = [...prev];
      if (index < 0 || index >= inv.length) return inv;
      const item = inv.splice(index, 1)[0];
      if (!item) return inv;
      const base = Math.floor(Math.random() * 10) + 5;
      const bonus = Math.floor(((item.damageBonus || 0) + (item.defenseBonus || 0)) * 1.5);
      const value = base + bonus;
      setPlayer((p) => normalizePlayer({ ...p, gold: (p.gold || 0) + value }));
      addToLog(`💰 Sold ${item.name} for ${value} gold.`);
      addFloatingText(`+${value} G`, "gold");
      try { playEffect("coin"); } catch (e) {}
      return inv;
    });
  };

  const equipItem = (item) => {
    if (!item || !item.type) return;
    setInventory((prevInv) => {
      const inv = [...prevInv];
      const idx = inv.findIndex((i) => i === item || (i && item && i.name === item.name && i.damageBonus === item.damageBonus));
      if (idx > -1) inv.splice(idx, 1);

      setEquipment((prevEquip) => {
        const updated = { ...prevEquip };
        let slot = null;
        if (item.type === "weapon") slot = "weapon";
        else if (item.type === "armor") slot = "armor";
        else if (item.type === "head") slot = "head";
        else if (item.type === "body") slot = "body";
        else if (item.type === "boots") slot = "boots";

        if (slot) {
          if (updated[slot]) {
            if (inv.length < MAX_INVENTORY) inv.push(updated[slot]);
            else addToLog("⚠️ Inventory full — previous equipment dropped.");
          }
          updated[slot] = item;
          addToLog(`⚙️ Equipped ${item.name} in ${slot}.`);
          addFloatingText(`Equipped ${item.name}`, "equip");
          try { playEffect("equip"); } catch (e) {}
        } else {
          addToLog(`${item.name} cannot be equipped.`);
        }
        return updated;
      });

      return inv;
    });
  };

// ---------- Character lifecycle ----------

const createCharacter = (characterName) => {
  const cleanName = String(characterName || "").trim();

  if (!cleanName) {
    return {
      success: false,
      error: "Please enter a character name.",
    };
  }

  const newPlayer = createStartingPlayer(cleanName);
  const emptyEquipment = {
    weapon: null,
    armor: null,
    head: null,
    body: null,
    boots: null,
  };

  isResettingRef.current = false;

  setPlayerRaw(newPlayer);
  setInventory([]);
  setEquipment(emptyEquipment);
  setActivityLog([]);
  setFloatingText([]);
  setPotionEffect(null);
  setCrownsConvertedToday(0);
  setCrownsFromAdsToday(0);
  setAdsWatchedToday(0);
  setDailyResetTs(startOfDayTs());
  setHasCharacter(true);

  saveSnapshotToStorage({
    player: newPlayer,
    inventory: [],
    equipment: emptyEquipment,
    activityLog: [],
    potionEffect: null,
    crownsConvertedToday: 0,
    crownsFromAdsToday: 0,
    dailyResetTs: startOfDayTs(),
    adsWatchedToday: 0,
    musicVolume: AudioManager.getMusicVolume
      ? AudioManager.getMusicVolume()
      : musicVolume,
    sfxVolume: AudioManager.getSfxVolume
      ? AudioManager.getSfxVolume()
      : sfxVolume,
    musicTrackIndex: 0,
  });

  return {
    success: true,
    player: newPlayer,
  };
};

const resetCharacter = () => {
  isResettingRef.current = true;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to remove CrownBound save:", error);
  }

  setPlayerRaw(createStartingPlayer());
  setInventory([]);
  setEquipment({
    weapon: null,
    armor: null,
    head: null,
    body: null,
    boots: null,
  });
  setActivityLog([]);
  setFloatingText([]);
  setPotionEffect(null);
  setCrownsConvertedToday(0);
  setCrownsFromAdsToday(0);
  setAdsWatchedToday(0);
  setDailyResetTs(startOfDayTs());
  setHasCharacter(false);

  return true;
};

  // ---------- Quests & events ----------
  const defeatBoss = (bossName) => {
    const crownsAwarded = 2 + Math.floor(Math.random() * 2);
    awardCrowns(crownsAwarded, "boss");
    addNotableLog("BOSS_DEFEAT", `${player.name} defeated boss: ${bossName} (+${crownsAwarded} Crowns)`);
    addFloatingText("Boss defeated!", "level");
    try { playEffect("boss"); } catch (e) {}
  };

  const completeQuest = (questName) => {
    awardCrowns(1, "quest");
    addNotableLog("QUEST_COMPLETE", `${player.name} completed quest: ${questName}`);
    // try { playSound("/sounds/quest_complete.mp3", "sfx"); } catch (e) {}
  };

  // ---------- Exposed context ----------
  const contextValue = {
  // character lifecycle
  hasCharacter,
  createCharacter,
  resetCharacter,
  account,
  setAccount,

  // state
    player,
    setPlayer,
    inventory,
    setInventory,
    equipment,
    setEquipment,
    activityLog,
    floatingText,
    potionEffect,
    

    // actions
    fight,
    rest,
    explore,
    usePotion,
    sellItem,
    addItem,
    equipItem,
    tryAutoEquip,

    // crowns & economy
    addCrowns,
    awardCrowns,
    convertCrownsToUsd,
    watchAdReward,
    crownsConvertedToday,
    crownsFromAdsToday,

    // helpers
    addLog: addToLog,
    addNotableLog,
    addFloatingText,
    countPotionsByName,
    useFirstPotionByName,

    // audio (delegated)
    playSound,
    playEffect,
    playNextTestEffect,
    startBackgroundMusic,
    stopBackgroundMusic,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,

    // events
    defeatBoss,
    completeQuest,

    // constants exposed for UI
    DAILY_USD_LIMIT,
CROWN_TO_USD,
MAX_CROWNS_FROM_ADS_PER_DAY,
MAX_AD_REWARDS_PER_DAY,
MAX_INVENTORY,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export default GameContext;
