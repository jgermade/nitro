'use strict';

module.exports = function (nitro) {

  nitro.addPreset('log', function (src, filename, filepath) {
    console.log('fileLog', filepath, filename);
    return src;
  });

};
