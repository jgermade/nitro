
'use strict';

var _ = require('nitro-tools'),
    path = require('path'),
    file = require('./file');

module.exports = function (meta) {

  function File (src, data) {
    this.cwd = this.cwd || '.';

    if( typeof src === 'object' ) {
      _.extend(this, src);
    } else if( _.isString(src) ) {
      if( data === undefined ) {
        this.setPath(src);
      } else {
        this.src = src;
        _.extend(this, data );
      }
      this.sourcePath = path.join( this.cwd, this.getPath() );
    }
  }

  if( meta ) {
    File.prototype = meta;
  }

  File.prototype.getSrc = function () {
    return ( this.src ? this.src : this.load().src ) || '';
  };

  File.prototype.setSrc = function (src) {
    this.src = src;
    return this;
  };

  File.prototype.getMap = function () {
    return this.map;
  };

  File.prototype.setMap = function (map) {
    this.map = map;
    return this;
  };

  File.prototype.getPath = function () {
    return path.join( this.filePath || '.', this.filename );
  };

  File.prototype.setPath = function (filepath) {
    _.extend(this, file.parsePath(filepath) );
    return this;
  };

  File.prototype.load = function (fpath) {
    if( fpath ) {
      this.setPath(fpath);
      this.sourcePath = fpath;
    }

    this.src = file.read( path.join(this.cwd, this.getPath() ) );
    return this;
  };

  File.prototype.json = function () {
    return JSON.parse( this.getSrc() );
  };

  File.prototype.yaml = function () {
    return require('js-yaml').safeLoad( this.getSrc() );
  };

  File.prototype.clone = function () {
    return new File(this);
  };

  return File;
};
