'use strict';

var fs = require('fs'),
    fileFilters = [],
    file = require('./file'),
    watchers = {};

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
}

Watcher.prototype.when = function (filter, handler) {
  var matches = file.filter(filter);

  if( filter && handler instanceof Function ) {
    this.subscriptors.push(function (filePath) {
      if( matches(filePath) ) {
        handler.apply(this, arguments);
      }
    });
  }
  return this;
};

function watch (dirPath, handler) {
  return new Watcher(dirPath, handler);
}

module.exports = watch;
