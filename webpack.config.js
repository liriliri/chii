const path = require('path');

module.exports = (env, argv) => {
  const config = {
    target: ['web', 'es5'],
    entry: {
      index: './src/index.ts',
      target: {
        import: './src/target.ts',
        library: {
          name: 'chii',
          type: 'umd',
        },
      },
    },
    devtool: 'inline-source-map',
    output: {
      filename: '[name].js',
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
        {
          test: /\.svg$/,
          loader: 'svg-url-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };

  if (argv.mode === 'production') {
    delete config.devtool;
  }

  return config;
};
