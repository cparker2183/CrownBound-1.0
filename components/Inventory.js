import React from "react";
import { View, Text, Button, ScrollView } from "react-native-web";
import { useGame } from "../engine/GameContext";

export default function Inventory() {
  const { inventory, equipItem, usePotion, sellItem, MAX_INVENTORY } = useGame();

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
      fontWeight: "800",
      marginBottom: 6,
      color: "#ffffff",
    }}
  >
        Inventory ({inventory.length}/{MAX_INVENTORY})
      </Text>

      <ScrollView 
      showsVerticalScrollIndicator={false}
      style={{ maxHeight: 620 }}>
        {inventory.map((item, i) => {
          if (!item) return null;
          const safeName = item.name || `Unknown Item ${i}`;

          return (
            <View
              key={`${safeName}-${i}`}
              style={{
                backgroundColor: "#1e293b",
                borderWidth: 2,
                borderColor: "#475569",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#ffffff", marginBottom: 6 }}>
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
  <Text
    style={{
      color: "#9ca3af",
      textAlign: "center",
      paddingVertical: 24,
    }}
  >
    Empty.
  </Text>
)}
      </ScrollView>
    </View>
  );
}
