'use strict';

var _ = require('nitro-tools'),
    fs = require('fs'),
    joinPaths = require('./join-paths'),
    mkdirp = require('mkdirp'),
    mmatch = require('minimatch'),
    deasync = require('deasync'),
    RE_filepath = /(.*)[\\\/](.*)/,
    YAML = require('js-yaml');

function parsePath (filepath) {
  var matches = filepath.match(RE_filepath);

  return {
    filename: ( matches && matches[2] ) || filepath,
    filepath: ( matches && matches[1] ) || null
  };
}

var file = {
  exists: function (filepath, done) {
    filepath = joinPaths.root(filepath);
    try {
      return fs[done ? 'stat' : 'statSync'](filepath, done);
    } catch(err) {
      if( done ) done(err);
      return false;
    }
  },
  read: function (paths) {
    return fs.readFileSync( joinPaths.root(paths), { encoding: 'utf8' });
  },
  readJSON: function () {
    return JSON.parse( file.read.apply(this, arguments) );
  },
  readYAML: function () {
    return YAML.safeLoad( file.read.apply(this, arguments) );
  },
  write: function (paths, content, options) {
    var dest = joinPaths(paths),
        filepath = parsePath(dest).filepath;

    if( filepath ) mkdirp.sync(filepath);
    return fs.writeFileSync( joinPaths.root(dest) , content, _.extend({ encoding: 'utf8' }, options || {}) );
  },
  writeJSON: function (paths, data, indentation) {
    return file.write( paths, JSON.stringify(data, null, indentation || '\t') );
  },
  writeYAML: function (paths, data) {
    return file.write( paths, YAML.safeDump(data) );
  },
  copy: function (src, dest) {
    var filepath = parsePath(dest).filepath;
    if( filepath && !file.exists(filepath) ) {
      mkdirp.sync( joinPaths.root(filepath) );
    }
    deasync(function (done) {
      fs.createReadStream(joinPaths.root(src))
        .pipe( fs.createWriteStream( joinPaths.root(dest) ).on('close', done) );
    })();
    return file;
  },
  parsePath: parsePath,
  filter: function (filter) {
    if( typeof filter === 'string' ) {
      return mmatch.filter(filter);
    } else if( filter instanceof Array ) {
      var filters = filter.map(file.filter);

      return function (filepath) {
        return filters.every(function (fileFilter) {
          return fileFilter(filepath);
        });
      };
    }
    return null;
  }
};

module.exports = file;
