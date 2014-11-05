var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    gjslint = require('gulp-gjslint'),
    mocha = require('gulp-mocha'),
    phantom = require('gulp-mocha-phantomjs'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
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
        '-W055': true,
        '-W040': true,
        '-W064': true,
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
  return gulp.src(indexFile)
    .pipe(browserify({
      standalone: 'domino'
    }))
    .pipe(uglify())
    .pipe(rename('domino.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-tests', function() {
  return gulp.src('./test/unit.collection.js')
    .pipe(browserify({debug: true}))
    .pipe(rename('tests.js'))
    .pipe(gulp.dest('./test/build'));
});

// Testing
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
  // Tests are over, we close the server
  server.close();
});


// Watching
gulp.task('watch', ['build-tests'], function() {
  gulp.watch([jsFiles].concat(testFiles), ['build-tests']);
});

// Macro tasks
gulp.task('test', ['node-test', 'browser-test']);
gulp.task('default', ['lint', 'test']);
