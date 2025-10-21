const { defineConfig } = require('@vue/cli-service')
const { execSync } = require('child_process')
const package = require('./package.json')

// Генерація версії білда
function getBuildVersion() {
  let buildNumber = 'dev'

  try {
    // Використовуємо git hash як номер білда
    buildNumber = execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    console.warn('Git hash не доступний, використовується "dev"')
  }

  const buildTime = new Date().toISOString()

  return {
    buildNumber,
    buildTime
  }
}

const buildInfo = getBuildVersion()

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['process.env'].VUE_APP_BUILD_NUMBER = JSON.stringify(buildInfo.buildNumber)
      args[0]['process.env'].VUE_APP_BUILD_TIME = JSON.stringify(buildInfo.buildTime)
      return args
    })
  }
})
