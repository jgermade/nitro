'use strict';

module.exports = function (nitro) {

  var SVGO = nitro.require('svgo');

  return function (list, options) {

    var svgo = new SVGO(options || {}),
        optimize = nitro.deasync(function (f, callback) {
          svgo.optimize(f.src, { path: f.path }).then(function (result) {
            callback(null, result.data);
          });
        });

    return list.each(function (f) {
       f.src = optimize(f);
    });
  };

};
