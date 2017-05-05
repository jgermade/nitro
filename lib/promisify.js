
var Parole = require('parole');

function promisify (fn) {
  return function () {
    var _this = this, _args = arguments;
    return new Parole(function (resolve, reject) {
      fn.apply(_this, _args.concat([function (err, result) {
        if( err ) reject(err);
        else resolve(result);
      }]) );
    });
  };
}

module.exports = promisify;
