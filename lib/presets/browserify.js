'use strict';

module.exports = function (nitro) {

  nitro.addPreset('browserify', function () {

    var browserify = nitro.require('browserify');

    return function (list, options) {
      options = options || {};

      var browserifiedSrc, defaultFilename;

      nitro.deasync(function (done) {

        var b = browserify();

        if( options.plugins ) {
          options.plugins.forEach(function (plugin) {
            b.transform(plugin);
          });
        }

        var paths = list.each(function (file) {
          if( !defaultFilename ) {
            defaultFilename = file.filename;
          }
          b.add( file.getPath() );
        });

        b.bundle(function (err, out) {
          browserifiedSrc = '' + out;
          done();
        });

      })();

      return browserifiedSrc && list.new([ new list.File(browserifiedSrc, { filename: options.filename || defaultFilename || 'bundle.js' }) ]);

    };
  }, true);

};
