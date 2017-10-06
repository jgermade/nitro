/* globals describe, it */

var assert = require('assert'),
    nitro = require('../lib/nitro'),
    cwd = nitro.cwd;

describe('cwd', function() {

  it('.exists()', function () {

    cwd('tests', function () {
      assert.strictEqual(process.cwd(), __dirname);
    });

  });

  it('returned value', function () {

    assert.equal( cwd('tests', function () {
      return 'gogogo';
    }), 'gogogo' );

  });

});
