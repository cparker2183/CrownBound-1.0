// src/components/Settings.js
import React from "react";
import { View, Text } from "react-native-web";
import { useGame } from "../engine/GameContext";
import { createDefaultAccount } from "../engine/Account.js";
import { DISPLAY_VERSION } from "../config/version";

export default function Settings({
  onReturnToIntro = () => {},
  onOpenHowToPlay = () => {},
}) {
  const {
  musicVolume,
  setMusicVolume,
  sfxVolume,
  setSfxVolume,
  playNextTestEffect,
  resetCharacter,
  setAccount,

} = useGame();

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: "#0f1722",
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        ⚙️ Settings
      </Text>

      <Text
        style={{
          color: "#9ca3af",
          fontSize: 12,
          marginBottom: 10,
        }}
      >
        Version {DISPLAY_VERSION}
      </Text>

      {/* Audio Settings */}
      <View
        style={{
          backgroundColor: "#1e293b",
          borderWidth: 2,
          borderColor: "#475569",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Audio
        </Text>

        <Text style={{ color: "#9ca3af", marginBottom: 4 }}>
          Music Volume: {musicVolume}
        </Text>

        <input
  type="range"
  min="0"
  max="100"
  value={musicVolume}
  onChange={(event) =>
    setMusicVolume(Number(event.target.value))
  }
  style={{
    width: "100%",
    accentColor: "#2563eb",
  }}
/>

        <Text
          style={{
            color: "#9ca3af",
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          SFX Volume: {sfxVolume}
        </Text>

        <input
          type="range"
          min="0"
          max="100"
          value={sfxVolume}
          onChange={(event) =>
            setSfxVolume(Number(event.target.value))
          }
  style={{
    width: "100%",
    accentColor: "#2563eb",
  }}
        />

        <div style={{ marginTop: 12 }}>
          <button
            onClick={playNextTestEffect}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              background: "#2563eb",
              color: "#ffffff",
              border: "2px solid #475569",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ▶ Test Sound Effects
          </button>
        </div>

        <Text
  style={{
    color: "#9ca3af",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  }}
>
  Background music cycles through the playlist with short silences
  between tracks.
</Text>

      </View>

      {/* Game Guide */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: "#1e293b",
          borderWidth: 2,
          borderColor: "#475569",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          Game Guide
        </Text>

        <button
          onClick={onOpenHowToPlay}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            background: "#2563eb",
            color: "#ffffff",
            border: "2px solid #475569",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          How To Play
        </button>

        <Text
          style={{
            color: "#9ca3af",
            marginTop: 10,
            lineHeight: 20,
          }}
        >
          Review combat, equipment, potions, saving, and the basic flow of
          your adventure.
        </Text>
      </View>

      {/* Reset Character */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: "#1e293b",
          borderWidth: 2,
          borderColor: "#475569",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text
          style={{
            color: "#fca5a5",
            fontWeight: "bold",
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          Reset Character
        </Text>

        <button
          onClick={() => {
            const confirmed = window.confirm(
              "Reset your character?\n\n" +
                "This permanently deletes your level, equipment, inventory, gold, and activity history."
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
            borderRadius: 8,
            background: "#7f1d1d",
            color: "#ffffff",
            border: "2px solid #991b1b",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Reset Character
        </button>

        <Text
          style={{
            color: "#9ca3af",
            marginTop: 10,
            lineHeight: 20,
          }}
        >
          Permanently erase this character and return to character creation.
        </Text>
      </View>

            {/* Delete Account */}
      <View
        style={{
          marginTop: 12,
          backgroundColor: "#111827",
          borderWidth: 2,
          borderColor: "#991b1b",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text
          style={{
            color: "#fca5a5",
            fontWeight: "bold",
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          Delete Account
        </Text>

        <button
          onClick={() => {
            const confirmed = window.confirm(
              "Delete your CrownBound account?\n\n" +
                "This permanently deletes your character, level, equipment, inventory, gold, Crowns, Kingdom, and all locally saved progress.\n\n" +
                "This cannot be undone."
            );

            if (!confirmed) {
              return;
            }

            resetCharacter();
            setAccount(createDefaultAccount());
            onReturnToIntro();
          }}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            background: "#450a0a",
            color: "#ffffff",
            border: "2px solid #dc2626",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Delete Account
        </button>

        <Text
          style={{
            color: "#9ca3af",
            marginTop: 10,
            lineHeight: 20,
          }}
        >
          Permanently erase all character and account data, including your
          Kingdom and Crowns.
        </Text>
      </View>
    </View>
  );
}