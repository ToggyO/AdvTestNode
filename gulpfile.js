/* eslint-disable node/no-unpublished-require */
const gulp = require('gulp'); //gulp
const sass = require('gulp-sass'); //пропроцессор sass для gulp
const autoprefixer = require('gulp-autoprefixer'); //автоматическая расстановка префиксов для разных браузеров
const cssnano = require('gulp-cssnano'); //сжатие css-файлов для деплоя на сервер
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyjs');
// const nodemon = require('gulp-nodemon');
/* esint-enable node/no-unpublished-require */


gulp.task('scss', () => {
  return gulp
  .src('dev/scss/**/*.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(
    autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true  //нужно разобрать !!! DONE
    })
  )
  .pipe(cssnano())
  .pipe(gulp.dest('public/stylesheets'))
});


gulp.task('scripts', () => {
  gulp
    .src([
      'dev/js/auth.js'
      //
    ])
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts'))
});
// gulp.task('start', function (done) {
//   nodemon({
//     script: 'index.js'
//   , ext: 'js html'
//   , env: { 'NODE_ENV': 'development' }
//   , done: done
//   })
// })
// gulp.task('nodemon', function() {
//   nodemon({script: 'index.js'});
// });

gulp.task('default', ['scss', 'scripts'], () => {
  gulp.watch('dev/scss/**/*.scss', ['scss']);
  gulp.watch('dev/js/**/*.js', ['scripts']);
});

//C:\Душа\Web\testApps\Blog\eslintrc.json
//ИЗУЧИТЬ GULP!!!!!!!!!!!!!!!
//ИЗУЧИТЬ ПРЕПРОЦЕССОРЫ!!!!!!!!!
//НАСТРОИТЬ ЛИНТЕР!!!!!!!!!!!!!!
