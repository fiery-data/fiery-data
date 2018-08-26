const path = require('path')

const WEB = {
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
  devtool: 'source-map',
  output: {
    filename: 'fiery-data.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'FieryData',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  externals: {
    firebase: 'firebase'
  }
}

const NODE = {
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
  devtool: 'source-map',
  output: {
    filename: 'fiery-data.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'FieryData',
    libraryTarget: 'commonjs2'
  },
  externals: {
    firebase: 'firebase'
  }
}

module.exports = WEB
