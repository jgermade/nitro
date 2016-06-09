'use strict';

module.exports = function (nitro) {

  nitro.addPreset('babel', function () {

    var babel = nitro.require('babel-core');

    return function (list, options) {
      options = options || {};

      list.each(function (f) {
        var result = babel.transform( f.getSrc() , options);
        f.setSrc( result.code );
        f.setMap( result.map );
      });

      return list;

    };

  }, true);

};
