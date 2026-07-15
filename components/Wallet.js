import React from "react";
import { View, Text, Button } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Wallet() {
  const {
    player,
    watchAdReward,
    convertCrownsToUsd,
    adsWatchedToday,
    crownsConvertedToday,
    DAILY_USD_LIMIT,
    CROWN_TO_USD,
    MAX_CROWNS_FROM_ADS_PER_DAY,
    addLog,
  } = useGame();

  const crowns = player?.crowns ?? 0;

  const onWatchAd = () => {
    const result = watchAdReward();
    if (result.type === "none") {
      addLog("⚠️ No reward this time (limit or luck).");
    }
  };

  const onConvertAll = () => {
    if (crowns <= 0) {
      addLog("No Crowns available to convert.");
      return;
    }
    const res = convertCrownsToUsd(crowns);
    if (res.success) {
      addLog(`💱 Converted ${res.converted} Crowns into $${res.usd.toFixed(2)} (simulation).`);
    } else {
      addLog(`⚠️ ${res.message}`);
    }
  };

  const dailyCapCrowns = Math.floor(DAILY_USD_LIMIT / CROWN_TO_USD);

  return (
    <View style={{ padding: 12, backgroundColor: "#fefce8", borderRadius: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>💰 Wallet</Text>

      <Text style={{ marginBottom: 6 }}>Gold: {player?.gold ?? 0}</Text>
      <Text style={{ marginBottom: 6 }}>Crowns (balance): {crowns}</Text>
      <Text style={{ marginBottom: 6 }}>
        Ads watched today: {adsWatchedToday} / {MAX_CROWNS_FROM_ADS_PER_DAY}
      </Text>
      <Text style={{ marginBottom: 6 }}>
        Crowns converted today: {crownsConvertedToday} / {dailyCapCrowns}
      </Text>
      <Text style={{ marginBottom: 6 }}>Daily USD cap: ${DAILY_USD_LIMIT.toFixed(2)}</Text>

      <View style={{ marginVertical: 6 }}>
        <Button title="📺 Watch Rewarded Ad" onPress={onWatchAd} color="#16a34a" />
      </View>

      <View style={{ marginVertical: 6 }}>
        <Button title="🔄 Convert ALL Crowns → USD" onPress={onConvertAll} color="#2563eb" />
      </View>

      <Text style={{ marginTop: 8, color: "#92400e" }}>
        ⚠️ Simulation only. Real payouts in the plans. 
      </Text>
      {/* Banner Ad Placeholder */}
      <View
        style={{
          height: 60,
          marginTop: 8,
          borderWidth: 1,
          borderColor: "#475569",
          borderStyle: "dashed",
          borderRadius: 8,
          backgroundColor: "#111827",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#94a3b8",
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          Banner Ad (320×50 / AdSense)
        </Text>
      </View>
    </View>
  );
}
