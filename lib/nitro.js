
// useful es6 shim
if( !Array.prototype.find ) {
  Array.prototype.find = function (iteratee, thisArg) {
    if( typeof iteratee !== 'function' ) throw new TypeError('predicate must be a function');

    for( var i = 0, n = this.length ; i < n ; i++ ) {
      if( iteratee.call(thisArg, this[i]) ) {
        return this[i];
      }
    }
  };
}

// nitro declaration

var nitro = function (handler) {
      if( handler instanceof Function ) handler(nitro);
      return nitro;
    },
    _ = require('nitro-tools'),
    fs = require('fs'),
    color = require('./color'),
    deasync = require('deasync'),
    noop = function (value) { return value; },
    YAML = require('js-yaml');

var file = require('./file'),
    dir = require('./dir'),
    // File = require('./class-file'),
    // Files = require('./class-files'),
    processors = require('./processors'),
    tasks = require('./tasks'),
    path = require('path'),
    server = require('./server'),
    livereload = require('./livereload'),
    autoRequire = require('./auto-require');

function returnNitro (fn) {
  return function () {
    fn.apply(this, arguments);
    return nitro;
  };
}

_.extend(nitro, {
  color: color,
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
  load: function (pattern, options) {
    return dir.load('.', pattern, options);
  },
  // addPreset: returnNitro( processors.addPreset ),
  // loadProcessors: returnNitro( processors.loadPresets ),
  require: autoRequire,
  import: function (dirpath, filter) {
    var path = require('path');

    if( !dir.exists(dirpath) ) {
      console.error('directory ' + color.yellow(dirpath) + ' does not exists');
      process.exit(1);
    }

    dir(dirpath).load( filter || ( filter === false ? '*.js' : '{,**/}*.js' ) )
      .each(function (f) {
        var fullpath = path.join( process.cwd(), f.cwd, f.path );
        if( fullpath === __filename ) return;
        require( fullpath )(nitro);
      });

    return nitro;
  },
  registerProcessor: returnNitro(processors.register),
  task: tasks,
  template: require('trisquel'),
  libs2html: dir.libs2html,
  watch: require('./watch'),
  livereload: function (dirpath, options) {
    options = options ? _.copy(options) : {};

    if( options.highlight ) {
      options.highlight = autoRequire('cardinal').highlight;
    }

    livereload(options.server || server(__dirname + '/livereload', { port: options.port || 12345, log: false }), dirpath, options);
  },
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
  run: function (taskList) {
    if( taskList && process.argv.length < 3 ) {
      console.error('needs at least 1 argument');
      process.exit(1);
    }

    return tasks.run( taskList || [].slice.call(process.argv, 2) );
  },
  server: server
});

nitro.package = require('./package')(nitro);

module.exports = nitro;
