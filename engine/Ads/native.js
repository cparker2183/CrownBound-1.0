// engine/Ads/native.js
import React from "react";
import { Platform } from "../RNCompat";

let BannerAd, BannerAdSize, RewardedAd, TestIds;

if (Platform.OS !== "web") {
  try {
    const RNAds = require("react-native-google-mobile-ads");
    BannerAd = RNAds.BannerAd;
    BannerAdSize = RNAds.BannerAdSize;
    RewardedAd = RNAds.RewardedAd;
    TestIds = RNAds.TestIds;
  } catch (err) {
    console.warn("⚠️ Native ads unavailable. Skipping react-native-google-mobile-ads load.", err);
  }
}

// 🧱 Fallbacks — never crash
if (!BannerAd) {
  BannerAd = () => (
    <div
      style={{
        width: "100%",
        height: 60,
        background: "rgba(255,255,255,0.05)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        color: "#ccc",
        textAlign: "center",
        lineHeight: "60px",
        fontSize: 12,
        fontFamily: "monospace",
      }}
    >
      🧩 [Ad Placeholder – Web Mode]
    </div>
  );
}

BannerAdSize = BannerAdSize || { FULL_BANNER: "FULL_BANNER" };
RewardedAd =
  RewardedAd ||
  {
    createForAdRequest: () => ({
      load: () => console.log("Rewarded ad load() stub"),
      show: () => console.log("Rewarded ad show() stub"),
    }),
  };
TestIds = TestIds || { BANNER: "test-banner", REWARDED: "test-rewarded" };

export { BannerAd, BannerAdSize, RewardedAd, TestIds };

export const showRewardedAd = async (onReward) => {
  console.log("Rewarded Ad requested (platform: " + Platform.OS + ")");
  if (Platform.OS === "web") {
    console.log("🎁 Simulating rewarded ad reward on web.");
    if (onReward) onReward();
  } else {
    try {
      const ad = RewardedAd.createForAdRequest(TestIds.REWARDED);
      ad.load();
      ad.show();
    } catch (e) {
      console.warn("Failed to show native rewarded ad:", e);
    }
  }
};
