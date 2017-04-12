
'use strict';

var _ = require('nitro-tools'),
    color = require('./color'),
    noop = function (value) { return value; },
    Parole = require('parole'),
    promisify = function (result) {
      if( result && result.then instanceof Function ) return result;
      return Parole.resolve(result);
    },
    tasksCache = {},
    registerTask = function () {
      var handlers = [].slice.call(arguments),
          taskName = handlers.shift();

      if( typeof taskName === 'object' ) {

        for( var key in taskName ) registerTask(key, taskName[key]);

      } else if( handlers.length === 1 ) {
        tasksCache[taskName] = handlers[0];
      } else {
        tasksCache[taskName] = handlers;
      }
    };

function tasks () {
  if( arguments.length > 1 ) return registerTask.apply(this, arguments);
  else if( arguments.length === 1 ) return tasks.run.apply(this, arguments);
}

function runTasksSequence (tasks, target) {
  var task = tasks.shift();

  if( !task ) return Parole.resolve();

  return runTask(task, target).then(function () {
    return runTasksSequence(tasks);
  });
}

tasks.register = registerTask;

function runTask (task, target, concurrentArray) {

  if( task instanceof Function ) {
    if( /^function [^(]*\( *[^ ]+ *, *[^ ]+/.test(task.toString()) ) {
      return new Parole(function (resolve, reject) {
        task(target, resolve);
        setTimeout(reject, 300000);
      });
    } else return promisify( task(target) );
  }

  if( typeof task === 'string' ) {
    return (function (taskName, target) {

      if( !tasksCache[taskName] ) {
        console.error( color.yellow('\ntask ') + taskName + (target ? color.cyan(':' + target) : '') + color.red(' not found\n') );
        process.exit(2);
      }

      var startTime = Date.now();

      return runTask(tasksCache[taskName], target).then(function (result) {
        console.log('\n' + color.green('\ntask ') + taskName + (target ? color.cyan(':' + target) : '') + ' ' + color.yellow( ( Date.now() - startTime ) + 'ms' ) + '\n' );
        return result;
      });

    }).apply(null, task.split(/:(.+)/) );
  }

  if( task instanceof Array ) {
    if( concurrentArray ) return Parole.all(task.map(function (task) {
      return runTask(task, target);
    }) );

    return runTasksSequence(task.slice(), target, true);
  }

  if( typeof task === 'object' ) {

    if( !target && !task.default ) {
      console.error('\nno target defined and default task missing\n');
      process.exit(2);
    }

    if( target && !task[target] ) {
      console.error('\ntask ' + color.yellow('target') + ' ' + target + color.red(' not found\n') );
      process.exit(2);
    }

    return runTask( target ? task[target] : task.default, target);
  }

}

tasks.run = function () {
  var tasks = [];

  for( var i = 0, n = arguments.length ; i < n ; i++ ) {
    if( arguments[i] instanceof Array ) [].push.apply(tasks, arguments[i]);
    else tasks.push(arguments[i]);
  }

  return runTasksSequence(tasks);
};

module.exports = tasks;
