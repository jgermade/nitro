
var nitro = {},
    _ = require('jengine-utils'),
    colors = require('colors'),
    glob = require('glob'),
    path = require('path'),
    deasync = require('deasync'),
    noop = function (value) { return value; };

var file = require('./file'),
    dir = require('./dir'),
    exec = deasync(require('child_process').exec),
    Files = require('./class-files'),
    File = require('./class-file'),
    timing = require('./timing');

var processors = require('./processors'),
    requireLibs = function (requirements) {
      requirements.forEach(function (libName) {
        if( !dir.exists('node_modules/' + libName) ) {
          exec('npm install ' + libName);
        }
      });
    };

function fileProcessor (methodName, processor, processAsBatch, requirements) {
  if( requirements && requirements.length ) {
    requireLibs(requirements);
  }

  if( processAsBatch ) {
    processors[methodName] = function (options) {
      return new Files( processor(this, options) || [] );
    };
  } else {
    processors[methodName] = function () {
      var files = new Files(), f;

      for( var i = 0, n = this.length; i < n ; i++ ) {
        f = this[i];
        files[i] = new File('' + processor(f.src, f.fileName, f.filePath), f);
      }

      files.length = n;
      return files;
    };
  }
  // Files.prototype[methodName] = processors[methodName];
  return nitro;
}

var presets = {},
    addPreset = function (processorKey, processor, processAsBatch, requirements) {
      presets[processorKey] = function () {
        nitro.fileProcessor(processorKey, processor, processAsBatch, requirements);
      };
    },
    loadProcessors = function () {
      [].forEach.call(arguments, function (preset) {
        if( !presets[preset] ) {
          throw new Error('preset not found: ' + preset);
        }

        presets[preset]();
      });
    };

_.extend(nitro, {
  cwd: require('./cwd'),
  exec: exec,
  glob: glob,
  deasync: deasync,
  dir: dir,
  file: file,
  copy: function () {
    dir.copy.apply(this, arguments);
    return nitro;
  },
  timestamp: timing.stamp,
  timingLog: timing.log,
  load: function ( globSrc, options ) {
    return new Files(globSrc, options);
  },
  addPreset: addPreset,
  loadProcessors: loadProcessors,
  require: function () {
    return requireLibs( [].slice.call(arguments) );
  },
  fileProcessor: fileProcessor
});

require('./presets')(nitro);

module.exports = nitro;
