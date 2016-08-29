
'use strict';

var _ = require('nitro-tools'),
    path = require('path'),
    file = require('./file');

module.exports = function (listOptions) {

  function File (filepath, src, map) {
    this.cwd = this.cwd || '.';

    if( _.isObject(filepath) ) {
      _.extend(this, filepath);
    } else {
      if( filepath ) {
        this.path = filepath;
      }
      if( src ) {
        this.src = src;
      }
      if( map ) {
        this.map = map;
      }
    }
  }

  if( listOptions ) {
    File.prototype = listOptions;
  }

  Object.defineProperty(File.prototype, 'path', {
    get: function () {
      return path.join( this.filepath || '.', this.filename );
    },
    set: function (filepath) {
      _.extend(this, file.parsePath(filepath) );
    }
  });

  Object.defineProperty(File.prototype, 'src', {
    get: function () {
      if( !this.$$src ) {
        this.load();
      }
      return this.$$src || '';
    },
    set: function (src) {
      this.$$src = src;

    }
  });

  Object.defineProperty(File.prototype, 'map', {
    get: function () {
      return this.$$map;
    },
    set: function (map) {
      this.$$map = typeof map === 'string' ? map : JSON.stringify(map);
    }
  });

  File.prototype.getSrc = function () { return this.src; };
  File.prototype.setSrc = function (src) { this.src = src; return this; };

  File.prototype.getPath = function () { return this.path; };
  File.prototype.setPath = function (path) { this.path = path; return this; };

  File.prototype.getMap = function () { return this.map; };
  File.prototype.setMap = function (map) { this.map = map; return this; };

  File.prototype.load = function (fpath) {
    if( fpath ) {
      this.path = fpath;
      this.sourcePath = fpath;
    }

    this.src = file.read( path.join(this.cwd, this.path ) );
    return this;
  };

  File.prototype.json = function () {
    return JSON.parse( this.src );
  };

  File.prototype.yaml = function () {
    return require('js-yaml').safeLoad( this.src );
  };

  File.prototype.clone = function () {
    return new File(this);
  };

  return File;
};
