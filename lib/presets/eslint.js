'use strict';

module.exports = function (nitro) {

  function severityStr(severity) {
    return severity === 2 ? 'error' : 'warning';
  }

  var joinPaths = require('../join-paths'),
      color = require('../color'),
      linter = nitro.require('eslint').linter,
      _ = nitro.tools;

  return function (list, options) {
    options = _.extend({
        rules: {
            semi: 2
        }
    }, options || {});

    var errorsLog = '',
        maxSeverity = 0,
        warnings = 0,
        errors = 0;

    list.each(function (f) {

      var errors = linter.verify( f.src , options, { filename: f.path });

      if( errors.length ) {
        errorsLog += '\n' + color.blueBright( joinPaths.root(f.cwd, f.path) ) + '\n';

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

          errorsLog += '  ' + ((err.line + '') + ',' + (err.column + '')).white + ' ' + color[ err.severity === 2 ? 'red' : 'yellow' ]( severityStr(err.severity) ) + ' ' + err.message + ' ' + err.ruleId + '\n';
        });
      }

    });

    if( maxSeverity ) {
      console.log( '\nESLint: ' + color[ maxSeverity === 2 ? 'red' : 'yellow' ](severityStr(maxSeverity).toUpperCase()) + '\n' + errorsLog );
      console.log( color[ maxSeverity === 2 ? 'red' : 'yellow' ](`✖ ${errors + warnings} problems (${errors} errors, ${warnings} warnings)`) );

      if( options.onError instanceof Function ) {
        options.onError(errors);
      }
    } else {
      console.log( color.green('\nESLint: PASSING\n') );
    }

    return list;
  };

};
