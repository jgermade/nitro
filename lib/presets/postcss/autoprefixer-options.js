'use strict';

module.exports = function (options) {
  return { browsers: (options || {}).browsers || ['last 5 versions', 'ie 9', '> 5%'] };
};
