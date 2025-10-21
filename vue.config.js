const { defineConfig } = require('@vue/cli-service')
const { execSync } = require('child_process')
const package = require('./package.json')

// Генерація версії білда
function getBuildVersion() {
  const version = package.version
  let gitHash = 'dev'

  try {
    // Отримуємо короткий git hash
    gitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    console.warn('Git hash не доступний, використовується "dev"')
  }

  const buildTime = new Date().toISOString()

  return {
    version,
    gitHash,
    buildTime,
    fullVersion: `${version}-${gitHash}`
  }
}

const buildInfo = getBuildVersion()

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['process.env'].VUE_APP_VERSION = JSON.stringify(buildInfo.version)
      args[0]['process.env'].VUE_APP_GIT_HASH = JSON.stringify(buildInfo.gitHash)
      args[0]['process.env'].VUE_APP_BUILD_TIME = JSON.stringify(buildInfo.buildTime)
      args[0]['process.env'].VUE_APP_FULL_VERSION = JSON.stringify(buildInfo.fullVersion)
      return args
    })
  }
})
