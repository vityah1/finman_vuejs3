module.exports = {
    devServer: {
        port: 8081
    }, configureWebpack: {
        devtool: 'source-map'
    }
    // , publicPath: '/finman'
    ,
    // publicPath: process.env.NODE_ENV === 'production'
    //     ? '/finman/'
    //     : '/',
    publicPath: '/finman/',
    // assetsPublicPath: '/finman/',
    productionSourceMap: false
}