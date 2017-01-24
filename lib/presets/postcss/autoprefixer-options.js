'use strict';

var _ = require('nitro-tools');

module.exports = function (options) {
  return _.extend({
    browsers: ['> 10%', 'last 10 Chrome versions', 'last 5 Safari versions', 'last 5 Firefox versions', 'last 4 iOS versions', 'ie >= 9']
  }, options);
};
