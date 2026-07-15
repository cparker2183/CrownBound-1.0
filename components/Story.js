// src/components/Story.js
import React from "react";
import { View, Text, ScrollView } from "react-native-web";

export default function Story({ log = [] }) {
  // Only keep entries that are objects with notable: true
  const storyEvents = log.filter(
    (entry) => typeof entry === "object" && entry.notable
  );

  return (
    <View style={{ backgroundColor: "#fff4e6", padding: 12, borderRadius: 12 }}>
      <Text style={{ fontWeight: "800", marginBottom: 6, color: "#4a3728" }}>
        Story
      </Text>
      <ScrollView style={{ maxHeight: 320 }}>
        {storyEvents.map((entry, i) => (
          <Text
            key={`${entry.text}-${i}`}
            style={{ marginBottom: 6, color: "#4a3728" }}
          >
            📖 {entry.text}
          </Text>
        ))}
        {storyEvents.length === 0 && (
          <Text style={{ color: "#666", textAlign: "center" }}>
            Your saga is unwritten.
          </Text>
        )}
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
