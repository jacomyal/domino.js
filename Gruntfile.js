module.exports = function(grunt) {
  var files = [
    // Core:
    'src/domino.core.js',

    // Helpers:
    'src/domino.types.js'
  ];

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
          opt: '--disable 6,13,220'
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
      all: {
        options: {
          banner: '/* domino.js - Version: <%= pkg.version %> - Author:  Alexis Jacomy, Atelier Iceberg - License: MIT */\n',
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
  grunt.registerTask('default', ['closureLint', 'jshint', 'browserify', 'qunit']);
};
