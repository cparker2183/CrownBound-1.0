// src/engine/RNCompat.js
let rn;
try {
  rn = require("react-native"); // mobile
} catch (e) {
  rn = require("react-native-web"); // web fallback
}

export const {
  View,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  Platform,
} = rn;
