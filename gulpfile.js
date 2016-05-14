const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');

var generateSchema = require('gulp-typescript-schema').generateSchema

gulp.task('shema', function () {
  gulp.src('src/main/**/*.ts').pipe(generateSchema({
    path: './schema.json'
  })).pipe(gulp.dest('schemas'))
});

gulp.task('clean', function () {
  return del('build');
});

// TypeScript compile
var tsProject = typescript.createProject('tsconfig.json');
gulp.task('compile', function () {
  var sourceTsFiles = ['src/**/*.ts',
    'typings/main/**/*.ts', 'typings/main.d.ts'];

  var tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject));

  tsResult.dts.pipe(gulp.dest('build'));
  return tsResult.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

gulp.task('copy:resources', ['clean'], function () {
  return gulp.src(['src/**/*', '!src/**/*.ts'], {base: './src/'})
    .pipe(gulp.dest('build'))
});

gulp.task('build', ['copy:resources', 'compile']);
// Run browsersync for development
gulp.task('watch', ['build'], function () {
  gulp.watch(['src/**/*'], ['build']);
});

