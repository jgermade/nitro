
'use strict';

var glob = require('glob'),
    path = require('path'),
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    file = require('./file'),
    File = require('./class-file'),
    processors = require('./processors'),
    noop = function (value) { return value; };

function Files (src, options) {
  options = options || {};
  var cwd = options.cwd || '.';

  if( typeof src === 'string' ) {
    [].push.apply( this, glob.sync(src, options || {}).map(function (filePath) {
      return new File( file.read( path.join(cwd, filePath) ), file.parsePath(filePath) );
    }) );
  } else if ( src instanceof Array ) {
    [].push.apply(this, src);
  }
}

function getFileSrc (f) {
  return f.src;
}

Files.prototype = [];
Files.prototype.each = Files.prototype.forEach;

Files.prototype.add = function (files) {
  [].push.apply(this, files);
  return this;
};

Files.prototype.process = function (processorKey, options) {
  if( !processors[processorKey] ) {
    throw new Error('file processor missing: ' + processorKey);
  }

  return processors[processorKey].call(this, options);
};

Files.prototype.concat = function (filter, filePath) {
  if( !filePath ) {
    if( !filter ) {
      throw new Error('Files.concat :: file path needs to be defined');
    }
    filePath = filter;
  }


  if( filePath !== true ) {
    var files = new Files();

    files.push( new File(this.concat(true), file.parsePath(filePath) ) );
    return files;
  } else {
    return this.map(getFileSrc).join('');
  }
};

function filterPattern (pattern) {
  var mm = new Minimatch(pattern);
  return function (f) {
    return mm.match( f.getFullPath() );
  };
}

Files.prototype.filter = function (pattern) {
  return new Files( [].filter(this,  filterPattern(pattern) ) );
};

Files.prototype.with = function (pattern, processor) {
  var matchPattern = filterPattern(pattern),
      pristine = new Files(),
      dirty = new Files();

  for( var i = 0, n = this.length; i < n ; i++ ) {
    if( matchPattern(this[i]) ) {
      dirty.push(this[i]);
    } else {
      pristine.push(this[i]);
    }
  }

  return pristine.concat( processor(dirty) );
};

Files.prototype.write = function (dest, rename) {
  this.forEach(function (f) {
    file.write( ( rename || noop )( path.join(dest, f.filePath || '.', f.fileName) ), f.src );
  });
};

Files.prototype.writeFile = function (destFile) {
  file.write( destFile, this.concat(true) );
  return this;
};

module.exports = Files;
