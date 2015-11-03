'use strict';

var path = require('path'),
    Files = require('./class-files');

function runCwd (path, cb) {
  if( !path ) {
    return process.cwd();
  }

  if( !cb ) {
    return function (_cb) {
      runCwd(path, _cb);
    };
  }

  var cwd = process.cwd();
  process.chdir(path);

  var result = cb( process.cwd() );

  process.chdir(cwd);

  return result;
}

module.exports = runCwd;
