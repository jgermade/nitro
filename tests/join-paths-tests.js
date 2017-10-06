/* globals describe, it */

var assert = require('assert'),
    joinPaths = require('../lib/join-paths');

describe('joinPaths', function() {

  it('__dirname', function () {
    assert.strictEqual( joinPaths.root() + '/tests', __dirname );
  });

  var test_paths = [
    {
      result: 'foo/bar/foobar/subdir',
      paths: ['foo/bar', 'foobar/subdir'],
    },
    {
      result: 'foo/foobar/subdir',
      paths: ['foo/bar', '../foobar/subdir'],
    },
    {
      result: 'foobar/subdir',
      paths: ['foo/bar', '../../foobar/subdir'],
    },
    {
      result: 'foobar/subdir',
      paths: ['foo/bar/', '../../foobar/subdir'],
    },
    {
      result: 'foobar/subdir/',
      paths: ['foo/bar/', '../../foobar/subdir/'],
    },
    {
      result: '/foobar/subdir/',
      paths: ['/foo/bar/', '../../foobar/subdir/'],
    },
    {
      result: 'foobar/subdir/',
      paths: ['/foo/bar/', '../../../../../foobar/subdir/'],
    },
    {
      result: '/foobar/subdir/file.ext',
      paths: ['/foo/bar/', '/foobar/subdir/file.ext'],
    },
    {
      result: '/foo/bar/foobar/subdir/file.ext',
      paths: ['/foo/bar', 'foobar/subdir/file.ext'],
    },
    {
      result: 'foo/bar/foobar/subdir/file.ext',
      paths: ['foo/bar', 'foobar/subdir/file.ext'],
    },
    {
      result: 'foo/bar/foobar/subdir/file.ext',
      paths: ['foo/bar', './foobar/subdir/file.ext'],
    },
    {
      result: 'foo/bar/foobar/subdir/file.ext',
      paths: ['foo/bar/', './foobar/subdir/file.ext'],
    },
  ];

  test_paths.forEach(function (test) {
    it( test.paths.join(' + ') + ' = ' + test.result , function () {
      assert.strictEqual( joinPaths.apply(null, test.paths), test.result, 'arguments');
      assert.strictEqual( joinPaths(test.paths), test.result, 'Array');
    });
  });

});
