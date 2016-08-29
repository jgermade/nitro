
'use strict';

var _ = require('nitro-tools'),
    glob = require('glob'),
    path = require('path'),
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    file = require('./file'),
    dir = require('./dir'),
    classFile = require('./class-file'),
    noop = function (value) { return value; },
    noFilter = function () { return true; };

function loadFile (File, filepath, cwd) {
  var src = file.read( path.join(cwd, filepath) ), map;

  src = src.replace(/\n?\/\/# +sourceMappingURL=(.*?)\s*$/, function (mapPatter, mapFile) {
    if( /^data:/.test(mapFile) ) {
      map = mapFile.replace( /data:((.*?);)+base64,(.*)/, function (dataRaw, options, enctype, data) {
        return new Buffer(data, 'base64').toString('utf8');
      });
      return '';
    }
    var dirPaths = filepath.split('/');
    dirPaths.pop();
    map = file.read( path.join(cwd, dirPaths.join('/'), mapFile ) );
    return '';
  });
  return new File( filepath, src, map );
}

function Files (src, options) {
  options = options || {};
  options.cwd = options.cwd || '.';

  if( options.srcMap !== undefined ) {
    options.sourceMap = options.srcMap;
  }

  this.options = options;

  var File = classFile(options);
  this.File = File;

  if( typeof src === 'string' ) {
    [].push.apply( this, glob.sync(src, { cwd: options.cwd }).map(function (filepath) {
      return loadFile(File, filepath, options.cwd );
    }) );
  } else if ( src instanceof Array ) {
    [].push.apply( this, dir(options.cwd).expand(src).map(function (filepath) {
      return loadFile(File, filepath, options.cwd );
    }) );

  }
}

function filterPattern (pattern) {
  return mmatch.filter(pattern);
}

function getFileSrc (f) {
  return f.src;
}

function filterListByPattern (list, pattern) {
  var matchPattern = filterPattern(pattern);

  return [].filter.call(list, function (f) {
    return matchPattern(f.path);
  });
}

Files.prototype = [];

Files.prototype.each = function (pattern, handler, mapThis) {

  if( !pattern ) {
    throw new Error('.each(...) expects at least 1 parameter');
  }

  if( typeof pattern === 'function' ) {
    mapThis = handler;
    handler = pattern;
    pattern = null;
  }

  var list = pattern ? filterListByPattern(this, pattern) : this,
      result = mapThis || [];

  for( var i = 0, n = list.length; i < n ; i++ ) {
    result[i] = handler.call(list[i], list[i], i);
  }

  return mapThis || this;
};

Files.prototype.log = function (title) {
  if( title ) {
    console.log(title.yellow);
  }

  this.each(function (f) {
    console.log( f.path );
  });

  return this;
};

Files.prototype.add = function (files) {
  [].push.apply(this, files);
  return this;
};

Files.prototype.load = function (filter, options) {
  this.add( new Files(filter, options || {}) );
  return this;
};

Files.prototype.concat = function (items) {
   [].push.apply(this, items);
   return this;
};

Files.prototype.clone = function (options) {
  return this.new(this.map(function (f) {
    return f.clone();
  }), options || {} );
};

Files.prototype.new = function (list, _options) {
  var options = {}, key;
  for( key in this.options ) {
    options[key] = this.options[key];
  }
  if( _options ) {
    for( key in _options ) {
      options[key] = _options[key];
    }
  }

  var newList = new Files();
  newList.options = options;

  if( list ) {
    newList.concat(list);
  }

  return newList;
};

// Files.prototype.process > defined in processors.js

Files.prototype.join = function (filter, filepath, options) {
  if( !filepath || ( typeof filepath === 'object' && filepath !== null ) ) {
    if( !filter ) {
      throw new Error('Files.join :: filepath path needs to be defined');
    }
    options = filepath;
    filepath = filter;
  }

  options = options || {};

  if( options.sourceMap || this.every(function (f) { return f.map; }) ) {
    var Concat = require('./require-on-demand')('concat-with-sourcemaps'),
        concat = new Concat(true, 'all.js', '\n');

    this.each(function (f) {
      concat.add( f.path, f.src, f.map );
    });

    return this.new([ new this.File( filepath, '' + concat.content, concat.sourceMap ) ]);
  }

  return this.new([ new this.File( filepath, this.each(function (f) {
    return '\n// ' + f.path + '\n' + f.src;
  }, []).join('\n') ) ]);
};

Files.prototype.filter = function (filter) {
  if( typeof filter === 'string' ) {
    return new Files( [].filter.call(this,  mmatch.filter(filter) ) );
  }
  return new Files().concat( [].filter.call(this,  filter ) );
};

Files.prototype.with = function (pattern, processor) {
  var matchPattern = filterPattern(pattern),
      pristine = this.new(),
      dirty = this.new();

  for( var i = 0, n = this.length; i < n ; i++ ) {
    if( matchPattern( this[i].path ) ) {
      dirty.push(this[i]);
    } else {
      pristine.push(this[i]);
    }
  }

  var processedList = typeof processor === 'string' ? dirty.process(processor) : processor(dirty);

  return processedList ? pristine.concat( processedList ) : this;
};

Files.prototype.write = function (dest, rename, options) {
  options = options || ( _.isObject(rename) ? rename : {} );
  rename = _.isFunction(rename) || noop;

  // console.log(rename, options);
  this.forEach(function (f) {
    var filepath = rename( path.join(dest, f.path) ),
        sourceMapPath = f.map && ( options.sourceMap === 'inline' ? ('data:application\/json;charset=utf-8;base64,' + new Buffer(f.map || '').toString('base64') ) : ( f.path + '.map' ) ),
        src = f.src + ( f.map ? ( /\.js$/.test(f.path) ? `\n//# sourceMappingURL=${sourceMapPath}` : `\n/*# sourceMappingURL=${sourceMapPath} */` ) : '' );

    file.write( filepath, src );
    if( f.map && options.sourceMap !== 'inline' ) {
      file.write( filepath + '.map' , f.map );
    }
  });
  return this;
};

Files.prototype.writeFile = function (destFile) {
  file.write( destFile, this.join('tmp')[0].src );
  return this;
};

Files.prototype.getSrc = function () {
  var src = '';
  this.forEach(function (f) {
    src += f.src;
  });
  return src;
};

module.exports = Files;
