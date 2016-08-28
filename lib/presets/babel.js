'use strict';

module.exports = function (nitro) {

  nitro.addPreset('babel', function () {

    var babel = nitro.require('babel-core'),
        // presetsLoaded = { 'es2015': true };
        presetsLoaded = {};

    // nitro.require('babel-preset-es2015');

    return function (list, options) {
      options = options || {};

      if( options.presets ) {
        options.presets.forEach(function (preset) {
          if( !presetsLoaded[preset] ) {
            nitro.require('babel-preset-' + preset);
            presetsLoaded[preset] = true;
          }
        });
      }

      list.each(function (f) {
        var result = babel.transform( f.src , options);
        f.src =  result.code ;
        f.map =  result.map ;
      });

      return list;

    };

  }, true);

};
