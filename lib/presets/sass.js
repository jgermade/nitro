'use strict';

module.exports = function (nitro) {

  nitro.addPreset('sass', function () {

    // var sass = nitro.require('node-sass'),
    var sass = nitro.require('node-sass@3.7.0'),
        path = require('path'),
        _ = nitro.tools,
        escSass = require('minimatch').filter('!{,**/}_*.{scss,sass}');

    return function (list, options) {
      options = options || {};

      if( options.includePaths ) {
        options.includePaths = options.includePaths.map(function (_path) {
          return /^\.?\.?\//.test(_path) ? _path : path.join(nitro.cwdRoot, _path);
        });
      }

      var processedList = list.filter(function (f) {
            return escSass( f.path );
          }).each(function (f) {
            var result;
            try {
              result = sass.renderSync( _.extend({
                file: f.path,
                data: f.src
              }, /\.sass$/.test(f.filename) ? {
                indentedSyntax: true,
                indentType: 'tab'
              } : {}, options) );
            } catch(err) {
              console.log( 'Error compiling', f.path )
              console.error(err);
              if( options.onError instanceof Function ) {
                options.onError(err);
              }
            }

            if( result.css ) {
              f.path = f.path.replace(/\.(scss|sass)/, '.css');
              f.src =  result.css ;
              if( options.sourceMap ) {
                f.map = result.map;
              }
            } else {
              console.log('error parsing sass file: ' + f.path );
            }
          });

      return require('./postcss/auto-postcss')(nitro, processedList, options);
    };

  }, true);

};
