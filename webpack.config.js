// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/lodash.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-lodash.min.js',
    library: 'myLodash',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
};