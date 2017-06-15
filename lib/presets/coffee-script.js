'use strict';

module.exports = function (nitro) {

  var coffeeScript = nitro.require('coffee-script');

  return function (list, options) {
    options = options || {};

    list.each(function (f) {

      var result = coffeeScript.compile( f.src, options );

      if( options.sourceMap ) {
        f.src =  result.js;
        f.map =  result.v3SourceMap;
      } else {
        f.src =  result;
      }

      f.filename = f.filename.replace(/\.coffee$/, '.js');

    });

    return list;

  };

};
