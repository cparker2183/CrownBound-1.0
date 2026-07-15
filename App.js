import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native-web";

// Components
import Stats from "./components/Stats.js";
import Inventory from "./components/Inventory.js";
import Quests from "./components/Quests.js";
import Achievements from "./components/Achievements.js";
import Story from "./components/Story.js";
import Referral from "./components/Referral.js";
import Settings from "./components/Settings.js";
import Wallet from "./components/Wallet.js"; // ✅ fixed path

export default function App() {
  const [tab, setTab] = useState("Stats");

  const tabs = [
    "Stats",
    "Inventory",
    "Quests",
    "Achievements",
    "Story",
    "Referral",
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
        return <Settings />;
      case "Wallet": // ✅ fixed
        return <Wallet />;
      default:
        return <Text style={{ color: "#fff" }}>Unknown Tab</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👑 CrownBound 👑</Text>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabButton, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={styles.tabText}>{t}</Text>
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
