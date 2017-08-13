var gulp=require('gulp');
var webserver = require('gulp-webserver');
var less = require('gulp-less');
var clean = require('gulp-clean');
var glob = require("glob");
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream')

var param={root:'./src',
            devroot:'./dev',
            host:'0.0.0.0',
            port:8100,
            index:'./pages/index.html',
          };

//清理dev目录
gulp.task('clean', function() {
    return gulp.src(param.devroot)
        .pipe(clean({
            force: true
        }));
});

//图片
gulp.task('images', function() {
    return gulp.src(param.root+'/images/*')
        .pipe(gulp.dest(param.devroot+'/static/images'));
});
//css
gulp.task('dev:css', function() {
    return gulp.src(param.root+'/style/app.less')
        .pipe(less())
        .pipe(gulp.dest(param.devroot+'/static/style'));
});
//js
gulp.task('dev:js', function() {
    glob(param.root+"/js/app.js", {}, function(er, files) {
        for (var i = 0; i < files.length; i++) {
            browserify()
                .add(files[i])
                .transform(babelify, {
                    presets: ["es2015", "stage-3"],
                    "plugins": ["transform-runtime"],
                    compact: false
                })
                .bundle()
                .pipe(source(files[i].match(/js\/(.*?)\.js/)[1] + '.js'))
                .pipe(gulp.dest(param.devroot+'/static/js'));
        }
    });
});

gulp.task('dev:html',function () {
    gulp.src(param.root+'/pages/**').pipe(gulp.dest(param.devroot+'/pages/'));;
});

//服务
gulp.task('dev:webserver', function() {
    gulp.src(param.devroot)
        .pipe(webserver({
            host:param.host,
            livereload: true,
            directoryListing: false,
            port:param.port,
            open: false,
            fallback: param.index,
        }));
    gulp.watch(param.root+'/images/**', ['images']);
    gulp.watch([param.devroot+'/style/app.css',param.root+'/style/**/*.less'], ['dev:css']);
    gulp.watch([param.devroot+'/js/*.js',param.root+'/js/**/*.js'], ['dev:js']);
    gulp.watch([param.devroot+'/pages/**',param.root+'/pages/**'], ['dev:html']);

});



gulp.task('dev',['images','dev:css','dev:js','dev:html'],function () {
    gulp.start('dev:webserver');
})