
'use strict';

var tasksCache = {},
    _ = require('nitro-tools'),
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

function getHandler (handlers) {

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
      if( !target ) {
        if( handlers.default ) {
          return getHandler(handlers.default)();
        } else {
          throw new Error('task target must be specified if default not defined');
        }
      } else if( handlers[target] ) {
        return ( getHandler(handlers[target]) || noop )();
      } else if( handlers.default ) {
        return getHandler(handlers.default)();
      } else {
        throw new Error('task target \'' + target + '\' not found');
      }
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

  timing.log(color.green('task ') + [taskName].concat(argvs).join(':'), function () {
    tasksCache[taskName].apply(thisArg, argvs);
  });
};

module.exports = tasks;
