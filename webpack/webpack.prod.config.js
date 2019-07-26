// This is the prod Webpack config. All settings here should prefer smaller,
// optimized bundles at the expense of a longer build time.
const Merge = require('webpack-merge');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackNewRelicPlugin = require('html-webpack-new-relic-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const NewRelicSourceMapPlugin = require('new-relic-source-map-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PostCssRtlPlugin = require('postcss-rtl');
const PostCssAutoprefixerPlugin = require('autoprefixer');
const CssNano = require('cssnano');

const commonConfig = require('./webpack.common.config.js');

module.exports = Merge.smart(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[chunkhash].js',
  },
  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, '../src'),
        ],
        loader: 'babel-loader',
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      // Webpack, by default, includes all CSS in the javascript bundles. Unfortunately, that means:
      // a) The CSS won't be cached by browsers separately (a javascript change will force CSS
      // re-download).  b) Since CSS is applied asyncronously, it causes an ugly
      // flash-of-unstyled-content.
      //
      // To avoid these problems, we extract the CSS from the bundles into separate CSS files that
      // can be included as <link> tags in the HTML <head> manually.
      //
      // We will not do this in development because it prevents hot-reloading from working and it
      // increases build time.
      {
        test: /(.scss|.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                PostCssRtlPlugin(),
                PostCssAutoprefixerPlugin({ grid: true }),
                CssNano(),
              ],
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
            options: {
              sourceMap: true,
              includePaths: [
                path.join(__dirname, '../node_modules'),
                path.join(__dirname, '../src'),
              ],
            },
          },
        ],
      },
    ],
  },
  // New in Webpack 4. Replaces CommonChunksPlugin. Extract common modules among all chunks to one
  // common chunk and extract the Webpack runtime to a single runtime chunk.
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // Cleans the dist directory before each build
    new CleanWebpackPlugin(['dist'], {
      root: path.join(__dirname, '../'),
    }),
    // Writes the extracted CSS from each entry to a file in the output directory.
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
    }),
    // Scan files for class names and ids and remove unused css
    new PurgecssPlugin({
      paths: [].concat(
        // Scan files in this app
        glob.sync(`${path.resolve(__dirname, '../src')}/**/*`, { nodir: true }),
        // Scan files in any edx frontend-component
        glob.sync(`${path.resolve(__dirname, '../node_modules/@edx/frontend-component')}*/dist/**/*`, { nodir: true }),
        // Scan files in paragon
        glob.sync(`${path.resolve(__dirname, '../node_modules/@edx/paragon/dist')}/**/*`, { nodir: true }),
      ),
      // Protect react-css-transition class names
      whitelistPatterns: [/-enter/, /-appear/, /-exit/],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      BASE_URL: null,
      LMS_BASE_URL: null,
      CREDENTIALS_BASE_URL: null,
      ECOMMERCE_BASE_URL: null,
      LOGIN_URL: null,
      LOGOUT_URL: null,
      CSRF_TOKEN_API_PATH: null,
      REFRESH_ACCESS_TOKEN_ENDPOINT: null,
      SEGMENT_KEY: null,
      ACCESS_TOKEN_COOKIE_NAME: null,
      USER_INFO_COOKIE_NAME: null,
      CSRF_COOKIE_NAME: 'csrftoken',
      LANGUAGE_PREFERENCE_COOKIE_NAME: null,
      CURRENCY_COOKIE_NAME: 'edx-price-l10n',
      SITE_NAME: null,
      MARKETING_SITE_BASE_URL: null,
      ENTERPRISE_MARKETING_URL: null,
      ENTERPRISE_MARKETING_UTM_CAMPAIGN: null,
      ENTERPRISE_MARKETING_UTM_SOURCE: null,
      ENTERPRISE_MARKETING_FOOTER_UTM_MEDIUM: null,
      SUPPORT_URL: null,
      CONTACT_URL: null,
      OPEN_SOURCE_URL: null,
      TERMS_OF_SERVICE_URL: null,
      PRIVACY_POLICY_URL: null,
      FACEBOOK_URL: null,
      TWITTER_URL: null,
      YOU_TUBE_URL: null,
      LINKED_IN_URL: null,
      REDDIT_URL: null,
      APPLE_APP_STORE_URL: null,
      GOOGLE_PLAY_URL: null,
      ORDER_HISTORY_URL: null,
      NEW_RELIC_ADMIN_KEY: null,
      NEW_RELIC_APP_ID: null,
      NEW_RELIC_LICENSE_KEY: null,
      CYBERSOURCE_URL: null,
      APPLE_PAY_MERCHANT_IDENTIFIER: null,
      APPLE_PAY_MERCHANT_NAME: null,
      APPLE_PAY_COUNTRY_CODE: null,
      APPLE_PAY_CURRENCY_CODE: null,
      APPLE_PAY_START_SESSION_URL: null,
      APPLE_PAY_AUTHORIZE_URL: null,
      APPLE_PAY_SUPPORTED_NETWORKS: null,
      APPLE_PAY_MERCHANT_CAPABILITIES: null,
    }),
    // Generates an HTML file in the output directory.
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(__dirname, '../public/index.html'),
      optimizelyId: process.env.OPTIMIZELY_PROJECT_ID,
      preconnect: (() => {
        const preconnectDomains = [
          'https://api.segment.io',
          'https://cdn.segment.com',
          'https://www.google-analytics.com',
        ];

        if (process.env.LMS_BASE_URL) {
          preconnectDomains.push(process.env.LMS_BASE_URL);
        }

        if (process.env.OPTIMIZELY_PROJECT_ID) {
          preconnectDomains.push('https://logx.optimizely.com');
        }

        return preconnectDomains;
      })(),
    }),
    new HtmlWebpackNewRelicPlugin({
      // This plugin fixes an issue where the newrelic script will break if
      //  not added directly to the HTML.
      // We use non empty strings as defaults here to prevent errors for empty configs
      license: process.env.NEW_RELIC_LICENSE_KEY || 'fake_app',
      applicationID: process.env.NEW_RELIC_APP_ID || 'fake_license',
    }),
    new NewRelicSourceMapPlugin({
      applicationId: process.env.NEW_RELIC_APP_ID,
      nrAdminKey: process.env.NEW_RELIC_ADMIN_KEY,
      staticAssetUrl: process.env.BASE_URL,
      noop: typeof process.env.NEW_RELIC_ADMIN_KEY === 'undefined', // upload source maps in prod builds only
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
});
