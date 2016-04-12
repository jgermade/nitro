'use strict';

module.exports = function (nitro) {

  nitro.addPreset('eslint', function () {

    var path = require('path'),
        colors = nitro.require('colors'),
        file = nitro.file,
        linter = nitro.require("eslint").linter,
        _ = nitro.tools;

    return function (list, options) {

      var options = _.extend({
              rules: {
                  semi: 2
              }
          }, options || {}),
          errorsLog = '';

      list.each(function (f) {

        var errors = linter.verify( f.getSrc() , options, { filename: f.getPath() });

        if( errors.length ) {
          errorsLog += f.getPath().cyan + '\n';

          errors.forEach(function (err) {
            if( err === null ) {
              return;
            }
            errorsLog += '  line ' + (err.line + '').yellow + ', col ' + (err.column + '').cyan + ', ' + err.message.yellow + '\n';
          });
        }

      });

      if( errorsLog ) {
        console.log( '\nESLINT ERRORS\n\n'.red + errorsLog );

        if( options.onError instanceof Function ) {
          options.onError(errors);
        }
      } else {
        console.log( '\nESLINT PASSED\n'.green );
      }

      return list;
    };

  }, true);

};
