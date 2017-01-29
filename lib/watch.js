'use strict';

var fs = require('fs'),
    path = require('path'),
    fileFilters = [],
    file = require('./file'),
    color = require('./color'),
    watchers = {},
    tasks = require('./tasks'),
    server = require('./server'),
    autoRequire = require('./auto-require'),
    chokidar = require('chokidar');

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


  (dirPath instanceof Array ? dirPath : [dirPath]).forEach(function (dirpath, i) {

    var RE_removeBase = new RegExp('^' + path.join(process.cwd(), dirpath) + '\\/');
    // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
    // nodeWatch(dirpath, function (filepath, eventType) {
    chokidar.watch( path.join(process.cwd(), dirpath), {
      ignoreInitial: true
    }).on('all', function (event, filepath) {

      filepath = ( i ? ( dirpath + '/' ) : '' ) + filepath.replace(RE_removeBase, '');
      console.log( '\n' + color.yellowBright( dirpath + '/' ) + filepath, color.yellow('changed\n') );

      for( var i = 0, n = subscriptors.length; i < n ; i++ ) {
        subscriptors[i](filepath, { event: event, dirpath: dirpath });
      }

    });

  });

  this.time = new Date();

  console.log( '\nwatching', color.yellow(dirPath), '\n' );
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
    } else if( handler !== undefined ) {
      console.warn('handler should be an array, a string or a function');
      console.warn('found: ' + typeof handler );
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

  if( typeof options === 'string' || typeof options === 'function' || options instanceof Array ) {
    handlers.unshift(options);
    options = {};
  }

  handlers = getHandlers(handlers);

  return new Watcher(dirPath, options || {}, function () {
    return runHandlers(handlers, arguments, this);
  });

}

module.exports = watch;
