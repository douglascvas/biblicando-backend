const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');

gulp.task('clean', function () {
  return del('build');
});

// TypeScript compile
var tsProject = typescript.createProject('tsconfig.json');
gulp.task('compile', function () {
  // return tsResult = tsProject
  //   .src('src/main/**/*.ts')
  //   .pipe(sourcemaps.init())
  //   .pipe(typescript(tsProject))
  //   .pipe(sourcemaps.write('.'))
  //   .pipe(gulp.dest('build'));

  var sourceTsFiles = ['src/main/**/*.ts',                //path to typescript files
    'typings/main/**/*.ts', 'typings/main.d.ts']; //reference to library .d.ts files


  var tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(typescript(tsProject));

  tsResult.dts.pipe(gulp.dest('build'));
  return tsResult.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});

// gulp.task('compile', function () {
//   var sourceTsFiles = [config.allTypeScript,                //path to typescript files
//     config.libraryTypeScriptDefinitions]; //reference to library .d.ts files
//
//
//   var tsResult = gulp.src(sourceTsFiles)
//     .pipe(sourcemaps.init())
//     .pipe(tsc(tsProject));
//
//   tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
//   return tsResult.js
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(config.tsOutputPath));
// });

gulp.task('copy:resources', ['clean'], function () {
  return gulp.src(['src/main/**/*', '!src/main/**/*.ts'], {base: './src/main/'})
    .pipe(gulp.dest('build/'))
});

gulp.task('build', ['copy:resources', 'compile']);
// Run browsersync for development
gulp.task('watch', ['build'], function () {
  gulp.watch(['src/main/**/*'], ['build']);
});

