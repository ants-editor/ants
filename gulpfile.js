/*
	node ./node_modules/gulp/bin/gulp.js
*/
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

//gulp.task('build',['html' ,'css' ,'scripts' ,'images' ,'manifest']);


function css_task()
{
	console.log('css_task');
	return gulp.src([
		'./depencies/material-design-lite/material.min.css',
		'./css/*.css',
		'./depencies/dialog-polyfill/dialog-polyfill.css'])
    //.pipe(cleanCSS({}))
    .pipe(gulp.dest('dist/css'));
}

function scripts_task()
{
	console.log('scripts');
	let base = gulp.src([
			'./js/*.js',
			'./depencies/markdown-it/markdown-it.js',
			'./depencies/dialog-polyfill/dialog-polyfill.js',
			'./depencies/dialog-polyfill/dialog-polyfill.css',
			'./depencies/material-design-lite/*.js',
			'./depencies/material-design-lite/*.css',
			'./node_modules/promiseutil/PromiseUtils.js',
      		'./node_modules/db-finger/DatabaseStore.js',
      		'./node_modules/diabetes/Util.js'])
		.pipe( gulp.dest('dist/js/') );


	let sauna = gulp.src(['./node_modules/sauna-spa/js/*.js'])
		.pipe(gulp.dest('dist/js/sauna/') );

	let html = gulp.src(['./index.html']).pipe(gulp.dest('dist/'));

	return mergeStream( base, sauna , html);
}

function watch_task()
{
	console.log('watch');
	gulp.watch([
			'./index.html',
			'./css/*.css',
			'./node_modules/sauna-spa/js/*.js',
			'./js/*.js',
			'./depencies/markdown-it/markdown-it.js',
			'./depencies/dialog-polyfill/dialog-polyfill.js',
			'./depencies/material-design-lite/*.js',
			'./node_modules/promiseutil/PromiseUtils.js',
      		'./node_modules/db-finger/DatabaseStore.js',
      		'./node_modules/diabetes/Util.js'],gulp.parallel('scripts_task','css_task'));

}

gulp.task('css_task', css_task );
gulp.task('scripts_task', scripts_task );
gulp.task('watch_task', watch_task );
gulp.task('default',function(){
	scripts_task();
	css_task();
	watch_task();
	return gulp.series('scripts_task','css_task','watch_task');
});
