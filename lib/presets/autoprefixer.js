'use strict';

module.exports = function (nitro) {

  nitro.addPreset('autoprefixer', function () {

    // var autoprefixer = nitro.require('autoprefixer'),
    //     postcss      = nitro.require('postcss'),
    var autoprefixer = nitro.require('postcss')([ nitro.require('autoprefixer') ]);

    return function (src, options) {
      return nitro.deasync(function (done) {
        autoprefixer.process(src).then(function (result) {
            done(result.css);
        });
      });
    }

  });

};
