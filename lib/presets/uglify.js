'use strict';

module.exports = function (nitro) {

  nitro.addPreset('uglify', function () {

    var uglify = nitro.require('uglify-js'),
        _ = nitro.tools;

    return function (list, options) {

      options = options || {};

      if( options.filepath ) {

        var result = uglify.minify( list.map(function (f) {
              return f.getPath();
            })),
            resultList = list.new();

        resultList.push( new resultList.File(options.filepath).setSrc(result.code).setMap(result.map) );

        return resultList;

      } else {

        options = _.extend({ expand: true }, options, { fromString: true });

        list.forEach(function (f) {
          return f.setSrc( uglify.minify( f.getSrc(), options).code );
        });
      }

    };

  }, true);

};
