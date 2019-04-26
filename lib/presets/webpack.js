
module.exports = function (nitro) {

  var webpack = nitro.require('webpack')

  function _copyObject(src) {
    var result = {}
    for( var key in src ) result[key] = _copy(src[key])
    return result
  }

  function _copy (src) {
    if( src instanceof Array ) return src.slice()
    if( typeof src === 'object' && src !== null ) return _copyObject(src)
    return src
  }

  return function (list, options) {

    if( !options || (!options.output && (!options.config || !options.config.output) ) ) {
      throw new Error('output config should be defined')
    }
    
    var _config = Object.assign(
      options.output
        ? { output: options.output, rules: [] }
        : { rules: [] }
    , options.config || {})

    if( options.babel ) {
      _config.rules.push({
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: options.babel
        },
      })
    }

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
