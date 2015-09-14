
'use strict';

var _ = require('jengine-utils'),
    path = require('path'),
    file = require('./file');

module.exports = function (meta) {

  function File (src, data) {
    this.cwd = this.cwd || '.';

    if( typeof src === 'object' ) {
      _.extend(this, src);
    } else if( _.isString(src) ) {
      if( data === undefined ) {
        this.load(src);
      } else {
        this.src = src;
        _.extend(this, data );
      }
    }
  }

  if( meta ) {
    File.prototype = meta;
  }

  File.prototype.getPath = function () {
    return path.join( this.filePath || '.', this.fileName );
  };

  File.prototype.load = function (fpath) {
    this.src = file.read( path.join(this.cwd, fpath) );
    _.extend(this, file.parsePath(fpath) );
    return this;
  };

  File.prototype.clone = function () {
    return new File(this);
  };

  return File;
};
