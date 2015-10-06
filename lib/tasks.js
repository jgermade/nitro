
'use strict';

var tasksCache = {},
    _ = require('nitro-tools'),
    timing = require('./timing'),
    noop = function (value) { return value; };

function tasks () {
  if( arguments.length > 1 ) {
    tasks.register.apply(this, arguments);
  } else if( arguments.length === 1 ) {
    tasks.run.apply(this, arguments);
  }
}

function getHandler (handlers) {

  // console.log( '\n', handlers, handlers instanceof Function, typeof handlers === 'string', handlers instanceof Array , typeof handlers === 'object', '\n' );

  if( handlers instanceof Function ) {
    return handlers;
  }

  if( typeof handlers === 'string' ) {
    return function () {
      tasks.run(handlers);
    };
  }

  if( handlers instanceof Array ) {
    var handlerList = [];

    handlers.forEach(function (h) {
      handlerList.push( getHandler(h) );
    });

    return function () {
      for( var i = 0, n = handlerList.length ; i < n ; i++ ) {
        handlerList[i].apply(this, arguments);
      }
    };
  }

  if( typeof handlers === 'object' ) {

    return function (target) {
      if( target === undefined && handlers.default ) {
        return handlers.default();
      }
      if( !handlers[target] ) {
        throw new Error('task has not target ' + target);
      }

      return ( getHandler(handlers[target]) || noop )();
    };
  }

}

tasks.register = function () {

  var handlers = [].slice.call(arguments),
      taskName = handlers.shift();

  if( typeof taskName === 'object' ) {
    for( var key in taskName ) {
      tasks.register(key, taskName[key]);
    }
  } else {
    var handler = getHandler(handlers);

    if( !handler ) {
      throw new Error('task hander should be a function, a string or an array');
    }

    tasksCache[taskName] = handler;
  }

};

tasks.run = function (taskName, argvs, thisArg) {
  if( _.isArray(taskName) ) {
    taskName.forEach(function (argv) {
      tasks.run( argv );
    });
    return;
  }

  if( argvs === undefined ) {
    argvs = taskName.split(':');
    taskName = argvs.shift();
  }

  if( !tasksCache[taskName] ) {
    throw new Error('task \'' + taskName + '\' not defined');
  }

  timing.log([taskName].concat(argvs).join(':'), function () {
    tasksCache[taskName].apply(thisArg, argvs);
  });
};

module.exports = tasks;
