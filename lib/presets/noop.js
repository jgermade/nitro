'use strict';

module.exports = function (nitro) {

  nitro.addPreset('noop', function () {

    return function (list, options) {
      return list;
    };

  }, true);

};
