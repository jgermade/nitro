'use strict';

module.exports = function (nitro) {

  nitro.addPreset('sass', function () {

    var sass = nitro.require('node-sass'),
        _ = nitro.tools,
        escSass = require('minimatch').filter('!{,**/}_*.{scss,sass}');

    return function (list, options) {
      options = options || {};

      var processedList = list.filter(function (f) {
            return escSass( f.getPath() );
          }).each(function (f) {
            var result;
            try {
              result = sass.renderSync( _.extend({
                file: f.getPath(),
                data: f.getSrc()
              }, /\.sass$/.test(f.filename) ? {
                indentedSyntax: true,
                indentType: 'tab'
              } : {}, options) );
            } catch(err) {
              console.error(err);
              if( options.onError instanceof Function ) {
                options.onError(err);
              }
            }

            if( result.css ) {
              f.setPath( f.getPath().replace(/\.(scss|sass)/, '.css') );
              f.setSrc( result.css );
              if( options.sourceMap ) {
                f.setMap(result.map);
              }
            } else {
              console.log('error parsing sass file: ' + f.getPath() );
            }
          });

      return require('./postcss/auto-postcss')(nitro, processedList, options);
    };

  }, true);

};
