'use strict';

module.exports = function (nitro) {

  nitro.addPreset('coffee-script', function () {

    var coffeeScript = nitro.require('coffee-script'),
        _ = nitro.tools;

    return function (list, options) {
      options = options || {};

      list.each(function (f) {

        var result = coffeeScript.compile( f.getSrc(), options );

        if( options.sourceMap ) {
          f.setSrc( result.js );
          f.setMap( result.sourceMap );
        } else {
          f.setSrc( result );
        }

        f.filename = f.filename.replace(/\.coffee$/, '.js');

      });

      return list;

    };

  }, true);

};
