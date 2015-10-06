/* globals describe, it, expect, beforeEach */

var assert = require('assert'),
    nitro = require('../lib/nitro'),
    file = nitro.file;

describe('File', function() {

  it('.exists()', function () {
    assert.ok( file.exists('./package.json') );
  });

  it('.readJSON()', function () {
    assert.equal( file.readJSON('./package.json').name, 'nitro' );
  });

});
