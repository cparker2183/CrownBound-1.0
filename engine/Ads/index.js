// engine/Ads/index.js

import { Platform } from "../RNCompat";

let Ads;

if (Platform.OS === "web") {
  Ads = require("./web.js");
} else {
  Ads = require("./native.js");
}

export const {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  TestIds,
  showRewardedAd,
} = Ads;