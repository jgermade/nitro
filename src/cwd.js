'use strict';

var path = require('path'),
    Files = require('./class-files');

function Cwd () {
  var pcwd = path.join.apply(null, [].slice.call(arguments) );

  this.path = pcwd;
  this.cwd = path.join( process.cwd(), pcwd );
}

Cwd.prototype.get = function () {
  return this.cwd;
};

Cwd.prototype.load = function (globSrc) {
  return new Files(globSrc, { cwd: this.path });
};

function getCwd (p) {
  return new Cwd(p);
}

getCwd.path = function () {
  return path.join.apply(null, [process.cwd()].concat( [].slice.call(arguments) ) );
};

module.exports = getCwd;
