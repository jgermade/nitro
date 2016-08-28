'use strict';

module.exports = function (nitro) {

  nitro.addPreset('cssnano', function () {

    var cssnano = nitro.require('cssnano');

    return function (list, options) {
      return list.process('postcss', { plugins: [ cssnano() ] });
    };

  }, true);

};
