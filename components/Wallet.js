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
    MAX_AD_REWARDS_PER_DAY,
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
      addLog(
        `💱 Converted ${res.converted} Crowns into $${res.usd.toFixed(
          2
        )} (simulation).`
      );
    } else {
      addLog(`⚠️ ${res.message}`);
    }
  };

  const dailyCapCrowns = Math.floor(DAILY_USD_LIMIT / CROWN_TO_USD);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1722",
        padding: 12,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: 12,
        }}
      >
        💰 Wallet
      </Text>

      <View
        style={{
          backgroundColor: "#1e293b",
          borderWidth: 2,
          borderColor: "#475569",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#ffffff", marginBottom: 6 }}>
          Gold: {player?.gold ?? 0}
        </Text>

        <Text style={{ color: "#ffffff", marginBottom: 6 }}>
          Crowns (balance): {crowns}
        </Text>

        <Text style={{ color: "#ffffff", marginBottom: 6 }}>
          Ads watched today: {adsWatchedToday ?? 0} /{" "}
          {MAX_AD_REWARDS_PER_DAY}
        </Text>

        <Text style={{ color: "#ffffff", marginBottom: 6 }}>
          Crowns converted today: {crownsConvertedToday} / {dailyCapCrowns}
        </Text>

      </View>

      <View style={{ marginVertical: 6 }}>
        <Button
          title="📺 Watch Rewarded Ad"
          onPress={onWatchAd}
          color="#16a34a"
        />
      </View>

      <View style={{ marginVertical: 6 }}>
        <Button
          title="🔄 Convert ALL Crowns → USD"
          onPress={onConvertAll}
          color="#2563eb"
        />
      </View>

      <Text
        style={{
          marginTop: 10,
          color: "#f5c451",
          textAlign: "center",
        }}
      >
        ⚠️ Simulation only. Real payouts are planned for a future version.
      </Text>
    </View>
  );
}