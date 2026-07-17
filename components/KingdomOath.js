// components/KingdomOath.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native-web";
import {
  LAUNCH_KINGDOMS,
  getKingdomById,
} from "../engine/Kingdoms.js";
import { useGame } from "../engine/GameContext.js";

export default function KingdomOath({ onContinue = () => {} }) {
  const { width } = useWindowDimensions();
  const { account, selectKingdom } = useGame();

  const [selectedKingdom, setSelectedKingdom] = useState(null);
  const [welcomedKingdom, setWelcomedKingdom] = useState(null);
  const [selectionError, setSelectionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kingdomChoicesEnabled, setKingdomChoicesEnabled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setKingdomChoicesEnabled(true);
    }, 800);

  return () => clearTimeout(timer);
}, []);

  const accountKingdom = getKingdomById(account?.kingdomId);

  const standingKingdom = welcomedKingdom || accountKingdom;

  const otherKingdoms = standingKingdom
  ? LAUNCH_KINGDOMS.filter(
      (kingdom) => kingdom.id !== standingKingdom.id
    )
  : [];

  // Keep two columns on normal phones.
  // Fall back to one column only on unusually narrow windows.
  const useSingleColumn = width < 340;

  const openConfirmation = (kingdom) => {
    setSelectionError("");
    setSelectedKingdom(kingdom);
  };

  const returnToKingdoms = () => {
    setSelectionError("");
    setSelectedKingdom(null);
  };

  const confirmKingdomOath = () => {
  if (!selectedKingdom || isSubmitting) {
    return;
  }

  setIsSubmitting(true);
  setSelectionError("");

  const result = selectKingdom(selectedKingdom.id);

  if (!result?.success) {
    setSelectionError(
      result?.error || "Your Kingdom Oath could not be completed."
    );
    setIsSubmitting(false);
    return;
  }

  setWelcomedKingdom(selectedKingdom);
  setSelectedKingdom(null);
  setIsSubmitting(false);
};

  if (standingKingdom) {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0f1722",
      }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#1e293b",
            borderColor: "#374151",
            borderWidth: 1,
            borderRadius: 14,
            padding: 20,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "#f5c451",
              fontSize: 29,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Standing with {standingKingdom.name}
          </Text>

          <Text
            style={{
              color: "#9ca3af",
              fontSize: 15,
              lineHeight: 22,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Your deeds now carry the name of {standingKingdom.name}.
          </Text>

          <View
            style={{
              flexDirection: useSingleColumn ? "column" : "row",
              alignItems: "center",
              width: "100%",
              marginBottom: 18,
            }}
          >
            {/* Future 800 × 1000 kingdom crest artwork. */}
            <View
              style={{
                width: 144,
                height: 180,
                flexShrink: 0,
                backgroundColor: "#111827",
                borderColor: "#f5c451",
                borderWidth: 1,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: useSingleColumn ? 0 : 20,
                marginBottom: useSingleColumn ? 16 : 0,
              }}
            >
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 19,
                  textAlign: "center",
                  paddingHorizontal: 8,
                }}
              >
                {standingKingdom.name}
                {"\n"}
                Kingdom Crest
                {"\n"}
                800 × 1000
              </Text>
            </View>

            <View
              style={{
                flex: useSingleColumn ? 0 : 1,
                width: useSingleColumn ? "100%" : "auto",
                minWidth: 0,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 21,
                  fontWeight: "bold",
                  textAlign: useSingleColumn ? "center" : "left",
                  marginBottom: 5,
                }}
              >
                {standingKingdom.primaryValue}
              </Text>

              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 15,
                  lineHeight: 21,
                  textAlign: useSingleColumn ? "center" : "left",
                  marginBottom: 16,
                }}
              >
                {standingKingdom.supportingValues.join(" • ")}
              </Text>

              <View
                style={{
                  backgroundColor: "#111827",
                  borderLeftColor: "#f5c451",
                  borderLeftWidth: 4,
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    color: "#d1d5db",
                    fontSize: 15,
                    lineHeight: 23,
                    fontStyle: "italic",
                  }}
                >
                  “{standingKingdom.oath}”
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "#111827",
                borderRadius: 9,
                padding: 11,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Crowns
              </Text>

              <Text
                style={{
                  color: "#f5c451",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {account?.crowns || 0}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#111827",
                borderRadius: 9,
                padding: 11,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Standing
              </Text>

              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Member
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "#111827",
                borderRadius: 9,
                padding: 11,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Season
              </Text>

              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Coming Soon
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onContinue}
            style={({ pressed }) => ({
              width: "100%",
              backgroundColor: pressed ? "#1d4ed8" : "#2563eb",
              borderRadius: 10,
              paddingVertical: 14,
              paddingHorizontal: 18,
              alignItems: "center",
            })}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Continue My Journey
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 13,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          THE OTHER KINGDOMS
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {otherKingdoms.map((kingdom) => (
            <View
              key={kingdom.id}
              style={{
                width: useSingleColumn ? "100%" : "31.8%",
                minWidth: useSingleColumn ? 0 : 150,
                backgroundColor: "#1e293b",
                borderColor: "#374151",
                borderWidth: 1,
                borderRadius: 10,
                padding: 9,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {/* Small display of the same 800 × 1000 crest. */}
              <View
                style={{
                  width: 40,
                  height: 50,
                  flexShrink: 0,
                  backgroundColor: "#111827",
                  borderColor: "#4b5563",
                  borderWidth: 1,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 9,
                }}
              >
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 9,
                    textAlign: "center",
                  }}
                >
                  Crest
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  style={{
                    color: "#d1d5db",
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 3,
                  }}
                >
                  {kingdom.name}
                </Text>

                <Text
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                  }}
                >
                  {kingdom.primaryValue}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

  if (selectedKingdom) {
    return (
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#0f1722",
        }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 32,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 620,
            alignSelf: "center",
            backgroundColor: "#1e293b",
            borderColor: "#374151",
            borderWidth: 1,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "#f5c451",
              fontSize: 28,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Confirm Your Oath
          </Text>

          <Text
            style={{
              color: "#ffffff",
              fontSize: 17,
              lineHeight: 24,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            You have chosen {selectedKingdom.name}.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              backgroundColor: "#111827",
              borderRadius: 12,
              padding: 14,
              marginBottom: 18,
            }}
          >
            {/* Reserved space for the kingdom's future crest or portrait. */}
            <View
              style={{
                width: 90,
                aspectRatio: 0.8,
                flexShrink: 0,
                backgroundColor: "#0f1722",
                borderColor: "#4b5563",
                borderWidth: 1,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  lineHeight: 16,
                  textAlign: "center",
                  paddingHorizontal: 5,
                }}
              >
                Kingdom{"\n"}Crest
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Text
                style={{
                  color: "#f5c451",
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 7,
                }}
              >
                {selectedKingdom.name}
              </Text>

              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 17,
                  fontWeight: "bold",
                  marginBottom: 5,
                }}
              >
                {selectedKingdom.primaryValue}
              </Text>

              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {selectedKingdom.supportingValues.join(" • ")}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#111827",
              borderLeftColor: "#f5c451",
              borderLeftWidth: 4,
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: "#d1d5db",
                fontSize: 17,
                lineHeight: 25,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              “{selectedKingdom.oath}”
            </Text>
          </View>

          <Text
            style={{
              color: "#d1d5db",
              fontSize: 15,
              lineHeight: 23,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Your Kingdom Oath is permanent.
          </Text>

          <Text
            style={{
              color: "#9ca3af",
              fontSize: 14,
              lineHeight: 21,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Your kingdom will remain part of your account even if your
            character begins anew. It can only be removed by deleting your
            account.
          </Text>

          {selectionError ? (
            <View
              style={{
                backgroundColor: "#3f1d1d",
                borderColor: "#7f1d1d",
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: "#fecaca",
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                {selectionError}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={confirmKingdomOath}
            disabled={isSubmitting}
            style={({ pressed }) => ({
              backgroundColor: isSubmitting
                ? "#4b5563"
                : pressed
                  ? "#d9a932"
                  : "#f5c451",
              borderRadius: 10,
              paddingVertical: 14,
              paddingHorizontal: 18,
              alignItems: "center",
              marginBottom: 10,
              opacity: isSubmitting ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: "#111827",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {isSubmitting
                  ? "Confirming Oath..."
                    : `Stand with ${selectedKingdom.name}`}
            </Text>
          </Pressable>

          <Pressable
            onPress={returnToKingdoms}
            disabled={isSubmitting}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#273449" : "#111827",
              borderColor: "#4b5563",
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 13,
              paddingHorizontal: 18,
              alignItems: "center",
              opacity: isSubmitting ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              Return to the Kingdoms
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0f1722",
      }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 900,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            color: "#f5c451",
            fontSize: 30,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          The Kingdom Oath
        </Text>

        <Text
          style={{
            color: "#ffffff",
            fontSize: 18,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Your deeds have not gone unnoticed.
        </Text>

        <Text
          style={{
            color: "#d1d5db",
            fontSize: 16,
            lineHeight: 24,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          The kingdoms now invite you to make an Oath—not for power, but
          for purpose.
        </Text>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Read their values carefully. Your choice will become a permanent
          part of your account.
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {LAUNCH_KINGDOMS.map((kingdom) => (
            <View
              key={kingdom.id}
              style={{
                width: useSingleColumn ? "100%" : "48.8%",
                backgroundColor: "#1e293b",
                borderColor: "#374151",
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Reserved space for a future crest or portrait image. */}
                <View
                  style={{
                    width: useSingleColumn ? 86 : 72,
                    aspectRatio: 0.8,
                    flexShrink: 0,
                    backgroundColor: "#111827",
                    borderColor: "#4b5563",
                    borderWidth: 1,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      lineHeight: 15,
                      textAlign: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    Kingdom{"\n"}Crest
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text
                    style={{
                      color: "#f5c451",
                      fontSize: useSingleColumn ? 22 : 19,
                      fontWeight: "bold",
                      marginBottom: 6,
                    }}
                  >
                    {kingdom.name}
                  </Text>

                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    {kingdom.primaryValue}
                  </Text>

                  <Text
                    style={{
                      color: "#9ca3af",
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                  >
                    {kingdom.supportingValues.join(" • ")}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#111827",
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 12,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#d1d5db",
                    fontSize: 14,
                    lineHeight: 20,
                    fontStyle: "italic",
                  }}
                >
                  “{kingdom.oath}”
                </Text>
              </View>

              <Pressable
                  onPress={() => openConfirmation(kingdom)}
                  disabled={!kingdomChoicesEnabled}
                style={({ pressed }) => ({
                  backgroundColor: !kingdomChoicesEnabled
                    ? "#4b5563"
                    : pressed
                      ? "#d9a932"
                      : "#f5c451",
                  opacity: kingdomChoicesEnabled ? 1 : 0.65,
                  borderRadius: 8,
                  paddingVertical: 11,
                  paddingHorizontal: 10,
                  alignItems: "center",
                })}
              >
                <Text
                  style={{
                    color: "#111827",
                    fontSize: 14,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Choose {kingdom.name}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Text
          style={{
            color: "#9ca3af",
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          You may answer today, or continue your journey until the time is
          right.
        </Text>

        <Pressable
          onPress={onContinue}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#1d4ed8" : "#2563eb",
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 18,
            alignItems: "center",
          })}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Continue My Journey
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}