'use strict';

module.exports = function (nitro) {

  var rollup = nitro.require('rollup')

  return function (list, options) {

    var bundleSync = nitro.deasync(function (f, callback) {
      options = Object.assign({
        commonjs: {
          include: 'node_modules/**',
        },
        resolve: {},
        babel: {
          exclude: 'node_modules/**',
        },
      }, options || {})

      if( options.path && !/^\//.test(options.path) ) options.path = nitro.joinPaths.root(options.path)

      var _plugins = []
      if( options.commonjs ) _plugins.push( nitro.require('rollup-plugin-commonjs')(options.commonjs) )
      if( options.resolve ) _plugins.push( nitro.require('rollup-plugin-node-resolve')(options.resolve) )
      if( options.babel ) _plugins.push( nitro.require('rollup-plugin-babel')(options.babel) )
      if( options.virtual ) _plugins.push( nitro.require('rollup-plugin-virtual')(options.virtual) )

      if( options.plugins ) _plugins.push.apply(_plugins, options.plugins)

      rollup.rollup( Object.assign({
        input: f.full_path,
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
