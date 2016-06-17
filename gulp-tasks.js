const del = require('del');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
// const tslint = require('gulp-tslint');

module.exports = function (gulp) {

  function task() {
    var dependencies = Array.prototype.slice.call(arguments);
    var handler = null;
    if (!dependencies.length) {
      return;
    }
    if (typeof dependencies[dependencies.length - 1] === 'function') {
      handler = dependencies[dependencies.length - 1];
      dependencies.splice(dependencies.length - 1, 1);
    }
    return {
      dependencies: dependencies,
      handler: handler
    };
  }

  function cleanMain() {
    return del('build/main');
  }

  function cleanTest() {
    return del('build/test');
  }

  function cleanResource() {
    return del('build/resource');
  }

  function compileMain() {
    return compile('main');
  }

  function compileTest() {
    return compile('test');
  }

  function copyMain() {
    return gulp.src(['src/main/**/*', '!src/main/**/*.ts'], {base: './src/'}).pipe(gulp.dest('build'));
  }

  function copyResource() {
    return gulp.src(['src/resources/**/*'], {base: './src/'}).pipe(gulp.dest('build'));
  }

  function copyTest() {
    return gulp.src(['src/test/**/*', '!src/test/**/*.ts'], {base: './src/'}).pipe(gulp.dest('build'));
  }

  function watch() {
    gulp.watch(['src/main/**/*'], ['build:main']);
    gulp.watch(['src/resource/**/*'], ['build:resource']);
    gulp.watch(['src/test/**/*'], ['build:test']);
  }

  function compile(source) {
    var sourceTsFiles = ['src/' + source + '/**/*.ts', 'typings/**/*.ts'];
    var tsProject = typescript.createProject(__dirname + '/tsconfig.json');
    var tsResult = gulp.src(sourceTsFiles)
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject));
    tsResult.dts.pipe(gulp.dest('build/' + source));
    return tsResult.js
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('build/' + source));
  }

  function registerTasks(gulp, prefix, tasks) {
    const taskNames = Reflect.ownKeys(tasks);
    for (let taskName of taskNames) {
      let description = tasks[taskName];
      let dependencies = description.dependencies.map(dep=> {
        if (taskNames.indexOf(dep) >= 0) {
          return prefix + dep;
        }
        return dep;
      });
      gulp.task(prefix + taskName, dependencies, description.handler);
    }
  }

  function start(cb) {
    var server = require('gulp-express');
    server.run([__dirname + '/build/main/index.js'], {}, 35725);
    cb();
  }

  const taskMap = {
    'clean:main': task(cleanMain),
    'clean:test': task(cleanTest),
    'clean:resource': task(cleanResource),
    'compile:main': task(compileMain),
    'compile:test': task(compileTest),
    'copy:main': task('clean:main', copyMain),
    'copy:resource': task('clean:resource', copyResource),
    'copy:test': task('clean:test', copyTest),
    'build:main': task('copy:main', 'compile:main'),
    'build:resource': task('copy:resource'),
    'build:test': task('copy:test', 'compile:test'),
    'build': task('build:main', 'build:resource', 'build:test'),
    'start': task('build', start),
    'watch': task('build', watch)
  };

  registerTasks(gulp, 'be-', taskMap);
};