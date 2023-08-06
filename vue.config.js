const { defineConfig } = require('@vue/cli-service')
const CopyPlugin = require('copy-webpack-plugin')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: 'public/manifest.json',
          to: 'manifest.json'
        }]
      })
    ]
  }
})
