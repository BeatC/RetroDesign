var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    concatCss = require('gulp-concat-css'),
    htmlMin = require('gulp-htmlmin'),
    cssMin = require('gulp-uglifycss'),
    jsMin = require('gulp-uglify'),
    log = require('gulp-util'),
    refresh = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    rimraf = require('gulp-rimraf');


// Livereload server
gulp.task('livereload', function() {
    server.listen(35729, function(err) {
        if(err) return console.log(err);
    });
});

// Watching task
gulp.task('watch', function() {
    gulp.watch('./src', function() {
        gulp.run('build');
    })
});

// Should be run after concatenation. Adds autoprefixes to css-rules
gulp.task('prefix', function() {
    gulp.src('./build/css/bundle.css')
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build/css/'));
});

// Concatenates styles into bundle.css
gulp.task('concat', function() {
    gulp.src('./src/css/*.css')
        .pipe(concatCss('bundle.css'))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('delete', function() {
    gulp.src('./build/css', {read: false})
        .pipe(rimraf());
});

// Should be used after concatenation, autoprefix and copying
gulp.task('compress', function() {
    /* Compressing HTML */
    gulp.src('./build/*.html')
        .pipe(htmlMin({
                        collapseWhitespace: true,
                        removeComments: true,
                        maxLineLength: 80,
                        preserveLineBreaks: true}))
        .pipe(gulp.dest('./dist'));

    /* Compressing CSS */
    gulp.src('./build/css/bundle.css')
        .pipe(cssMin({'max-line-len': 80}))
        .pipe(gulp.dest('./dist/css'));

    /* Compressing JS */
    gulp.src('./build/js/*.js')
        .pipe(jsMin())
        .pipe(gulp.dest('./dist/js'));
});

var copyTo = function(mediaPath, fontsPath, htmlPath, jsPath) {
    // HTML
    if(htmlPath) {
        gulp.src(htmlPath.from)
            .pipe(gulp.dest(htmlPath.to));
    }

    // Media
    if(mediaPath) {
        gulp.src(mediaPath.from)
            .pipe(gulp.dest(mediaPath.to));
    }

    if(fontsPath) {
        gulp.src(fontsPath.from)
            .pipe(gulp.dest(fontsPath.to));
    }

    // JS
    if(jsPath) {
        gulp.src(jsPath.from)
            .pipe(gulp.dest(jsPath.to));
    }
};

var copyToBuild = function() {
    copyTo(
        {
            from: './src/img/**/*.*',
            to: 'build/img'

        },
        {
            from: './src/fonts/*.*',
            to: 'build/fonts'

        },
        {
            from: './src/*.html',
            to: './build'
        },
        {
            from: './src/js/*.js',
            to: './build/js'
        });
};

    var copyToDist = function() {
        copyTo(
            {
                from: './build/img/**/*.*',
                to: 'dist/img'

            },
            {
                from: './build/fonts/*.*',
                to: 'dist/fonts'

            });
    };

// Copying *.html, *.js and media files to /build directory
gulp.task('copyToBuild', copyToBuild);

gulp.task('copyToDist', copyToDist);

gulp.task('build', [ 'concat', 'prefix', 'copyToBuild']); // Building of dev version

gulp.task('make', ['build', 'compress', 'copyToDist']);  // Running all tasks

gulp.task('default', ['livereload', 'build']);  // Default task