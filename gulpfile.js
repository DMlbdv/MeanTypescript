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
    fs              = require ('fs'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    autoprefixer    = require('gulp-autoprefixer');

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


gulp.task('sass', function () {
  return gulp.src(config.client.src.scss + '/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        // indentedSyntax: true, // Enable .sass syntax!
        // imagePath: 'images' // Used by the image-url helper
    }))
    .pipe(plumber({
        errorHandler: alertError
    }))
    .pipe(autoprefixer({ browsers: ['last 2 version'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.client.build.css))
});

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
    gulp.watch(config.client.src.sass + '/**.sass', ['sass']);
});

// ------------------------------------------------------------------------------
// Default
// ------------------------------------------------------------------------------

gulp.task('default', function(){
    return runSequence ('build', ['watch'])
});

