const { getDefaultConfig } = require("expo/metro-config");
const nodeLibs = require("node-libs-browser");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    ...nodeLibs,
  };
  config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs"];
  return config;
})();
