// Karma configuration
// Generated on Tue Jul 08 2014 12:21:50 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    files: [
      'demo/bower_components/moment/moment.js',
      'demo/bower_components/d3/d3.js',
      'demo/bower_components/check-types/src/check-types.min.js',
      'demo/bower_components/angular/angular.js',
      'src/**/*.js',
      'test/unit/**/*.js'
    ],
    reporters: ['dots', 'progress'],
    preprocessors: {
      'src/js/*.js': ['coverage']
    },
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
