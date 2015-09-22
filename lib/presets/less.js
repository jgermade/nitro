'use strict';

module.exports = function (nitro) {

  nitro.addPreset('less', function () {

    var less = nitro.require('less'),
        _ = nitro.utils,
        escLess = require('minimatch').filter('!{,**/}_*.less'),
        mainLess = function (file) {
          return escLess( file.getPath() );
        },
        options = _.extend({}, options || {}),
        compileLess = function (src, options) {
          var result;

          nitro.deasync(function (done) {
            less.render(src, options, function (error, output) {
              result = output;
              done();
            });
          });

          return result;
        },
        compileLessFile = function (file) {
          file.setSrc( compileLess( file.getSrc(), _.extend(options, { filename: file.filename }) ).css );
          file.filename = file.filename.replace(/\.less/, '.css');
        };

    if( !options.paths ) {
      options.paths = ['.'];
    } else {
      options.paths.push('.');
    }

    return function (list) {
      return list.filter(mainLess).each(compileLessFile);
    };

  }, true);

};
