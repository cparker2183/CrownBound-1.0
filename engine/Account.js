// src/engine/Account.js

export const ACCOUNT_STORAGE_KEY = "crownbound_account_v1";

export function createDefaultAccount() {
  return {
    kingdomId: null,
    crowns: 0,
    legacy: "Unaffiliated",
    kingdomPromptSeen: false,
    rewardedAdsToday: 0,
    rewardedAdsDate: null,
  };
}

export function loadAccount() {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);

    if (!raw) {
      return createDefaultAccount();
    }

    return {
      ...createDefaultAccount(),
      ...JSON.parse(raw),
    };
  } catch (error) {
    console.warn("Failed to load account:", error);
    return createDefaultAccount();
  }
}

export function saveAccount(account) {
  try {
    localStorage.setItem(
      ACCOUNT_STORAGE_KEY,
      JSON.stringify(account)
    );
  } catch (error) {
    console.warn("Failed to save account:", error);
  }
}