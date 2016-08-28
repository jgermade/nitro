'use strict';

module.exports = function (nitro) {

  nitro.addPreset('coffee-script', function () {

    var coffeeScript = nitro.require('coffee-script'),
        _ = nitro.tools;

    return function (list, options) {
      options = options || {};

      list.each(function (f) {

        var result = coffeeScript.compile( f.src, options );

        if( options.sourceMap ) {
          f.src =  result.js;
          f.map =  result.sourceMap;
        } else {
          f.src =  result;
        }

        f.filename = f.filename.replace(/\.coffee$/, '.js');

      });

      return list;

    };

  }, true);

};
