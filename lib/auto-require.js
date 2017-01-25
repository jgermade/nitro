
var cwdRoot = process.cwd(),
    dir = require('./dir'),
    color = require('./color'),
    path = require('path'),
    execSH = require('child_process').execSync || deasync( require('child_process').exec );

module.exports = function requireLibs (requirements) {
  if( typeof requirements === 'string' ) {
    requireLibs([requirements]);
    return require(requirements.split('@')[0]);
  }

  var versions = require('../package').autoRequire;

  requirements.forEach(function (libName) {
    var version = versions[libName];
    if( /@/.test(libName) ) {
      libName = libName.split('@');
      version = libName[1];
      libName = libName[0];
    }
    if( !dir.exists( path.join( cwdRoot, 'node_modules', libName) ) ) {
      console.log('installing', color.yellow(libName) + color.cyan( version ? ( '@' + version ) : '' ), 'on-demand' );
      execSH('npm install ' + libName + ( version ? ( '@' + version ) : '' ) );
    }
  });
}
