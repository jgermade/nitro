'use strict';

module.exports = function (nitro) {

  nitro.addPreset('autoprefixer', function () {

    var cssnano = nitro.require('cssnano');

    return function (list, options) {
      return list.process('postcss', { plugins: [ cssnano() ] });
    };

  }, true);

};
