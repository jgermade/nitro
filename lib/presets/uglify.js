'use strict';

module.exports = function (nitro) {

  nitro.addPreset('uglify', function () {

    var uglify = nitro.require('uglify-js'),
        _ = nitro.tools;

    return function (list, options) {
      options = _.extend({ expand: true }, options || {}, { fromString: true });

      list.forEach(function (f) {
        var o = _.copy(options);
        if( f.map ) {
          _.extend(o, { inSourceMap: JSON.parse(f.map) });
        }
        if( options.sourceMap ) {
          _.extend(o, { outSourceMap: f.path + '.map' });
        }
        var result = uglify.minify( f.src, o);

        if( options.sourceMap ) {
          f.src = result.code.replace(/\n\/\/[^\n]+\.js\.map$/, '');
          f.map = result.map;
        } else {
          f.src = result.code;
        }
      });

    };

  }, true);

};
