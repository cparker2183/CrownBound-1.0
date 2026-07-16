import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native-web";

const sections = [
  {
    icon: "⚔️",
    title: "Fight",
    description:
      "Battle enemies to earn experience, gold, equipment, and other rewards. Watch your health and rest when needed.",
  },
  {
    icon: "🎒",
    title: "Equipment",
    description:
      "Open Inventory to equip stronger weapons and armor. Equipped gear improves your combat abilities.",
  },
  {
    icon: "🧪",
    title: "Potions",
    description:
      "Potions restore health or provide useful bonuses. Keep a few available before difficult battles.",
  },
  {
    icon: "🛏️",
    title: "Rest",
    description:
      "Rest when your health is low. Recovering before another fight can prevent an early defeat.",
  },
  {
    icon: "💾",
    title: "Saving",
    description:
      "Your character is saved automatically on this device. Reset Character in Settings permanently erases that save.",
  },
];

export default function HowToPlay({
  onClose,
  buttonText = "Begin Adventure",
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>How To Play</Text>

          <Text style={styles.introduction}>
            Welcome to CrownBound! Build your character, grow stronger, and
            prove yourself worthy of crowns.
          </Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>

              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <Text style={styles.sectionDescription}>
                  {section.description}
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.closing}>
            Do well, adventurer. Your journey begins now.
          </Text>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
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
    padding: 16,
  },

  card: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "96vh",
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#475569",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.45)",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 10,
  },

  crown: {
    fontSize: 42,
    textAlign: "center",
  },

  title: {
    color: "#f5c451",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },

  introduction: {
    color: "#9ca3af",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 22,
  },

  section: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#475569",
    borderRadius: 9,
    padding: 13,
    marginBottom: 10,
  },

  sectionIcon: {
    fontSize: 25,
    marginRight: 12,
    width: 32,
    textAlign: "center",
  },

  sectionText: {
    flex: 1,
  },

  sectionTitle: {
    color: "#f5c451",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 3,
  },

  sectionDescription: {
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },

  closing: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
  },

  button: {
    backgroundColor: "#2563eb",
    borderWidth: 2,
    borderColor: "#475569",
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 14,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
});