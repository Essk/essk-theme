var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var axe = require('gulp-axe-webdriver');
var browserSync = require('browser-sync').create();

gulp.task('styles', function() {
    var plugins = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];
    return gulp.src('./sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
  });

gulp.task('theme-js', function(){
    return gulp.src(['./js/navigation.js', './js/skip-link-focus-fix.js', './js/main.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error', function(uglify){
            console.error(uglify.message);
            this.emit('end');
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js/'))
        
});  

gulp.task('axe', function(done) {
    var options = {
      saveOutputIn: 'allHtml.json',
      headless: true,
      urls: ['http://essk.localhost']
    };
    return axe(options, done);
  });

gulp.task('watch', gulp.parallel('styles', 'theme-js', function(){
    browserSync.init({
        proxy : 'http://essk.localhost',
    });
    gulp.watch('./sass/**/*.scss', gulp.series('styles', 'axe'));
    gulp.watch('./js/*.js', gulp.series('theme-js')).on('change', browserSync.reload);
    gulp.watch(['./*/php', './**/*.php'], gulp.series('axe')).on('change', browserSync.reload);
}));