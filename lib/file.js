'use strict';

var _ = require('nitro-tools'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    deasync = require('deasync'),
    exec = deasync( require('child_process').exec ),
    // RE_filepath = /(.*)[\\\/]([^\\\/]+)/,
    RE_filepath = /(.*)[\\\/](.*)/,
    YAML = require('js-yaml'),
    noopValue = function (value) { return value; };

function parsePath (filepath) {
  var matches = filepath.match(RE_filepath);

  return {
    filename: ( matches && matches[2] ) || filepath,
    filepath: ( matches && matches[1] ) || null
  };
}

var file = {
  exists: function (filepath, done) {
    try {
      return fs[done ? 'stat' : 'statSync'](filepath, done);
    } catch(err) {
      if( done ) done(err);
      return false;
    }
  },
  read: function () {
    return fs.readFileSync( path.join.apply(null, arguments), { encoding: 'utf8' });
  },
  readJSON: function () {
    return JSON.parse( file.read.apply(this, arguments) );
  },
  readYAML: function () {
    return YAML.safeLoad( file.read.apply(this, arguments) );
  },
  write: function (paths, content, options, done) {
    var dest = typeof paths === 'string' ? paths : path.join(paths),
        filepath = parsePath(dest).filepath;

    if( options instanceof Function ) {
      done = options; options = {};
    }

    if( done instanceof Function ) {
      if( filepath ) mkdirp.sync(filepath);
      return fs.writeFile( dest , content, _.extend({ encoding: 'utf8' }, options || {}, done) );
    } else {
      if( filepath ) mkdirp.sync(filepath);
      return fs.writeFileSync(dest , content, _.extend({ encoding: 'utf8' }, options || {}) );
    }
  },
  writeJSON: function (paths, data) {
    return file.write( paths, JSON.stringify(data, null, '\t') );
  },
  writeYAML: function () {
    return file.write( paths, YAML.safeDump(data) );
  },
  copy: function (src, dest) {
    var filepath = parsePath(dest).filepath;
    if( filepath && !file.exists(filepath) ) {
      mkdirp.sync(filepath);
    }
    deasync(function (done) {
      fs.createReadStream(src).pipe( fs.createWriteStream(dest).on('close', done) );
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
