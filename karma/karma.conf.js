var stringify = require('stringify');

var ignore_files = '**/lib/**',
    spec_files = '**/spec/**',
    tpl_files = '**/*.tpl',
    node_modules_files = '**/node_modules/**';


var babelOpts = { 
  presets: ['es2015', 'react'],
  // sourceMap: 'inline',
  ignore: [node_modules_files, ignore_files, tpl_files]
}

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [ 'browserify', 'jasmine' ],
    files: [
      "./components/**/*.es6",
    ],
    browsers: ['Chrome'],
    preprocessors: {
      "./components/**/*.es6": ['browserify']
    },

    browserify: {
      debug: true,
      paths: ['./components/lib'],

      transform: [
        stringify(['.tpl', '.txt']),

        ["babelify", babelOpts],

        ['browserify-istanbul', {
          instrumenter: require('babel-istanbul'),
          instrumenterConfig: {
            // embedSource: true,
            babel: babelOpts,
          },
          ignore: [
            spec_files,
            tpl_files, 
            node_modules_files, 
            ignore_files
          ],
        }]
      ],
      extensions: ['.es6', '.jsx', '.js']
    },
    // logLevel: config.LOG_DEBUG,
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type : 'html',
      dir : './coverage'
    },
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false

  });
};