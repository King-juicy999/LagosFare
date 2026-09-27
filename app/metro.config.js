const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const dataRoot = path.resolve(projectRoot, "..", "data");

const config = getDefaultConfig(projectRoot);

config.resolver.platforms = ["android"];

config.watchFolders = [...(config.watchFolders ?? []), dataRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "..", "node_modules"),
];

module.exports = config;
