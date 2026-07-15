// src/engine/Progression.js

export function explore(player) {
  const roll = Math.random();

  if (roll < 0.3) {
    // Found gold
    const goldFound = 5 + Math.floor(Math.random() * 10);
    const updatedPlayer = { ...player, gold: player.gold + goldFound };

    return {
      updatedPlayer,
      message: `💰 You found ${goldFound} gold while exploring!`,
    };
  } else if (roll < 0.6) {
    // Found XP
    const xpFound = 5 + Math.floor(Math.random() * 8);
    const updatedPlayer = { ...player, xp: player.xp + xpFound };

    return {
      updatedPlayer,
      message: `⭐ You gained ${xpFound} XP from a discovery!`,
    };
  } else {
    // Nothing
    return {
      updatedPlayer: player,
      message: "🗺️ You explored but found nothing of interest.",
    };
  }
}

export function rest(player) {
  const heal = Math.floor(player.maxHp * 0.25);
  const updatedPlayer = {
    ...player,
    hp: Math.min(player.maxHp, player.hp + heal),
  };

  return {
    updatedPlayer,
    message: `🛌 You rest and recover ${heal} HP.`,
  };
}
