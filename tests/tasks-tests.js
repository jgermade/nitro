/* globals describe, it */

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

  it('task list definition', function (done) {
    var pristine2 = true,
        pristine3 = true

    nitro.task('test2', function () {
      pristine2 = false;
    });

    nitro.task('test3', function () {
      pristine3 = false;
    });

    nitro.task(['test2', 'test3']).then(function () {
      assert.strictEqual(pristine2, false)
      assert.strictEqual(pristine3, false)
    })
    .then(done, done)

    
  });

  // @TODO test async tasks
  // it('task nested', function (done) {
  //   var counter = 0, steps = [];
  //
  //   nitro.task('test-dependence', function (target, nextTask) {
  //     counter++;
  //     steps.push(1);
  //
  //     setTimeout(nextTask, 10);
  //   });
  //
  //   nitro.task('test-nested', ['test-dependence'], function () {
  //     counter++;
  //     steps.push(2);
  //   });
  //
  //   nitro.task('test-nested').then(function () {
  //
  //     assert.equal(counter, 2);
  //     assert.equal(steps.join(','), '1,2');
  //     done();
  //   });
  //
  // });

});
