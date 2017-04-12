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
    var counter = 0, steps = [];

    nitro.task('test-dependence', function () {
      counter++;
      steps.push(1);
    });

    nitro.task('test-nested', ['test-dependence'], function () {
      counter++;
      steps.push(2);
    });

    nitro.task('test-nested').then(function () {

      assert.equal(counter, 2);
      assert.equal(steps.join(','), '1,2');

    });

  });

});
