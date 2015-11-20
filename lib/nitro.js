
// useful es6 shim
if( !Array.prototype.find ) {
  Array.prototype.find = function (iteratee) {
    if( !( iteratee instanceof Function ) ) {
      var value = iteratee;
      iteratee = function (item) {
        return item === value;
      };
    }

    for( var i = 0, n = this.length ; i < n ; i++ ) {
      if( iteratee(this[i]) ) {
        return this[i];
      }
    }
  };
}

// nitro declaration

var nitro = function (handler) {
      if( handler instanceof Function ) {
        handler(nitro);
      }
      return nitro;
    },
    _ = require('nitro-tools'),
    fs = require('fs'),
    colors = require('colors'),
    deasync = require('deasync'),
    noop = function (value) { return value; };

var file = require('./file'),
    dir = require('./dir'),
    File = require('./class-file'),
    Files = require('./class-files'),
    timing = require('./timing'),
    processors = require('./processors'),
    tasks = require('./tasks');

processors._addNitro(nitro);
dir._addNitro(nitro);

function returnNitro (fn) {
  return function () {
    fn.apply(this, arguments);
    return nitro;
  };
}

function requireLibs (requirements) {
  if( typeof requirements === 'string' ) {
    requireLibs([requirements]);
    return require(requirements);
  }

  var versions = require('../package').autoRequire;

  requirements.forEach(function (libName) {
    if( !dir.exists( require('path').join( nitro.cwdRoot, 'node_modules', libName) ) ) {
      console.log('installing', libName.yellow, 'on-demand' );

      var version = versions[libName];
      nitro.exec('npm install ' + libName + ( version ? ( '@' + version ) : '' ) );
    }
  });
  return nitro;
}

_.extend(nitro, {
  noop: noop,
  cwdRoot: process.cwd(),
  cwd: require('./cwd'),
  exec: require('child_process').execSync || deasync( require('child_process').exec ),
  deasync: deasync,
  dir: dir,
  expand: function (pattern, options) {
    return dir('.').expand(pattern, options);
  },
  isDir: function (dirpath) {
    try {
      return fs.statSync(dirpath).isDirectory();
    } catch(err) {
      return false;
    }
  },
  file: file,
  isFile: function (dirpath) {
    try {
      return fs.statSync(dirpath).isFile();
    } catch(err) {
      return false;
    }
  },
  tools: _,
  copy: function () {
    dir.copy.apply(this, arguments);
    return nitro;
  },
  timestamp: timing.stamp,
  timingLog: timing.log,
  load: function ( globSrc, options ) {
    return new Files(globSrc, options);
  },
  addPreset: returnNitro( processors.addPreset ),
  loadProcessors: returnNitro( processors.loadPresets ),
  require: requireLibs,
  import: function (dirpath, filter) {
    var path = require('path');

    require('glob').sync( require('path').join(dirpath, filter || '{,**/}*.js') )
      .forEach(function (filename) {
        require( path.join( process.cwd(), filename ) )(nitro);
      });
    return nitro;
  },
  fileProcessor: processors.register,
  server: function () {
    return require('nitro-server').start.apply(this, arguments);
  },
  task: tasks,
  template: require('nitro-template'),
  libs2html: function (filter, options) {
    options = options || {};

    var files = nitro.dir(options.cwd || '.').expand(filter),
        rootSlash = options.rootSlash === undefined || options.rootSlash,
        scriptTail = ( options.version ? ( 'v=' + options.version ) : '' ) + '\"' + ( options.deferJs ? ' defer' : '' ) + ( options.asyncJs ? ' async' : '' ) + '></script>';

    return files.reduce(function (prev, filepath) {
      if( rootSlash ) {
        filepath = '/' + filepath;
      }

      if( /\.js$/.test(filepath) ) {
        return prev + '\n\t<script type="text/javascript" src="' + filepath + scriptTail;
      } else if( /\.css$/.test(filepath) ) {
        return prev + '\n\t<link type="text/css" rel="stylesheet" href="' + filepath + '\" />';
      }
      return prev;
    }, '');
  },
  watch: require('./watch'),
  livereload: function (match, options) {
    nitro.require('livereload').createServer(options).watch(match);
  },
  run: function () {
    if( process.argv.length < 3 ) {
      console.error('needs at least 1 argument');
      process.exit(1);
    }

    tasks.run( [].slice.call(process.argv, 2) );
  }
});

nitro.package = require('./package')(nitro);

module.exports = nitro;
