'use strict';

module.exports = function (nitro) {

  nitro.addPreset('less', function () {

    var less = nitro.require('less'),
        _ = nitro.tools,
        escLess = require('minimatch').filter('!{,**/}_*.less'),
        mainLess = function (file) {
          return escLess( file.path );
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
          file.src = compileLess( file.src, _.extend(options, { filename: file.filename }) ).css;
          file.filename = file.filename.replace(/\.less/, '.css');
        };

    if( !options.paths ) {
      options.paths = ['.'];
    } else {
      options.paths.push('.');
    }

    return function (list) {
      return require('./postcss/auto-postcss')(nitro, list.filter(mainLess).each(compileLessFile), options);
    };

  }, true);

};
