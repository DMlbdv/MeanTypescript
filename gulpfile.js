// ------------------------------------------------------------------------------
// Load in modules
// ------------------------------------------------------------------------------

var gulp            = require ('gulp'),
    plumber         = require ('gulp-plumber'),
    ts              = require ('gulp-typescript'),
    config          = require ('./config/config'),
    del             = require ('del'),
    vinylPaths      = require ('vinyl-paths'),
    runSequence     = require ('run-sequence'),
    browserSync     = require('browser-sync').create(),
    notify          = require('gulp-notify'),
    jade            = require('gulp-jade'),
    size            = require('gulp-size'),
    fs              = require ('fs');

// ------------------------------------------------------------------------------
// Custom vars and methods
// ------------------------------------------------------------------------------
var ENV = process.env.NODE_ENV || 'development';

var alertError = notify.onError(function(error) {
    var message;
    console.log('alert error!');
    message = (error != null ? error.message : void 0) || (error != null ? error.toString() : void 0) || 'Something went wrong';
    return "Error: " + message;
});

//------------------------------------------------------------------------------
// Directory management
// ------------------------------------------------------------------------------

gulp.task('clean', function() {
  return gulp.src(config.client.build.root + "/*", {
    read: false
  }).pipe(plumber({
    errorHandler: alertError
  })).pipe(vinylPaths(del));
});

// ------------------------------------------------------------------------------
// Compile assets
// ------------------------------------------------------------------------------

gulp.task('typescript', function() {
  return gulp.src(config.client.src.ts + '/**/*.ts')
      .pipe( plumber() )
      // .pipe( sourcemaps.init() )
      .pipe(ts({
          declarationFiles:       true,
          target:                 'es5',
          module:                 'commonjs',
          emitDecoratorMetadata:  true,
          experimentalDecorators: true
      }))
      // .pipe( sourcemaps.write() )
      .pipe( gulp.dest(config.client.build.js) );
});

gulp.task('jade', function() {
  return gulp.src(config.client.src.jade + "/**/*.jade")
  .pipe(plumber({
    errorHandler: alertError
    }))
  // .pipe(preprocess({
  //   context: {
  //     ENV: ENV
  //   }
  // }))
  .pipe(jade({
    pretty: true,
  })).pipe(gulp.dest(config.client.build.root))
  .pipe(size())
  .pipe(notify({ message: 'Jade task complete' }));
});


  // var gulp         = require('gulp');
  // var browserSync  = require('browser-sync');
  // var sass         = require('gulp-sass');
  // var sourcemaps   = require('gulp-sourcemaps');
  // var handleErrors = require('../util/handleErrors');
  // var config       = require('../config').sass;
  // var autoprefixer = require('gulp-autoprefixer');

  // gulp.task('sass', function () {
  //   return gulp.src(config.src)
  //     .pipe(sourcemaps.init())
  //     .pipe(sass(config.settings))
  //     .on('error', handleErrors)
  //     .pipe(sourcemaps.write())
  //     .pipe(autoprefixer({ browsers: ['last 2 version'] }))
  //     .pipe(gulp.dest(config.dest))
  //     .pipe(browserSync.reload({stream:true}));
  // });

// ------------------------------------------------------------------------------
// Build
// ------------------------------------------------------------------------------


gulp.task('build', function(cb) {
  var sequence;
  sequence = ['clean', ['jade','typescript'], cb];
  return runSequence.apply(null, sequence);
});

// ------------------------------------------------------------------------------
// server
// -----------------------------------------------------------------------------

gulp.task('server', function() {

});

// ------------------------------------------------------------------------------
// Watch
// ------------------------------------------------------------------------------

gulp.task ('watch', function (cb) {
    browserSync.init({
        server: {
            baseDir: config.client.build.root
        }
    });

    gulp.watch(config.client.build.root + '/**').on('change', browserSync.reload);
    gulp.watch(config.client.src.ts + '/**.ts', ['typescript']);
});

// ------------------------------------------------------------------------------
// Default
// ------------------------------------------------------------------------------

gulp.task('default', function(){
    return runSequence ('build', ['watch'])
});

