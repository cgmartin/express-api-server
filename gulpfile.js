'use strict';
var path        = require('path');
var _           = require('lodash');
var gulp        = require('gulp-help')(require('gulp'));
var $           = require('gulp-load-plugins')({lazy: true});
var runSequence = require('run-sequence');
var args        = require('yargs').argv;
var notifier    = require('node-notifier');
var del         = require('del');

process.setMaxListeners(0);       // Disable max listeners for gulp

var isVerbose = args.verbose;     // Enable extra verbose logging with --verbose
var isProduction = args.prod;     // Run extra steps with production flag --prod
var isWatching = false;           // Enable/disable tasks when running watch

/************************************************************************
 * Functions/Utilities
 */

// Desktop notifications of errors
function onError(err) {
    // jshint validthis: true
    notifier.notify({
        title: err.plugin + ' Error',
        message: err.message
    });
    $.util.log(err.toString());
    $.util.beep();
    if (isWatching) {
        this.emit('end');
    } else {
        process.exit(1);
    }
}

function verbosePrintFiles(taskName) {
    return $.if(isVerbose, $.print(function(filepath) {
        return taskName + ': ' + filepath;
    }))
}

/************************************************************************
 * Clean temporary folders and files
 */

gulp.task('clean-coverage', false, function(cb) {
    del(['coverage'], cb);
});

gulp.task('clean', 'Remove all temporary files', ['clean-coverage']);

/************************************************************************
 * JavaScript tasks
 */

gulp.task('lint', 'Lints all JavaScript files', function() {
    return gulp.src('src/**/*.js')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(verbosePrintFiles('lint-js'))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.if(!isWatching, $.jshint.reporter('fail')));
});

/************************************************************************
 * Unit testing tasks
 */

function serverTestStream() {
    process.env.NODE_ENV = 'test';
    return gulp.src('src/**/*.spec.js', {read: false})
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.if(args.verbose, $.print()))
        .pipe($.mocha({
            reporter: 'spec'
        }));
}

gulp.task('test-server', function() {
    return serverTestStream();
});

gulp.task('test-server-coverage', ['clean-coverage'], function(cb) {
    var coverageDir = './coverage';
    gulp.src(['src/**/*.js', '!**/*.spec.js'])
        .pipe($.if(args.verbose, $.print()))
        .pipe($.istanbul({ // Covering files
            //instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe($.istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function() {
            serverTestStream()
                .pipe($.istanbul.writeReports({
                    dir: coverageDir,
                    reportOpts: {dir: coverageDir},
                    reporters: ['text', 'text-summary', 'json', 'html']
                }))
                .pipe($.istanbulEnforcer({
                    thresholds: {
                        statements: 0,
                        branches: 0,
                        lines: 0,
                        functions: 0
                    },
                    coverageDirectory: coverageDir,
                    rootDirectory: ''
                }))
                .on('end', cb);
        });
});

gulp.task('test', 'Run unit tests', function(cb) {
    runSequence('clean-coverage', 'lint', 'test-server-coverage', cb);
});

/************************************************************************
 * Watch / Reload tasks
 */

gulp.task('watch-iterate', false, function(cb) {
    runSequence('lint', 'test-server', cb);
});

gulp.task('watch', false, function() {
    isWatching = true;
    gulp.watch('src/**/*.js', ['watch-iterate']);
});

gulp.task('nodemon', false, function(cb) {
    var firstStart = true;
    var serverPort = 8000;
    $.nodemon({
        script: 'example/server.js',
        ext: 'js',
        env: {
            'NODE_ENV': 'development',
            'PORT': serverPort
        },
        nodeArgs: ['--debug'],
        ignore: [
            'coverage/**', 'node_modules/**',
            'gulpfile.js', '.idea/**', '.git/**'
        ],
        stdout: false // important for 'readable' event
    })
    // The http server might not have started listening yet when
    // the `restart` event has been triggered. It's best to check
    // whether it is already listening for connections or not.
    .on('readable', function() {
        this.stdout.on('data', function(chunk) {
            process.stdout.write(chunk);
            if (/listening at http/.test(chunk)) {
                if (firstStart) {
                    firstStart = false;
                    cb();
                }
            }
        });
        this.stderr.pipe(process.stdout);
    });
    //.on('change', ['test-server'])
    //.on('start', function() {});
});

gulp.task('serve', 'Watch for file changes and re-run build and lint tasks', function(cb) {
    // When watch and nodemon tasks run at same time
    // the server seems to randomly blow up (??)
    runSequence(
        'watch',
        'nodemon',
        cb
    );
});
