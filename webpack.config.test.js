module.exports = {
  entry: {
    test: './test/test.ts',
    'test-worker': './test/worker.ts',
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  node: {
    fs: 'empty',
  },
};
