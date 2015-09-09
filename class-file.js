
'use strict';

var _ = require('jstools-utils'),
    path = require('path'),
    file = require('./file');

function File (src, data) {
  if( data && data.fileName ) {
    _.extend(this, data, { src: src });
  } else {
    var cwd = data || '.';
    _.extend(this, parsePath(src), { src: file.read( path.join(cwd, src) ) });
  }
}

File.prototype.getFullPath = function () {
  return path.join( this.filePath || '.', this.fileName );
};

module.exports = File;
