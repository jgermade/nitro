'use strict';

var fs = require('fs'),
    fileFilters = [],
    file = require('./file'),
    watchers = {},
    tasks = require('./tasks');

function Watcher (dirPath, handler) {

  var subscriptors = [];
  this.subscriptors = subscriptors;

  if( handler instanceof Function ) {
    subscriptors.push(handler);
  }

  var RE_removeBase = new RegExp('^' + dirPath + '\\/');

  //  fs.watch(dirPath, { persistent: true, recursive: true }, function (eventName, filePath) {
  require('node-watch')(dirPath, function (filePath) {
    filePath = filePath.replace(RE_removeBase, '');
    console.log( '\n' + filePath, 'changed\n'.yellow );

    for( var i = 0, n = subscriptors.length; i < n ; i++ ) {
      subscriptors[i](filePath);
    }
  });

  this.time = new Date();

  console.log( '\nwatching', dirPath.yellow, '\n' );
}

function getHandlers (args) {
  var handlers = [];

  args.forEach(function (handler) {
    if( typeof handler === 'string' ) {
      var hArgvs = handler.split(':'),
          hTask = hArgvs[0];
      hArgvs = hArgvs.slice(1);

      handlers.push(function () {
        tasks.run(hTask, hArgvs );
      });
    } else if( handler instanceof Array ) {
      handler.forEach(function (h) {
        handlers.concat( getHandlers([h]) );
      });
    } else if( handler instanceof Function ) {
      handlers.push(handler);
    } else {
      console.warn('handler should be an array, a string or a function');
    }
  });

  return handlers;
}

function runHandlers (handlers, args, thisArg) {
  for( var i = 0, n = handlers.length ; i < n ; i++ ) {
    handlers[i].apply(thisArg, args);
  }
}

Watcher.prototype.when = function (filter, handler1, handler2, etc) {
  var args = [].slice.call(arguments),
      filter = args.shift(),
      matches = file.filter(filter),
      handlers = getHandlers(args);

  if( filter && handlers.length ) {
    this.subscriptors.push(function (filePath) {
      if( matches(filePath) ) {
        runHandlers(handlers, arguments, this);
      }
    });
  }
  return this;
};

function watch (dirPath, handler) {
  return new Watcher(dirPath, handler instanceof Function ? handler : function () {
    runHandlers(handler);
  });
}

module.exports = watch;
