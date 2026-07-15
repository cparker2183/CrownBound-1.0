// src/components/Settings.js
import React from "react";
import { View, Text } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Settings() {
  const {
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    playSound,
    playEffect,
    playNextTestEffect,
  } = useGame();

  return (
    <View style={{ padding: 12, backgroundColor: "#0b1220", borderRadius: 12 }}>
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        ⚙️ Settings
      </Text>

      {/* Music Volume */}
      <Text style={{ color: "#9ca3af", marginTop: 8 }}>
        Music Volume: {musicVolume}
      </Text>
      <input
        type="range"
        min="0"
        max="100"
        value={musicVolume}
        onChange={(e) => setMusicVolume(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      {/* SFX Volume */}
      <Text style={{ color: "#9ca3af", marginTop: 12 }}>
        SFX Volume: {sfxVolume}
      </Text>
      <input
        type="range"
        min="0"
        max="100"
        value={sfxVolume}
        onChange={(e) => setSfxVolume(Number(e.target.value))}
        style={{ width: "100%" }}
      />

      {/* Test button */}
      <div style={{ marginTop: 12 }}>
  <button
    onClick={() => playNextTestEffect()}
    style={{
      padding: 8,
      borderRadius: 6,
      background: "#2563eb",
      color: "#fff",
      border: "none",
    }}
  >
    ▶ Test Sound Effects
  </button>
</div>

      <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 12 }}>
        Background music will loop through your playlist with short silences between tracks.
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
