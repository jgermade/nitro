'use strict';

module.exports = function (nitro) {

  nitro.addPreset('sass', function () {

    var sass = nitro.require('node-sass'),
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

            var o = _.copy(options);
            if( o.sourceMap ) {
              o.outFile = f.path;
            }

            try {
              result = sass.renderSync( _.extend({
                file: f.path,
                data: f.src,
                functions: options.functions,
                importer: options.importer
              }, /\.sass$/.test(f.filename) ? {
                indentedSyntax: true,
                indentType: 'tab'
              } : {}, o) );
            } catch(err) {
              console.log( 'Error compiling', f.path )
              console.error(err);
              if( o.onError instanceof Function ) {
                o.onError(err);
              }
            }

            if( result.css ) {
              f.path = f.path.replace(/\.(scss|sass)/, '.css');
              if( o.sourceMap ) {
                f.map = '' + result.map;
                f.src = ('' + result.css).trim().replace(/\/\*# sourceMappingURL=[^\n\s]+\.s[ac]ss\.map \*\/$/, '');
              } else {
                f.src =  '' + result.css;
              }
            } else {
              console.log('error parsing sass file: ' + f.path );
            }
          });

      return require('./postcss/auto-postcss')(nitro, processedList, options);
    };

  }, true);

};
