
var nitro = require('./lib/nitro');

// nitro.github.release( 'v' + require('./package').version, {
// nitro.github.release({
// 	attach: ['test.js']
// });

// // nitro.load('tests/dummy/{,**/}*.js')
// // 	.process('uglify', { sourceMap: true })
// // 	.join('tests/dummy.js')
// nitro.load('tests/dummy/dummy.coffee', { sourceMap: true })
// 	.process('coffee-script')
// 	// .process('ng-annotate')
// 	// .process('browserify', { sourceMap: true })
// 	.process('uglify')
// 	.each(function (f) {
// 		console.log(f.path);
// 		console.log(f.src);
// 		console.log(f.map);
// 	})
// 	.write('.tmp');

// nitro.load('tests/dummy/dummy.less')
// 	.process('less', {
// 		autoprefix: true,
// 		sourceMap: true
// 	})
// 	.each(function (f) {
// 		console.log(f.path);
// 		console.log(f.src);
// 		console.log(f.map);
// 	})
// 	.write('.tmp', { sourceMap: 'inline' });

// nitro.dir('.tmp').load('tests/dummy/dummy.js')
// 	.each(function (f) {
// 		console.log('path\n', f.path);
// 		console.log('src\n', f.src);
// 		console.log('map\n', f.map);
// 	});

nitro.task('coffee', function () {
  console.log('task:coffee', arguments);
});

nitro.task('all', function () {
  console.log('task:all', arguments);
});

nitro.watch('tests', ['all:dev'], function (filename, meta) {
  console.log('changed', filename, meta);
}).when('{,**/}*.js', function (filename, meta) {
  console.log('js', filename, meta);
}).when('{,**/}*.coffee', ['coffee:dev'], function (filename, meta) {
  console.log('coffee', filename, meta);
});

nitro.livereload('lib', { port: 12345, highlight: false });
