const {dest, src} = require('gulp'),
    gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    cssbeautify = require('gulp-cssbeautify'),
    removeComments = require('gulp-strip-css-comments'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    plumber = require('gulp-plumber'),
    panini = require('panini'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    notify = require('gulp-notify'),
    webpackStream = require('webpack-stream'),
    browserSync = require('browser-sync').create(),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webp-css'),
    cleanCSS = require('gulp-clean-css')

/* Paths */
const srcPath = '#src/', distPath = 'dist/'

const path = {
    build: {
        html: distPath,
        css: distPath + 'assets/css/',
        js: distPath + 'assets/js/',
        images: distPath + 'assets/images/',
        fonts: distPath + 'assets/fonts/',
    },
    src: {
        html: srcPath + '*.html',
        css: srcPath + 'assets/scss/*.scss',
        js: srcPath + 'assets/js/*.js',
        images: srcPath + 'assets/images/**/*.{jpg,png,gif,ico,webp,svg,webmanifest,xml,json}',
        fonts: srcPath + 'assets/fonts/*.{eot,otf,woff,woff2,ttf,svg}',
    },
    watch: {
        html: srcPath + '**/*.html',
        css: srcPath + 'assets/scss/**/*.scss',
        js: srcPath + 'assets/js/**/.js',
        images: srcPath + 'assets/images/**/*.{jpg,png,gif,ico,webp,svg,webmanifest,xml,json}',
        fonts: srcPath + 'assets/fonts/*.{eot,otf,woff,woff2,ttf,svg}',
    },
    clean: './' + distPath
}

/* Tasks */
const serve = () => {
    browserSync.init({
        server: {
            baseDir: path.clean
        },
        port: 3000,
        notify: false
    })
}

const html = () => {
    panini.refresh()
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(panini({
            root: srcPath,
            layouts: srcPath + 'layouts/',
            partials: srcPath + 'partials/',
            helpers: srcPath + 'helpers/',
            data: srcPath + 'data/',
        }))
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}))
}

const css = () => src(path.src.css, {base: srcPath + 'assets/scss/'})
    .pipe(plumber({
        errorHandler: function (err) {
            notify.onError({
                title: 'SCSS Error',
                message: 'Error: <%= error.message %>'
            })(err)
            this.emit('end')
        }
    }))
    .pipe(sass({
        includePaths: './node_modules/',
        outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
        overrideBrowserList: ['last 5 versions'],
        cascade: true
    }))
    .pipe(webpcss())
    .pipe(cssbeautify())
    .pipe(cssnano({
        zindex: false,
        discardComments: {
            removeAll: true
        }
    }))
    .pipe(removeComments())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream: true}))

const cssWatch = () => src(path.src.css, {base: srcPath + 'assets/scss/'})
    .pipe(plumber({
        errorHandler: function (err) {
            notify.onError({
                title: 'SCSS Error',
                message: 'Error: <%= error.message %>'
            })(err)
            this.emit('end')
        }
    }))
    .pipe(sass({
        includePaths: './node_modules/',
        outputStyle: 'expanded'
    }))
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream: true}))

const js = () => src(path.src.js, {base: srcPath + 'assets/js/'})
    .pipe(plumber({
        errorHandler: function (err) {
            notify.onError({
                title: 'JS Error',
                message: 'Error: <%= error.message %>'
            })(err)
            this.emit('end')
        }
    }))
    .pipe(webpackStream({
        mode: 'production',
        output: {
            filename: 'app.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: '/(node_modules)/',
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/preset-env']
                    }
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.txt$/,
                    use: 'raw-loader'
                }
            ]
        }
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({stream: true}))

const jsWatch = () => src(path.src.js, {base: srcPath + 'assets/js/'})
    .pipe(plumber({
        errorHandler: function (err) {
            notify.onError({
                title: 'JS Error',
                message: 'Error: <%= error.message %>'
            })(err)
            this.emit('end')
        }
    }))
    .pipe(webpackStream({
        mode: 'development',
        output: {
            filename: 'app.js'
        }
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({stream: true}))

const images = () => src(path.src.images, {base: srcPath + 'assets/images/'})
    .pipe(webp({
        quality: 70
    }))
    .pipe(imagemin([
        imagemin.gifsicle({interfaced: true}),
        imagemin.mozjpeg({quality: 80, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        }),
    ]))
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({stream: true}))

const fonts = () => src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.reload({stream: true}))

const clean = () => del(path.clean)

const watchFiles = () => {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], cssWatch)
    gulp.watch([path.watch.js], jsWatch)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(css, html, js, images, fonts))
const watch = gulp.parallel(build, watchFiles, serve)

exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.build = build
exports.watch = watch
exports.default = watch
