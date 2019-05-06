'use strict';

module.exports = function (nitro) {

  var sass = nitro.require('node-sass'),
      joinPaths = require('../join-paths'),
      _ = nitro.tools,
      isSass = require('minimatch').filter('{,**/}*.{scss,sass}'),
      escSass = require('minimatch').filter('!{,**/}_*.{scss,sass}');

  return function (list, options) {
    options = Object.create(options || {});

    if( options.includePaths ) {
      options.includePaths = options.includePaths.map(function (_path) {
        return joinPaths.root(_path);
      });
    }

    var processedList = list.filter(function (f) {
          return isSass( f.path ) && escSass( f.path );
        }).each(function (f) {
          var result;

          var o = _.copy(options);
          if( o.sourceMap ) {
            o.outFile = f.path;
          }

          try {
            result = sass.renderSync( _.extend({
              file: f.full_path,
              data: f.src,
              functions: options.functions,
              importer: options.importer
            }, /\.sass$/.test(f.filename) ? {
              indentedSyntax: true,
              indentType: 'tab'
            } : {}, o) );
          } catch(err) {
            console.log( 'Error compiling', f.path );
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

};
