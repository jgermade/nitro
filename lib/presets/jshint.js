'use strict';


module.exports = function (nitro) {

  var color = require('../color');

  var JSHINT = nitro.require('jshint').JSHINT;

  return function (list, options) {
    options = options || {};

    var errorsLog = '';

    list.forEach(function (file) {
      JSHINT( file.src.split(/\n/), options.jshintrc );
      var res = JSHINT.data();

      if( res.errors ) {
        var fileLog = file.path.cyan + '\n';

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
      files: list
    };

    if( errorsLog ) {
      console.log( color.red('\nJSHINT ERRORS') + '\n\n', errorsLog );

      if( options.onError instanceof Function ) {
        options.onError(result);
      }
    } else {
      console.log( '\nJSHINT PASSED\n'.green );
    }

    return list;
  };

};
