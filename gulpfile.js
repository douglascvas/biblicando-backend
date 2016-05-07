const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');

gulp.task('clean', function () {
  return del('dist/**/*');
});

// TypeScript compile
var tsProject = typescript.createProject('tsconfig.json');
gulp.task('compile', ['clean'], function () {
  return tsResult = tsProject
    .src('src/main/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('copy:resources', function () {
  return gulp.src(['src/main/**/*', '!src/main/**/*.ts'], {base: './src/main/'})
    .pipe(gulp.dest('build/'))
});

gulp.task('build', ['compile', 'copy:resources']);
// Run browsersync for development
gulp.task('watch', ['build'], function () {
  gulp.watch(['src/main/**/*'], ['build']);
});

