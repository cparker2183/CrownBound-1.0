// index.js (root of project)
import React from "react";
import { AppRegistry } from "react-native-web";
import App from "./App.js";
import { GameProvider } from "./engine/GameContext.js";

// ✅ Create a simple entry component that wraps the app
function CrownBoundRoot() {
  return (
    <GameProvider>
      <App />
    </GameProvider>
  );
}

// ✅ Register for React Native Web / Parcel
AppRegistry.registerComponent("CrownBound", () => CrownBoundRoot);
AppRegistry.runApplication("CrownBound", {
  initialProps: {},
  rootTag: document.getElementById("root") || document.body.appendChild(document.createElement("div")),
});
