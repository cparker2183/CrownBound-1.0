import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native-web";

import { useGame } from "./engine/GameContext.js";

// Components
import IntroScreen from "./components/IntroScreen.js";
import HowToPlay from "./components/HowToPlay.js";
import Stats from "./components/Stats.js";
import Inventory from "./components/Inventory.js";
import Quests from "./components/Quests.js";
import Achievements from "./components/Achievements.js";
import Story from "./components/Story.js";
import Referral from "./components/Referral.js";
import Settings from "./components/Settings.js";
import Wallet from "./components/Wallet.js";

const APP_VERSION = "v0.9.0";

export default function App() {
  const {
    player,
    hasCharacter,
    createCharacter,
  } = useGame();

  const [tab, setTab] = useState("Stats");

  // The Intro appears once per application launch.
  const [hasStartedThisLaunch, setHasStartedThisLaunch] =
    useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);  

  const tabs = [
    "Stats",
    "Inventory",
    "Settings",
    "Wallet",
  ];

  const renderTab = () => {
    switch (tab) {
      case "Stats":
        return <Stats />;

      case "Inventory":
        return <Inventory />;

      case "Quests":
        return <Quests />;

      case "Achievements":
        return <Achievements />;

      case "Story":
        return <Story />;

      case "Referral":
        return <Referral />;

      case "Settings":
  return (
    <Settings
      appVersion={APP_VERSION}
      onReturnToIntro={() => {
        setTab("Stats");
        setHasStartedThisLaunch(false);
      }}
      onOpenHowToPlay={() => {
        setTutorialMode(false);
        setShowHowToPlay(true);
      }}
    />
  );

      case "Wallet":
        return <Wallet />;

      default:
        return (
          <Text style={{ color: "#fff" }}>
            Unknown Tab
          </Text>
        );
    }
  };

if (showHowToPlay) {
  return (
    <HowToPlay
      buttonText={tutorialMode ? "Begin Adventure" : "Return to Game"}
      onClose={() => {
        setShowHowToPlay(false);

        if (tutorialMode) {
          setTutorialMode(false);
          setTab("Stats");
          setHasStartedThisLaunch(true);
        }
      }}
    />
  );
}
  
  if (!hasStartedThisLaunch) {
    return (
      <IntroScreen
  hasCharacter={hasCharacter}
  playerName={player?.name}
  playerLevel={player?.level}
  appVersion={APP_VERSION}
  onCreateCharacter={(characterName) => {
    const result = createCharacter(characterName);

    if (result?.success) {
      setTutorialMode(true);
      setShowHowToPlay(true);
    }

    return result;
  }}
  onStartPlaying={() => {
    setTab("Stats");
    setHasStartedThisLaunch(true);
  }}
/>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👑 CrownBound 👑</Text>

      <View style={styles.tabRow}>
        {tabs.map((tabName) => (
          <TouchableOpacity
            key={tabName}
            style={[
              styles.tabButton,
              tab === tabName && styles.tabActive,
            ]}
            onPress={() => setTab(tabName)}
          >
            <Text style={styles.tabText}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderTab()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 15,
  },

  header: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },

  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#333",
    paddingVertical: 4,
  },

  tabButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 2,
    borderRadius: 6,
  },

  tabActive: {
    backgroundColor: "#555",
  },

  tabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  content: {
    flex: 1,
    padding: 8,
  },
});