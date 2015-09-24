'use strict';

module.exports = function (nitro, list, options) {

  var plugins = [];

  if( options.autoprefix ) {
    plugins.push( nitro.require('autoprefixer')( require('./autoprefixer-options')( options.autoprefix === true ? {} : options.autoprefix ) ) );
  }

  if( options.minify ) {
    plugins.push( nitro.require('cssnano')( require('./autoprefixer-options')( options.minify === true ? {} : options.minify ) ) );
  }

  if( plugins.length ) {
    return list.process('postcss', { plugins: plugins, sourceMap: options.sourceMap });
  }

  return list;

};
