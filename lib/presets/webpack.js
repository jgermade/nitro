
module.exports = function (nitro) {

  var webpack = nitro.require('webpack')

  return function (list, options) {

    if( !options || (!options.output && (!options.config || !options.config.output) ) ) {
      throw new Error('output config should be defined')
    }
    
    var _config = Object.assign( options.output ? { output: options.output } : {}, options.config || {})

    if( !_config.module ) _config.module = {}
    if( !_config.module.rules ) _config.module.rules = []
    
    if( !_config.plugins ) _config.plugins = []
    if( options.plugins ) _config.plugins.push.apply(_config.plugins, options.plugins)

    if( options.babel ) {
      _config.module.rules.push({
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: options.babel
        },
      })
    }

    if( options.virtual ) (function (VirtualModulesPlugin) {
      _config.plugins.push( new VirtualModulesPlugin(options.virtual) )
    })(nitro.require("webpack-virtual-modules"))

    if( options.alias ) {
      _config.resolve = _config.resolve || {}
      _config.resolve.alias = Object.assign(Object.assign({}, options.alias), _config.resolve.alias || {})
    }

    var bundle = nitro.deasync(function (f, callback) {
      
      webpack(Object.assign({
        entry: f.full_path,
      }, _config), function (err, stats) {
        if( err || stats.hasErrors() ) {
          // Handle errors here
          console.log(err)
          console.log(stats)
          process.exit(2)
        } else {
          callback(null, stats)
        }
      })

    })

    return list.each(function (f) {
      bundle(f)
    })
  }

}
