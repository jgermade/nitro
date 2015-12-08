'use strict';

module.exports = function (nitro) {

  nitro.addPreset('jshint', function () {

    var path = require('path'),
        JSHINT = nitro.require('jshint').JSHINT,
        colors = nitro.require('colors');

    return function (batchFiles, options) {
      options = options || {};

      var errorsLog = '';

      batchFiles.forEach(function (file) {
        JSHINT( file.getSrc().split(/\n/), options.jshintrc );
        var res = JSHINT.data();

        if( res.errors ) {
          var fileLog = path.join(file.getPath(), file.filename).cyan + '\n';

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
