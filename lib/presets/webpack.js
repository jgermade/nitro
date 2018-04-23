'use strict';

module.exports = function (nitro) {

  var webpack = nitro.require('webpack'),
      _ = nitro.tools;

  return function (list, options) {

    var bundle = nitro.deasync(function (f, callback) {
      var _options = Object.create(options);
      _options.output = _options.output ? _.copy(_options.output) : {};
      _options.output.filename = _options.output.filename || f.filename;
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
