// src/components/Quests.js
import React from "react";
import { View, Text, Button, ScrollView } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Quests() {
  const { quests = [], completeQuest } = useGame();

  return (
    <View style={{ backgroundColor: "#fff4e6", padding: 12, borderRadius: 12 }}>
      <Text
        style={{
          fontWeight: "800",
          marginBottom: 6,
          color: "#4a3728",
          fontSize: 16,
        }}
      >
        Quests
      </Text>

      <ScrollView style={{ maxHeight: 320 }}>
        {quests.map((q) => (
          <View key={q.id} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "600", color: "#4a3728", fontSize: 14 }}>
              {q.title}
            </Text>
            <Text style={{ color: "#4a3728", marginBottom: 6 }}>
              {q.description}
            </Text>

            {q.completed ? (
              <Text style={{ color: "green", fontWeight: "700" }}>Completed!</Text>
            ) : (
              <Button
                title="Complete"
                onPress={() => completeQuest(q.title)}
                color="#4a3728"
              />
            )}
          </View>
        ))}

        {quests.length === 0 && (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 12 }}>
            No quests available.
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
