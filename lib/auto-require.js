
var cwdRoot = process.cwd(),
    dir = require('./dir'),
    file = require('./file'),
    color = require('./color'),
    path = require('path'),
    deasync = require('deasync'),
    execSH = require('child_process').execSync || deasync( require('child_process').exec );

module.exports = function requireLibs (requirements) {
  if( typeof requirements === 'string' ) {
    requireLibs([requirements]);
    return require(requirements.split('@')[0]);
  }

  var versions = require('../package').autoRequire;

  requirements.forEach(function (libName) {
    var version = versions[libName],
        dirpath = path.join( cwdRoot, 'node_modules', libName),
        startTime;
    if( /@/.test(libName) ) {
      libName = libName.split('@');
      version = libName[1];
      libName = libName[0];
    }
    if( !dir.exists( dirpath ) ) {
      console.log(color.magenta('installing'), color.yellow(libName) + color.cyan( version ? ( '@' + version ) : '' ), 'on-demand' );
      startTime = Date.now();
      execSH('npm install ' + libName + ( version ? ( '@' + version ) : '' ) );
      if( file.exists( path.join( dirpath, 'package.json') ) ) {
        console.log(color.green('\ninstalled ') + libName + (version ? color.cyan('@' + file.readJSON( dirpath, 'package.json').version ) : '') + ' ' + color.yellow( ( Date.now() - startTime ) + 'ms' ) + '\n' );
      }
    } else if( version && file.exists( path.join( dirpath, 'package.json') ) ) {
      if( file.readJSON( path.join( dirpath, 'package.json') ).version >= version.replace(/\.x/g, '') ) return;

      console.log(color.magenta('updating'), color.yellow(libName) + color.cyan('@' + version), 'on-demand' );
      startTime = Date.now();
      execSH('npm install ' + libName + '@' + version );
      if( file.exists( path.join( dirpath, 'package.json') ) ) {
        console.log(color.green('\nupdated ') + libName + color.cyan('@' + file.readJSON( dirpath, 'package.json').version ) + ' ' + color.yellow( ( Date.now() - startTime ) + 'ms' ) + '\n' );
      }
    }
  });
};
