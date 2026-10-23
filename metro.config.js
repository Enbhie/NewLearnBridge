const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("node:path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const nativewindConfig = withNativewind(config);
const nativewindResolver = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const isExpoAssetImport =
    moduleName === "react-native" &&
    context.originModulePath.includes(
      `${path.sep}expo-asset${path.sep}`,
    );

  if (isExpoAssetImport) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return nativewindResolver(context, moduleName, platform);
};

module.exports = nativewindConfig;