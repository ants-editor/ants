var gulp			= require('gulp');
///var sass 			= require('gulp-sass');
///var autoprefixer	= require('gulp-autoprefixer');
/////var minifyCss		= require('gulp-minify-css');
///var rename			= require('gulp-rename');
///var del				= require('del');
///var htmlmin			= require('gulp-htmlmin');

let cleanCSS = require('gulp-clean-css');

var concat 			= require('gulp-concat');
var mergeStream		= require('merge-stream');
//var closureCompiler = require('google-closure-compiler').gulp();

//var amazonDir		= './node_modules/amazon-parser';

//gulp.task('default', ['html' ,'css' ,'scripts' ,'images' ,'watch','manifest']);
//gulp.task('build',['html' ,'css' ,'scripts' ,'images' ,'manifest']);

//gulp.task('watch',()=>
//{
//	amazonDir		= '/home/pejelover/Projects/AmazonParser';
//	gulp.watch( [ './css/*.css' ] ,['css'] );
//	gulp.watch ( ['./js/*.js' ] ,['scripts']);
//	gulp.watch ( [ 'manifest.json' ], ['manifest'] );
//	gulp.watch(['./*.html'],['html']);
//	gulp.watch(['./node_modules/extension-framework/*.js'
//		,'./node_modules/promiseutil/*.js'
//		,'./node_modules/db-finger/DatabaseStore.js'
//		,'./node_modules/dealer-sorter/ArraySorter.js'
//		,amazonDir+'/*.js'],['scripts']);
//});
//
//gulp.task('manifest',()=>
//{
//	return gulp.src(['./manifest.json'])
//		.pipe(gulp.dest('./dist/') );
//});
//
//gulp.task('html',()=>
//{
//	return gulp.src(['./*.html'])
//		.pipe(htmlmin({
//			collapseWhitespace	: true
//			,removeComments		: true
//		}))
//		.pipe(gulp.dest('./dist/'));
//});
//
//gulp.task('images',()=>
//{
//	return
//});

gulp.task('css', () => {
	return gulp.src(['./depencies/material-design-lite/material.min.css','./css/*.css'])
	.pipe(concat('all.css') )
    .pipe(cleanCSS({}))
    .pipe(gulp.dest('dist/css'));
});



//gulp.task('default', function () {
//	console.log("Hellyewa");
//  return gulp.src([
//      		'./js/*.js',
//      		'./depencies/material-design-lite/material.min.js',
//      		'./node_modules/promiseutil/PromiseUtils.js',
//      		'./node_modules/db-finger/DatabaseStore.js',
//      		'./node_modules/sauna-spa/js/*.js',
//      		'./node_modules/diabetes/Util.js',
//  		], {base: './'})
//      .pipe(closureCompiler({
//          compilation_level: 'SIMPLE',
//          warning_level: 'VERBOSE',
//          language_in: 'ECMASCRIPT6_STRICT',
//          language_out: 'ECMASCRIPT5_STRICT',
//          output_wrapper: '(function(){\n%output%\n}).call(this)',
//          js_output_file: 'output.min.js'
//        }, {
//          platform: ['native', 'java', 'javascript']
//        }))
//      .pipe(gulp.dest('./dist/js'));
//});

gulp.task('scripts',function(){

	let base = gulp.src([
			'./js/*.js',
			'./depencies/markdown-it/markdown-it.js',
			'./depencies/dialog-polyfill/dialog-polyfill.js',
			'./depencies/material-design-lite/*.js',
			'./node_modules/promiseutil/PromiseUtils.js',
      		'./node_modules/db-finger/DatabaseStore.js',
      		'./node_modules/diabetes/Util.js'])
		.pipe( gulp.dest('dist/js/') );


	let sauna = gulp.src(['./node_modules/sauna-spa/js/*.js'])
		.pipe(gulp.dest('dist/js/sauna/') );

	let html = gulp.src(['./index.html']).pipe(gulp.dest('dist/'));

	return mergeStream( base, sauna , html);
});


