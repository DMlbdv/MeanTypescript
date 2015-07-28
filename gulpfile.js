var gulp = require ('gulp'),
    plumber = require ('gulp-plumber'),
    ts = require ('gulp-typescript'),
    config = require ('./config/config'),
    del = require ('del'),
    vinylPaths = require ('vinyl-paths'),
    runSequence = require ('run-sequence'),
    fs = require ('fs');

//------------------------------------------------------------------------------
// Directory management
// ------------------------------------------------------------------------------

gulp.task('clean', function() {
  return gulp.src(config.client.build.root + "/*", {
    read: false
  }).pipe(plumber({
    // errorHandler: alertError
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

// ------------------------------------------------------------------------------
// Build
// ------------------------------------------------------------------------------


gulp.task('build', function(cb) {
  var sequence;
  sequence = ['clean', ['typescript'], cb];
  return runSequence.apply(null, sequence);
});


gulp.task ('watch', function (cb) {});


gulp.task('default', function(){
    return runSequence ('build', ['watch'])
});