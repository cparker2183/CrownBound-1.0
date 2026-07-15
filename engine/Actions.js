// src/engine/Actions.js
// Centralized action handler. Always return { updatedState, message }.
// This file does not depend on React or UI — pure game logic.

import defaultPlayer from "./Player.js";

/* -------------------------
   Helpers & combat logic
   -------------------------*/

// create a simple enemy scaled to player level
function makeEnemy(player) {
  const lvl = Number(player.level ?? 1);
  return {
    name: "Goblin",
    health: 12 + lvl * 3,
    attack: 2 + lvl,
    defense: 1 + Math.floor(lvl / 2),
    xpReward: 6 + lvl * 2,
    goldReward: 3 + Math.floor(lvl * 1.5),
  };
}

// safe numeric helpers
function n(x, fallback = 0) {
  return Number.isFinite(Number(x)) ? Number(x) : fallback;
}

/* -------------------------
   Action implementations
   -------------------------*/

function actionFight(state, payload = {}) {
  const player = { ...state };
  // defensive defaults
  player.health = n(player.health, defaultPlayer.health);
  player.maxHealth = n(player.maxHealth, defaultPlayer.maxHealth);
  player.xp = n(player.xp, defaultPlayer.xp);
  player.maxXP = n(player.maxXP, defaultPlayer.maxXP);
  player.gold = n(player.gold, defaultPlayer.gold);
  player.level = n(player.level, defaultPlayer.level);

  const enemy = makeEnemy(player);

  // compute derived player stats
  const playerAttack = player.level + n(player.weapon?.damageBonus, 0);
  const playerDefense = Math.floor(player.level / 2) + n(player.armor?.defenseBonus, 0);

  let playerHp = player.health;
  let enemyHp = enemy.health;

  // simple turn loop but compute one round only to avoid long loops on web
  // player hits first
  const playerDamage = Math.max(1, playerAttack - enemy.defense);
  enemyHp -= playerDamage;

  let logParts = [];
  logParts.push(`You hit the ${enemy.name} for ${playerDamage} damage.`);

  if (enemyHp > 0) {
    const enemyDamage = Math.max(1, enemy.attack - playerDefense);
    playerHp = Math.max(0, playerHp - enemyDamage);
    logParts.push(`${enemy.name} hits you for ${enemyDamage} damage.`);
  }

  let updated = { ...player };

  if (enemyHp <= 0) {
    // victory
    updated.health = Math.max(0, playerHp);
    updated.xp = player.xp + enemy.xpReward;
    updated.gold = player.gold + enemy.goldReward;
    // level up if xp >= maxXP (simple)
    if (updated.xp >= updated.maxXP) {
      updated.level = updated.level + 1;
      updated.xp = Math.max(0, updated.xp - updated.maxXP);
      updated.maxXP = Math.floor(updated.maxXP * 1.2) + 10;
      updated.maxHealth = Math.floor(updated.maxHealth * 1.08);
      logParts.push(`You leveled up to ${updated.level}!`);
    }
    logParts.unshift(`🏆 You defeated the ${enemy.name}! +${enemy.xpReward} XP, +${enemy.goldReward} gold.`);
  } else if (playerHp <= 0) {
    // defeat: revive at half HP and lose small gold
    updated.health = Math.floor(updated.maxHealth / 2);
    updated.gold = Math.max(0, updated.gold - 5);
    logParts.unshift(`💀 You were defeated by the ${enemy.name}. You revive at half HP and lost 5 gold.`);
  } else {
    // both alive after one exchange
    updated.health = playerHp;
    logParts.unshift(`⚔️ Combat was tense — both still standing.`);
  }

  // ensure numbers are numeric
  updated.health = n(updated.health, defaultPlayer.health);
  updated.maxHealth = n(updated.maxHealth, defaultPlayer.maxHealth);
  updated.xp = n(updated.xp, defaultPlayer.xp);
  updated.maxXP = n(updated.maxXP, defaultPlayer.maxXP);
  updated.gold = n(updated.gold, defaultPlayer.gold);
  updated.level = n(updated.level, defaultPlayer.level);

  return {
    updatedState: updated,
    message: logParts.join(" "),
  };
}

function actionExplore(state, payload = {}) {
  const player = { ...state };
  player.health = n(player.health, defaultPlayer.health);
  player.gold = n(player.gold, defaultPlayer.gold);
  player.xp = n(player.xp, defaultPlayer.xp);

  const roll = Math.random();
  let updated = { ...player };
  let message = "";

  if (roll < 0.3) {
    const goldFound = 5 + Math.floor(Math.random() * 11);
    updated.gold = player.gold + goldFound;
    message = `💰 You explored and found ${goldFound} gold.`;
  } else if (roll < 0.65) {
    const xpFound = 5 + Math.floor(Math.random() * 10);
    updated.xp = player.xp + xpFound;
    message = `⭐ You explored and gained ${xpFound} XP.`;
  } else if (roll < 0.9) {
    // minor damage event
    const dmg = 1 + Math.floor(Math.random() * 4);
    updated.health = Math.max(0, player.health - dmg);
    message = `🕳 You had an accident and took ${dmg} damage while exploring.`;
  } else {
    message = "🗺 You explored but found nothing of note.";
  }

  // bound numbers
  updated.health = Math.min(n(updated.health, player.health), n(updated.maxHealth, defaultPlayer.maxHealth));
  updated.xp = n(updated.xp, player.xp);
  updated.gold = n(updated.gold, player.gold);

  return { updatedState: updated, message };
}

function actionRest(state, payload = {}) {
  const player = { ...state };
  player.health = n(player.health, defaultPlayer.health);
  player.maxHealth = n(player.maxHealth, defaultPlayer.maxHealth);

  const heal = Math.max(1, Math.floor(player.maxHealth * 0.2));
  const updated = { ...player, health: Math.min(player.maxHealth, player.health + heal) };
  const message = `🛌 You rest and recover ${Math.min(heal, updated.health - player.health)} HP.`;

  return { updatedState: updated, message };
}

/* -------------------------
   Public handler
   -------------------------*/

export function handleAction(state, action, payload = {}) {
  // Ensure state exists
  const base = state && typeof state === "object" ? state : { ...defaultPlayer };

  switch ((action || "").toString().toLowerCase()) {
    case "fight":
    case "do_fight":
      return actionFight(base, payload);
    case "explore":
    case "do_explore":
      return actionExplore(base, payload);
    case "rest":
    case "do_rest":
      return actionRest(base, payload);
    default:
      return { updatedState: base, message: `Unknown action: ${action}` };
  }
}
