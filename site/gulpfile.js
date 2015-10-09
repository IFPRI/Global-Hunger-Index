'use strict';
// Global Hunger Index 2015: Gulp file
// Generated on 2015-09-29 using generator-leaflet 0.0.17

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var open = require('open');
var browserSync = require('browser-sync').create();
var wiredep = require('wiredep').stream;
var gutil = require('gulp-load-utils')(['log']);
var ghPages = require('gulp-gh-pages');

// Load plugins
var $ = require('gulp-load-plugins')();

// Styles
/*
gulp.task('styles', function () {
    return gulp.src(['app/styles/main.css'])
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size());
});
*/
gulp.task('styles',function(){
  return gulp.src([
      'app/styles/app.scss', 'app/lib/**/*.css'
    ])
    .pipe(sass({
        includePaths: [ 'app/bower_components/foundation/scss' ]
      }
    ))
    .pipe(concat("app.css"))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size())
    .pipe(browserSync.stream());
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe($.size())
        .pipe(browserSync.stream());
});

// HTML
gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    gulp.src([ 'app/styles/app.scss' ])
    .pipe(sass({
        includePaths: [ 'app/bower_components/foundation/scss' ]
      }
    ))
    .pipe(concat("app.css"))
    .pipe(gulp.dest('dist/styles'));

    // This is *AWFUL*, but I am in a hurry
    gulp.src([ 'app/lib/scripts/*.js', 'app/scripts/*.js', 
               'app/bower_components/datatables/media/js/jquery.dataTables.js',
               'app/bower_components/jquery/dist/jquery.js',
               'app/bower_components/foundation/js/foundation.min.js',
               'app/bower_components/chartjs/Chart.min.js',
               'app/bower_components/foundation/js/vendor/modernizr.js',
               ])
        // Make everything into one file! Add main.js
        //.pipe(concat('app.js'))
        //.pipe(jsFilter)
        //.pipe($.uglify())
        //.pipe(jsFilter.restore())
        .pipe(gulp.dest('dist/scripts'));

    gulp.src(['app/lib/styles/*.css'])
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());   

    
    // return gulp.src('app/**/*.html')
    /*
        .pipe($.useref.assets().on('error', gutil.log))
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size())
        .pipe(browserSync.stream());
    */
    return gulp.src('app/html/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe($.size())
        .pipe(browserSync.stream());
});

// Images
gulp.task('images', function () {
    return gulp.src([
    		'app/images/**/*',
    		'app/lib/images/*'])
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Data
gulp.task('data', function () {
    return gulp.src(['app/data/*'])
        .pipe(gulp.dest('dist/data'))
        .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {
    return gulp.src([
    		'app/fonts/**/*'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

// Clean
gulp.task('clean', function () {
    return gulp.src(['dist/styles', 'dist/scripts', 'dist/images', 'dist/fonts'], { read: false }).pipe($.clean());
});

// Build
gulp.task('build', ['html', 'images', 'data', 'fonts']);

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// Connect
gulp.task('connect', function(){
    $.connect.server({
        root: 'dist',
        port: 9000,
        livereload: true
    });
});

// Open
gulp.task('serve', ['connect'], function() {
});

// Inject Bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.css')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest('app/styles'));
    gulp.src('app/scripts/*.js')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/bower_components/'
        }))
        .pipe(gulp.dest('app/scripts'));
    gulp.src('app/html/**/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components',
            ignorePath: 'app/'
        }))
        .pipe(gulp.dest('app'));
});

// Watch
gulp.task('watch', ['connect', 'serve'], function () {
    browserSync.init({
          server: "dist/"
      });
    gulp.watch('app/html/**/*.html',['html']);
    gulp.watch('app/styles/**/*.scss',['styles']);
    gulp.watch('app/scripts/**/*.js',['scripts']);
    gulp.watch('app/fonts/**/*.*',['fonts']);
    gulp.watch('app/images/**/*.*',['images']);

});

gulp.task('deploy', function() {
  return gulp.src("./dist/**/*")
    .pipe(ghPages());
});

