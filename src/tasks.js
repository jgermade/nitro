
'use strict';

var tasksCache = {},
    _ = require('jengine-utils'),
    timing = require('./timing');

function tasks () {}

tasks.register = function (taskName, handler) {
  if( !_.isFunction(handler) ) {
    throw new Error('task hander should be a function');
  }
  tasksCache[taskName] = handler;
};

tasks.run = function (taskName, argvs, thisArg) {
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

module.exports = tasks;
