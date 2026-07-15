// src/components/Settings.js
import React from "react";
import { View, Text } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Settings({
  appVersion = "v0.9.2",
  onReturnToIntro = () => {},
  onOpenHowToPlay = () => {},
}) {
  const {
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    playSound,
    playEffect,
    playNextTestEffect,
    resetCharacter,
  } = useGame();

  return (
    <View style={{ padding: 12, backgroundColor: "#0b1220", borderRadius: 12 }}>
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        ⚙️ Settings
      </Text>

      <Text
  style={{
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  }}
>
  CrownBound {appVersion}
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

<div
  style={{
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid #444",
  }}
>
  <Text
    style={{
      color: "#f5c451",
      fontWeight: "bold",
      fontSize: 17,
    }}
  >
    Game Guide
  </Text>

  <Text
    style={{
      color: "#bbb",
      marginTop: 8,
      marginBottom: 12,
      lineHeight: 20,
    }}
  >
    Review the basics of combat, equipment, potions, saving, and
    character progress.
  </Text>

  <button
    onClick={onOpenHowToPlay}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 6,
      background: "#5f4715",
      color: "#fff",
      border: "1px solid #8a6417",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    How To Play
  </button>
</div>

<div
  style={{
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #444",
  }}
>
  <Text
    style={{
      color: "#ff8c8c",
      fontWeight: "bold",
      fontSize: 17,
    }}
  >
    Reset Character
  </Text>

  <Text
    style={{
      color: "#bbb",
      marginTop: 8,
      marginBottom: 12,
      lineHeight: 20,
    }}
  >
    Permanently erase this character and begin again.
  </Text>

  <button
    onClick={() => {
      const confirmed = window.confirm(
        "Reset your character?\n\n" +
        "This permanently deletes your level, equipment, inventory, gold, crowns, and activity history."
      );

      if (!confirmed) {
        return;
      }

      resetCharacter();
      onReturnToIntro();
    }}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 6,
      background: "#7f1d1d",
      color: "#fff",
      border: "1px solid #b91c1c",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Reset Character
  </button>
</div>

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
