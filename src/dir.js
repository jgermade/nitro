'use strict';

var _ = require('jengine-utils'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    mkdirp = require('mkdirp'),
    file = require('./file');

var dir = {
  create: function (dirPath) {
    mkdirp.sync(dirPath);
  },
  exists: function (dirPath) {
    return fs.existsSync(dirPath);
  },
  copy: function copyFiles (cwd, globSrc, dest, options) {
    if( dest === undefined || typeof dest === 'object' ) {
      dest = globSrc;
      globSrc = '**';
    }

    glob.sync(globSrc, _.extend( options || {}, cwd ? { cwd: cwd } : undefined ) ).forEach(function (filePath) {
      file.copy( path.join(cwd || options.cwd || '.', filePath) , path.join(dest || '.', filePath) );
    });
  },
  matchFiles: function (pattern, options) {
    return glob.sync(pattern, options);
  },
  remove: function (dirPath) {
    if( dir.exists(dirPath) ) {
      exec('rm -r ' + dirPath);
    }
  }
};

module.exports = dir;
