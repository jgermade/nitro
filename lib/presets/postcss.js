'use strict';

module.exports = function (nitro) {

  var postcss = nitro.require('postcss');

  return function (list, options) {
    options = options || {};

    var cssProcessor = postcss(options.plugins || []);

    list.each(function (f) {
      var processOptions = {};
      if( options.sourceMap ) {
        processOptions.from = f.path;
        processOptions.map = {
          prev: f.map,
          inline: options.sourceMap === 'inline'
        };
      }

      nitro.deasync(function (done) {

        cssProcessor.process( f.src, processOptions ).then(function (result) {
          result.warnings().forEach(function (warn) {
              console.warn(warn.toString());
          });
          f.src = result.css;
          if( options.sourceMap ) {
            f.map = '' + result.map;
          }
          done();
        });

      })();

    });
  };

};
