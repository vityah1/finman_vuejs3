module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    '@babel/plugin-transform-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-class-properties'
  ]
}
