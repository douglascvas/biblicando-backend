const del = require('del');
const paths = require('./paths');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
var net = require('net');
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
    return del(paths.outputMain);
  }

  function cleanTest() {
    return del(paths.outputTest);
  }

  function cleanResource() {
    return del(paths.outputResource);
  }

  function compileMain() {
    return compile(paths.source, paths.output);
  }

  function compileTest() {
    return compile(paths.test, paths.output);
  }

  function copyMain() {
    return gulp.src([`${paths.baseMain}/**/*`, `!${paths.baseMain}/**/*.ts`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function copyResource() {
    return gulp.src([`${paths.baseResource}/**/*`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function copyTest() {
    return gulp.src([`${paths.baseTest}/**/*`, `!${paths.baseTest}/**/*.ts`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function watch() {
    gulp.watch([`${paths.baseMain}/**/*`], ['build:main']);
    gulp.watch([`${paths.baseResource}/**/*`], ['build:resource']);
    gulp.watch([`${paths.baseTest}/**/*`], ['build:test']);
  }

  function compile(source, output) {
    var sourceTsFiles = [source, `${paths.typings}/**/*.ts`];
    var tsProject = typescript.createProject(paths.tsConfig);
    var tsResult = gulp.src(sourceTsFiles)
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject));
    tsResult.dts.pipe(gulp.dest(output));
    return tsResult.js
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(output));
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

  var portInUse = function (port, callback) {
    var server = net.createServer(function (socket) {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
      callback(true);
    });
    server.on('listening', function (e) {
      server.close();
      callback(false);
    });
  };

  function waitForApplication(port, callback) {
    const interval = setInterval(()=> {
      portInUse(port, used => {
        console.log("### Port used:", used);
        if (used) {
          clearInterval(interval);
          return callback();
        }
      })
    }, 500);
  }

  function start(cb) {
    var server = require('gulp-express');
    server.run([`${paths.outputMain}/index.js`], {}, 35725);
    waitForApplication(3005, cb);
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
    'watch': task('build', watch),
    'dev': task('start', watch)
  };

  registerTasks(gulp, 'be-', taskMap);
};