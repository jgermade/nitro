'use strict';

var path = require('path');

function _runCwd (cwd, dir_path, cb) {
  var cwd_path = path.join(cwd, dir_path), result;
  process.chdir( cwd_path );
  result = cb(cwd_path);
  process.chdir(cwd);
  return result;
}

function runCwd (dirpath, cb) {
  if( !dirpath ) return process.cwd();

  var cwd = process.cwd();

  if( !cb ) return function (_cb) {
    _runCwd(cwd, dirpath, _cb);
  };

  return _runCwd( cwd, dirpath, cb );
}

// runCwd.process_dir = process.cwd();

module.exports = runCwd;
