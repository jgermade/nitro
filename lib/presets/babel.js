'use strict';

module.exports = function (nitro) {

  nitro.addPreset('babel', function () {

    var babel = nitro.require('babel-core');

    return function (list, options) {
      options = options || {};

      list.each(function (f) {

        var result = babel.transform( f.getSrc() , options);

        if( options.sourceMap ) {
          f.setSrc( result.js );
          f.setMap( result.sourceMap );
        } else {
          f.setSrc( result );
        }

      });

      return list;

    };

  }, true);

};
