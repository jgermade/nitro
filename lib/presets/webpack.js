'use strict';

module.exports = function (nitro) {

  var webpack = nitro.require('webpack');

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

    var bundle = nitro.deasync(function (f, callback) {
      var _options = options ? _copy(options) : {};

      var _output = _options.output ? _copy(_options.output) : {};
      _output.filename = _output.filename || f.filename;
      if( _output.path && !/^\//.test(_output.path) ) _output.path = nitro.joinPaths.root(_output.path);
      _options.output = _output;
      _options.entry = f.full_path;

      console.log('_options', _options, options);

      webpack(_options, function (err, stats) {
        if( err || stats.hasErrors() ) {
          // Handle errors here
          console.log(err);
          console.log(stats);
          process.exit(2);
        } else {
          callback(null, stats);
        }
        // Done processing
      });
    });

    return list.each(function (f) {
      bundle(f);
    });
  };

};
