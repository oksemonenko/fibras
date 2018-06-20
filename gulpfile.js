"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var jsmin = require('gulp-jsmin');
var del = require("del");
var run = require("run-sequence");

gulp.task("clean", function() {
    return del("build");
});

gulp.task("copy", function() {
    return gulp.src([
        "source/fonts/**/*.{woff,woff2}"
    ], {
        base: "source"
    })
        .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
    gulp.src("source/sass/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(gulp.dest("build/css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("images", function() {
    return gulp.src("source/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function() {
    return gulp.src("source/img/**/*.{png,jpg}")
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
    return gulp.src("source/img/icons/*.svg")
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img/icons"));
});

gulp.task("html", function() {
    return gulp.src("source/*.html")
        .pipe(posthtml ([
            include()
        ]))
        .pipe(gulp.dest("build"))
});

gulp.task("js", function() {
    gulp.src("source/js/**/*.js")
        .pipe(gulp.dest("build/js"))
        .pipe(jsmin())
        .pipe(rename(function(path) {
            path.basename += ".min";
        }))
        .pipe(gulp.dest("build/js"));
});

gulp.task("serve", function() {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
    gulp.watch("source/js/**/*.js", ["js"]);
    gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});

gulp.task ("build", function(fn) {
    run(
        "clean",
        "copy",
        "style",
        "js",
        "images",
        "webp",
        "symbols",
        "html",
        fn
    );
});