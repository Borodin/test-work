'use strict';

var gulp           = require('gulp');
var del            = require('del');
var autoprefixer   = require('gulp-autoprefixer');
var cache          = require('gulp-cache');
var concat         = require('gulp-concat');
var csslint        = require('gulp-csslint');
var imagemin       = require('gulp-imagemin');
var jscs           = require('gulp-jscs');
var jshint         = require('gulp-jshint');
var minifyHTML     = require('gulp-minify-html');
var size           = require('gulp-size');
var sourcemaps     = require('gulp-sourcemaps');
var stylint        = require('gulp-stylint');
var stylus         = require('gulp-stylus');
var uglify         = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');

var browserSync    = require('browser-sync').create();

// Удаляет все содержимое папки build и src/lib
gulp.task('clean', function() {
    return del.sync(['build/**', 'src/lib/**']);
});

// Очищает кэш файлов
gulp.task('clear', function(done) {
    return cache.clearAll(done);
});

// Конкатинирует и минифицирует JavaScript, создает sourseMap
gulp.task('scripts', function() {
    return gulp.src(['src/lib/*.js', 'src/js/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify({
        preserveComments: 'some',
        outSourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'))
    .pipe(size({title: 'scripts'}));
});

// Конкатинирует и минифицирует CSS, STYLUS, создает sourseMap
gulp.task('styles', function() {

    var AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

    return gulp.src(['src/css/main.styl'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.styl'))
    .pipe(stylus({compress: true}))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(size({title: 'styles'}));
});

// Сжимает изображения (gif, jpg, png, svg) без потерь
gulp.task('images', function() {
    return gulp.src(['src/img/**/*'])
    .pipe(cache(imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('build/img'))
    .pipe(size({title: 'images'}));
});

// Копирует и минифицирует все html страницы
gulp.task('html', function() {
    return gulp.src(['src/*.html'])
    .pipe(minifyHTML())
    .pipe(gulp.dest('build'))
    .pipe(size({title: 'html'}));
});

// Копирует все файлы из корня, кроме html
gulp.task('copy', function() {
    return gulp.src(['src/*', '!src/*.html'])
    .pipe(gulp.dest('build'))
    .pipe(size({title: 'copy'}));
});

//Копирует главные файлы из bower_components/ в src/lib/
gulp.task('mainBowerFiles', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('src/lib'));
});

// Проверка всех JS файлов в папке src/js
gulp.task('jslint', function() {
    return gulp.src('src/js/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default', { verbose: true }));
});

// Проверка стиля javascript
gulp.task('jscs', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(jscs())
        .pipe(jscs.reporter());
});

// Проверка всех css файлов в папке src/css
gulp.task('csslint', function() {
    return gulp.src('src/css/**/*.css')
        .pipe(stylint())
        .pipe(csslint())
        .pipe(csslint.reporter());
});

// Проверка всех stylus файлов в папке src/css
gulp.task('stylint', function() {
    return gulp.src('src/css/**/*.styl')
        .pipe(stylint())
        .pipe(csslint.reporter())
        .pipe(stylint.reporter('fail'));
});

// Запускает локальный http сервер, следит за изменениями
gulp.task('serve', ['build'], function() {
    browserSync.init({
        notify: false,
        server: './build/'
    });

    gulp.watch(['src/*.html', 'src/blocks/*.html'], ['html', browserSync.reload]);
    gulp.watch(['src/*', '!src/*.html'], ['copy', browserSync.reload]);
    gulp.watch(['src/js/**/*.js', 'src/lib/*.js'], ['scripts', browserSync.reload]);
    gulp.watch(['src/css/**/*.{css,styl}', 'src/lib/*.css'], ['styles', browserSync.reload]);
    gulp.watch(['src/fonts/**'], ['fonts', browserSync.reload]);
    gulp.watch(['src/img/**/*'], ['images', browserSync.reload]);
});

gulp.task('bower', ['mainBowerFiles'], function() {
    gulp.run(['copy', 'html', 'images', 'scripts', 'styles']);
});
gulp.task('lint', ['jslint', 'jscs', 'csslint', 'stylint']);
gulp.task('build', ['clean', 'clear', 'bower']);
gulp.task('default', ['build']);
