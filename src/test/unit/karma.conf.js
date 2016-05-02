module.exports = function (karma) {
  karma.set({
    basePath: '),
    frameworks: ['mocha'],
    files: [
      {
        pattern: 'node_modules/chai/chai.js', include: true
      },
      'server/*.unittest.js'
    ],

    exclude: [
      'karma.conf.js'
    ],


// use dots reporter, as travis terminal does not support escaping sequences
// possible values: 'dots', 'progress', 'junit', 'teamcity'
// CLI --reporters progress
    reporters: ['progress', 'coverage'],

    preprocessors: {
      'server/*.unittest.js': 'coverage'
    },

    //Code Coverage options. report type available:
    //- html (default)
    //- lcov (lcov and html)
    //- lcovonly
    //- text (standard output)
    //- text-summary (standard output)
    //- cobertura (xml format supported by Jenkins)
    coverageReporter: {
      // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
      type: 'lcov',
      dir: 'coverage/'
    },
    // web server port
    port: 9876,
    // cli runner port
    runnerPort: 9100,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: karma.LOG_DEBUG,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: ['Chrome'],
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 6000,
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-coverage'
    ]
  });
}