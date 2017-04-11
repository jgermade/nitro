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

function runSequence (list, args, thisArg) {
  var entry = list.shift();

  if( !entry ) return Parole.resolve();

  return ( entry instanceof Function ? (function (result) {
    if( result && result.then instanceof Function ) return result;
    return Parole.resolve(result);
  })( entry.apply(thisArg, args) ) : tasks.run(entry) ).then(function () {
    return runSequence(list, args, thisArg);
  });
}

function Watcher (dirPath, subscriptors) {
  this.subscriptors = subscriptors;

  (dirPath instanceof Array ? dirPath : [dirPath]).forEach(function (dirpath, i) {

    var RE_removeBase = new RegExp('^' + path.join(process.cwd(), dirpath) + '\\/');
    // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
    // nodeWatch(dirpath, function (filepath, eventType) {
    chokidar.watch( path.join(process.cwd(), dirpath), {
      ignoreInitial: true
    }).on('all', function (event, filepath) {

      filepath = ( i ? ( dirpath + '/' ) : '' ) + filepath.replace(RE_removeBase, '');
      console.log( '\n' + color.yellowBright( dirpath + '/' ) + filepath, color.yellow('changed\n') );

      runSequence(subscriptors.slice(), [filepath, { event: event, dirpath: dirpath }] );
    });

  });

  this.time = new Date();

  console.log( '\nwatching', color.yellow(dirPath), '\n' );
}

Watcher.prototype.when = function (filter) {
  var taskList = [].slice.call(arguments, 1),
      matches = file.filter(filter);

  if( filter && taskList.length ) {
    this.subscriptors.push(function (filepath, meta) {
      if( matches(filepath) ) return runSequence(taskList.slice(), [filepath, meta]);
    });
  }
  return this;
};

function watch (dirPath) {
  return new Watcher(dirPath, [].slice.call(arguments, 1) );
}

module.exports = watch;
