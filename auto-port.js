// auto-port.js
import { execSync } from "child_process";

const port = process.env.PORT || 5000;
console.log(`🌐 Starting Parcel on port ${port}...`);

try {
  execSync(`npx parcel index.html --no-hmr --no-cache --port ${port} --public-url /`, {
    stdio: "inherit",
  });
} catch (err) {
  console.error("❌ Parcel failed to start:", err.message);
  
}
