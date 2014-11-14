var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    jshint = require('gulp-jshint'),
    gjslint = require('gulp-gjslint'),
    runSequence = require('run-sequence'),
    browserify = require('gulp-browserify'),
    phantom = require('gulp-mocha-phantomjs'),
    pkg = require('./package.json'),
    api = require('./test/api-mockup.js'),
    server;

// Files
var indexFile = './src/domino.core.js',
    jsFiles = './src/*.js',
    testFiles = './test/suites/*.js';

// Linting
gulp.task('lint', function() {
  // Linting configurations
  var jshintConfig = {
        '-W040': true,
        node: true,
        browser: true
      },
      gjslintConfig = {
        flags: ['--nojsdoc', '--disable 211,212']
      };

  return gulp.src(jsFiles)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(gjslint(gjslintConfig))
    .pipe(gjslint.reporter('console'), {fail: true});
});

// Building
gulp.task('build', function() {
  var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

  return gulp.src(indexFile)
    .pipe(browserify({
      standalone: 'domino'
    }))

    // Export unminified version:
    .pipe(rename('domino.js'))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('./build'))

    // Export minified version:
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(rename('domino.min.js'))
    .pipe(gulp.dest('./build'));
});

// Testing
gulp.task('build-tests', function() {
  return gulp.src('./test/unit.collection.js')
    .pipe(browserify({debug: true}))
    .pipe(rename('tests.js'))
    .pipe(gulp.dest('./test/build'));
});

gulp.task('node-test', function() {
  return gulp.src('./test/unit.collection.js')
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('browser-test-run', ['build-tests'], function() {
  // Launching API server
  server = api.listen(8001);

  // Launching mocha tests through phantomjs
  var stream = phantom();
  stream.write({
    path: 'http://localhost:8001/browser/unit.html',
    reporter: 'spec'
  });
  stream.on('error', function() {
    // Tearing down server if an error occurred
    server.close();
  });

  stream.end();
  return stream;
});

gulp.task('browser-test', ['browser-test-run'], function() {
  // Tests are over, we close the server:
  server.close();
});


// Watching:
gulp.task('watch', ['build-tests'], function() {
  gulp.watch([jsFiles].concat(testFiles), ['build-tests']);
});

// Macro tasks:
gulp.task('test', function() {
  runSequence('lint', 'browser-test', 'node-test');
});
gulp.task('default', function() {
  runSequence('lint', 'browser-test', 'node-test', 'build');
});
