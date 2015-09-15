'use strict';

module.exports = function (nitro) {

  nitro.addPreset('sass', function () {

    var sass = nitro.require('node-sass'),
        _ = nitro.utils,
        escSass = require('minimatch').filter('!{,**/}_*.{scss,sass}');

    return function (list, options) {
      options = options || {};

      return list.filter(function (f) {
        return escSass( f.getPath() );
      }).each(function (f) {
        f.setSrc( sass.renderSync( _.extend({ data: f.getSrc() }, options) ).css );
        f.filename = f.filename.replace(/\.(scss|sass)/, '.css');
      });

    };

  }, true);

};
