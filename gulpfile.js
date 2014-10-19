var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    phantom = require('gulp-mocha-phantomjs'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

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
  };

  return gulp.src(jsFiles)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('default'));
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
    .pipe(gulp.dest('./build'));
});

// Testing
gulp.task('node-test', function() {
  return gulp.src('./test/unit.collection.js')
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('browser-test', ['build-tests'], function() {
  return gulp.src('./test/browser/unit.html')
    .pipe(phantom({reporter: 'spec'}));
})

// Watching
gulp.task('watch', ['build-tests'], function() {
  gulp.watch([jsFiles].concat(testFiles), ['build-tests']);
});

// Macro tasks
gulp.task('test', ['node-test', 'browser-test']);
gulp.task('default', ['lint', 'test']);
