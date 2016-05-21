const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');

gulp.task('clean:main', function () {
  return del('build/main');
});

gulp.task('clean:test', function () {
  return del('build/test');
});

gulp.task('clean:resource', function () {
  return del('build/resource');
});

// TypeScript compile
gulp.task('compile:main', compile('main'));
gulp.task('compile:test', compile('test'));

gulp.task('copy:main', ['clean:main'], function () {
  return gulp.src(['src/main/**/*', '!src/main/**/*.ts'], {base: './src/'}).pipe(gulp.dest('build'))
});
gulp.task('copy:resource', ['clean:resource'], function () {
  return gulp.src(['src/resource/**/*'], {base: './src/'}).pipe(gulp.dest('build'))
});
gulp.task('copy:test', ['clean:test'], function () {
  return gulp.src(['src/test/**/*', '!src/test/**/*.ts'], {base: './src/'}).pipe(gulp.dest('build'))
});

gulp.task('build', ['build:resource', 'build:main', 'build:test']);
gulp.task('build:main', ['copy:main', 'compile:main']);
gulp.task('build:resource', ['copy:resource']);
gulp.task('build:test', ['copy:test', 'compile:test']);

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/main/**/*'], ['build:main']);
  gulp.watch(['src/resource/**/*'], ['build:resource']);
  gulp.watch(['src/test/**/*'], ['build:test']);
});

function compile(source) {
  var sourceTsFiles = ['src/' + source + '/**/*.ts', 'typings/main/**/*.ts', 'typings/main.d.ts'];
  var tsProject = typescript.createProject('tsconfig.json');
  return function () {
    var tsResult = gulp.src(sourceTsFiles)
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject));
    tsResult.dts.pipe(gulp.dest('build'));
    return tsResult.js
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('build'));
  }
}

