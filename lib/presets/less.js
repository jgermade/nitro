'use strict';

module.exports = function (nitro) {

  nitro.addPreset('less', function () {

    var less = nitro.require('less');

    return function (src, options) {
      return nitro.deasync(function (done) {
        less.render(src, options || {}, function (e, output) {
           done(output.css);
        });
      });
    }
  });

};
