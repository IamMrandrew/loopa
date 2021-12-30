/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const devConfig = require('./config/webpack.config.development');
const prodConfig = require('./config/webpack.config.production');

const environment = (process.env.NODE_ENV || 'development').trim();

if (environment === 'development') {
  module.exports = devConfig;
} else if (environment === 'production') {
  module.exports = prodConfig;
}