// src/engine/Kingdoms.js

export const KINGDOM_STATUS = {
  LAUNCH: "launch",
  FUTURE: "future",
};

export const KINGDOMS = [
  {
    id: "avareth",
    name: "Avareth",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Honor",
    supportingValues: ["Justice", "Mercy"],
    oath: "A true crown is earned by keeping one's word.",
  },
  {
    id: "merithal",
    name: "Merithal",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Unity",
    supportingValues: ["Compassion", "Stewardship"],
    oath: "No triumph is greater than one shared.",
  },
  {
    id: "solvyr",
    name: "Solvyr",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Wisdom",
    supportingValues: ["Curiosity", "Creativity"],
    oath: "Knowledge becomes wisdom when it serves others.",
  },
  {
    id: "haldren",
    name: "Haldren",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Resolve",
    supportingValues: ["Hope", "Liberty"],
    oath: "When the path grows difficult, we endure.",
  },

  // Future kingdom concepts.
  // Their supporting values are intentionally left open until expansion.
  {
    id: "velmora",
    name: "Velmora",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Hope",
    supportingValues: [],
    oath: "Even the smallest light can guide a kingdom.",
  },
  {
    id: "corenth",
    name: "Corenth",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Justice",
    supportingValues: [],
    oath: "Fairness is the shield of every citizen.",
  },
  {
    id: "delmara",
    name: "Delmara",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Compassion",
    supportingValues: [],
    oath: "Strength is measured by how we lift others.",
  },
  {
    id: "norathen",
    name: "Norathen",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Stewardship",
    supportingValues: [],
    oath: "Guard what is entrusted to you, for others will follow.",
  },
  {
    id: "kireth",
    name: "Kireth",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Curiosity",
    supportingValues: [],
    oath: "Every unanswered question is an invitation.",
  },
  {
    id: "lorvayn",
    name: "Lorvayn",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Liberty",
    supportingValues: [],
    oath: "Freedom carries both privilege and responsibility.",
  },
  {
    id: "eryvale",
    name: "Eryvale",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Mercy",
    supportingValues: [],
    oath: "The greatest victory is choosing mercy when vengeance is easy.",
  },
  {
    id: "theryn",
    name: "Theryn",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Creativity",
    supportingValues: [],
    oath: "Every new idea shapes tomorrow's kingdom.",
  },
];

export const LAUNCH_KINGDOMS = KINGDOMS.filter(
  (kingdom) => kingdom.status === KINGDOM_STATUS.LAUNCH
);

export function getKingdomById(kingdomId) {
  if (!kingdomId) {
    return null;
  }

  return KINGDOMS.find((kingdom) => kingdom.id === kingdomId) || null;
}

export function isValidKingdomId(kingdomId) {
  return Boolean(getKingdomById(kingdomId));
}

export function isLaunchKingdomId(kingdomId) {
  const kingdom = getKingdomById(kingdomId);

  return kingdom?.status === KINGDOM_STATUS.LAUNCH;
}