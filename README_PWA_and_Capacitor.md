CrownBound — Build & Publish (PWA + Android APK via Capacitor)

Prereqs:
- Node.js + npm installed
- Android Studio (for final APK signing / Play Store upload) OR use PWABuilder for APK/Bundle if you prefer

1) Install deps
   npm install

2) Run locally (dev)
   npm start
   (open http://localhost:1234 or the port from parcel)

3) Build web bundle
   npm run build
   (If your package.json doesn't have a build script: use: npx parcel build index.html --public-url ./)

4) PWA (quick, host static files)
   - Ensure manifest.json and service-worker.js are in your published root.
   - Host the `dist/` folder on any static host (Netlify, GitHub Pages, Vercel, static server).
   - Users can "Install" from Chrome/Edge as an app.

5) Wrap with Capacitor for Android (free)
   npm install @capacitor/core @capacitor/cli --save
   npx cap init crownbound com.yourcompany.crownbound
   # When init asks: app name, app id
   # Build web assets first:
   npm run build
   # copy build output to capacitor
   npx cap copy
   npx cap add android  # installs Android project
   npx cap open android # opens Android Studio
   # In Android Studio: Build -> Generate Signed Bundle / APK (for Play Store)

6) Notes for Play Store
   - Create Google Play Developer account ($25 one-time).
   - Use a clear description: "Demo app — rewards are simulated. Real payouts coming soon."
   - Include privacy policy and contact info.
   - Follow Google Play policies for rewarded ads and incentives.

7) To replace the demo ad flow with real AdMob later:
   - Remove the showTestAd() shim and integrate AdMob SDK for web/native.
   - Implement server-side accounting and a payment provider (PayPal MassPay, Stripe Connect, or crypto custodian).
   - Add fraud prevention and KYC if you enable fiat payouts.

8) Local storage keys used by the demo:
   - cb_coins
   - cb_transactions
   - cb_referral_code
   - cb_referral_applied
   - cb_pending_payouts

If you want, I can provide a prefilled Android `ic_launcher` and other icons in PNG — tell me preferred colors and title and I’ll produce the images (you paste them into /icons).
