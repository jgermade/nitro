/* global describe, it */

var assert = require('assert'),
    nitro = require('../lib/nitro'),
    fs = require('fs');

function readFile (filepath) {
  return fs.readFileSync( filepath, { encoding: 'utf8' });
}

describe('dir.load()', function() {

  it('.path', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').map(function (f) {
      return f.path;
    }).join(', '), 'dummy/dummy.coffee, dummy/dummy.js, dummy/dummy.less, dummy/dummy.sass' );
  });

  it('.path (specific order)', function () {
    assert.strictEqual( nitro.dir('tests').load([
      'dummy/*',
      '!dummy/dummy.{js,coffee}',
      'dummy/dummy.js',
      'dummy/*',
    ]).map(function (f) {
      return f.path;
    }).join(', '), 'dummy/dummy.less, dummy/dummy.sass, dummy/dummy.js, dummy/dummy.coffee' );
  });

  it('.src', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').map(function (f) {
      return f.src;
    }).join('\n'), readFile('tests/dummy/dummy.coffee') + '\n' + readFile('tests/dummy/dummy.js') + '\n' + readFile('tests/dummy/dummy.less') + '\n' + readFile('tests/dummy/dummy.sass') );
  });

  it('.filter().path', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').filter('{,**/}*.{js,coffee}').map(function (f) {
      return f.path;
    }).join(', '), 'dummy/dummy.coffee, dummy/dummy.js' );
  });

  it('.filter().src', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').filter('{,**/}*.{js,coffee}').map(function (f) {
      return f.src;
    }).join('\n'), readFile('tests/dummy/dummy.coffee') + '\n' + readFile('tests/dummy/dummy.js') );
  });

  it('.width().path', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').with('{,**/}*.{js,coffee}', function (f) {
      f.path += '_';
    }).map(function (f) {
      return f.path;
    }).join(', '), 'dummy/dummy.coffee_, dummy/dummy.js_, dummy/dummy.less, dummy/dummy.sass' );
  });

});

describe('dir.process()', function() {

  it('.process(\'noop\').path', function () {
    assert.strictEqual( nitro.dir('tests').load('dummy/*').process('noop').map(function (f) {
      return f.path;
    }).join(', '), 'dummy/dummy.coffee, dummy/dummy.js, dummy/dummy.less, dummy/dummy.sass' );
  });

  it('.process(\'each-i\').path', function () {
    nitro.registerProcessor('each-i', function (files, _options) {

      files.each(function (f, i) {
        f.src = '' + i;
      });

    });

    assert.strictEqual( nitro.dir('tests').load('dummy/*').process('each-i').map(function (f) {
      return f.src;
    }).join(', '), '0, 1, 2, 3' );
  });

});
