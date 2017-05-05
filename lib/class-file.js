
'use strict';

var _ = require('nitro-tools'),
    join = require('path').join,
    file = require('./file'),
    color = require('./color'),
    process_cwd = process.cwd();

function File (filepath, src, map, list) {

  if( list ) this.list = list;

  this.__ = {};

  if( filepath ) this.path = filepath;
  if( src ) this.__.src = src;
  if( map ) this.__.map = map;

}

Object.defineProperty(File.prototype, 'path', {
  get: function () {
    return join( this.filepath || '.', this.filename );
  },
  set: function (filepath) {
    _.extend(this, file.parsePath(filepath) );
  }
});

Object.defineProperty(File.prototype, 'full_path', {
  get: function () {
    return join( this.list ? this.list.cwd : '.', this.path );
  }
});

Object.defineProperty(File.prototype, 'src', {
  get: function () {
    if( this.__.src === undefined ) this.load();
    return this.__.src || '';
  },
  set: function (src) {
    this.__.src = src;
  }
});

Object.defineProperty(File.prototype, 'map', {
  get: function () {
    return this.__.map;
  },
  set: function (map) {
    this.__.map = typeof map === 'string' ? map : JSON.stringify(map);
  }
});

Object.defineProperty(File.prototype, 'cwd', {
  get: function () {
    return this.list && this.list.cwd || '.';
  }
});

['src', 'path', 'map'].forEach(function (property) {
  var property_title_case = property[0].toUpperCase() + property.substr(1);

  File.prototype['get' + property_title_case] = function () {
    console.log( color.yellow('[WARN]') + 'File.prototype.get' + property_title_case + ' is deprecated, please ' + color.yellow('use File.prototype.' + property) + ' instead' );
    return this.src;
  };
  File.prototype.setSrc = function (src) {
    console.log( color.yellow('[WARN]') + 'File.prototype.set' + property_title_case + ' is deprecated, please ' + color.yellow('use File.prototype.' + property) + ' instead' );
    this.src = src; return this;
  };

});

File.prototype.load = function (fpath) {
  if( fpath ) this.path = fpath;

  var cwd = this.cwd;
  cwd = /^\//.test(cwd) ? cwd : join(process_cwd, cwd);

  this.src = file.read( join(cwd, this.path ) );
  return this;
};

File.prototype.json = function () {
  return JSON.parse( this.src );
};

File.prototype.yaml = function () {
  return require('js-yaml').safeLoad( this.src );
};

File.prototype.clone = function (list) {
  return new File(this.path, this.src, this.map, list || this.list);
};

module.exports = File;
