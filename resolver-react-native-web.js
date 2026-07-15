// resolver-react-native-web.js
console.log("[Parcel Resolver] Custom react-native-web resolver active!");

const { Resolver } = require("@parcel/plugin");

module.exports = new Resolver({
  async resolve({ dependency }) {
    const spec = dependency?.moduleSpecifier;

    // 🧩 Ignore entries like index.html or undefined
    if (!spec || typeof spec !== "string") {
      return null;
    }

    // 1️⃣ Redirect base react-native imports
    if (spec === "react-native") {
      console.log("[Parcel Resolver] Redirecting react-native → react-native-web");
      return { filePath: require.resolve("react-native-web") };
    }

    // 2️⃣ Redirect deep internal RN imports (e.g. react-native/Libraries/...)
    if (spec.startsWith("react-native/")) {
      const relativePath = spec.replace(/^react-native\//, "");
      try {
        const resolved = require.resolve(`react-native-web/${relativePath}`);
        console.log(`[Parcel Resolver] Mapped ${spec} → ${resolved}`);
        return { filePath: resolved };
      } catch {
        console.log(`[Parcel Resolver] Fallback for ${spec}`);
        return { filePath: require.resolve("react-native-web") };
      }
    }

    // Default to normal Parcel resolution
    return null;
  },
});
