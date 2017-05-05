'use strict';

module.exports = function (nitro) {

  var cssnano = nitro.require('cssnano');

  return function (list, options) {
    return list.process('postcss', { plugins: [ cssnano() ] });
  };

};
