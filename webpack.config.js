const path = require('path')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  output: {
    filename: 'fiery-data.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'FieryData',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
  }
};
