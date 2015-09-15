'use strict';

module.exports = function (nitro) {

  nitro.addPreset('uglify', function () {

    var uglify = nitro.require('uglify-js');

    return function (src, options) {
      return uglify.minify(src, { fromString: true }).code;
    };

  });

};

module.exports = function (nitro) {

  nitro.addPreset('uglify', function () {

    var uglify = nitro.require('uglify-js'),
        _ = nitro.utils;

    return function (list, options) {

      if( !options ) {
        throw new Error('options are required for uglify preset');
      }

      if( options.expand ) {

        options = _.extend({}, options, { fromString: true });

        list.forEach(function (f) {
          return f.setSrc( uglify.minify( f.getSrc(), options).code );
        });

      } else if( options.filepath ) {

        var result = uglify.minify( list.map(function (f) {
              return f.getPath();
            })),
            resultList = list.new();

        resultList.push( new resultList.File(options.filepath).setSrc(result.code).setMap(result.map) );

        return resultList;

      } else {
        throw new Error('options \'expand\' or \'filepath\' are required for uglify preset');
      }

    };

  }, true);

};