'use strict';

module.exports = function (nitro) {

  nitro.addPreset('postcss', function () {

    var postcss = nitro.require('postcss');

    return function (list, options) {
      options = options || {};

      var css, cssProcessor = postcss(options.plugins || []);

      list.each(function (file) {
        var processOptions = {};
        if( options.sourceMap ) {
          processOptions.from = file.sourcePath;
          processOptions.map = {
            prev: file.getMap(),
            inline: (options.sourceMap.inline !== undefined) ? options.sourceMap.inline : true
          };
        }

        nitro.deasync(function (done) {

          cssProcessor.process( file.getSrc(), processOptions ).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            file.setSrc(result.css);
            if( options.sourceMap ) {
              file.setMap(result.map);
            }
            done();
          });

        })();

      });
    };

  }, true);

};
