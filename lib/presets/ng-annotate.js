'use strict';

module.exports = function (nitro) {

  nitro.addPreset('ng-annotate', function () {

    var ngAnnotate = nitro.require('ng-annotate');

    return function (src, options) {
      options = options || {};

      if( !options.remove ) {
        options.add = true;
      }

      if( options.single_quotes === undefined ) {
        options.single_quotes = true;
      }

      if( options.sourceMap ) {
        options.map = { inline: false, inFile: this.path };
      }

      var res = ngAnnotate(src, options);

      if( res.errors ) {
        console.error('error processing', this.path );
        throw new Error(res.errors);
      }

      this.src = res.src;

      if( options.map ) {
        this.map = res.map;
      }
    };

  });

};
