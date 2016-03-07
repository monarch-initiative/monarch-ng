'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var useTLS = false;
var useTLSPrefix = useTLS ? 'https' : 'http';

module.exports = function makeWebpackConfig (options) {
  /**
   * Environment type
   * BUILD is for generating minified builds
   * TEST is for generating test builds
   */
  var BUILD = !!options.BUILD;
  var TEST = !!options.TEST;
  var BUILDHASH = true;

  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {};
  config.debug = true;

  config.eslint = {
    configFile: './.eslintrc',
    emitError: false,
    emitWarning: false,
    quiet: false,
    failOnError: false,
    failOnWarning: false
  };

  var deps = [
    'angular/angular.min.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'angular-ui-bootstrap/ui-bootstrap.min.js',
    'angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
    'falcor/dist/falcor.all.min.js',
    'falcor/dist/falcor.browser.min.js',
    'moment/min/moment.min.js',
    'moment/min/locales.min.js',
    'underscore/underscore-min.js'
  ];

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Should be an empty object if it's generating a test build
   * Karma will set this when it's a test build
   */
  if (TEST) {
    config.entry = {};
  }
  else {
    config.entry = {
      app: './ui/app.js'
    };
  }

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
  if (TEST) {
    config.output = {};
    // config.output = {
    //   path: '/tmp/dist',
    //   publicPath: 'http://localhost:' + webpackPort + '/',
    //   filename: 'app.bundle.js',
    //   chunkFilename: 'app.bundle.js'
    // };
  }
  else {
    config.output = {
      // Absolute output directory
      path: path.join(__dirname, '/dist'),

      // Output path from the view of the page
      // Uses webpack-dev-server in development
      publicPath: BUILD ? '' : (useTLSPrefix + '://localhost:4081/'),

      // Filename for entry points
      // Only adds hash in build mode
      filename: BUILDHASH ? '[name].[hash].js' : '[name].bundle.js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename: BUILDHASH ? '[name].[hash].js' : '[name].bundle.js'
    };
  }

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (TEST) {
    config.devtool = 'inline-source-map';
  }
  else if (BUILD) {
    config.devtool = 'source-map';  // Trying to speed up builds with 'eval', correct behavior is 'source-map';
  }
  else {
    config.devtool = 'eval';
  }

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */

  var dbt = path.resolve(__dirname, 'dbTemplates');
  var ui = path.resolve(__dirname, 'ui');
  var srv = path.resolve(__dirname, 'server');
  var nm = path.resolve(__dirname, 'node_modules');
  var fa = path.resolve(__dirname, 'node_modules/font-awesome');
  var indexHtml = path.resolve(__dirname, 'ui/index.html');

  // Initialize module
  config.module = {
    preLoaders: [
    ],

    loaders: [
      {
        // JS LOADER
        // Reference: https://github.com/babel/babel-loader
        // Transpile .js files using babel-loader
        // Compiles ES6 and ES7 into ES5 code
        test: /\.js$/,
        loader: 'babel',
        query: {
            // https://github.com/babel/babel-loader#options
            cacheDirectory: true,
            presets: ['es2015']
        },
        include: [ui, srv]
      },

/*
      {
        // HTML LOADER
        // Reference: https://github.com/webpack/raw-loader
        // Allow loading html through js
        test: /\.html$/,
        loader: 'html',
        include: [ui]
      },

      {
        // HTML LOADER
        // Reference: https://github.com/teux/ng-cache-loader
        test: /\.html$/,
        loader: "ng-cache?prefix=[dir]/[dir]",
        include: [ui]
      },
*/


      {
        // NGTEMPLATE LOADER
        // Reference: https://github.com/WearyMonkey/ngtemplate-loader
        // Include AngularJS templates in the Webpack bundle and preload the template cache
        test: /\.html$/,
        loader: "ngtemplate?relativeTo=" + ui + "/!html",
        include: [ui],
        exclude: indexHtml
      },

      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff",
        include: [fa]
      },

      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff",
        include: [fa]
      },

      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream",
        include: [fa]
      },

      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file",
        include: [fa]
      },

      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml",
        include: [fa]
      },


      {
        // ASSET LOADER
        // Reference: https://github.com/webpack/file-loader
        // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
        // Rename the file using the asset hash
        // Pass along the updated reference to your code
        // You can add here any file extension you want to get copied to your output
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|txt|ico)$/,
        loader: 'file',
        include: [ui, nm, dbt]
      }
    ],

    postLoaders: [
       // {
       //    test: /\.js$/,
       //    include: [ui],
       //    loader: 'eslint-loader'
       //  }
    ],

    // don't parse some dependencies to speed up build.
    // can probably do this non-AMD/CommonJS deps
    noParse: [],

    resolve: {
      alias: {
        // Workaround https://github.com/Reactive-Extensions/RxJS/issues/832, until it's fixed
        // NO LONGER NECESSARY 'rx$': <path to rx/dist/rx.js file >
      }
    }
  };

  // Run through deps and extract the first part of the path,
  // as that is what you use to require the actual node modules
  // in your code. Then use the complete path to point to the correct
  // file and make sure webpack does not try to parse it
  // From: https://christianalfoni.github.io/react-webpack-cookbook/Optimizing-development.html
  //
  deps.forEach(function (dep) {
    var depPath = path.resolve(nm, dep);
    config.module.resolve.alias[dep.split(path.sep)[0]] = depPath;
    config.module.noParse.push(depPath);
  });

  if (!TEST) {
    config.module.loaders.push(
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: [nm, srv]
      });
  }

  // ISPARTA LOADER
  // Reference: https://github.com/ColCh/isparta-instrumenter-loader
  // Instrument JS files with Isparta for subsequent code coverage reporting
  // Skips node_modules and files that end with .test.js
  if (false && TEST) {
    config.module.preLoaders.push({
      test: /\.js$/,
      exclude: [
        /node_modules/,
        /\.test\.js$/
      ],
      loader: 'isparta-instrumenter'
    });
  }

  // CSS LOADER
  // Reference: https://github.com/webpack/css-loader
  // Allow loading css through js
  //
  // Reference: https://github.com/postcss/postcss-loader
  // Postprocess your css with PostCSS plugins
  var cssLoader = {
    test: /\.css$/,
    // Reference: https://github.com/webpack/extract-text-webpack-plugin
    // Extract css files in production builds
    //
    // Reference: https://github.com/webpack/style-loader
    // Use style-loader in development for hot-loading
    loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss')
  };

  // Skip loading css in test mode
  if (TEST) {
    // Reference: https://github.com/webpack/null-loader
    // Return an empty module
    cssLoader.loader = 'null';
  }

  // Add cssLoader to the loader list
  config.module.loaders.push(cssLoader);

  // LESS LOADER
  var lessLoader = {
    test: /\.less$/,
    include: [ui, nm],
    loader: ('style!css!less-loader?outputStyle=expanded&includePaths[]=' + nm)
  };

  // Skip loading less in test mode
  if (TEST) {
    // Reference: https://github.com/webpack/null-loader
    // Return an empty module
    lessLoader.loader = 'null';
  }

  // Add lessLoader to the loader list
  config.module.loaders.push(lessLoader);

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer
   * Add vendor prefixes to your css
   */
  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    // Reference: https://github.com/webpack/extract-text-webpack-plugin
    // Extract css files
    // Disabled when in test mode or not in build mode
    new ExtractTextPlugin(BUILDHASH ? '[name].[hash].css' : '[name].bundle.css',
      {
        disable: !BUILD || TEST
      })
  ];

  // Skip rendering index.html in test mode
  if (!TEST) {
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render index.html
    var minifyOpts = {};
    if (BUILD) {
      minifyOpts = {
        removeComments: true,
        // removeCommentsFromCDATA: true,
        // removeCDATASectionsFromCDATA: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
        collapseBooleanAttributes: false,
        removeAttributeQuotes: false,
        removeRedundantAttributes: false,
        // useShortDoctype: true,
        removeEmptyAttributes: false,
        removeEmptyElements: false,
        removeOptionalTags: false,
        removeIgnored: false,
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: false,
        caseSensitive: true,
        // keepClosingSlash: true,
        minifyJS: true,
        processScripts: ['text/javascript'],
        minifyCSS: true,
        minifyURLs: false,
        lint: false,
        maxLineLength: 50
      };
    }
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './ui/index.html',
        inject: 'head',
        minify: minifyOpts
      })
    );
  }

  if (BUILD) {
    config.plugins.push(
      // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      // Only emit files when there are no errors
      // NoErrorsPlugin prevents Webpack from outputting anything into a bundle. So
      // even ESLint warnings will fail the build. No matter what error settings are
      // used for eslint-loader.
      // So if you want to see ESLint warnings in console during development using
      // WebpackDevServer remove NoErrorsPlugin from webpack config.
      // new webpack.NoErrorsPlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      new webpack.optimize.DedupePlugin(),

      // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      // Minify all javascript, switch loaders to minimizing mode
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        // mangle: false,
        mangle: {
          except: ['$', '$scope', '$timeout', '$rootScope', '$http',
                    '$rootScopeProvider', 'JSONFormatterConfigProvider',
                    '$location', '$state', '$q']
        },
        compress: {
          warnings: false
        }
      }),

      // https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([
            // {output}/file.txt
            { from: 'ui/favicon.ico', to: 'favicon.ico' }
          ])

    );
  }

  var MANIFEST = false;
  if (MANIFEST) {
    config.plugins.push(
      // https://github.com/NekR/offline-plugin
      new OfflinePlugin({
        // All options are optional
        // caches: 'all',
        scope: '/',
        relativePaths: true,
        updateStrategy: 'all',
        // version: 'v12',

        caches: {
          main: [
            'index.html',
            'favicon.ico',
            '404.html',
            ':rest:'
          ],
          additional: [
            'https://fonts.googleapis.com/css'
          ]
        },

        externals: [
            '404.html',
            'https://fonts.googleapis.com/css'
        ],

        ServiceWorker: {
          output: 'sw.js'
        },
        AppCache: {
          directory: '',
          NETWORK: '*',
          FALLBACK: {
            '/about': '/'
          }
        }
      })
    );
  }

  if (!BUILD && !TEST) {
    var httpsOptions = null;

    if (useTLS) {
      httpsOptions = {
        key: './security/localhost-key.pem',
        cert: './security/localhost-cert.pem'
      };
      httpsOptions = true;
    }

    var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
    config.plugins.push(
      new BrowserSyncPlugin({
        proxy: useTLSPrefix + '://127.0.0.1:4081',
        host: '127.0.0.1',
        port: 4000,
        online: true,
        tunnel: false,
        https: httpsOptions,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        },
        files: ["serverStarted.dat"]
      }));
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    headers: { "Access-Control-Allow-Origin": "http://localhost:4000", "Access-Control-Allow-Credentials": "true" },
    contentBase: './dist',
    quiet: false,
    https: useTLS,
    proxy: [
        {
            path: /(.*)\.json|(.*)\.txt/,
            target: useTLSPrefix + "://localhost:4888"
        },
        {
            path: /\/status/,
            target: useTLSPrefix + "://localhost:4888"
        }
        // ,
        // {
        //     path: /\/.*/,
        //     target: "http://localhost:4888"
        // }
      ],
    stats: {
      modules: false,
      cached: false,
      colors: true,
      chunk: false
    }

    /* Send API requests on localhost to API server get around CORS
    proxy: {
      '/api/*': 'http://localhost:8887'
    } */
  };

  config.plugins.push(
    new webpack.DefinePlugin({ 'EnvWebPack': true })
  );

  // config.plugins.push(
  //   new webpack.DefinePlugin({
  //       'EnvData': {
  //           'args': process.argv
  //        }
  //   }));

  return config;
};
