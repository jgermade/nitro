
var nitro = {},
    _ = require('jstools-utils'),
    colors = require('colors'),
    glob = require('glob'),
    mmatch = require('minimatch'),
    Minimatch = mmatch.Minimatch,
    fs = require('fs'),
    path = require('path'),
    JSHINT = require('jshint').JSHINT,
    // childProcess = require('child_process'),
    // spawn = childProcess.spawn,
    shell = require('shelljs'),
    noop = function (value) { return value; };

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
        return fs.createReadStream(src).pipe( fs.createWriteStream(dest) );
      }
    },
    dir = {
      create: function (dirPath) {
        if( !fs.existsSync(dirPath) ) {
            fs.mkdirSync(dirPath);
        }
      },
      exists: function (dirPath) {
        return fs.existsSync(dirPath);
      }
    };

function exec(cmd) {
    return shell.exec(cmd);
}

function launchJShint (src, jshintrc) {
  var errorsLog = '';

  glob.sync(src).forEach(function (fileName) {
    JSHINT( file.read(fileName).split(/\n/), jshintrc );
    var res = JSHINT.data();

    if( res.errors ) {
      var fileLog = fileName.cyan + '\n';
      res.errors.forEach(function (err) {
        if( err === null ) {
          return;
        }
        fileLog += '  line ' + (err.line + '').yellow + ', col ' + (err.character + '').cyan + ', ' + err.reason.yellow + '\n';
      });

      errorsLog += fileLog;
    }
  });

  return {
    valid: !errorsLog,
    log: errorsLog
  };
}


function timestamp () {
  return new Date().getTime();
}

function timingSync ( dest, fn ) {
  if( dest instanceof Function ) {
    fn = dest;
    dest = null;
  }

  var start = timestamp();
  fn();
  var elapsedTime = timestamp() - start;
  if( dest ) {
    console.log('\n' + dest, 'updated'.green, ( elapsedTime + 'ms' ).yellow, '\n' );
  }
  return timestamp() - start;
}


var processors = {},
    presets = {},
    requireLibs = function (requirements) {
      requirements.forEach(function (libName) {
        if( !dir.exists('node_modules/' + libName) ) {
          exec('npm install ' + libName);
        }
      });
    },
    addPreset = function (processorKey, processor, isCollection, requirements) {
      presets[processorKey] = function () {
        if( requirements && requirements.length ) {
          requireLibs(requirements);

          if( !processors[processorKey] ) {
            nitro.fileProcessor(processorKey, processor, isCollection);
          }
        }
      };
    },
    loadPresets = function () {
      [].forEach.call(arguments, function (preset) {
        if( !presets[preset] ) {
          throw new Error('preset not found: ' + preset);
        }

        presets[preset]();
      });
    };

addPreset('log', function (src, fileName, filePath) {
  console.log('fileLog', src, fileName, filePath);
  return src;
});

addPreset('sass', function (src) {
  return require('node-sass').renderSync({ data: src }).css;
}, false, ['node-sass']);

addPreset('uglify', function (src) {
  return require('uglify-js').minify(src, { fromString: true }).code;
}, false, ['uglify-js']);

function parsePath (filePath) {
  var matches = filePath.match(/(.*)\/([^\/]+)/);

  return {
    fileName: ( matches && matches[2] ) || filePath,
    filePath: ( matches && matches[1] ) || null
  };
}

function GlobFile (src, data) {
  if( data && data.fileName ) {
    _.extend(this, data, { src: src });
  } else {
    var cwd = data || '.';
    _.extend(this, parsePath(src), { src: file.read( path.join(cwd, src) ) });
  }
}

GlobFile.prototype.getFullPath = function () {
  return path.join( this.filePath || '.', this.fileName );
};

function fileByName (fileName) {
  return new GlobFile(fileName);
}

function GlobFiles (src, options) {
  options = options || {};
  var cwd = options.cwd || '.';

  if( typeof src === 'string' ) {
    [].push.apply( this, glob.sync(src, options || {}).map(function (filePath) {
      return new GlobFile( file.read( path.join(cwd, filePath) ), parsePath(filePath) );
    }) );
  } else if ( src instanceof Array ) {
    [].push.apply(this, src);
  }
}

function getFileSrc (f) {
  return f.src;
}

GlobFiles.prototype = [];
GlobFiles.prototype.each = GlobFiles.prototype.forEach;

GlobFiles.prototype.add = function (files) {
  [].push.apply(this, files);
  return this;
};

GlobFiles.prototype.process = function (processorKey) {
  if( !processors[processorKey] ) {
    throw new Error('file processor missing: ' + processorKey);
  }

  // console.log('processor', processorKey, processors[processorKey], this);

  return processors[processorKey].call(this);
};

GlobFiles.prototype.concat = function (filter, filePath) {
  if( !filePath ) {
    if( !filter ) {
      throw new Error('GlobFiles.concat :: file path needs to be defined');
    }
    filePath = filter;
  }


  if( filePath !== true ) {
    var files = new GlobFiles();

    files.push( new GlobFile(this.concat(true), parsePath(filePath) ) );
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

GlobFiles.prototype.filter = function (pattern) {
  return new GlobFiles( [].filter(this,  filterPattern(pattern) ) );
};

GlobFiles.prototype.with = function (pattern, processor) {
  var matchPattern = filterPattern(pattern),
      pristine = new GlobFiles(),
      dirty = new GlobFiles();

  for( var i = 0, n = this.length; i < n ; i++ ) {
    if( matchPattern(this[i]) ) {
      dirty.push(this[i]);
    } else {
      pristine.push(this[i]);
    }
  }

  return pristine.concat( processor(dirty) );
};

GlobFiles.prototype.write = function (dest, rename) {
  this.forEach(function (f) {
    file.write( ( rename || noop )( path.join(dest, f.filePath || '.', f.fileName) ), f.src );
  });
};

GlobFiles.prototype.writeFile = function (destFile) {
  file.write( destFile, this.concat(true) );
  return this;
};

function copyFiles (cwd, globSrc, dest, options) {
  glob.sync(globSrc, _.extend( options || {}, cwd ? { cwd: cwd } : undefined ) ).forEach(function (filePath) {
    file.copy( path.join(cwd || options.cwd || '.', filePath) , path.join(dest || '.', filePath) );
  });
  return nitro;
}

function CwdPath () {
  var pcwd = path.join.apply(null, [].slice.call(arguments) );

  this.path = pcwd;
  this.cwd = path.join( process.cwd(), pcwd );
}

CwdPath.prototype.get = function () {
  return this.cwd;
};

CwdPath.prototype.load = function (globSrc) {
  return new GlobFiles(globSrc, { cwd: this.path });
};

function getCwd (p) {
  return new CwdPath(p);
}

getCwd.path = function () {
  return path.join.apply(null, [process.cwd()].concat( [].slice.call(arguments) ) );
};

module.exports = _.extend(nitro, {
  cwd: getCwd,
  exec: exec,
  glob: glob,
  dir: dir,
  file: file,
  copy: copyFiles,
  timestamp: timestamp,
  timingSync: timingSync,
  jshint: launchJShint,
  load: function ( globSrc, options ) {
    return new GlobFiles(globSrc, options);
  },
  autoLoad: loadPresets,
  require: function () {
    requireLibs( [].slice.call(arguments) );
  },
  fileProcessor: function (methodName, processor, isCollection, requirements) {
    if( requirements ) {
      requireLibs(requirements);
    }

    if( isCollection ) {
      processors[methodName] = function () {
        return new GlobFiles( processor(this) || [] );
      };
    } else {
      processors[methodName] = function () {
        var files = new GlobFiles(), f;

        for( var i = 0, n = this.length; i < n ; i++ ) {
          f = this[i];
          files[i] = new GlobFile('' + processor(f.src, f.fileName, f.filePath), f);
        }

        files.length = n;
        return files;
      };
    }
    // GlobFiles.prototype[methodName] = processors[methodName];
    return nitro;
  }
});
