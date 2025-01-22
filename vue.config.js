const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {  // 代理转发
    proxy: {
      '/api': {
        open: true,
        target: 'http://localhost:9900/api/',// 后台目标地址,会自动拼接
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 替换请求路径中的api为没有 ^为正则表达式表示为以什么为开头的
        }
      }
    }
  }
})
