'use strict';

module.exports = function (nitro) {

  nitro.addPreset('log', function (src, fileName, filePath) {
    console.log('fileLog', filePath, fileName);
    return src;
  });

};
