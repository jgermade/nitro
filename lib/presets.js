
module.exports = function (nitrox) {

  nitrox.addPreset('log', function (src, fileName, filePath) {
    console.log('fileLog', filePath, fileName);
    return src;
  });

  nitrox.addPreset('sass', function () {

    var sass = nitrox.require('node-sass'),
        _ = nitrox.utils,
        escSass = require('minimatch').filter('!{,**/}_*.{scss,sass}');

    return function (list, options) {
      options = options || {};

      return list.filter(function (f) {
        return escSass( f.getPath() );
      }).each(function (f) {
        f.src = sass.renderSync( _.extend({ data: f.src }, options) ).css;
      });
      
    };

  }, true);

  nitrox.addPreset('uglify', function () {

    var uglify = nitrox.require('uglify-js');

    return function (src, options) {
      return uglify.minify(src, { fromString: true }).code;
    };

  });

  nitrox.addPreset('less', function () {

    var less = nitrox.require('less');

    return function (src, options) {
      return nitrox.deasync(function (done) {
        less.render(src, options || {}, function (e, output) {
           done(output.css);
        });
      });
    }
  });

  nitrox.addPreset('jshint', function () {

    var path = require('path'),
        JSHINT = nitrox.require('jshint').JSHINT,
        colors = nitrox.require('colors');

    return function (batchFiles, options) {
      options = options || {};

      var errorsLog = '';

      batchFiles.forEach(function (file) {
        JSHINT( file.src.split(/\n/), options.jshintrc );
        var res = JSHINT.data();

        if( res.errors ) {
          var fileLog = path.join(file.filePath, file.fileName).cyan + '\n';

          res.errors.forEach(function (err) {
            if( err === null ) {
              return;
            }
            fileLog += '  line ' + (err.line + '').yellow + ', col ' + (err.character + '').cyan + ', ' + err.reason.yellow + '\n';
          });

          errorsLog += fileLog;
        }
      });

      var result = {
        valid: !errorsLog,
        files: batchFiles
      };

      if( errorsLog ) {
        console.log( '\nJSHINT ERRORS'.red + '\n', errorsLog );

        if( options.onError instanceof Function ) {
          options.onError(result);
        }
      } else {
        console.log('\nJSHINT PASSED\n'.green);
      }

      return batchFiles;
    };

  }, true);

};
