
var nitro = {},
    _ = require('jengine-utils'),
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
  addPreset: returnNitro( processors.addPreset ),
  loadProcessors: returnNitro( processors.loadPresets ),
  require: function () {
    requireLibs( [].slice.call(arguments) );
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

require('./presets')(nitro);

module.exports = nitro;
