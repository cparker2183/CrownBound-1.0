import React, { useState } from "react";
import { DISPLAY_VERSION } from "../config/version";
import { useGame } from "../engine/GameContext.js";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native-web";

export default function IntroScreen({
  hasCharacter,
  playerName,
  playerLevel,
  onCreateCharacter,
  onStartPlaying,
}) {
  const [characterName, setCharacterName] = useState("");
  const [error, setError] = useState("");
  const { startBackgroundMusic } = useGame();

  const handleCreateCharacter = () => {
    const cleanName = characterName.trim();

    if (!cleanName) {
      setError("Please enter a character name.");
      return;
    }

    const result = onCreateCharacter(cleanName);

    if (!result?.success) {
      setError(result?.error || "Character creation failed.");
      return;
    }

    setError("");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>CrownBound</Text>

        <Text style={styles.subtitle}>
           Rise from a humble adventurer to a legendary ruler.
        </Text>

        {hasCharacter ? (
          <>
            <Text style={styles.welcome}>Welcome back,</Text>

            <Text style={styles.playerName}>
  {playerName || "Hero"}
</Text>

<Text style={styles.playerLevel}>
  Level {playerLevel || 1} Adventurer
</Text>

<TouchableOpacity
  style={styles.primaryButton}
  onPress={() => {
    startBackgroundMusic();
    onStartPlaying();
  }}
>
              <Text style={styles.primaryButtonText}>
                Start Playing
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>
              What shall your adventurer be called?
            </Text>

            <TextInput
              value={characterName}
              onChangeText={(value) => {
                setCharacterName(value);
                setError("");
                startBackgroundMusic();
              }}
              onSubmitEditing={handleCreateCharacter}
              placeholder="Enter character name"
              placeholderTextColor="#9ca3af"
              maxLength={24}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !characterName.trim() && styles.disabledButton,
              ]}
              onPress={handleCreateCharacter}
              disabled={!characterName.trim()}
            >
              <Text style={styles.primaryButtonText}>
                Create Character
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footer}>
  Your progress is saved automatically on this device.
</Text>

<Text style={styles.version}>{DISPLAY_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100vh",
    backgroundColor: "#0f1722",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#475569",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.45)",
  },

  crown: {
    fontSize: 48,
    marginBottom: 4,
  },

  title: {
    color: "#f5c451",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 12,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 30,
  },

  welcome: {
    color: "#bbb",
    fontSize: 17,
    marginBottom: 4,
  },

  playerName: {
  color: "#fff",
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 24,
},

playerLevel: {
  color: "#f5c451",
  fontSize: 16,
  fontWeight: "bold",
  marginTop: -14,
  marginBottom: 24,
},

prompt: {
  color: "#fff",
  fontSize: 17,
  textAlign: "center",
  marginBottom: 14,
},

  prompt: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 14,
  },

  input: {
  width: "100%",
  backgroundColor: "#111827",
  color: "#ffffff",
  borderWidth: 2,
  borderColor: "#475569",
  borderRadius: 8,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 17,
  marginBottom: 8,
  outlineStyle: "none",
},

  error: {
    color: "#ff6b6b",
    width: "100%",
    textAlign: "left",
    fontSize: 14,
    marginBottom: 8,
  },

  primaryButton: {
  width: "100%",
  backgroundColor: "#2563eb",
  borderWidth: 2,
  borderColor: "#475569",
  borderRadius: 8,
  paddingVertical: 13,
  paddingHorizontal: 18,
  alignItems: "center",
  marginTop: 10,
},

  disabledButton: {
    opacity: 0.45,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  footer: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  version: {
  color: "#666",
  fontSize: 11,
  textAlign: "center",
  marginTop: 6,
},
});