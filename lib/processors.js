'use strict';

var file = require('./file'),
    Files = require('./class-files'),
    joinPaths = require('./join-paths'),
    _ = require('nitro-tools'),
    // process_cwd = process.cwd(),
    processors = {};

var processorsCache = {},
    presets = {};

function processorWrapper (processor) {
  return function (list, options) {
    var result;
    options = options || {};

    if( options.cwd || list.cwd ) process.chdir(options.cwd || list.cwd);

    result = processor.call( list, list, _.extend({ sourceMap: list.options.sourceMap }, options) );

    return result instanceof Files ? result : list;
  };
}

function registerProcessor (methodName, processor, thisArg) {
  processorsCache[methodName] = processorWrapper(processor);
  return thisArg;
}

function loadPreset (preset) {
  var preset_file = joinPaths( __dirname, './presets/' + preset + '.js' );
  if( !presets[preset] && file.exists( preset_file ) ) {
    presets[preset] = processorWrapper( require(preset_file)(require('./nitro')) );
  }

  if( !presets[preset] ) throw new Error('preset not found: ' + preset);

  return presets[preset];
}

Files.prototype.process = function (pattern, processorName, options) {

  if( !_.isString(processorName) ) {
    if( _.isObject(processorName) ) options = processorName;

    processorName = pattern;
    pattern = undefined;
  }

  var processor = processorsCache[processorName] || loadPreset( processorName );

  if( !processor ) throw new Error('file processor missing: ' + processorName);

  var list = this.clone();

  if( pattern ) {

    var indexes_matched = [],
        filtered_list = new Files([], Object.create(this.options) );

    list.each(pattern, function (f, i) {
      indexes_matched.push(i);
      filtered_list.push(f);
    });

    filtered_list = processor.call( filtered_list, filtered_list, options ) || filtered_list;

    for( var i = 0 ; i < indexes_matched.length ; i++ ) list[indexes_matched[i]] = filtered_list[i];

    return list;
  } else {
    return processor.call( list, list, options ) || list;
  }
};

_.extend(processors, {
  register: registerProcessor,
});

module.exports = processors;
