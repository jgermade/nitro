'use strict';

// https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script
function brightBlue (text) {
  return '\x1b[1m' + '\x1b[34m' + text + '\x1b[0m';
}

function severityStr(severity) {
  return severity === 2 ? 'error' : 'warning';
}

module.exports = function (nitro) {

  nitro.addPreset('eslint', function () {

    var path = require('path'),
        colors = nitro.require('colors'),
        file = nitro.file,
        linter = nitro.require("eslint").linter,
        _ = nitro.tools,
        cwd = process.cwd();

    return function (list, options) {

      var options = _.extend({
              rules: {
                  semi: 2
              }
          }, options || {}),
          errorsLog = '',
          maxSeverity = 0,
          warnings = 0,
          errors = 0;

      list.each(function (f) {

        var errors = linter.verify( f.src , options, { filename: f.path });

        if( errors.length ) {
          errorsLog += '\n' + brightBlue(path.join(cwd, f.cwd, f.path)) + '\n';

          errors.forEach(function (err) {
            if( err === null ) {
              return;
            }
            if( err.fatal ) {
              throw err;
            }
            if( err.severity > maxSeverity ) {
              maxSeverity = err.severity;
            }

            warnings += err.severity === 1 ? 1 : 0;
            errors += err.severity === 2 ? 1 : 0;

            errorsLog += '  ' + ((err.line + '') + ',' + (err.column + '')).white + ' ' + severityStr(err.severity)[ err.severity === 2 ? 'red' : 'yellow' ] + ' ' + err.message + ' ' + err.ruleId + '\n';
          });
        }

      });

      if( maxSeverity ) {
        console.log( '\nESLint: ' + severityStr(maxSeverity).toUpperCase()[ maxSeverity === 2 ? 'red' : 'yellow' ] + '\n' + errorsLog );
        console.log( (`✖ ${errors + warnings} problems (${errors} errors, ${warnings} warnings)`)[ maxSeverity === 2 ? 'red' : 'yellow' ] )

        if( options.onError instanceof Function ) {
          options.onError(errors);
        }
      } else {
        console.log( '\nESLint: PASSING\n'.green );
      }

      return list;
    };

  }, true);

};
