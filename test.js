
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

// nitro.watch('lib', { livereload: 12345 });
nitro.livereload('lib', { port: 12345 });
