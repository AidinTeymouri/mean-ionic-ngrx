/**
 * @Author: Nicolas Fazio <webmaster-fazio>
 * @Date:   11-10-2017
 * @Email:  contact@nicolasfazio.ch
 * @Last modified by:   webmaster-fazio
 * @Last modified time: 06-01-2018
 */

/**
* Server Webpack config v.0.1.1
*/
const path = require('path');
// all webpack import working cause we use Ionicframewok in front-side
// Ionic allready have install all default webpack dependencies into our node_modules
// Do simply import with require(WEBPACK_MODULE_PLUGIN_YOU_NEED);
// If plugin do not exist, just add it to ou project package devDependencies
// with $ npm install --save-dev WEBPACK_MODULE_PLUGIN_YOU_NEED
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const NodemonPlugin = require( 'nodemon-webpack-plugin' );

// import nodemon config object
const NodemonOptions = require('./server.nodemon.json')

// define server config
const SERVER_CONFIG = {
  entry_path: path.resolve()+'/server', // server entry folder
  entry_file: path.resolve()+'/server/server.ts', // server entry start file
  output: path.resolve()+'/platforms/server', // server output folder
}

// define common webpack config for "prod" and "dev" environment
const commonConfig = {
  entry: SERVER_CONFIG.entry_file,
  target: 'node',
  externals: [
    /^[a-z\-0-9]+$/ // Ignore node_modules folder
  ],
  output: {
      filename: 'server.js', // output file
      path: SERVER_CONFIG.output,
      libraryTarget: "commonjs",
  },
  resolve: {
      // Add in `.ts` and `.tsx` as a resolvable extension.
      extensions: ['.ts', '.tsx', '.js'],
      modules: [path.resolve('node_modules')]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

// define webpack devConfig options
const devConfig = {
    module: {
        loaders: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.tsx?$/,
            exclude:[
              path.resolve('node_modules')
            ],
            loader: 'awesome-typescript-loader',
            options: {
                configFileName: SERVER_CONFIG.entry_path+'/tsconfig.json',
                sourceMap: true
            },
        }]
    },
    plugins: [
      new NodemonPlugin(NodemonOptions)
    ]
};

// define function to return default loaders
function getProdLoaders() {
  return devConfig.module.loaders;
}

// define webpack prodConfig options
const prodConfig = {
    module: {
      loaders: getProdLoaders()
    },
    plugins: [
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        sourceMap: false,
        uglifyOptions: {
            compress: true
        }
      }),
      new CopyWebpackPlugin([
        { from: SERVER_CONFIG.entry_path+'/package.json'},
        { from: SERVER_CONFIG.entry_path+'/.gitignore' },
        { from: SERVER_CONFIG.entry_path+'/README.md' },
      ]),
      new webpack.optimize.ModuleConcatenationPlugin()
    ],
};

// export webpack config
module.exports = (env)=> {
  console.log('#################################################');
  switch (true) {
    case env.prod === true:
      console.log('[info] Webpack build mode ==> prod');
      return Object.assign({}, commonConfig, prodConfig);
    case env.dev === true:
      console.log('[info] Webpack build mode ==> dev');
      return Object.assign({}, commonConfig, devConfig)
    // Disable this for enable testing with webpack.
    // Do not forget to define 'testConfig' to meke it work.
    // case env.test === true:
    //   console.log('[info] Webpack build mode ==> test');
    //   return Object.assign({}, commonConfig, testConfig);
  }
  console.log('[info] Webpack build mode ==> default dev');
  return Object.assign({}, commonConfig, devConfig);
}
