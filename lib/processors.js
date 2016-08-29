'use strict';

var file = require('./file'),
    dir = require('./dir'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    // File = require('./class-file'),
    Files = require('./class-files'),
    _ = require('nitro-tools'),
    processors = {},
    nitro;

var processorsCache = {},
    presets = {};

function getProcessor (processorKey) {
  return processorsCache[processorKey];
}

function setProcessor (processorKey, processor) {
  processorsCache[processorKey] = processor;
  return processor;
}

function registerProcessor (methodName, processorFactory, processAsBatch, requirements) {
  var processor = processorFactory();

  if( requirements && requirements.length ) {
    nitro.require(requirements);
  }

  if( processAsBatch ) {
    return setProcessor(methodName, function (options) {
      var cwd = process.cwd(), result,
          list = this.clone();

      process.chdir(this.options.cwd);

      result = processor.call( list, list, _.extend({ sourceMap: this.options.sourceMap }, options) );

      process.chdir(cwd);

      return result instanceof Files ? result : list;
    });
  }

  return setProcessor(methodName, function (options) {
    var list = this;

    return this.clone().each(function () {
      var result = processor.call(this, this.src, _.extend({ sourceMap: this.options.sourceMap }, options) );

      if( typeof result === 'string' ) {
        this.src =  result ;
      }
    });

  });
}

function addPreset (processorKey, processorFactory, processAsBatch, requirements) {
  presets[processorKey] = function () {
    return registerProcessor(processorKey, processorFactory, processAsBatch, requirements);
  };
}

function loadPreset (preset) {
  // console.log('loadPreset', preset, !presets[preset], file.exists( require('path').join( __dirname, './presets/' + preset + '.js' ) ), './presets/' + preset + '.js' );

  if( !presets[preset] && nitro && file.exists( require('path').join( __dirname, './presets/' + preset + '.js' ) ) ) {
    require('./presets/' + preset + '.js')(nitro);
  }

  if( !presets[preset] ) {
      throw new Error('preset not found: ' + preset);
  }

  return presets[preset]();
}

function loadPresets () {
  [].forEach.call(arguments, loadPreset);

  console.log('\nloaded processors', [].join.call(arguments, ' ').yellow );
}

Files.prototype.process = function (filter, processorKey, options) {
  if( !_.isString(processorKey) ) {
    if( _.isObject(processorKey) ) {
      options = processorKey;
    }

    processorKey = filter;
    filter = undefined;
  }

  var processor = processors.get(processorKey) || loadPreset( processorKey );

  if( !processor ) {
    throw new Error('file processor missing: ' + processorKey);
  }

  if( filter ) {
    return this.with(filter, function (filteredList) {
      return processor.call( filteredList , options);
    });
  }

  return processor.call( this , options);
};

_.extend(processors, {
  _addNitro: function (_nitro) { nitro = _nitro; },
  get: getProcessor,
  set: setProcessor,
  register: registerProcessor,
  addPreset: addPreset,
  loadPresets: loadPresets
});

module.exports = processors;
