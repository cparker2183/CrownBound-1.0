import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Animated,
} from "react-native-web";
import { useGame } from "../engine/GameContext";
import { BannerAd } from "../engine/Ads";

const COLOR_BY_TYPE = {
  damage: "#ef4444",
  heal: "#22c55e",
  xp: "#facc15",
  gold: "#f59e0b",
  item: "#38bdf8",
  level: "#a855f7",
  buff: "#eab308",
  equip: "#60a5fa",
  error: "#f87171",
  default: "#ffffff",
};

function FloatingEntry({ text, type = "default", index }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = Math.min(200, index * 80);

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -40 - index * 6,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [translateY, opacity, index]);

  return (
    <Animated.View
      style={{
        position: "relative",
        marginVertical: 2,
        transform: [{ translateY }],
        opacity,
        pointerEvents: "none",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: COLOR_BY_TYPE[type] || COLOR_BY_TYPE.default,
        }}
      >
        {text}
      </Text>
    </Animated.View>
  );
}

export default function Stats() {
  const {
    player,
    equipment,
    activityLog,
    floatingText,
    fight,
    rest,
    explore,
    countPotionsByName,
    useFirstPotionByName,
  } = useGame();

  const p = player || {
    name: "Hero",
    level: 1,
    hp: 0,
    maxHp: 100,
    xp: 0,
    xpToNextLevel: 100,
    gold: 0,
    crowns: 0,
  };

  const hpPercent = Math.min(
    100,
    Math.round((p.hp / Math.max(1, p.maxHp)) * 100)
  );

  const xpPercent = Math.min(
    100,
    Math.round((p.xp / Math.max(1, p.xpToNextLevel)) * 100)
  );

  const healthPotions = countPotionsByName("Health Potion");
  const goldenPotions = countPotionsByName("Golden Potion");

  const recentActivity = (activityLog || []).slice(0, 25);

  return (
    <View
      style={{
        flex: 1,
        padding: 6,
        backgroundColor: "#0f1722",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 5,
        }}
      >
        {p.name}
      </Text>

      {/* Floating Text */}
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        {Array.isArray(floatingText) &&
          floatingText.map((entry, index) => (
            <FloatingEntry
              key={entry.id}
              text={entry.text}
              type={entry.type}
              index={index}
            />
          ))}
      </View>

      {/* Core Stats */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Level</Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {p.level}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Gold</Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {p.gold}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>Crowns</Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {p.crowns}
          </Text>
        </View>
      </View>

      {/* HP */}
      <View style={{ marginTop: 7 }}>
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>❤️ HP</Text>

        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#1f2937",
            marginTop: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 10,
              width: `${hpPercent}%`,
              backgroundColor: "#ef4444",
            }}
          />
        </View>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {p.hp} / {p.maxHp}
        </Text>
      </View>

      {/* XP */}
      <View style={{ marginTop: 7 }}>
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>⭐ XP</Text>

        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#1f2937",
            marginTop: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 10,
              width: `${xpPercent}%`,
              backgroundColor: "#f59e0b",
            }}
          />
        </View>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {p.xp} / {p.xpToNextLevel}
        </Text>
      </View>

      {/* Equipment */}
      <Text
        style={{
          color: "#ffffff",
          fontSize: 15,
          fontWeight: "600",
          marginTop: 5,
        }}
      >
        🧰 Equipment
      </Text>

      <View
        style={{
          marginTop: 3,
          padding: 6,
          backgroundColor: "#1e293b",
          borderWidth: 1,
          borderColor: "#475569",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
            marginBottom: 3,
          }}
        >
          🗡 Weapon:{" "}
          {equipment?.weapon
            ? `${equipment.weapon.name} (+${
                equipment.weapon.damageBonus || 0
              } dmg)`
            : "None"}
        </Text>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          🛡 Armor:{" "}
          {equipment?.armor
            ? `${equipment.armor.name} (+${
                equipment.armor.defenseBonus || 0
              } def)`
            : "None"}
        </Text>
      </View>

      {/* Potions */}
      <Text
        style={{
          color: "#ffffff",
          fontSize: 15,
          fontWeight: "700",
          marginTop: 5,
        }}
      >
        🧪 Potions
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginTop: 4,
        }}
      >
        <View style={{ flex: 1, marginRight: 3 }}>
          <Button
            title={`Health (${healthPotions})`}
            onPress={() => useFirstPotionByName("Health Potion")}
            color="#9333ea"
          />
        </View>

        <View style={{ flex: 1, marginLeft: 3 }}>
          <Button
            title={`Golden (${goldenPotions})`}
            onPress={() => useFirstPotionByName("Golden Potion")}
            color="#eab308"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 6,
        }}
      >
        <View style={{ flex: 1, marginRight: 2 }}>
          <Button title="⚔️ Fight" onPress={fight} color="#dc2626" />
        </View>

        <View style={{ flex: 1, marginHorizontal: 2 }}>
          <Button title="🛌 Rest" onPress={rest} color="#2563eb" />
        </View>

        <View style={{ flex: 1, marginLeft: 2 }}>
          <Button title="🗺 Explore" onPress={explore} color="#16a34a" />
        </View>
      </View>

      {/* Recent Activity */}
      <Text
        style={{
          color: "#ffffff",
          fontSize: 15,
          fontWeight: "700",
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        📜 25 Recent Activities
      </Text>

      <View
        style={{
          height: 125,
          backgroundColor: "#1e293b",
          borderWidth: 1,
          borderColor: "#475569",
          borderRadius: 8,
          padding: 6,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentActivity.length === 0 ? (
            <Text
              style={{
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              No activity yet.
            </Text>
          ) : (
            recentActivity.map((entry, index) => {
              const text =
                typeof entry === "string" ? entry : entry.text;

              return (
                <Text
                  key={`${index}-${text}`}
                  style={{
                    color: "#cbd5e1",
                    fontSize: 13,
                    marginBottom: 5,
                  }}
                >
                  {text}
                </Text>
              );
            })
          )}
        </ScrollView>
      </View>
      <BannerAd />
    </View>
  );
}