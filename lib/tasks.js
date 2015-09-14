
'use strict';

var tasksCache = {},
    _ = require('jengine-utils'),
    timing = require('./timing'),
    noop = function (value) { return value; };

function getHandler (handler) {

  if( handler instanceof Function ) {
    return handler;
  }

  if( typeof handler === 'string' ) {
    return function () {
      tasks.run(handler);
    };
  }

  if( handler instanceof Array ) {
    var handlerList = [];

    handler.forEach(function (h) {
      if( typeof h === 'string' || h instanceof Function ) {
        handlerList.push( getHandler(h) );
      }
    });

    return function () {
      for( var i = 0, n = handlerList.length ; i < n ; i++ ) {
        handlerList[i]();
      }
    };
  }

  if( typeof handler === 'object' ) {
    return function (target) {
      if( !handler[target] ) {
        throw new Error('task has not target ' + target);
      }

      ( getHandler(handler[target]) || noop )();
    };
  }
}

function tasks () {}

tasks.register = function (taskName, handler) {

  var handlers = [].slice.call(arguments),
      taskName = handlers.shift();

  if( typeof taskName === 'object' ) {
    for( var key in taskName ) {
      tasks.register(key, taskName[key]);
    }
  } else {
    handler = getHandler(handlers);

    if( !handler ) {
      throw new Error('task hander should be a function, a string or an array');
    }

    tasksCache[taskName] = handler;
  }

};

tasks.run = function (taskName, argvs, thisArg) {
  if( argvs == undefined ) {
    argvs = taskName.split(':');
    taskName = argvs[0];
    argvs = argvs.slice(1);
  }

  if( !tasksCache[taskName] ) {
    throw new Error('task \'' + taskName + '\' not defined');
  }

  timing.log([taskName].concat(argvs).join(':'), function () {
    tasksCache[taskName].apply(thisArg, argvs);
  });
};

tasks.process = function (argvs) {
  if( _.isArray(argvs) ) {
    argvs.forEach(function (argv) {
      var taskArgvs = argv.split(':');
      tasks.run( taskArgvs.shift(), taskArgvs );
    });
  }
}

// function runTask(taskCmd) {
//   var params = taskCmd.split(':');
//
//   handlers.push(function () {
//     tasks.run(params[0], params.slice(1) );
//   });
// }

module.exports = tasks;
