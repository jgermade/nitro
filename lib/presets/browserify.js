'use strict';

module.exports = function (nitro) {

  var browserify = nitro.require('browserify'),
      joinPaths = require('../join-paths'),
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
      },
      parseResult = function (browserifiedSrc, options) {
        if( !browserifiedSrc ) return null;

        var result = { src: browserifiedSrc };
        if( options.sourceMap ) {
          result.src = result.src.trim().replace(/\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,([^\n\s]+)$/, function (matched, data) {
            result.map = new Buffer(data || '', 'base64').toString('utf8');
          });
        }
        return result;
      };

  return function (list, options) {
    options = Object.create(options || {});

    options.basedir = options.basedir || joinPaths.root();

    var resultList;

    if( options.bundle ) {
      nitro.deasync(function (done) {

        var b = getB(options),
            defaultFilename = typeof options.bundle === 'string' ? options.bundle : null;

        list.each(function (file) {
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

          var result = parseResult('' + out, options);
          resultList = result && list.new([
            new list.File( options.filename || defaultFilename || 'bundle.js', result.src, result.map )
          ]);
          done();
        });

      })();

    } else {

      list.new( list.map(function (f) {

        nitro.deasync(function (done) {

          var b = getB(options);
          b.add( f.full_path, options );

          b.bundle(function (err, out) {
            if( err ) {
              console.log(err);
              process.exit(2);
            }
            var result = parseResult('' + out, options);
            f.src = result.src;
            resultList = new list.File( f.path, result.src, result.map );
            done();
          });

        })();

      }) );

    }

    return resultList;

  };

};
