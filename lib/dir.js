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
    return new Files( dirExpand(pattern, _.extend(options ||{}, { cwd: join(process.cwd(), dirpath) }) ), { cwd: dirpath });
  },
  libs2html: function (dirpath, filter, options) {
    options = options || {};

    var files = dirExpand(filter, dirpath),
        rootSlash = options.rootSlash === undefined || options.rootSlash,
        scriptTail = ( options.version ? ( '?v=' + options.version ) : '' ) + '\"' + ( options.defer ? ' defer' : '' ) + ( options.async ? ' async' : '' ) + '></script>',
        styleTail = ( options.version ? ( '?v=' + options.version ) : '' ) + '\" />';

    return files.reduce(function (prev, filepath) {
      if( rootSlash ) filepath = '/' + filepath;

      if( /\.js$/.test(filepath) ) {
        return prev + '\n\t<script type="text/javascript" src="' + filepath + scriptTail;
      } else if( /\.css$/.test(filepath) ) {
        return prev + '\n\t<link type="text/css" rel="stylesheet" href="' + filepath + styleTail;
      }
      return prev;
    }, '');
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
    return this;
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
    dir.copy( this.dirpath, globSrc, dest, options );
    return this;
  },
  symlink: function (_path, target, type) {
    fs.symlinkSync( target, join(this.dirpath, _path), type);
    return this;
  },
  load: function (pattern, options) {
    return dir.load(this.dirpath, pattern, options);
  },
  libs2html: function (filter, options) {
    return dir.libs2html(this.dirpath, filter, options);
  },
  watch: function (handler) {
    return require('./nitro').watch(this.dirpath, handler);
  }
});



module.exports = dir;
