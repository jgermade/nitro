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
    chokidar = require('chokidar'),
    Parole = require('parole');

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

Watcher.prototype.when = function () {
  var handlers = [].slice.call(arguments),
      filter = handlers.shift();

  if( filter && handlers.length ) {
    this.subscriptors.push(function (filepath) {
      if( matches(filepath) ) {
        tasks.run(handlers, arguments, this);
      }
    });
  }
  return this;
};

function watch () {

  var handlers = [].slice.call(arguments),
      dirPath = handlers.shift(),
      options = handlers.pop();

  if( typeof options === 'string' || typeof options === 'function' || options instanceof Array ) {
    handlers.unshift(options);
    options = {};
  }
  
  return new Watcher(dirPath, options || {}, function () {
    tasks.run(handlers, arguments, this);
  });

}

module.exports = watch;
