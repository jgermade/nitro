
var glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    JSHINT = require('jshint').JSHINT,
    // childProcess = require('child_process'),
    // spawn = childProcess.spawn,
    shell = require('shelljs'),
    noop = function () {};

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

function cwd () {
  var paths = [process.cwd()];
  [].push.apply(paths, arguments);
  return path.join.apply(null, paths );
}

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
    console.log('\n' + dest, 'updated'.green, ( elapsedTime + 'ms' ).yellow );
  }
  return timestamp() - start;
}

function GlobFile (src, data) {
  if( !data ) {
    var matches = src.match(/(.*)\/([^\/]+)/);

    this.fileName = ( matches && matches[2] ) || src;
    this.filePath = ( matches && matches[1] ) || null;
    this.src = file.read(src);
  } else if( data && data.fileName ) {
    this.fileName = data.fileName;
    this.filePath = data.filePath;
    this.src = src;
  }
}

function fileByName (fileName) {
  return new GlobFile(fileName);
}

function GlobFiles (src) {
  if( typeof src === 'string' ) {
    [].push.apply(this, glob.sync(src).map(fileByName) );
  } else if ( src instanceof Array ) {
    [].push.apply(this, src);
  }
}

function getFileSrc (f) {
  return f.src;
}

GlobFiles.prototype = [];
GlobFiles.prototype.each = GlobFiles.prototype.forEach;

GlobFiles.prototype.append = function (files) {
  [].push.apply(this, files);
  return this;
};

GlobFiles.prototype.concat = function (fileName) {
  if( fileName ) {
    return new GlobFiles([new GlobFile(this.concat(), { fileName: fileName })]);
  } else {
    return this.map(getFileSrc).join('');
  }
};

GlobFiles.prototype.write = function (dest) {

};

GlobFiles.prototype.writeFile = function (destFile) {
  file.write( destFile, this.concat() );
  return this;
};

var nitro = {
  cwd: cwd,
  exec: exec,
  glob: glob,
  dir: dir,
  file: file,
  timestamp: timestamp,
  timingSync: timingSync,
  jshint: launchJShint,
  load: function ( globSrc ) {
    return new GlobFiles(globSrc);
  },
  fileProcessor: function (methodName, processor, isCollection) {
    if( isCollection ) {
      GlobFiles.prototype[methodName] = function () {
        return new GlobFiles( processor(this) || [] );
      };
    } else {
      GlobFiles.prototype[methodName] = function () {
        var files = new GlobFiles();

        for( var i = 0, n = this.length; i < n ; i++ ) {
          files[i] = new GlobFile(processor(this[i].src), this[i]);
        }

        files.length = n;
        return files;
      };
    }
    return nitro;
  }
};

module.exports = nitro;
