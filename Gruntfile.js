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
    qunit: {
      all: {
        options: {
          urls: [ './test/unit.html' ]
        }
      }
    },
    closureLint: {
      all: {
        command: 'gjslint',
        closureLinterPath: '/usr/local/bin',
        src: files,
        options: {
          stdout: true,
          strict: true,
          opt: '--disable 6,13'
        }
      }
    },
    jshint: {
      all: files,
      options: {
        '-W055': true,
        '-W040': true,
        '-W064': true
      }
    },
    uglify: {
      options: {
        banner: '/* domino.js - Version: <%= pkg.version %> - Author:  Alexis Jacomy, Atelier Iceberg - License: MIT */\n'
      },
      prod: {
        files: {
          'build/domino.min.js': files
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['closureLint', 'jshint', 'qunit', 'uglify']);
};
