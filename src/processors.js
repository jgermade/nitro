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

function registerProcessor (methodName, processor, processAsBatch, requirements) {
  if( requirements && requirements.length ) {
    requireLibs(requirements);
  }

  if( processAsBatch ) {
    return setProcessor(methodName, function (options) {
      return new Files( processor(this, options) || [] );
    });
  }

  return setProcessor(methodName, function () {
    var files = new Files(), f;

    for( var i = 0, n = this.length; i < n ; i++ ) {
      f = this[i];
      files[i] = new File('' + processor(f.src, f.fileName, f.filePath), f);
    }

    files.length = n;
    return files;
  });
}

function addPreset (processorKey, processor, processAsBatch, requirements) {
  presets[processorKey] = function () {
    return registerProcessor(processorKey, processor, processAsBatch, requirements);
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
