
'use strict';

var _ = require('nitro-tools'),
    join = require('path').join,
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    file = require('./file'),
    color = require('./color'),
    dirExpand = require('./dir-expand'),
    File = require('./class-file'),
    noop = function (value) { return value; },
    noFilter = function () { return true; },
    arrPush = Array.prototype.push;

function Files (files_list, options) {
  options = _.copy(options || {});
  this.cwd = options.cwd || '.';

  var list = this;

  if( options.srcMap !== undefined ) {
    options.sourceMap = options.srcMap;
  }

  this.options = options;

  function FilesFile () {
    File.apply(this, arguments);
  };
  FilesFile.prototype = new File;
  FilesFile.prototype.constructor = FilesFile;
  FilesFile.prototype.list = this;

  this.File = FilesFile;

  arrPush.apply(this, files_list.map(function (filepath) {
    return filepath instanceof File ? filepath : new FilesFile( filepath );
    // return new File( filepath, null, null, list );
  }));
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

Files.prototype = new Array;
Files.prototype.constructor = Files;

function allowAll () {
  return true;
}

Files.prototype.each = function (filterList, iteratee) {

  if( !filterList ) throw new Error('.each(...) expects at least 1 parameter');

  if( iteratee instanceof Function ) {
    filterList = filterList instanceof Function ? filterList : (function (mm) {
      return function (f) {
        return mm.match(f.path);
      };
    })(new Minimatch(filterList) );
  } else {
    // mapThis = iteratee;
    iteratee = filterList;
    filterList = allowAll;
  }

  this.forEach(function (f, i) {
    if( filterList(f) ) iteratee.call(f, f, i);
  });

  return this;
};

Files.prototype.log = function (title) {
  if( title ) {
    console.log( color.yellow(title) );
  }

  this.each(function (f) {
    console.log( f.path );
  });

  return this;
};

Files.prototype.add = function (files) {
  var list = this;

  (files && files.length ? files : [files]).foreach(function (f) {
    f.list = list;
    list.push(f);
  })
  return this;
};

Files.prototype.filter = function (filter) {
  var list = new Files([], Object.create(this.options) );

  this.each(filter, function (f) {
    list.push(f);
  });

  return list;
};

Files.prototype.with = function (pattern, processor, is_collection) {
  if( processor instanceof Function ) {
    is_collection ? processor( this.filter(pattern) ) : this.filter(pattern).forEach(processor);
  } else this.filter(pattern).process(processor);

  return this;
};

Files.prototype.load = function (patterns, options) {
  this.add( dirExpand(patterns, this.cwd) );
  this.add( new Files(filter, options || {}) );
  return this;
};

Files.prototype.concat = function (items) {
   arrPush.apply(this, items);
   return this;
};

Files.prototype.new = function (list, options) {
  return new Files( list || [], options || Object.create(this.options) );
};

Files.prototype.clone = function (options) {
  var files = this;
  return new Files( this.map(function (f) {
    return new files.File(f.path, f.src, f.map);
  }), options || Object.create(this.options) );
};

Files.prototype.join = function (filter, filepath, options) {
  if( !filepath || ( typeof filepath === 'object' && filepath !== null ) ) {
    if( !filter ) {
      throw new Error('Files.join :: filepath path needs to be defined');
    }
    options = filepath;
    filepath = filter;
  }

  options = options || {};

  var sourceMap = ( options.sourceMap !== undefined ? options.sourceMap : this.options.sourceMap );

  if( sourceMap ) {
    var Concat = require('./auto-require')('concat-with-sourcemaps'),
        concat = new Concat(true, 'all.js', '\n');

    this.each(function (f) {
      concat.add( f.path, f.src, f.map );
    });

    return new Files([ new this.File( filepath, '' + concat.content, concat.sourceMap ) ], Object.create(this.options) );
  }

  return new Files([ new this.File( filepath, this.map(function (f) {
    return f.src;
  }, []).join('\n') ) ], Object.create(this.options));
};

Files.prototype.write = function (dest, rename, options) {
  options = options || ( _.isObject(rename) ? rename : {} );
  rename = _.isFunction(rename) || noop;

  var sourceMap = this.options.sourceMap !== undefined ? this.options.sourceMap : options.sourceMap;

  this.forEach(function (f) {
    var filepath = rename( join(dest, f.path) ),
        sourceMapPath = f.map && ( sourceMap === 'inline' ? ('data:application\/json;charset=utf-8;base64,' + new Buffer(f.map || '').toString('base64') ) : ( f.filename + '.map' ) ),
        src = f.src + ( (f.map && sourceMap !== false) ? ( /\.js$/.test(f.path) ? `\n//# sourceMappingURL=${sourceMapPath}` : `\n/*# sourceMappingURL=${sourceMapPath} */` ) : '' );

    file.write( filepath, src );
    if( f.map && sourceMap !== 'inline' && sourceMap !== false ) {
      file.write( filepath + '.map' , f.map );
    }
  });
  return this;
};

Files.prototype.writeFile = function (destFile) {
  file.write( destFile, this.join( destFile.split('/').pop() )[0].src );
  return this;
};

Files.prototype.getSrc = function () {
  return this.reduce(function (src, f) {
    src += f.src;
    return src;
  }, '');
};

module.exports = Files;
