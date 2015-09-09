
module.exports = function (nitro) {

  nitro.addPreset('log', function (src, fileName, filePath) {
    console.log('fileLog', src, fileName, filePath);
    return src;
  });

  nitro.addPreset('sass', function (src, options) {
    return require('node-sass').renderSync({ data: src }).css;
  }, false, ['node-sass']);

  nitro.addPreset('uglify', function (src, options) {
    return require('uglify-js').minify(src, { fromString: true }).code;
  }, false, ['uglify-js']);

  nitro.addPreset('less', function (src, options) {
    return deasync(function (done) {
      require('less').render(src, options || {}, function (e, output) {
         done(output.css);
      });
    });
  }, false, ['less']);

  nitro.addPreset('jshint', function (batchFiles, options) {
    options = options || {};

    var errorsLog = '',
        path = require('path'),
        JSHINT = require('jshint').JSHINT,
        colors = require('colors');

    batchFiles.forEach(function (file) {
      JSHINT( file.src.split(/\n/), jshintrc );
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
    } else {
      console.log('\nJSHINT PASSED\n'.green);
    }

    return result;

  }, true, ['jshint', 'colors']);

};
