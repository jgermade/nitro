'use strict';

var _ = require('nitro-tools'),
    fs = require('fs'),
    path = require('path'),
    join = path.join,
    mmatch = require('minimatch'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    mkdirp = require('mkdirp'),
    file = require('./file'),
    Files = require('./class-files'),
    nitro = require('./nitro'),
    dirExpand = require('./dir-expand');

function stringPath(parts) {
  return parts instanceof Array ? join.apply(null, parts) : parts;
}

function Dir (dirpath) {
  this.dirpath = stringPath(dirpath);
}

function dir (dirpath) {
  return new Dir(dirpath);
}

_.extend(dir, {
  create: function (dirpath) {
    mkdirp.sync( stringPath(dirpath) );
    return dir;
  },
  exists: function (dirpath) {
    try {
      return fs.statSync( stringPath(dirpath) );
    } catch(err) {
      return false;
    }
  },
  copy: function copyFiles (dirpath, globSrc, dest, options) {
    if( dest === undefined || typeof dest === 'object' ) {
      options = dest;
      dest = globSrc;
      globSrc = '**';
    }

    options = _.extend({}, options || {}, dirpath ? { cwd: dirpath } : {} );

    dirExpand(globSrc, _.extend({}, options.cwd ? { cwd: options.cwd } : {} ) ).forEach(function (filepath) {
      var srcPath = path.join( options.cwd || '.', filepath ),
          destPath = path.join(dest || '.', filepath);

      if( dir.exists( srcPath ).isDirectory() ) {
        mkdirp.sync( destPath );
      } else {
        file.copy( srcPath, destPath );
      }
    });
    return dir;
  },
  expand: dirExpand,
  load: function (dirpath, pattern, options) {
    return new Files( dirExpand(pattern, _.extend(options || {}, { cwd: join(process.cwd(), dirpath) }) ), { cwd: dirpath });
  },
  remove: function (dirpath) {
    dirpath = dirpath = stringPath(dirpath);
    if( dir.exists(dirpath) ) exec('rm -r ' + dirpath);
    return dir;
  }
});

_.extend(Dir.prototype, {
  create: function () {
    dir.create(this.dirpath);
    return dirActions;
  },
  exists: function () {
    return dir.exists(this.dirpath);
  },
  expand: function (patterns, options) {
    return dir.expand(patterns, _.extend({}, options || {}, { cwd: this.dirpath }) );
  },
  remove: function () {
    dir.remove(this.dirpath);
    return this;
  },
  copy: function (globSrc, dest, options) {
    dir.copy( dirpath, globSrc, dest, options );
    return dirActions;
  },
  symlink: function (_path, target, type) {
    fs.symlinkSync( target, path.join(dirpath, _path), type);
    return dirActions;
  },
  load: function (pattern, options) {
    return dir.load(this.dirpath, pattern, options);
  },
  libs2html: function (filter, options) {
    options = options || {};
    return nitro.libs2html(filter, _.extend({}, options, { cwd: options.cwd ? path.join(options.cwd, dirpath) : dirpath }) );
  },
  watch: function (handler) {
    return nitro.watch(dirpath, handler);
  }
});



module.exports = dir;
