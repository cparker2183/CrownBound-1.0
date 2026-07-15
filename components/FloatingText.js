// src/components/FloatingText.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native-web";

// Assign colors to stat types
const typeColors = {
  xp: "#4ade80",     // green
  gold: "#facc15",   // yellow
  level: "#60a5fa",  // blue
  item: "#f472b6",   // pink
  default: "#ffffff" // white
};

export default function FloatingText({ messages }) {
  return (
    <View style={styles.container}>
      {messages.map((msg, index) => (
        <FloatingMessage key={index} {...msg} />
      ))}
    </View>
  );
}

function FloatingMessage({ text, type }) {
  const [opacity] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -40,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.text,
        { 
          color: typeColors[type] || typeColors.default,
          opacity,
          transform: [{ translateY }],
        }
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none", // prevent blocking buttons
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
