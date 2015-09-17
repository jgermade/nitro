var assert = require('assert'),
    nitro = require('../lib/nitro');

describe('File', function() {

  it('.exists()', function () {
    assert.ok( nitro.file.exists('./package.json') );
  });

  it('.readJSON()', function () {
    assert.equal( nitro.file.readJSON('./package.json').name, 'nitro' );
  });

});
