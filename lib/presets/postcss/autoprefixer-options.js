'use strict';

var _ = require('nitro-tools');

module.exports = function (options) {
  return _.extend({
    browsers: ['> 10%', 'last 10 Chrome versions', 'last 10 Safari versions', 'last 10 Firefox versions', 'last 10 iOS versions', 'ie >= 9']
  }, options);
};
