// assets/sounds/audioRegistry.js

// -------------------- Background music --------------------
import dancingLanterns from "./dancing_lanterns.mp3";
import dawnCastle from "./dawn_castle_walls.mp3";
import duetViolin from "./duet_violin_lute.mp3";
import echoesSumer from "./echoes_sumer.mp3";
import goldenCourtyard from "./golden_courtyard.mp3";

// -------------------- Sound effects --------------------
import hit from "./hit.mp3";
import coin from "./coin.mp3";
import error from "./error.mp3";
import equip from "./equip.mp3";
import potion from "./potion.mp3";
import levelUp from "./level_up.mp3";
import boss from "./boss.mp3";
import explore from "./explore.mp3";
import goldenPotion from "./golden_potion.mp3";
import ko from "./ko.mp3";
import rest from "./rest.mp3";

export const MUSIC_TRACKS = [
  dancingLanterns,
  dawnCastle,
  duetViolin,
  echoesSumer,
  goldenCourtyard,
];

export const SOUND_EFFECTS = {
  hit,
  coin,
  error,
  equip,
  potion,
  levelUp,
  boss,
  explore,
  goldenPotion,
  ko,
  rest,
};

export const SOUND_EFFECT_NAMES = Object.keys(SOUND_EFFECTS);