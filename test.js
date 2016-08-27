
var nitro = require('./lib/nitro');

// process.stdout.write( nitro.package().increaseVersion('minor').version() );

// console.log( nitro.dir('lib').expand('{,**/}*.js') );

// console.log( process.env );

// nitro.github.release( 'v' + require('./package').version, {
nitro.github.release({
	attach: ['test.js']
});

// require('./lib/nitro').dir('lib')
//   .expand([
//     '{,**/}cwd.js',
//     '{,**/}dir.js',
//     '{,**/}file.js',
//     '{,**/}*.js',
//     '!{,**/}log.js'
//   ]).forEach(function (filename) {
//     console.log('found', filename);
//   });

// var nitro = require('./lib/nitro');
//
// nitro.timingLog('dist', function () {
//   nitro.dir('dist').remove();
//   nitro.package('npm').dependencies().copy('dist');
// });
