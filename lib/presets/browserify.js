'use strict';

module.exports = function (nitro) {

  nitro.addPreset('browserify', function () {

    var browserify = nitro.require('browserify');

    return function (list, options) {
      options = options || {};

      var browserifiedSrc, defaultFilename;

      nitro.deasync(function (done) {

        var b = browserify(),
            presetsLoaded = {};

        if( options.plugins ) {
          for( var plugin in options.plugins ) {
            nitro.require(plugin);

            if( plugin === 'babelify' && options.plugins[plugin].presets ) {
              options.plugins[plugin].presets.forEach( (preset) => {
                if( !presetsLoaded[preset] ) {
                  nitro.require('babel-preset-' + preset);
                  presetsLoaded[preset] = true;
                }
              });
            }
            b.transform(plugin, options.plugins[plugin]);
          }
        }

        var paths = list.each(function (file) {
          if( !defaultFilename ) {
            defaultFilename = file.filename;
          }
          b.add( file.getPath(), options );
        });

        b.bundle(function (err, out) {
          if( err ) {
            console.log(err);
            process.exit(2);
          }
          browserifiedSrc = '' + out;
          done();
        });

      })();

      return browserifiedSrc && list.new([ new list.File(browserifiedSrc, { filename: options.filename || defaultFilename || 'bundle.js' }) ]);

    };
  }, true);

};
