'use strict';

var _ = require('jengine-utils'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    mmatch = require('minimatch'),
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    mkdirp = require('mkdirp'),
    file = require('./file');

function dir (dirpath) {
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
      return dir.remove(dirpath);
    },
    copy: function (globSrc, dest, options) {
      var cwd = process.cwd();
      process.chdir(dirpath);
      dir.copy( '.', globSrc, dest, options );
      process.chdir(cwd);
    },
    load: function (pattern, options) {
      options = options || {};

      options.cwd = options.cwd ? path.join(dirpath, options.cwd) : dirpath;

      return nitro.load(pattern, options);
    },
    watch: function (handler) {
      return nitro.watch(dirpath, handler);
    }
  };

  return dirActions;
};

_.extend(dir, {
  create: function (dirpath) {
    mkdirp.sync(dirpath);
  },
  exists: function (dirpath) {
    try {
      return fs.statSync(dirpath);
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

    glob.sync( globSrc, _.extend({}, options.cwd ? { cwd: options.cwd } : {} ) ).forEach(function (filePath) {
      file.copy( path.join( options.cwd || '.', filePath ) , path.join(dest || '.', filePath) );
    });
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

      for( i = 1, n = patterns.length ; i < n ; i++ ) {
        if( /^!/.test(patterns[i]) ) {
          matches = mmatch.filter(patterns[i]);

          for( key in filelistMap ) {
            if( !matches(key) ) {
              delete filelistMap[key];
            }
          }

        } else {

          glob.sync(patterns[i]).forEach(function (filepath) {
            if( !filelistMap[filepath] ) {
              filelistMap[filepath] = true;
            }
          });

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
    if( dir.exists(dirPath) ) {
      exec('rm -r ' + dirPath);
    }
  }
});

module.exports = dir;
