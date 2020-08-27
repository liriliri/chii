const path = require('path');

module.exports = (env, argv) => {
  const config = {
    entry: './target/index.ts',
    devtool: 'inline-source-map',
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

  if (argv.mode === 'production') {
    config.devtool = 'none';
  }

  return config;
};
