'use strict';

module.exports = function (nitro) {

  nitro.addPreset('ng-annotate', function () {

    var ngAnnotate = nitro.require('ng-annotate');

    return function (src, options) {
      options = options || {};

      if( !options.remove ) {
        options.add = true;
      }

      var res = ngAnnotate(src, options);

      if( res.errors ) {
        throw new Error(res.errors);
      }

      this.setSrc(res.src);

      if( options.map ) {
        this.setMap(res.map);
      }
    };

  });

};
