'use strict';

module.exports = function (options) {
  return { browsers: (options || {}).browsers || ['> 10%', 'last 4 Chrome versions', 'last 3 Safari versions', 'last 5 Firefox versions', 'last 3 iOS versions', 'ie >= 9'] };
};
