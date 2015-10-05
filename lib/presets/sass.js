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
              result = sass.renderSync( _.extend({ data: f.getSrc() }, /\.sass$/.test(f.filename) ? {
                indentedSyntax: true,
                indentType: 'tab'
              } : {}, options) );
            } catch(err) {
              console.error(err);
              process.exit(1);
            }
            f.filename = f.filename.replace(/\.(scss|sass)/, '.css');
            f.setSrc( result.css );
            if( options.sourceMap ) {
              f.setMap(result.map);
            }
          });

      return require('./postcss/auto-postcss')(nitro, processedList, options);
    };

  }, true);

};
