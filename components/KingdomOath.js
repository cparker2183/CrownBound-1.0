import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native-web";
import { LAUNCH_KINGDOMS } from "../engine/Kingdoms.js";

export default function KingdomOath({ onContinue }) {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0f1722",
      }}
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            color: "#f5c451",
            fontSize: 28,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          The Kingdom Oath
        </Text>

        <View
          style={{
            backgroundColor: "#1e293b",
            borderWidth: 1,
            borderColor: "#475569",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              lineHeight: 24,
              textAlign: "center",
            }}
          >
            Your deeds have not gone unnoticed. The kingdoms now invite you to
            swear an Oath—not for power, but for purpose.
          </Text>

          <Text
            style={{
              color: "#9ca3af",
              fontSize: 15,
              lineHeight: 22,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            You may answer today, or continue your journey until the time is
            right.
          </Text>
        </View>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {LAUNCH_KINGDOMS.length} kingdoms currently await your Oath.
        </Text>

        <Pressable
          onPress={() => {
            if (onContinue) {
              onContinue();
            }
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#1d4ed8" : "#2563eb",
            borderRadius: 8,
            paddingVertical: 13,
            paddingHorizontal: 18,
          })}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Continue My Journey
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}