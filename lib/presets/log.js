'use strict';

module.exports = function (nitro) {

  nitro.addPreset('log', function (src, filename, filePath) {
    console.log('fileLog', filePath, filename);
    return src;
  });

};
