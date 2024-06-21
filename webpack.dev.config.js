const { getBaseConfig } = require('@edx/frontend-build');

/**
 * We customize the plugins here for the following reasons:
 *
 * - We want a custom html-webpack-plugin config
 */
const config = getBaseConfig('webpack-dev');

config.devServer.historyApiFallback = true;
config.devServer.allowedHosts = 'all';
config.devServer.proxy = {
  '/proxy/ecommerce': {
    target: 'http://ecommerce.local.edly.io:8130',
    secure: false,
    pathRewrite: { '^/proxy/ecommerce': '' },
    changeOrigin: true,
  },
  '/proxy/lms': {
    target: 'http://courses.local.edly.io:8001',
    secure: false,
    pathRewrite: { '^/proxy/lms': '' },
    changeOrigin: true,
  },
  '/proxy/credentials': {
    target: 'http://credentials.local.edly.io:1999',
    secure: false,
    pathRewrite: { '^/proxy/credentials': '' },
    changeOrigin: true,
  },
};

module.exports = config;
