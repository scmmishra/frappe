const path = require('path')

module.exports = {
  publicPath: '/desk-beta/',
  outputDir: path.resolve('./frappe/www/desk-beta'),
  runtimeCompiler: true,
  configureWebpack(config) {
    config.entry.app = ['./desk-beta/src/main.js'];
    config.resolve.alias['@'] = path.resolve('./desk-beta/src');
  },
  devServer: {
    allowedHosts: ['frappe.develop'],
    proxy: 'http://frappe.develop:8004/',
  },
}
