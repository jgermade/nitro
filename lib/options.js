
module.exports = function (nitro) {

  var _ = require('nitro-tools'),
      options = {};

  function optionsChanged () {
    if( options.locals === true ) {

      var YAML = nitro.require('js-yaml'),
          defaultLocals = nitro.file.exists('defaults.yml') ? YAML.safeLoad( nitro.file.read('defaults.yml') ) : {};

      if( nitro.file.exists('locals.yml') ) {
        nitro.locals = YAML.safeLoad( nitro.file.read('locals.yml') );

        if( locals.version !== defaultLocals.version ) {
          nitro.tools.extend(nitro.locals, defaultLocals);

          nitro.file.write('locals.yml', YAML.safeDump(nitro.locals) );
        }

      } else {
        nitro.locals = defaultLocals;
        nitro.file.write('locals.yml', YAML.safeDump(nitro.locals) );
      }

    } else if( options.locals ) {
      nitro.locals = options.locals;
    }
  }

  return function (_options) {

    if( _options ) {
      _.merge(options, _options);

      return nitro;
    }

    return options;

  };

};
