'use strict';

module.exports = function (nitro) {

  return function (list, options) {
    list.each(function (f) {
      console.log('file', f);
    });
  };

};
