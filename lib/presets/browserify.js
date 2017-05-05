'use strict';

module.exports = function (nitro) {

  var browserify = nitro.require('browserify');

  return function (list, options) {
    options = options || {};

    var browserifiedSrc, defaultFilename;

    nitro.deasync(function (done) {

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

      var paths = list.each(function (file) {
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

    var result = { src: browserifiedSrc };
    if( options.sourceMap ) {
      result.src = result.src.trim().replace(/\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,([^\n\s]+)$/, function (matched, data) {
        result.map = new Buffer(data || '', 'base64').toString('utf8');
      });
    }

    return (function (list) {

      list.add( new list.File( options.filename || defaultFilename || 'bundle.js', result.src, result.map ) );
      return list;

    })( list.new() );

  };

};
