// engine/Kingdoms.js

import avarethCrest from "../assets/kingdoms/avareth/avareth-crest-800x1000.png";
import avarethEmblem from "../assets/kingdoms/avareth/avareth-emblem-512x512.png";
import avarethIcon from "../assets/kingdoms/avareth/avareth-icon-128x128.png";

import merithalCrest from "../assets/kingdoms/merithal/merithal-crest-800x1000.png";
import merithalEmblem from "../assets/kingdoms/merithal/merithal-emblem-512x512.png";
import merithalIcon from "../assets/kingdoms/merithal/merithal-icon-128x128.png";

import solvyrCrest from "../assets/kingdoms/solvyr/solvyr-crest-800x1000.png";
import solvyrEmblem from "../assets/kingdoms/solvyr/solvyr-emblem-512x512.png";
import solvyrIcon from "../assets/kingdoms/solvyr/solvyr-icon-128x128.png";

import haldrenCrest from "../assets/kingdoms/haldren/haldren-crest-800x1000.png";
import haldrenEmblem from "../assets/kingdoms/haldren/haldren-emblem-512x512.png";
import haldrenIcon from "../assets/kingdoms/haldren/haldren-icon-128x128.png";

export const KINGDOM_STATUS = {
  LAUNCH: "launch",
  FUTURE: "future",
};

export const KINGDOM_UNLOCK_LEVEL = 3;

export const KINGDOMS = [
  {
    id: "avareth",
    name: "Avareth",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Honor",
    supportingValues: ["Justice", "Mercy"],
    oath: "A true crown is earned by keeping one's word.",
    artwork: {
      crest: avarethCrest,
      emblem: avarethEmblem,
      icon: avarethIcon,
    },
  },

  {
    id: "merithal",
    name: "Merithal",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Unity",
    supportingValues: ["Compassion", "Stewardship"],
    oath: "No triumph is greater than one shared.",
    artwork: {
      crest: merithalCrest,
      emblem: merithalEmblem,
      icon: merithalIcon,
    },
  },

  {
    id: "solvyr",
    name: "Solvyr",
    status: KINGDOM_STATUS.LAUNCH,
    primaryValue: "Wisdom",
    supportingValues: ["Curiosity", "Creativity"],
    oath: "Knowledge becomes wisdom when it serves others.",

    artwork: {
  crest: solvyrCrest,
  emblem: solvyrEmblem,
  icon: solvyrIcon,
  },
  },

  {
  id: "haldren",
  name: "Haldren",
  status: KINGDOM_STATUS.LAUNCH,
  primaryValue: "Resolve",
  supportingValues: ["Hope", "Liberty"],
  oath: "When the path grows difficult, we endure.",
  artwork: {
    crest: haldrenCrest,
    emblem: haldrenEmblem,
    icon: haldrenIcon,
  },
  },

  {
    id: "velmora",
    name: "Velmora",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Hope",
    supportingValues: ["Compassion", "Creativity"],
    oath:
      "Where hope endures, compassion finds a way forward.",

    // Expected directory:
    // assets/kingdoms/velmora/
    artwork: null,
  },

  {
    id: "corenth",
    name: "Corenth",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Justice",
    supportingValues: ["Honor", "Stewardship"],
    oath:
      "Justice is kept by those who serve with honor and guard what belongs to all.",

    // Expected directory:
    // assets/kingdoms/corenth/
    artwork: null,
  },

  {
    id: "delmara",
    name: "Delmara",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Compassion",
    supportingValues: ["Mercy", "Unity"],
    oath:
      "We rise together when mercy leaves no one behind.",

    // Expected directory:
    // assets/kingdoms/delmara/
    artwork: null,
  },

  {
    id: "norathen",
    name: "Norathen",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Stewardship",
    supportingValues: ["Resolve", "Wisdom"],
    oath:
      "Guard with wisdom, endure with purpose, and leave the realm stronger than you found it.",

    // Expected directory:
    // assets/kingdoms/norathen/
    artwork: null,
  },

  {
    id: "kireth",
    name: "Kireth",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Curiosity",
    supportingValues: ["Wisdom", "Liberty"],
    oath:
      "Question freely, seek wisely, and let truth open every door.",

    // Expected directory:
    // assets/kingdoms/kireth/
    artwork: null,
  },

  {
    id: "lorvayn",
    name: "Lorvayn",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Liberty",
    supportingValues: ["Resolve", "Justice"],
    oath:
      "Freedom endures when defended with resolve and guided by justice.",

    // Expected directory:
    // assets/kingdoms/lorvayn/
    artwork: null,
  },

  {
    id: "eryvale",
    name: "Eryvale",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Mercy",
    supportingValues: ["Honor", "Compassion"],
    oath:
      "Honor is greatest when compassion stays the hand of vengeance.",

    // Expected directory:
    // assets/kingdoms/eryvale/
    artwork: null,
  },

  {
    id: "theryn",
    name: "Theryn",
    status: KINGDOM_STATUS.FUTURE,
    primaryValue: "Creativity",
    supportingValues: ["Curiosity", "Hope"],
    oath:
      "Imagine boldly, question deeply, and shape a future worth believing in.",

    // Expected directory:
    // assets/kingdoms/theryn/
    artwork: null,
  },
];

export const LAUNCH_KINGDOMS = KINGDOMS.filter(
  (kingdom) => kingdom.status === KINGDOM_STATUS.LAUNCH
);

export function getKingdomById(kingdomId) {
  if (!kingdomId) {
    return null;
  }

  return KINGDOMS.find(
    (kingdom) => kingdom.id === kingdomId
  ) || null;
}

export function isValidKingdomId(kingdomId) {
  return Boolean(getKingdomById(kingdomId));
}

export function isLaunchKingdomId(kingdomId) {
  const kingdom = getKingdomById(kingdomId);

  return kingdom?.status === KINGDOM_STATUS.LAUNCH;
}
