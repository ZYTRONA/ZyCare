const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude backend and ai-engine folders from Metro bundling
config.resolver.blockList = [
  /backend\/.*/,
  /ai-engine\/.*/,
];

// Exclude backend and ai-engine from watchFolders
config.watchFolders = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'assets'),
];

module.exports = config;
