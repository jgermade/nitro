'use strict';

module.exports = function (nitro) {

  nitro.addPreset('autoprefixer', function () {

    var autoprefixer = nitro.require('autoprefixer'),
        postcss      = nitro.require('postcss');

    return function (list, options) {
      options = options || {};

      var css, cssProcessor = postcss([ autoprefixer({ browsers: options.browsers || ['last 2 versions'] }) ]);

      list.each(function (file) {

        nitro.deasync(function (done) {

          cssProcessor.process( file.getSrc() ).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            file.setSrc(result.css);
            done();
          });

        })();

      });
    };

  }, true);

};
