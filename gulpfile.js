var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    qunit = require('gulp-qunit'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

// Files
var indexFile = './src/domino.core.js',
    jsFiles = './src/*.js';


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

// Testing
gulp.task('test', ['build'], function() {
  return gulp.src('./test/tests.html')
    .pipe(qunit());
});

// Watching
gulp.task('watch', ['build'], function() {
  gulp.watch(jsFiles, ['build']);
});

// Macro tasks
gulp.task('default', ['lint', 'test']);
