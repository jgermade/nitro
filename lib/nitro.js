
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
    },
    _ = require('jengine-utils'),
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

_.extend(nitro, {
  cwd: require('./cwd'),
  exec: deasync( require('child_process').exec ),
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
  utils: _,
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
  require: function (requirement) {
    if( typeof requirement === 'string' ) {
      processors.requireLibs([requirement]);
      return require(requirement);
    }

    processors.requireLibs( requirement );
    return nitro;
  },
  import: function (dirpath, filter) {
    var path = require('path');

    require('glob').sync( require('path').join(dirpath, filter || '{,**/}*.js') )
      .forEach(function (filename) {
        require( path.join( process.cwd(), filename ) )(nitro);
      });
    return nitro;
  },
  fileProcessor: processors.register,
  serve: function () {
    return require('nitro-server').start.apply(this, arguments);
  },
  task: tasks.register,
  watch: require('./watch'),
  run: function () {
    if( process.argv.length < 3 ) {
      console.error('needs at least 1 argument');
      process.exit(1);
    }

    tasks.process( [].slice.call(process.argv, 2) );
  }
});

nitro.package = require('./package')(nitro);

module.exports = nitro;
