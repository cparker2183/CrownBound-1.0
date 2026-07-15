// components/Achievements.js
import React from "react";
import { View, Text, ScrollView } from "react-native-web";

export default function Achievements({ achievements = [] }) {
  return (
    <View style={{ backgroundColor: "#fff4e6", padding: 12, borderRadius: 12 }}>
      <Text style={{ fontWeight: "800", marginBottom: 6, color: "#4a3728" }}>Achievements</Text>
      <ScrollView style={{ maxHeight: 320 }}>
        {achievements.map((a, i) => (
          <Text key={`${a}-${i}`} style={{ color: "#4a3728", marginBottom: 6 }}>
            🏆 {a}
          </Text>
        ))}
        {achievements.length === 0 && <Text style={{ color: "#666", textAlign: "center" }}>No achievements yet.</Text>}
      </ScrollView>
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
