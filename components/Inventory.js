import React from "react";
import { View, Text, Button, ScrollView } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Inventory() {
  const { inventory, equipItem, usePotion, sellItem, MAX_INVENTORY } = useGame();

  return (
    <View style={{ backgroundColor: "#fff4e6", padding: 12, borderRadius: 12 }}>
      <Text style={{ fontWeight: "800", marginBottom: 6, color: "#4a3728" }}>
        Inventory ({inventory.length}/{MAX_INVENTORY})
      </Text>

      <ScrollView style={{ maxHeight: 320 }}>
        {inventory.map((item, i) => {
          if (!item) return null;
          const safeName = item.name || `Unknown Item ${i}`;

          return (
            <View
              key={`${safeName}-${i}`}
              style={{
                borderBottomWidth: 1,
                borderColor: "#eadfce",
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#4a3728", marginBottom: 6 }}>
                {safeName}
                {item.damageBonus
                  ? ` (+${item.damageBonus} dmg)`
                  : item.defenseBonus
                  ? ` (+${item.defenseBonus} def)`
                  : item.heal
                  ? ` (heals ${item.heal})`
                  : ""}
              </Text>

              <View style={{ flexDirection: "row" }}>
                {(item.type === "weapon" || item.type === "armor") && (
                  <View style={{ flex: 1, marginRight: 4 }}>
                    <Button
                      title="Equip"
                      onPress={() => equipItem(item)}
                      color="#4f46e5"
                    />
                  </View>
                )}

                {item.type === "potion" && (
                  <View style={{ flex: 1, marginRight: 4 }}>
                    <Button
                      title="Use"
                      onPress={() => usePotion(i)}
                      color="#9333ea"
                    />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Button
                    title="Sell"
                    onPress={() => sellItem(i)}
                    color="#d97706"
                  />
                </View>
              </View>
            </View>
          );
        })}

        {inventory.length === 0 && (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 10 }}>
            Empty.
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
