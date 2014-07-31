module.exports = function(grunt) {
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
        src: [ './test/unit.html' ],
        options: {
          stdout: true,
          strict: true,
          opt: '--disable 6,13'
        }
      }
    },
    jshint: {
      all: './src/*.js',
      options: {
        '-W055': true,
        '-W040': true,
        '-W064': true
      }
    },
    uglify: {
      options: {
        banner: '/* main.js - Version: <%= pkg.version %> - Author:  Alexis Jacomy, Atelier Iceberg - License: MIT */\n'
      },
      prod: {
        files: {
          'build/main.min.js': [ 'src/*.js' ]
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['closureLint', 'jshint', 'qunit', 'uglify']);
};
