
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
    noop = function (value) { return value; },
    YAML = require('js-yaml');

var file = require('./file'),
    dir = require('./dir'),
    // File = require('./class-file'),
    Files = require('./class-files'),
    timing = require('./timing'),
    processors = require('./processors'),
    tasks = require('./tasks'),
    path = require('path');

processors._addNitro(nitro);
dir._addNitro(nitro);

function returnNitro (fn) {
  return function () {
    fn.apply(this, arguments);
    return nitro;
  };
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
  symlink: function (_path, target, type) {
    var dirpath = _path.replace(/\/[^\/]+$/, '');
    if( !dir.exists(dirpath) ) {
      dir.create(dirpath);
    }
    fs.symlinkSync( target, path.join(nitro.cwdRoot, _path), type);
    return nitro;
  },
  timestamp: timing.stamp,
  timingLog: timing.log,
  load: function ( globSrc, options ) {
    return new Files(globSrc, options);
  },
  addPreset: returnNitro( processors.addPreset ),
  loadProcessors: returnNitro( processors.loadPresets ),
  require: require('./require-on-demand'),
  import: function (dirpath, filter) {
    var path = require('path');

    dir(dirpath).load( filter || ( filter === false ? '*.js' : '{,**/}*.js' ) )
      .each(function (f) {
        require( path.join( process.cwd(), f.cwd, f.path ) )(nitro);
      });

    return nitro;
  },
  fileProcessor: processors.register,
  task: tasks,
  template: require('nitro-template'),
  libs2html: function (filter, options) {
    options = options || {};

    var files = nitro.dir(options.cwd || '.').expand(filter),
        rootSlash = options.rootSlash === undefined || options.rootSlash,
        scriptTail = ( options.version ? ( '?v=' + options.version ) : '' ) + '\"' + ( options.defer ? ' defer' : '' ) + ( options.async ? ' async' : '' ) + '></script>',
        styleTail = ( options.version ? ( '?v=' + options.version ) : '' ) + '\" />';

    return files.reduce(function (prev, filepath) {
      if( rootSlash ) {
        filepath = '/' + filepath;
      }

      if( /\.js$/.test(filepath) ) {
        return prev + '\n\t<script type="text/javascript" src="' + filepath + scriptTail;
      } else if( /\.css$/.test(filepath) ) {
        return prev + '\n\t<link type="text/css" rel="stylesheet" href="' + filepath + styleTail;
      }
      return prev;
    }, '');
  },
  watch: require('./watch'),
  livereload: function (match, options) {
    nitro.require('livereload').createServer(options).watch(match);
    return nitro;
  },
  options: require('./options')(nitro),
  parseJSON: function (json) {
    return JSON.parse(json);
  },
  parseYAML: function (yaml) {
    return YAML.safeLoad(yaml);
  },
  stringify: function (data, format, options) {
    format = format || 'json';
    options = options || {};

    if( format === 'json' ) {
      return JSON.stringify(data, null, options.indentBy || '\t' );
    } else if( format === 'yaml' ) {
      return YAML.safeDump(data);
    }

    throw new Error('Stringify to ' + format + ' format not supported.');
  },
  run: function () {
    if( process.argv.length < 3 ) {
      console.error('needs at least 1 argument');
      process.exit(1);
    }

    tasks.run( [].slice.call(process.argv, 2) );
  },
  server: require('./server')
});

nitro.github = require('./github')(nitro);
nitro.package = require('./package')(nitro);

module.exports = nitro;
