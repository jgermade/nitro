/* globals describe, it */

var assert = require('assert'),
    nitro = require('../lib/nitro'),
    cwd = nitro.cwd;

describe('cwd', function() {

  it('.exists()', function () {

    cwd('tests', function () {
      assert.ok( nitro.file.exists('./cwd-tests.js') );
    });

  });

  it('returned value', function () {

    assert.equal( cwd('tests', function () {
      return 'gogogo';
    }), 'gogogo' );

  });

});
