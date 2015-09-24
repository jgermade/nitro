'use strict';

module.exports = function (nitro) {

  nitro.addPreset('autoprefixer', function () {

    var autoprefixer = nitro.require('autoprefixer');

    return function (list, options) {
      return list.process('postcss', { plugins: [ autoprefixer( require('./postcss/autoprefixer-options')(options) ) ] });
    };

  }, true);

};
