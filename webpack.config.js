
const path = require('path')

module.exports = {
  mode: 'production',

  entry: {
    main: './src/main.ts',
    init: './src/init.ts',
    settings: './src/settings.ts',
    picker: './src/picker.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
}