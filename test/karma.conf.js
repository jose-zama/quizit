// Karma configuration
module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai', 'chai-shallow-deep-equal','sinon'],
        plugins: [
            'karma-coverage',
            //'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-chai-shallow-deep-equal',
            //'karma-script-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-sinon',
            'karma-ng-html2js-preprocessor'
        ],
        // list of files / patterns to load in the browser
        files: [
            //libraries dependencies ORDER MATTERS
            'node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
            'bower_components/jquery/dist/*.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-route/angular-route.min.js',
            'bower_components/angular-resource/angular-resource.min.js',
            'bower_components/angular-cookies/angular-cookies.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'public/js/lib/*.js',
            
            //code subject to testing
            'public/js/controllers/*.js',
            'public/js/services/*.js',
            'public/partials/modals/*.html',
            //tests
            'test/unit/**/*.js'
        ],
        // list of files to exclude
        exclude: [
        ],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'public/js/controllers/*.js': ['coverage'],
            'public/js/services/*.js': ['coverage'],
            'public/partials/modals/*.html': ['ng-html2js']
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],
        //config for HTML caching for unit tests
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'public',
            moduleName: 'modal'
        },
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Firefox', 'Chrome'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
