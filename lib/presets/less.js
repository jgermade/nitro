'use strict';

module.exports = function (nitro) {

  var less = nitro.require('less'),
      _ = nitro.tools,
      isLess = require('minimatch').filter('{,**/}*.less'),
      escLess = require('minimatch').filter('!{,**/}_*.less'),
      mainLess = function (file) {
        return isLess( file.path ) && escLess( file.path );
      },
      // options = _.extend({}, options || {}),
      compileLess = nitro.deasync(function (src, options, done) {
        less.render(src, options, function (err, output) {
          if( err ) {
            console.error(err);
            process.exit(2);
          }
          done(null, output);
        });
      }),
      compileLessFile = function (options) {
        return function (f) {
          var result = compileLess( f.src, _.extend(options, { filename: f.path }) );
          f.src = result.css;
          if( options.sourceMap ) {
            f.map = result.map;
          }
          f.path = f.path.replace(/\.less/, '.css');
        }
      };

  return function (list, options) {
    options = _.extend({}, options || {});

    if( !options.paths ) {
      options.paths = ['.'];
    } else {
      options.paths.push('.');
    }

    return require('./postcss/auto-postcss')(nitro, list.filter(mainLess).each(compileLessFile(options)), options);
  };

};
