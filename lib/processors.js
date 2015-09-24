'use strict';

var file = require('./file'),
    dir = require('./dir'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    File = require('./class-file'),
    Files = require('./class-files'),
    _ = require('jengine-utils'),
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

      process.chdir(this.meta.cwd);

      result = processor.call(list, list, options);

      process.chdir(cwd);

      return result instanceof Files ? result : list;
    });
  }

  return setProcessor(methodName, function (options) {

    return this.clone().each(function () {
      var result = processor.call(this, this.getSrc(), options);

      if( typeof result === 'string' ) {
        this.setSrc( result );
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

Files.prototype.process = function (processorKey, options) {
  var processor = processors.get(processorKey) || loadPreset( processorKey );

  if( !processor ) {
    throw new Error('file processor missing: ' + processorKey);
  }

  return processor.call(this, options);
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
