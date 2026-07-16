import React, { useEffect, useRef } from "react";

const CLIENT = "ca-pub-2070313816394931";

const SLOT = "6480247044";

let scriptLoaded = false;

function loadAdsense() {
  if (scriptLoaded) return;

  if (
    document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    )
  ) {
    scriptLoaded = true;
    return;
  }

  const script = document.createElement("script");

  script.async = true;
  script.crossOrigin = "anonymous";
  script.src =
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;

  document.head.appendChild(script);

  scriptLoaded = true;
}

export function BannerAd() {
  const initialized = useRef(false);

  useEffect(() => {
    loadAdsense();

    if (initialized.current) return;

    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
          initialized.current = true;
        }
      } catch (err) {
        console.warn("AdSense:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "728px",
        minHeight: "50px",
        margin: "4px auto 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: "50px",
        }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </div>
  );
}

export const BannerAdSize = {
  FULL_BANNER: "FULL_BANNER",
};

export const TestIds = {
  BANNER: "web-banner",
  REWARDED: "web-rewarded",
};

export const RewardedAd = {
  createForAdRequest() {
    return {
      load() {
        console.log("Rewarded Ad Loaded");
      },
      show() {
        console.log("Rewarded Ad Shown");
      },
    };
  },
};

export async function showRewardedAd(onReward) {
  alert("Rewarded Ads are not implemented on Web yet.");

  if (onReward) {
    onReward();
  }
}