'use strict';

module.exports = function (_nitro) {

  return function (list, _options) {
    list.each(function (f) {
      console.log('file', f);
    });
  };

};
