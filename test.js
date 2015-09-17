
var nitro = require('./lib/nitro');

process.stdout.write( nitro.package().increaseVersion('minor').version() );

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
