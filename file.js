'use strict';

var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    RE_filePath = /(.*)\/([^\/]+)/;

function parsePath (filePath) {
  var matches = filePath.match(RE_filePath);

  return {
    fileName: ( matches && matches[2] ) || filePath,
    filePath: ( matches && matches[1] ) || null
  };
}

var file = {
  read: function () {
    return fs.readFileSync( path.join.apply(null, arguments), { encoding: 'utf8' });
  },
  readJSON: function () {
    return JSON.parse( file.read.apply(this, arguments) );
  },
  write: function (paths, text) {
    return fs.writeFileSync( typeof paths === 'string' ? paths : path.join(paths), text, { encoding: 'utf8' });
  },
  writeJSON: function (paths, data) {
    return file.write( paths, JSON.stringify(data, null, '\t') );
  },
  copy: function (src, dest) {
    var filePath = parsePath(dest).filePath;
    if( filePath ) {
      mkdirp(filePath);
    }
    return fs.createReadStream(src).pipe( fs.createWriteStream(dest) );
  },
  parsePath: parsePath
};

module.exports = file;
