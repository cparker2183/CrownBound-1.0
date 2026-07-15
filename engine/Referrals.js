// engine/Referrals.js
/**
 * Referrals engine
 *
 * Exports:
 *  - setContext(ctx)
 *  - handleReferralSubmit(code)
 *  - handleReferralSubmitLocal(code)
 *  - handleReferralSubmitServer(code)
 *  - syncMyCodeToServer()
 *  - pullPendingReferrerRewards()
 *
 * This module expects ctx to include getPlayer, setPlayer, createFloatingNumber, clampNumber, deviceUID, setRefTabNotice, save/load local registry helpers, and firestore helpers if available.
 */

let ctx = null;

export function setContext(context) {
  ctx = context || {};
}

function loadLocalRegistry() {
  try {
    const raw = localStorage.getItem(ctx?.REF_REGISTRY_KEY || "crownbound_referrals_v1");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadLocalRegistry error", e);
    return {};
  }
}
function saveLocalRegistry(reg) {
  try {
    localStorage.setItem(ctx?.REF_REGISTRY_KEY || "crownbound_referrals_v1", JSON.stringify(reg));
    ctx?.setRefRegistry?.(reg);
  } catch (e) {
    console.warn("saveLocalRegistry error", e);
  }
}
function addOrUpdateLocalRegistryEntry(code, ownerName) {
  if (!code) return;
  const reg = loadLocalRegistry();
  if (!reg[code]) {
    reg[code] = { ownerName: ownerName || "Player", createdAt: Date.now(), referrals: [], playerSnapshot: { name: ownerName || "Player", referralCode: code } };
  } else {
    reg[code].ownerName = ownerName || reg[code].ownerName;
    reg[code].playerSnapshot = { ...(reg[code].playerSnapshot || {}), name: ownerName || reg[code].ownerName, referralCode: code };
  }
  saveLocalRegistry(reg);
}

export async function syncMyCodeToServer() {
  try {
    if (!ctx?.fbAvailable || !ctx?.firestoreHelpers) {
      ctx?.setRefTabNotice?.("Firebase offline/disabled.");
      return;
    }
    const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = ctx.firestoreHelpers;
    const code = ctx.getPlayer()?.referralCode;
    if (!code) { ctx.setRefTabNotice?.("No code"); return; }
    const refDoc = doc(ctx.fbDb, "referrals", code);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      await updateDoc(refDoc, { ownerName: ctx.getPlayer()?.name || "Player", updatedAt: serverTimestamp() });
    } else {
      await setDoc(refDoc, { ownerName: ctx.getPlayer()?.name || "Player", createdAt: serverTimestamp(), count: 0, referrals: [], creditGold: 0, creditXP: 0, creditCrowns: 0 });
    }
    ctx.setRefTabNotice?.("Synced with server.");
  } catch (e) {
    console.warn("syncMyCodeToServer error", e);
    ctx.setRefTabNotice?.("Could not sync — check network.");
  }
}

export async function pullPendingReferrerRewards() {
  try {
    if (!ctx?.fbAvailable || !ctx?.firestoreHelpers) {
      ctx.setRefTabNotice?.("Firebase offline/disabled.");
      return;
    }
    const { doc, getDoc, updateDoc } = ctx.firestoreHelpers;
    const code = ctx.getPlayer()?.referralCode;
    if (!code) { ctx.setRefTabNotice?.("No code assigned."); return; }
    const refDoc = doc(ctx.fbDb, "referrals", code);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) { ctx.setRefTabNotice?.("Not registered on server."); return; }
    const data = snap.data();
    const gold = ctx.clampNumber?.(data.creditGold || 0) || (data.creditGold || 0);
    const xp = ctx.clampNumber?.(data.creditXP || 0) || (data.creditXP || 0);
    const crowns = ctx.clampNumber?.(data.creditCrowns || 0) || (data.creditCrowns || 0);
    if (gold === 0 && xp === 0 && crowns === 0) { ctx.setRefTabNotice?.("No pending rewards."); return; }
    await updateDoc(refDoc, { creditGold: 0, creditXP: 0, creditCrowns: 0 });
    const p = ctx.getPlayer();
    ctx.setPlayer({ ...p, gold: (p.gold || 0) + gold, xp: (p.xp || 0) + xp, crowns: (p.crowns || 0) + crowns });
    ctx.createFloatingNumber?.(`+${gold} Gold (ref)`, "#f1c40f", 160);
    ctx.createFloatingNumber?.(`+${xp} XP (ref)`, "#3498db", 180);
    if (crowns) ctx.createFloatingNumber?.(`+${crowns} Crowns`, "#f39c12", 150);
    ctx.setRefTabNotice?.("Pulled pending rewards.");
  } catch (e) {
    console.warn("pullPendingReferrerRewards error", e);
    ctx.setRefTabNotice?.("Couldn’t load live referral data.");
  }
}

export function handleReferralSubmitLocal(code) {
  try {
    const reg = loadLocalRegistry();
    if (!reg[code]) {
      ctx.setMessage?.("Invalid referral code (local).");
      return;
    }
    // grant referee
    const p = ctx.getPlayer();
    ctx.setPlayer({ ...p,
      gold: (p.gold || 0) + (ctx.REF_REWARDS?.referee?.gold || 100),
      xp: (p.xp || 0) + (ctx.REF_REWARDS?.referee?.xp || 50),
      crowns: (p.crowns || 0) + (ctx.REF_REWARDS?.referee?.crowns || 1),
      usedReferralCodes: [...(p.usedReferralCodes || []), code],
    });
    ctx.createFloatingNumber?.(`Referral Used! +${ctx.REF_REWARDS.referee.gold} Gold`, "#f1c40f", 150);
    // update registry
    const entry = reg[code];
    entry.referrals = entry.referrals || [];
    entry.referrals.push({ name: p.name || "Player", date: Date.now(), uid: ctx.deviceUID || "local" });
    entry.pending = entry.pending || { gold: 0, xp: 0, crowns: 0 };
    entry.pending.gold += ctx.REF_REWARDS?.referrer?.gold || 50;
    entry.pending.xp += ctx.REF_REWARDS?.referrer?.xp || 25;
    entry.pending.crowns += ctx.REF_REWARDS?.referrer?.crowns || 2;
    saveLocalRegistry(reg);
    ctx.setMessage?.("Referral accepted locally. Rewards granted.");
  } catch (e) {
    console.warn("handleReferralSubmitLocal error", e);
    ctx.setMessage?.("Referral error (local).");
  }
}

export async function handleReferralSubmitServer(code) {
  if (!ctx?.fbAvailable || !ctx?.firestoreHelpers) throw new Error("Firebase not ready");
  const { doc, getDoc, runTransaction, serverTimestamp, arrayUnion, increment } = ctx.firestoreHelpers;
  const deviceUID = ctx.deviceUID || "uid_local_fallback";
  const userName = ctx.getPlayer()?.name || "Player";
  await runTransaction(ctx.fbDb, async (tx) => {
    const refDoc = doc(ctx.fbDb, "referrals", code);
    const redemptionDoc = doc(ctx.fbDb, "redemptions", `${code}_${deviceUID}`);
    const [refSnap, redSnap] = await Promise.all([tx.get(refDoc), tx.get(redemptionDoc)]);
    if (!refSnap.exists()) throw new Error("Invalid referral code (server).");
    if (redSnap.exists()) throw new Error("Already used (server).");
    tx.set(redemptionDoc, { uid: deviceUID, name: userName, date: serverTimestamp() });
    tx.update(refDoc, {
      count: increment(1),
      referrals: arrayUnion({ name: userName, uid: deviceUID, date: serverTimestamp() }),
      creditGold: increment(ctx.REF_REWARDS?.referrer?.gold || 50),
      creditXP: increment(ctx.REF_REWARDS?.referrer?.xp || 25),
      creditCrowns: increment(ctx.REF_REWARDS?.referrer?.crowns || 2),
    });
  });
  // grant referee locally
  const p = ctx.getPlayer();
  ctx.setPlayer({ ...p, gold: (p.gold || 0) + (ctx.REF_REWARDS.referee.gold || 100), xp: (p.xp || 0) + (ctx.REF_REWARDS.referee.xp || 50), crowns: (p.crowns || 0) + (ctx.REF_REWARDS.referee.crowns || 1), usedReferralCodes: [...(p.usedReferralCodes || []), code] });
  ctx.createFloatingNumber?.(`+${ctx.REF_REWARDS.referee.gold} Gold`, "#f1c40f", 160);
  ctx.setRefTabNotice?.("Referral accepted (server).");
}

export async function handleReferralSubmit(code) {
  if (!code) { ctx.setMessage?.("Please enter a referral code."); return; }
  const p = ctx.getPlayer();
  if (!p) return;
  if (code === p.referralCode) { ctx.setMessage?.("Cannot use your own code."); return; }
  if ((p.usedReferralCodes || []).includes(code)) { ctx.setMessage?.("You already used this code."); return; }
  if (ctx.fbAvailable && ctx.firestoreHelpers) {
    try {
      await handleReferralSubmitServer(code);
      return;
    } catch (e) {
      console.warn("server referral failed, fallback", e);
      ctx.setRefTabNotice?.("Server failed; using local fallback.");
    }
  }
  // local fallback
  handleReferralSubmitLocal(code);
}

export default {
  setContext,
  handleReferralSubmit,
  handleReferralSubmitLocal,
  handleReferralSubmitServer,
  syncMyCodeToServer,
  pullPendingReferrerRewards,
};
