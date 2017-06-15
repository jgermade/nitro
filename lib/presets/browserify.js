'use strict';

module.exports = function (nitro) {

  nitro.addPreset('browserify', function () {

    var browserify = nitro.require('browserify'),
        getB = function (options) {
          var b = browserify({ debug: options.sourceMap }),
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

          return b;
        };

    return function (list, options) {
      options = options || {};

      var browserifiedSrc, defaultFilename;

      if( options.bundle ) {
        if( typeof options.bundle === 'string' ) defaultFilename = options.bundle;

        nitro.deasync(function (done) {

          var b = getB(options);

          list.each(function (file) {
            console.log('file', file.path);
            if( !defaultFilename ) {
              defaultFilename = file.path;
            }
            b.add( file.path, options );
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
      } else {

        nitro.deasync(function (done) {

          list.each(function (f) {
            var b = getB(options);
            b.add( f.path, options );

            b.bundle(function (err, out) {
              if( err ) {
                console.log(err);
                process.exit(2);
              }
              f.src = '' + out;
              done();
            });

          });

        })();

        return list;
      }

      var result = { src: browserifiedSrc };
      if( options.sourceMap ) {
        result.src = result.src.trim().replace(/\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,([^\n\s]+)$/, function (matched, data) {
          result.map = new Buffer(data || '', 'base64').toString('utf8');
        });
      }

      return browserifiedSrc && list.new([
        new list.File( options.filename || defaultFilename || 'bundle.js', result.src, result.map )
      ]);

    };
  }, true);

};
