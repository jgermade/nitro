'use strict';

module.exports = function (nitro) {

  nitro.addPreset('uglify', function () {

    var uglify = nitro.require('uglify-js');

    return function (src, options) {
      return uglify.minify(src, { fromString: true }).code;
    };

  });

};
