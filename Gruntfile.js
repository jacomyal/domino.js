module.exports = function(grunt) {
  var files = './src/*.js';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    closureLint: {
      all: {
        command: 'gjslint',
        closureLinterPath: '/usr/local/bin',
        src: files,
        options: {
          stdout: true,
          strict: true,
          opt: '--disable 6,7,13,220,210,217,225'
        }
      }
    },
    jshint: {
      all: files,
      options: {
        '-W055': true,
        '-W040': true,
        '-W064': true,
        node: true,
        browser: true
      }
    },
    browserify: {
      watch: {
        options: {
          watch: true,
          keepAlive: true,
          transform: [ 'uglifyify' ],
          bundleOptions: {
            standalone: 'domino'
          }
        },
        files: {
          'build/domino.min.js': ['src/domino.core.js']
        }
      },
      build: {
        options: {
          transform: [ 'uglifyify' ],
          bundleOptions: {
            standalone: 'domino'
          }
        },
        files: {
          'build/domino.min.js': ['src/domino.core.js']
        }
      }
    },
    qunit: {
      all: {
        options: {
          urls: [ './test/tests.html' ]
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['closureLint', 'jshint', 'browserify:build', 'qunit']);
  grunt.registerTask('watch', ['browserify:build', 'browserify:watch']);
  grunt.registerTask('test', ['qunit']);
};
