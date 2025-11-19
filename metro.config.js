const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

// Use CommonJS so Metro's config loader (which uses require) can load this file inside Docker.
// Previously `.mjs` with ESM exports caused the "could not be loaded" error.
const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })
