'use strict';

module.exports = function (nitro) {

  var webpack = nitro.require('webpack'),
      _ = nitro.tools;

  return function (list, options) {

    var bundle = nitro.deasync(function (f, callback) {
      var _options = Object.create(options);
      
      var _output = _options.output ? _.copy(_options.output) : {};
      _output.filename = _output.filename || f.filename;
      if( _output.path && !/^\//.test(_output.path) ) _options.output.path = f.full_dir;
      _options.output = _output;

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
      bundle(f.path);
    });
  };

};
