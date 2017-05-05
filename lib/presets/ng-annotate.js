'use strict';

module.exports = function (nitro) {

  var ngAnnotate = nitro.require('ng-annotate');

  return function (list, options) {
    options = options ? Object.create(options) : {};

    if( !options.remove ) options.add = true;
    if( options.single_quotes === undefined ) options.single_quotes = true;

    list.each(function (f) {
      if( options.sourceMap ) {
        options.map = { inline: false, inFile: this.path };
      }

      var res = ngAnnotate(src, options);

      if( res.errors ) {
        console.error('error processing', f.path );
        throw new Error(res.errors);
      }

      f.src = res.src;
      if( options.map ) f.map = res.map;
    });
  };

};
