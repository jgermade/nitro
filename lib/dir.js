'use strict';

var _ = require('nitro-tools'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    mmatch = require('minimatch'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    mkdirp = require('mkdirp'),
    file = require('./file'),
    nitro;

function dir (dirpath) {
  if( dirPath instanceof Array ) {
    dirpath = path.join(dirpath);
  }

  var dirActions = {
    create: function () {
      dir.create(dirpath);
      return dirActions;
    },
    exists: function () {
      return dir.exists(dirpath);
    },
    expand: function (patterns, options) {
      return dir.expand(patterns, _.extend({}, options || {}, { cwd: dirpath }) );
    },
    remove: function () {
      dir.remove(dirpath);
      return dirActions;
    },
    copy: function (globSrc, dest, options) {
      dir.copy( dirpath, globSrc, dest, options );
      return dirActions;
    },
    load: function (pattern, options) {
      options = options || {};

      options.cwd = options.cwd ? path.join(dirpath, options.cwd) : dirpath;

      return nitro.load(pattern, options);
    },
    libs2html: function (filter, options) {
      options = options || {};
      return nitro.libs2html(filter, _.extend({}, options, { cwd: options.cwd ? path.join(options.cwd, dirpath) : dirpath }) );
    },
    watch: function (handler) {
      return nitro.watch(dirpath, handler);
    }
  };

  return dirActions;
}

_.extend(dir, {
  _addNitro: function (_nitro) { nitro = _nitro; },
  create: function (dirpath) {
    mkdirp.sync( paths instanceof Array ? path.join(paths) : paths );
    return dir;
  },
  exists: function (dirpath) {
    try {
      return fs.statSync( paths instanceof Array ? path.join(paths) : paths );
    } catch(err) {
      return false;
    }
  },
  copy: function copyFiles (cwd, globSrc, dest, options) {
    if( dest === undefined || typeof dest === 'object' ) {
      options = dest;
      dest = globSrc;
      globSrc = '**';
    }

    options = _.extend({}, options || {}, cwd ? { cwd: cwd } : {} );

    // glob.sync( globSrc, _.extend({}, options.cwd ? { cwd: options.cwd } : {} ) ).forEach(function (filePath) {
    dir.expand(globSrc, _.extend({}, options.cwd ? { cwd: options.cwd } : {} ) ).forEach(function (filePath) {
      var srcPath = path.join( options.cwd || '.', filePath ),
          destPath = path.join(dest || '.', filePath);

      if( dir.exists( srcPath ).isDirectory() ) {
        mkdirp.sync( destPath );
      } else {
        file.copy( srcPath, destPath );
      }
    });
    return dir;
  },
  expand: function (patterns, options) {
    var cwd, list = [];

    options = options || {};

    if( options.cwd ) {
      cwd = process.cwd();
      process.chdir(options.cwd);
    }

    if( typeof patterns === 'string' ) {
      list = glob.sync(patterns);
    } else if( patterns instanceof Array && patterns.length ) {
      var filelist = glob.sync(patterns[0]), i, n, key, matches;

      var filelistMap = {};
      for( i = 0, n = filelist.length ; i < n ; i++ ) {
        filelistMap[ filelist[i] ] = true;
      }

      var setFileListMap = function (filepath) {
        if( !filelistMap[filepath] ) {
          filelistMap[filepath] = true;
        }
      };

      for( i = 1, n = patterns.length ; i < n ; i++ ) {
        if( /^!/.test(patterns[i]) ) {
          matches = mmatch.filter(patterns[i]);

          for( key in filelistMap ) {
            if( !matches(key) ) {
              delete filelistMap[key];
            }
          }

        } else {
          glob.sync(patterns[i]).forEach(setFileListMap);
        }
      }

      i = 0;

      for( key in filelistMap ) {
        list[i++] = key;
      }
    }

    if( cwd ) {
      process.chdir(cwd);
    }

    return list;
  },
  remove: function (dirPath) {
    if( dirPath instanceof Array ) {
      dirpath = path.join(dirpath);
    }
    if( dir.exists(dirPath) ) {
      exec('rm -r ' + dirPath);
    }
    return dir;
  }
});

module.exports = dir;
