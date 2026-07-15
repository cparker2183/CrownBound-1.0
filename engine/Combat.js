// src/engine/Combat.js

// Generate an enemy based on player level
export function generateEnemy(player) {
  return {
    name: "Goblin",
    health: 10 + player.level * 2,
    attack: 2 + player.level,
    defense: 1 + Math.floor(player.level / 2),
    xpReward: 5 + player.level * 2,
    goldReward: 3 + player.level,
  };
}

export function fightEnemy(player) {
  const enemy = generateEnemy(player);
  let playerHp = player.health;
  let enemyHp = enemy.health;

  // Calculate player stats
  const playerAttack = player.level + (player.weapon?.damageBonus || 0);
  const playerDefense = Math.floor(player.level / 2) + (player.armor?.defenseBonus || 0);

  // Turn-based loop
  while (playerHp > 0 && enemyHp > 0) {
    // Player attacks
    const playerDamage = Math.max(1, playerAttack - enemy.defense);
    enemyHp -= playerDamage;

    if (enemyHp <= 0) break;

    // Enemy attacks
    const enemyDamage = Math.max(1, enemy.attack - playerDefense);
    playerHp -= enemyDamage;
  }

  if (playerHp > 0) {
    // Player wins
    const updatedPlayer = {
      ...player,
      health: playerHp,
      xp: player.xp + enemy.xpReward,
      gold: player.gold + enemy.goldReward,
    };

    return {
      updatedPlayer,
      message: `🏆 You defeated a ${enemy.name}! +${enemy.xpReward} XP, +${enemy.goldReward} gold.`,
    };
  } else {
    // Player loses
    const updatedPlayer = {
      ...player,
      health: Math.floor(player.maxHealth / 2), // revive at half HP
      gold: Math.max(0, player.gold - 5),
    };

    return {
      updatedPlayer,
      message: `💀 You were defeated by a ${enemy.name}. You revive at half HP and lost some gold.`,
    };
  }
}
