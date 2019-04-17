'use strict';

module.exports = function (nitro) {

  var rollup = nitro.require('rollup')

  function _copyObject(src) {
    var result = {};
    for( var key in src ) result[key] = _copy(src[key]);
    return result;
  }

  function _copy (src) {
    if( src instanceof Array ) return src.slice();
    if( typeof src === 'object' && src !== null ) return _copyObject(src);
    return src;
  }


  return function (list, options) {

    var bundleSync = nitro.deasync(function (f, callback) {
      var options = Object.assign(options, {
        commonjs: {
          include: 'node_modules/**',
        },
        resolve: {
          module: true, // Default: true
          browser: true,  // Default: false
        },
        babel: {
          exclude: 'node_modules/**',
        },
      })

      var _options = options ? _copy(options) : {}

      var _output = _options.output ? _copy(_options.output) : {}
      _output.filename = _output.filename || f.filename

      if( _output.path && !/^\//.test(_output.path) ) _output.path = nitro.joinPaths.root(_output.path)

      _options.output = _output
      _options.input = f.full_path

      var _plugins = []
      if( options.commonjs ) _plugins.push( nitro.require('rollup-plugin-commonjs')(options.commonjs) )
      if( options.resolve ) _plugins.push( nitro.require('rollup-plugin-node-resolve')(options.resolve) )
      if( options.babel ) _plugins.push( nitro.require('rollup-plugin-babel')(options.babel) )
      if( options.virtual ) _plugins.push( nitro.require('rollup-plugin-virtual')(options.virtual) )

      if( options.plugins ) _plugins.push.apply(_plugins, options.plugins)

      rollup.rollup( Object.assign({
        input: path.join(process.cwd(), filepath),
        context: 'window',
        plugins: _plugins,
      }, options.input || {}) ).then(function (bundle) {
        bundle.generate( Object.assign({
          format: 'iife',
          name: options.output_name,
          // name: 'aplazame',
          strict: false,
        }, options.output || {}) ).then(function (result) {
          callback(null, result.output[0].code)
        }, function (reason) {
          callback(reason)
        })

      }, function (reason) {
        callback(reason);
      })

    })

    return list.each(function (f) {
      f.src = bundleSync(f)
    })
  }

}
