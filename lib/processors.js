'use strict';

var file = require('./file'),
    dir = require('./dir'),
    color = require('./color'),
    deasync = require('deasync'),
    autoRequire = require('./auto-require'),
    Files = require('./class-files'),
    join = require('path').join,
    _ = require('nitro-tools'),
    process_cwd = process.cwd(),
    processors = {};

var processorsCache = {},
    presets = {};

function processorWrapper (processor) {
  return function (list, options) {
    var list = list.clone(), result;
    options = options || {};

    process.chdir(process_cwd);
    if( options.cwd || list.cwd ) process.chdir(options.cwd || list.cwd);

    result = processor.call( list, list, _.extend({ sourceMap: list.options.sourceMap }, options) );

    process.chdir(process_cwd);

    return result instanceof Files ? result : list;
  };
}

function registerProcessor (methodName, processor, thisArg) {
  processorsCache[methodName] = processorWrapper(processor);
  return thisArg;
}

function loadPreset (preset) {
  if( !presets[preset] && file.exists( join( __dirname, './presets/' + preset + '.js' ) ) ) {
    presets[preset] = processorWrapper( require('./presets/' + preset )(require('./nitro')) );
  }

  if( !presets[preset] ) throw new Error('preset not found: ' + preset);

  return presets[preset];
}

Files.prototype.process = function (filter, processorName, options) {

  if( !_.isString(processorName) ) {
    if( _.isObject(processorName) ) options = processorName;

    processorName = filter;
    filter = undefined;
  }

  var processor = processorsCache[processorName] || loadPreset( processorName );

  if( !processor ) throw new Error('file processor missing: ' + processorName);

  if( filter ) {
    return this.with(filter, function (filteredList) {
      return processor.call( filteredList, filteredList, options);
    });
  }

  return processor.call( this, this, options ) || this;
};

_.extend(processors, {
  register: registerProcessor,
});

module.exports = processors;
