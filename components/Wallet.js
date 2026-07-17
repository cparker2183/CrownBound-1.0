import React from "react";
import { View, Text } from "react-native-web";

export default function Wallet() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1722",
        padding: 12,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: 12,
        }}
      >
        Legacy
      </Text>

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
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          Crowns represent permanent standing and contribution within the
          CrownBound community.
        </Text>

        <Text
          style={{
            color: "#9ca3af",
            lineHeight: 20,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Legacy and community features are still under development.
        </Text>
      </View>
    </View>
  );
}