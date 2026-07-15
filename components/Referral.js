// src/components/Referral.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button } from "react-native-web";
import { useGame } from "../engine/GameContext";
import { getApps, initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment,
} from "firebase/firestore";

// Local storage keys
const LS_PLAYER_ID = "cb_player_id";
const LS_REF_APPLIED = "cb_referral_applied";
const LS_REF_CODE = "cb_referral_code";

// Firestore collection
const COL_REFERRALS = "referrals";

// Utility: simple UUID v4 fallback
const makeId = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

// Detect Firebase config (from window)
const getFirebaseConfig = () => {
  try {
    if (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) {
      return window.__FIREBASE_CONFIG__;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export default function Referral() {
  const { awardCrowns, addLog } = useGame();

  // UI state
  const [code, setCode] = useState(localStorage.getItem(LS_REF_CODE) || "");
  const [applied, setApplied] = useState(localStorage.getItem(LS_REF_APPLIED) === "true");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Firebase db ref
  const [db, setDb] = useState(null);

  // Ensure stable player ID
  useEffect(() => {
    let pid = localStorage.getItem(LS_PLAYER_ID);
    if (!pid) {
      pid = makeId();
      localStorage.setItem(LS_PLAYER_ID, pid);
    }
  }, []);

  // Listen online/offline
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Init Firebase
  useEffect(() => {
    const cfg = getFirebaseConfig();
    if (!cfg) {
      setFirebaseReady(false);
      return;
    }
    try {
      if (!getApps().length) {
        initializeApp(cfg);
      }
      const fdb = getFirestore();
      setDb(fdb);
      setFirebaseReady(true);
    } catch (e) {
      console.error("Firebase init failed:", e);
      setFirebaseReady(false);
    }
  }, []);

  // Helpers
  const playerId = () => localStorage.getItem(LS_PLAYER_ID);

  const saveAppliedLocally = (appliedCode) => {
    localStorage.setItem(LS_REF_APPLIED, "true");
    if (appliedCode) localStorage.setItem(LS_REF_CODE, appliedCode);
    setApplied(true);
    setCode(appliedCode || code);
  };

  // Generate a code
  const generateMyCode = async () => {
    if (!firebaseReady || !db) {
      setMessage("Referral service not configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const short = Math.random().toString(36).substring(2, 8).toUpperCase();
      const docRef = doc(db, COL_REFERRALS, short);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMessage("Collision on code, retrying...");
        setBusy(false);
        return generateMyCode();
      }

      await setDoc(docRef, {
        code: short,
        ownerId: playerId(),
        createdAt: serverTimestamp(),
        uses: 0,
        referred: [],
      });

      setCode(short);
      localStorage.setItem(LS_REF_CODE, short);
      setMessage(`Your referral code: ${short}`);
    } catch (e) {
      console.error("generateMyCode error", e);
      setMessage("Failed to generate code.");
    } finally {
      setBusy(false);
    }
  };

  // Apply a referral
  const applyReferral = async (codeToApply) => {
    setMessage("");
    if (!codeToApply) {
      setMessage("Enter a code.");
      return;
    }
    if (!online) {
      setMessage("You are offline — referral requires internet.");
      return;
    }
    if (!firebaseReady || !db) {
      setMessage("Referral service not configured.");
      return;
    }
    if (applied) {
      setMessage("Referral already applied on this device.");
      return;
    }

    setBusy(true);
    try {
      const docRef = doc(db, COL_REFERRALS, codeToApply);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        setMessage("Referral code not found.");
        setBusy(false);
        return;
      }

      const data = snap.data();
      if (!data) {
        setMessage("Invalid referral record.");
        setBusy(false);
        return;
      }

      const ownerId = data.ownerId;
      const myId = playerId();

      if (ownerId === myId) {
        setMessage("You cannot apply your own code.");
        setBusy(false);
        return;
      }

      if (Array.isArray(data.referred) && data.referred.includes(myId)) {
        setMessage("This account already used that code.");
        setBusy(false);
        return;
      }

      await updateDoc(docRef, {
        uses: increment(1),
        referred: arrayUnion(myId),
      });

      const NEW_USER_BONUS = 3;
      const OWNER_BONUS = 1;

      const given = awardCrowns(NEW_USER_BONUS, "referral");
      if (given > 0) {
        addLog(`🎁 Referral applied: +${given} Crowns.`);
        setMessage(`Referral applied — you got +${given} Crowns!`);
      } else {
        setMessage("Referral applied, but no crowns awarded.");
      }

      try {
        const ownerRewardRef = doc(db, `${COL_REFERRALS}/${codeToApply}/ownerRewards`, myId);
        await setDoc(ownerRewardRef, {
          from: myId,
          ts: serverTimestamp(),
          amount: OWNER_BONUS,
        });
      } catch (e) {
        console.warn("Failed to write owner reward:", e);
      }

      saveAppliedLocally(codeToApply);
    } catch (e) {
      console.error("applyReferral error:", e);
      setMessage("Failed to apply referral.");
    } finally {
      setBusy(false);
    }
  };

  // UI
  const disabledApply = busy || !online || !firebaseReady || applied;

  return (
    <View style={{ backgroundColor: "#fff4e6", padding: 12, borderRadius: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#4a3728" }}>
        🤝 Referral Program (Online)
      </Text>

      {!firebaseReady && (
        <Text style={{ color: "#92400e", marginBottom: 8 }}>
          ⚠️ Referral service is not configured. To enable referrals, set window.__FIREBASE_CONFIG__.
        </Text>
      )}

      {!online && (
        <Text style={{ color: "#92400e", marginBottom: 8 }}>
          ⚠️ You are offline — referrals require internet.
        </Text>
      )}

      <Text style={{ color: "#4a3728", marginBottom: 6 }}>
        Enter a referral code to claim a bonus:
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 6,
            paddingHorizontal: 8,
            backgroundColor: applied ? "#f3f4f6" : "#fff",
            color: "#111",
          }}
          placeholder="Referral code (e.g. ABC123)"
          value={code}
          onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
          editable={!disabledApply}
        />
        <View style={{ marginLeft: 6 }}>
          <Button title="Apply" onPress={() => applyReferral(code)} color="#16a34a" disabled={disabledApply} />
        </View>
      </View>

      <View style={{ marginTop: 6, marginBottom: 8 }}>
        <Text style={{ color: "#4a3728", marginBottom: 6 }}>Or generate your own code:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={localStorage.getItem(LS_REF_CODE) || ""}
            editable={false}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 6,
              paddingHorizontal: 8,
              marginRight: 8,
              backgroundColor: "#fff",
              color: "#111",
            }}
            placeholder="No code yet"
          />
          <Button
            title="Generate"
            onPress={generateMyCode}
            color="#2563eb"
            disabled={!firebaseReady || busy || !online}
          />
        </View>
      </View>

      {message ? (
        <Text style={{ marginTop: 6, color: "#92400e" }}>{message}</Text>
      ) : null}

      {applied && (
        <Text style={{ marginTop: 6, color: "#4b5563", fontSize: 12 }}>
          Referral applied and saved locally.
        </Text>
      )}

      <Text style={{ color: "#4b5563", marginTop: 8, fontSize: 12 }}>
        Note: referrals are verified online — local/demo codes are not supported.
      </Text>
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
