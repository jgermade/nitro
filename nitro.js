
var glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    childProcess = require('child_process'),
    spawn = childProcess.spawn,
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

function exec(cmd, args, onData, onEnd) {
    var child = spawn(cmd, args || []),
        me = this;

    if( args instanceof Function ) {
      onEnd = onData || noop;
      onData = args || noop;
      args = {};
    } else {
      onData = onData || noop;
      onEnd = onEnd || noop;
    }

    child.stdout.on('data', function (buffer) {
      onData(me, buffer);
    });

    child.stdout.on('end', onEnd);
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
    this.src = file.read(filePath);
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
  } else {
    throw new Error('src should be a string or an array');
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

module.exports = {
  exec: exec,
  dir: dir,
  file: file,
  timestamp: timestamp,
  timingSync: timingSync,
  src: function ( globSrc ) {
    return new GlobFiles(globSrc);
  },
  processorEach: function (methodName, processor) {
    GlobFiles.prototype[methodName] = function () {
      var files = new GlobFiles();

      for( var i = 0, n = this.length; i < n ; i++ ) {
        files[i] = new GlobFile(processor(this[i].src), this[i]);
      }

      files.length = n;
      return files;
    };
  },
  processorBatch: function (methodName, processor) {
    GlobFiles.prototype[methodName] = function () {
      return new GlobFiles( processor(this) || [] );
    }
  }
};
