'use strict';

var gulp         = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss     = require('gulp-clean-css'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    uglify       = require('gulp-uglify');

gulp.task('BootstrapCustomImageCSS', function () {
    return gulp.src(['./src/custom-image.scss'])
        .pipe(sass({outputStyle: 'expanded', precision: 10}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./dist'))
        .pipe(cleancss({sourceMap: true, level: {1: {specialComments: 0}}}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist'));
});


gulp.task('BootstrapCustomImageJS', function () {
    return gulp.src(['./src/custom-image.jquery.js'])
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('BootstrapCustomImageSVG', function () {
    return gulp.src(['./src/loader.svg'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', gulp.parallel([
    'BootstrapCustomImageJS',
    'BootstrapCustomImageCSS',
    'BootstrapCustomImageSVG'
]));