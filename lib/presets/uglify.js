'use strict';

module.exports = function (nitro) {

  var uglify = nitro.require('uglify-js'),
      _ = nitro.tools,
      color = require('../color'),
      getRatioLog = function (ratio) {
        var ratio_color = 'cyan', compression = 1 - ratio;
        if( compression < 0.2 ) ratio_color = 'yellow';
        else if( compression > 0.7 ) ratio_color = 'green';
        return color[ratio_color]('[' + Math.round(10000*compression)/100 + '%]');
      },
      sizeK = function (o) {
        if( !o || !o.length ) return o;
        return Math.round(o.length/1000) + 'k';
      };

  return function (list, options) {
    options = _.extend({ expand: true }, options || {}, { fromString: true });

    list.forEach(function (f) {
      var o = {}, result;
      o[f.path] = f.src;

      // @TODO imeplemt sourceMap
      // o[f.path] = f.src + f.map ? ( '//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +  ) : '';
      // if( f.map ) console.log('map', typeof f.map );

      try{
        console.log('\nuglifing', color.yellow(f.path), f.src.split('\n').length + color.white(' lines') );
        result = uglify.minify(o);

        if (result.error) throw result.error;
        console.log( '\n' + getRatioLog(result.code.length/f.src.length), color.magenta( sizeK(f.src) ) + color.white(' => ') + color.cyan( sizeK(result.code) ) + '\n' );

      } catch(err) {
        var code_lines = f.src.split('\n');

        console.log( '\n' + color.red(err.message) );
        console.log( '\nfile: ' + color.white( f.cwd + ( /\/$/.test(f.cwd) ? '' : '/' ) ) + color.yellow(err.filename) );

        if( err.line ) {
          console.log( color.white('\n--------------------------------------------------------------------------------') );
          console.log('line: ', color.cyan(err.line) + ' col: ' + color.magenta(err.col) );
          console.log( color.white('--------------------------------------------------------------------------------\n') );
          console.log( code_lines.slice(err.line - 5, err.line).join('\n') );
        }

        // https://www.w3schools.com/charsets/ref_utf_symbols.asp
        if( err.col ) console.log(' '.repeat(err.col) + color.yellow('🖢') );
        console.log( color.white('--------------------------------------------------------------------------------\n') );

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
