'use strict';

var _ = require('jengine-utils'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    RE_filePath = /(.*)\/([^\/]+)/;

function parsePath (filePath) {
  var matches = filePath.match(RE_filePath);

  return {
    filename: ( matches && matches[2] ) || filePath,
    filePath: ( matches && matches[1] ) || null
  };
}

var file = {
  exists: function (filepath) {
    try {
      return fs.statSync(filepath);
    } catch(err) {
      return false;
    }
  },
  read: function () {
    return fs.readFileSync( path.join.apply(null, arguments), { encoding: 'utf8' });
  },
  readJSON: function () {
    return JSON.parse( file.read.apply(this, arguments) );
  },
  write: function (paths, content, options) {
    var dest = typeof paths === 'string' ? paths : path.join(paths),
        filePath = parsePath(dest).filePath;


    if( filePath ) {
      mkdirp.sync(filePath);
    }
    return fs.writeFileSync(dest , content, _.extend({ encoding: 'utf8' }, options || {}) );
  },
  writeJSON: function (paths, data) {
    return file.write( paths, JSON.stringify(data, null, '\t') );
  },
  copy: function (src, dest) {
    var filePath = parsePath(dest).filePath;
    if( filePath ) {
      mkdirp.sync(filePath);
    }
    return fs.createReadStream(src).pipe( fs.createWriteStream(dest) );
  },
  parsePath: parsePath,
  filter: function (filter) {
    if( typeof filter === 'string' ) {
      return mmatch.filter(filter);
    } else if( filter instanceof Array ) {
      var filters = filter.map(file.filter);

      return function (filePath) {
        return filters.every(function (fileFilter) {
          return fileFilter(filePath);
        });
      };
    }
    return null;
  }
};

module.exports = file;
