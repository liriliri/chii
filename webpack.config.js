const path = require('path');

module.exports = {
  entry: './target/index.ts',
  devtool: 'source-map',
  output: {
    filename: 'target.js',
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
