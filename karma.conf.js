var webpackConfig = require('./webpack.test');

// Reference: http://karma-runner.github.io/0.12/config/configuration-file.html
module.exports = function karmaConfig (config) {
  config.set({
    frameworks: [
      // Reference: https://github.com/karma-runner/karma-jasmine
      // Set framework to jasmine
      'jasmine'
    ],

    reporters: [
      // Reference: https://github.com/mlex/karma-spec-reporter
      // Set reporter to print detailed results to console
      'spec',

      // Reference: https://github.com/karma-runner/karma-coverage
      // Output code coverage files
      'coverage'
    ],

    // env: {
    //   type: 'browser',
    //   runner: './node_modules/phantomjs2/bin/phantomjs'
    // },

    files: [
      // Grab all files in the app folder that contain .test.
      'ui/tests.webpack.js'
    ],

    preprocessors: {
      // Reference: http://webpack.github.io/docs/testing.html
      // Reference: https://github.com/webpack/karma-webpack
      // Convert files with webpack and load sourcemaps
      'ui/tests.webpack.js': ['webpack', 'sourcemap']
    },

    browsers: [
      // // Run tests using PhantomJS
      // 'PhantomJS2'
      'Firefox'
    ],

    singleRun: true,

    // Configure code coverage reporter
    coverageReporter: {
      dir: 'build/coverage/',
      type: 'html'
    },

    webpack: webpackConfig
  });
};
