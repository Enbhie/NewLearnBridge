const reactNativeRuntime = require("react-native-css/components");
// expo-asset imports this export from React Native, but the CSS wrapper omits it.
reactNativeRuntime.AssetRegistry = require("react-native/asset-registry");

require("expo-router/entry");
