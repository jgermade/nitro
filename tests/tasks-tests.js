/* globals describe, it, expect, beforeEach */

var assert = require('assert'),
    nitro = require('../lib/nitro');

describe('Tasks', function() {

  it('task definition', function () {
    var pristine = true;
    nitro.task('test', function () {
      pristine = false;
    });

    nitro.task('test');

    assert(!pristine);
  });

  it('task nested', function () {
    var counter = 0;

    nitro.task('test-dependence', function () {
      counter++;
    });

    nitro.task('test-nested', ['test-dependence'], function () {
      counter++;
    });

    nitro.task('test-nested');

    assert.equal(counter, 2);
  });

});
