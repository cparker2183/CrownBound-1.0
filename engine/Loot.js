// engine/Loot.js
/**
 * Loot engine - gear, potions, inventory, equip/sell/use functions
 *
 * Exports:
 *  - setContext(ctx)
 *  - generateGear(boss)
 *  - generatePotion()
 *  - addToInventory(item)
 *  - autoEquipOrStore(item)
 *  - handleLootDrop(boss)
 *  - equipItem(index)
 *  - sellItem(index)
 *  - usePotion(index)
 *
 * Implementation relies on ctx which should be provided via setContext
 * The ctx should provide: getPlayer, setPlayer, createFloatingNumber, clampNumber, animateStat, INVENTORY_LIMIT
 */

let ctx = null;

export function setContext(context) {
  ctx = context || {};
}

// Loot tiers and helpers (verbose)
const defaultLootTiers = [
  { rarity: "Common", bonus: [1, 4], weight: 50 },
  { rarity: "Uncommon", bonus: [4, 8], weight: 30 },
  { rarity: "Rare", bonus: [8, 14], weight: 12 },
  { rarity: "Epic", bonus: [14, 24], weight: 6 },
  { rarity: "Legendary", bonus: [24, 36], weight: 2 },
];

function pickWeighted(arr) {
  const total = arr.reduce((s, r) => s + (r.weight || 1), 0);
  let roll = Math.random() * total;
  for (const r of arr) {
    if (roll < (r.weight || 1)) return r;
    roll -= (r.weight || 1);
  }
  return arr[arr.length - 1];
}

export function generateGear(boss = false) {
  const lootTiers = ctx?.lootTiers || defaultLootTiers;
  const type = Math.random() < 0.5 ? "weapon" : "armor";
  const tier = boss ? lootTiers[lootTiers.length - 1] : pickWeighted(lootTiers);
  const [minB, maxB] = tier.bonus;
  const bonus = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
  const names = type === "weapon"
    ? ["Sword", "Axe", "Dagger", "Mace", "Spear"]
    : ["Leather Armor", "Chainmail", "Plate Armor", "Robe", "Scale Mail"];
  const name = `${tier.rarity} ${names[Math.floor(Math.random() * names.length)]}`;
  return { type, name, bonus, rarity: tier.rarity };
}

export function generatePotion() {
  if (Math.random() < 0.6) return { type: "potion", name: "Health Potion", heal: 50 };
  return { type: "potion", name: "Golden Potion" };
}

export function addToInventory(item) {
  if (!ctx || !ctx.getPlayer || !ctx.setPlayer) {
    console.warn("Loot.addToInventory missing ctx");
    return;
  }
  const p = ctx.getPlayer();
  if (!p) return;
  if ((p.inventory || []).length >= (ctx.INVENTORY_LIMIT || 100)) {
    ctx.setMessage?.("Inventory full!");
    return;
  }
  ctx.setPlayer({ ...p, inventory: [...(p.inventory || []), item] });
}

export function autoEquipOrStore(loot) {
  if (!ctx) {
    console.warn("autoEquipOrStore: no ctx");
    return;
  }
  const p = ctx.getPlayer();
  if (!p) return;
  if ((p.inventory || []).length >= (ctx.INVENTORY_LIMIT || 100)) {
    ctx.setMessage?.("Inventory full!");
    return;
  }
  let better = false;
  if (loot.type === "weapon" && loot.bonus > (p.weapon?.damageBonus || 0)) better = true;
  if (loot.type === "armor" && loot.bonus > (p.armor?.defenseBonus || 0)) better = true;
  if (better) {
    const old = p[loot.type] || { name: `Old ${loot.type}`, bonus: 0 };
    ctx.setPlayer({ ...p, [loot.type]: loot, inventory: [...(p.inventory || []), old] });
    ctx.createFloatingNumber?.(`🛡️ Equipped ${loot.name} (+${loot.bonus})`, "#f39c12", 140);
  } else {
    ctx.setPlayer({ ...p, inventory: [...(p.inventory || []), loot] });
    ctx.createFloatingNumber?.(`📦 Found ${loot.name} (+${loot.bonus})`, "#9b59b6", 140);
  }
}

export function handleLootDrop(boss = false) {
  // probabilistic loot; combined gear/potion/specials
  if (!ctx) return;
  // chance for special on bosses
  const roll = Math.random();
  if (boss && roll < 0.12) {
    // special items
    const specials = [
      { type: "special", name: "Tome of Wisdom", effect: "xpMultiplier", bonus: +(1.1 + Math.random() * 0.2).toFixed(2) },
      { type: "special", name: "Bag of Fortune", effect: "goldMultiplier", bonus: +(1.5 + Math.random() * 0.6).toFixed(2) },
      { type: "special", name: "Heart of Vitality", effect: "regenPerTurn", bonus: Math.floor(Math.random() * 10) + 5 },
    ];
    const special = specials[Math.floor(Math.random() * specials.length)];
    ctx.setPlayer((p) => {
      if (!p) return p;
      const updated = { ...p };
      if (special.effect === "xpMultiplier") updated.xpMultiplier = +(p.xpMultiplier * special.bonus).toFixed(2);
      if (special.effect === "goldMultiplier") updated.goldMultiplier = +(p.goldMultiplier * special.bonus).toFixed(2);
      if (special.effect === "regenPerTurn") updated.regenPerTurn = clamp(p.regenPerTurn + special.bonus);
      ctx.createFloatingNumber?.(`${special.name} empowered you!`, "#e74c3c", 120);
      return updated;
    });
    return;
  }

  if (roll < 0.25) {
    const potion = generatePotion();
    addToInventory(potion);
    ctx.createFloatingNumber?.(potion.name === "Health Potion" ? "🧪 Health Potion" : "🧪 Golden Potion", potion.name === "Health Potion" ? "#27ae60" : "#f1c40f", 120);
    return;
  }

  const gear = generateGear(boss);
  autoEquipOrStore(gear);
}

function clamp(v) {
  try {
    return ctx?.clampNumber ? ctx.clampNumber(v, 0) : Math.max(0, v);
  } catch (e) {
    return Math.max(0, v);
  }
}

// Item interactions - ensure index bounds and safe operations
export function equipItem(index) {
  if (!ctx) { console.warn("equipItem no ctx"); return; }
  const p = ctx.getPlayer();
  if (!p || !Array.isArray(p.inventory) || index < 0 || index >= p.inventory.length) {
    console.warn("equipItem: invalid index", index);
    return;
  }
  const item = p.inventory[index];
  if (!item || item.type === "potion" || item.type === "special") return;
  const type = item.type;
  const oldGear = p[type] || { name: `Old ${type}`, bonus: 0 };
  const newInv = [...p.inventory];
  newInv.splice(index, 1);
  const newPlayer = { ...p, [type]: item, inventory: [...newInv, oldGear] };
  ctx.setPlayer(newPlayer);
  ctx.createFloatingNumber?.(`🛡️ Equipped ${item.name} (+${item.bonus})`, "#f39c12", 140);
}

export function sellItem(index) {
  if (!ctx) return;
  const p = ctx.getPlayer();
  if (!p || !Array.isArray(p.inventory) || index < 0 || index >= p.inventory.length) {
    console.warn("sellItem: invalid index", index);
    return;
  }
  const item = p.inventory[index];
  if (!item) return;
  const base = item.type === "potion" ? 15 : item.type === "special" ? 100 : (item.bonus || 1) * 5;
  const goldenFactor = p.goldenBuff ? 2 : 1;
  const gain = Math.floor(base * (p.goldMultiplier || 1) * goldenFactor);
  const newInv = [...p.inventory];
  newInv.splice(index, 1);
  const crownGain = item.bonus ? Math.floor((item.bonus || 1) / 10) : 0;
  const newCrowns = (p.crowns || 0) + crownGain;
  ctx.setPlayer({ ...p, gold: (p.gold || 0) + gain, crowns: newCrowns, inventory: newInv, goldenBuff: false });
  ctx.animateStat?.(ctx.crownsAnim, newCrowns);
  ctx.animateStat?.(ctx.goldAnim, (p.gold || 0) + gain);
  ctx.createFloatingNumber?.(`💰 +${gain} Gold (sold)`, "#f1c40f", 160);
}

export function usePotion(index) {
  if (!ctx) return;
  const p = ctx.getPlayer();
  if (!p || !Array.isArray(p.inventory) || index < 0 || index >= p.inventory.length) {
    console.warn("usePotion: invalid index", index);
    return;
  }
  const item = p.inventory[index];
  if (!item || item.type !== "potion") return;
  const newInv = [...p.inventory];
  newInv.splice(index, 1);
  if (item.name === "Health Potion") {
    const healed = item.heal || 50;
    const newHealth = Math.min((p.health || 0) + healed, p.maxHealth || 100);
    ctx.setPlayer({ ...p, inventory: newInv, health: newHealth });
    ctx.animateStat?.(ctx.healthAnim, newHealth);
    ctx.createFloatingNumber?.(`+${healed} Health`, "#27ae60", 140);
  } else if (item.name === "Golden Potion") {
    ctx.setPlayer({ ...p, inventory: newInv, goldenBuff: true });
    ctx.createFloatingNumber?.("💰 Golden Buff Active", "#f1c40f", 140);
  } else {
    ctx.setPlayer({ ...p, inventory: newInv });
  }
}

export default {
  setContext,
  generateGear,
  generatePotion,
  addToInventory,
  autoEquipOrStore,
  handleLootDrop,
  equipItem,
  sellItem,
  usePotion,
};
