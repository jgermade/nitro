
'use strict';

var handlersCache = {},
    _ = require('nitro-tools'),
    Parole = require('parole'),
    color = require('./color'),
    timing = require('./timing'),
    noop = function (value) { return value; };

function tasks () {
  if( arguments.length > 1 ) {
    tasks.register.apply(this, arguments);
  } else if( arguments.length === 1 ) {
    tasks.run.apply(this, arguments);
  }
}

tasks.register = function () {

  var handlers = [].slice.call(arguments),
      taskName = handlers.shift();

  if( typeof taskName === 'object' && !Array.isArray(taskName) ) {
    for( var key in taskName ) {
      tasks.register.apply(null, [key].concat(taskName[key]) );
    }
  } else {
    handlersCache[taskName] = handlers;
  }

};

var resolved = Parole.resolve();

function hasCallback (fn) {
  return /^function \w+\(.+?,.+?[,)]/.test(fn.toString());
}

function handlerHasCallback (fn) {
  return /^function \w+\(.+?,.+?[,)]/.test(fn.toString());
}

function getHandlerByName (handlerName) {
  var args = handlerName.split(':'),
      name = args.shift(),
      deferred = Parole.defer();

  if( !handlerHasCallback(handlersCache[name]) ) deferred.resolve();
  args = args.concat(deferred.promise);

  return function () {
    handlersCache[name].apply(null, args);
    return deferred.promise;
  };
}

function getHandlerPromise (handler) {
  var deferred = Parole.defer();

  if( !hasCallback(handler) ) deferred.resolve();

  return function () {
    handler.apply(null, [deferred.promise]);
    return deferred.promise;
  };
}

function runTask (task, done) {
  var fn, result;

  if( typeof task === 'function' ) fn = getHandlerPromise(task);
  else if( typeof task === 'string' ) fn = getHandlerByName(task);
  else if( task instanceof Array ) {
    fn = function () {
      return $q.all(task.map(function (_task) {
        return new Parole(function (resolve) {
          runTask(_task, resolve);
        });
      }))
    }
  }

  if( !fn ) throw new Error('task handlers should be strings, functions or arrays');

  fn.apply(thisArg, args).then(done);
}

function runTasks (tasks, i) {
  i = i || 0;

  if( !tasks[i] ) return resolved;

  var deferred = Parole.defer();
  if( hasCallback(tasks[i]) ) deferred.resolve();

  var result = runTask( tasks[i], deferred.resolve );

  return ( result && result.then || deferred.promise ).then(function () {
    return runTasks(tasks, i + 1);
  });
}

tasks.run = function () {
  return runTasks([].slice.call(arguments));
}

module.exports = tasks;
