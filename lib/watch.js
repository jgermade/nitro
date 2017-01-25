'use strict';

var fs = require('fs'),
    fileFilters = [],
    file = require('./file'),
    watchers = {},
    tasks = require('./tasks'),
    server = require('./server'),
    autoRequire = require('./auto-require');

function Watcher (dirPath, options, handler) {

  var subscriptors = [],
      livereload;
  this.subscriptors = subscriptors;

  if( handler instanceof Function ) {
    subscriptors.push(handler);
  }

  if( options instanceof Function ) {
    subscriptors.push(options);
  }

  options = typeof options === 'object' ? options || {} : {};

  var RE_removeBase = new RegExp('^' + dirPath + '\\/');

  require('node-watch')(dirPath, function (filepath) {
  // fs.watch(dirPath, {
  //   persistent: true,
  //   recursive: true,
  //   encoding: 'utf8'
  // }, function (eventName, filepath) {
    filepath = filepath.replace(RE_removeBase, '');
    console.log( '\n' + filepath, 'changed\n'.yellow );

    for( var i = 0, n = subscriptors.length; i < n ; i++ ) {
      subscriptors[i](filepath);
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

function unravelList (list) {
  var unraveledList = [];

  for( var i = 0, len = list.length ; i < len ; i++ ) {
    if( list[i] instanceof Array ) {
      [].push.apply(unraveledList, list[i]);
    } else {
      unraveledList.push(list[i]);
    }
  }

  return unraveledList;
}

Watcher.prototype.when = function (_filter, handler1, handler2, etc) {
  var filter = [].shift.call(arguments),
      args = unravelList( [].slice.call(arguments) ),
      matches = file.filter(filter),
      handlers = getHandlers(args);

  if( filter && handlers.length ) {
    this.subscriptors.push(function (filepath) {
      if( matches(filepath) ) {
        runHandlers(handlers, arguments, this);
      }
    });
  }
  return this;
};

function watch () {

  var handlers = [].slice.call(arguments),
      dirPath = handlers.shift(),
      options = handlers.shift();

  if( typeof options !== 'object' || options === null ) {
    handlers.unshift(options);
    options = {};
  }

  handlers = getHandlers(handlers);

  return new Watcher(dirPath, options, function () {
    return runHandlers(handlers);
  });

  // if( typeof handler === 'function' ) options = options || {};
  // else if( typeof handler === 'object' ) {
  //   if( typeof options )
  // }


  // return new Watcher(dirPath, handler instanceof Function ? handler : (function (handlers) {
  //   return handlers ? function () {
  //     runHandlers(handlers);
  //   } : function () {};
  // })( handler && getHandlers([handler]) ) );
}

module.exports = watch;
