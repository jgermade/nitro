'use strict';

var _ = require('jengine-utils'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    file = require('./file');

module.exports = {
  create: function (dirPath) {
    mkdirp(dirPath);
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
      // console.log('dir.copy', filePath );
      // console.log('\t', path.join(cwd || options.cwd || '.', filePath), path.join(dest || '.', filePath) );
      file.copy( path.join(cwd || options.cwd || '.', filePath) , path.join(dest || '.', filePath) );
    });
  }
};
