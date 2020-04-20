const path = require('path');

module.exports = {
  entry: './client/index.ts',
  devtool: 'source-map',
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
};
