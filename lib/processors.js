'use strict';

var dir = require('./dir'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    File = require('./class-file'),
    Files = require('./class-files');

var processorsCache = {},
    presets = {};

function requireLibs (requirements) {
  requirements.forEach(function (libName) {
    if( !dir.exists('node_modules/' + libName) ) {
      exec('npm install ' + libName);
    }
  });
}

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
    requireLibs(requirements);
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
      var result = processor.call(this, this.src, options);

      if( typeof result === 'string' ) {
        this.src = result;
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
  if( !presets[preset] ) {
    throw new Error('preset not found: ' + preset);
  }

  return presets[preset]();
}

function loadPresets () {
  [].forEach.call(arguments, function (preset) {
    if( !presets[preset] ) {
      throw new Error('preset not found: ' + preset);
    }

    presets[preset]();
  });

  console.log('\nloaded processors', [].join.call(arguments, ' ').yellow );
}

Files.prototype.process = function (processorKey, options) {
  var processor = processors.get(processorKey) || loadPreset( processorKey );

  if( !processor ) {
    throw new Error('file processor missing: ' + processorKey);
  }

  return processor.call(this, options);
};

var processors = {
  requireLibs: requireLibs,
  get: getProcessor,
  set: setProcessor,
  register: registerProcessor,
  addPreset: addPreset,
  loadPresets: loadPresets
};

module.exports = processors;
