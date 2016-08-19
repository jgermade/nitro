'use strict';

module.exports = function (nitro) {

  nitro.addPreset('svgo', function (src, filename, filePath) {

    var SVGO = nitro.require('svgo');

    return function (list, options) {

      var svgo = new SVGO(options || {}),
          optimize = nitro.deasync(function (svg, callback) {
            svgo.optimize(svg, function (result) {
              callback(null, result.data);
            });
          });

    	return list.each(function (f) {
    	   f.setSrc( optimize(f.getSrc()) );
    	});
      
    };

  }, true);

};
