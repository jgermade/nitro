'use strict';

module.exports = function (nitro) {

  var uglify = nitro.require('uglify-js'),
      _ = nitro.tools,
      color = require('../color');

  return function (list, options) {
    options = _.extend({ expand: true }, options || {}, { fromString: true });

    list.forEach(function (f) {
      var o = {}, result;
      o[f.path] = f.src;

      // @TODO imeplemt sourceMap
      // o[f.path] = f.src + f.map ? ( '//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +  ) : '';
      // if( f.map ) console.log('map', typeof f.map );

      try{
        console.log('\nuglifing', color.yellow(f.path), f.src.split('\n').length + color.grey(' lines') );
        result = uglify.minify(o);

        if (result.error) throw result.error;
        console.log('[' + Math.round(10000*result.code.length/f.src.length)/100 + '%]', color.magenta(f.src.length) + color.grey(' => ') + color.magenta(result.code.length) + '\n' );

      } catch(err) {
        var code_lines = f.src.split('\n');

        console.log( '\n' + color.red(err.message) );
        console.log( '\nfile: ' + color.grey( f.cwd + ( /\/$/.test(f.cwd) ? '' : '/' ) ) + color.yellow(err.filename) );

        if( err.line ) {
          console.log( color.grey('\n--------------------------------------------------------------------------------') );
          console.log('line: ', color.cyan(err.line) + ' col: ' + color.magenta(err.col) );
          console.log( color.grey('--------------------------------------------------------------------------------\n') );
          console.log( code_lines.slice(err.line - 5, err.line).join('\n') );
        }

        if( err.col ) console.log(' '.repeat(err.col) + color.yellow('^') );
        console.log( color.grey('--------------------------------------------------------------------------------\n') );

        console.log('\n', err );

        throw err;
      }

      if( options.sourceMap ) {
        f.src = result.code.replace(/\n\/\/[^\n]+\.js\.map$/, '');
        f.map = result.map;
      } else {
        f.src = result.code;
      }

    });

    return list;

  };

};
