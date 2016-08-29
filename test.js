
var nitro = require('./lib/nitro');

// nitro.github.release( 'v' + require('./package').version, {
// nitro.github.release({
// 	attach: ['test.js']
// });

// nitro.load('tests/dummy/{,**/}*.js')
// 	.process('uglify', { sourceMap: true })
// 	.join('tests/dummy.js')
nitro.load('tests/dummy/dummy.coffee')
	.process('coffee-script')
	.process('ng-annotate', { sourceMap: true })
	// .process('browserify', { sourceMap: true })
	.process('uglify')
	.each(function (f) {
		console.log(f.path);
		console.log(f.src);
		console.log(f.map);
	})
	.write('.tmp', { sourceMap: 'inline' });

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
