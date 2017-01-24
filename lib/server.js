'use strict';

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    Parole = require('parole'),
    colors = require('colors'),
    mime = require('mime'),
    cwd = process.cwd(),
    autoRequire = require('./auto-require');

function extend () {
    var dest = [].shift.call(arguments),
      src = [].shift.call(arguments),
      key;

  while( src ) {
    for( key in src) {
      dest[key] = src[key];
    }
    src = [].shift.call(arguments);
  }

  return dest;
}

function noop (value) { return value; }

function clearSlash (path_str) {
  return path_str.replace(/^\/|\/$/g,'');
}

function qStat (filepath) {
  return new Parole(function (resolve, reject) {
    fs.stat(filepath, function (err, stat) {
      if( err !== null ) {
        reject(filepath);
      }
      resolve(stat);
    });
  });
}

function tryFilesFn (basePath, uri, tryFiles) {
  var filepath = tryFiles.shift();

  if( !filepath ) {
    return Parole.reject();
  }

  filepath = path.join( basePath, filepath.replace(/\$uri/, uri) );

  return qStat(filepath).then(function (stat) {

    if( stat.isDirectory() ) {
      filepath += ( ( /\/$/.test(filepath) ? '' : '/' ) + 'index.html' );

      return qStat( filepath ).then(function () {
          return filepath;
        });
    } else if( !stat.isFile() ) {
      throw 'uri is not a file';
    }

    return filepath;
  }).catch(function (reason) {
    return tryFilesFn(basePath, uri, tryFiles);
  });
}

var defaultOptions = {
  protocol: 'http',
  hostname: '0.0.0.0',
  port: 8080,
  root: '.',
  keepalive: false,
  debug: false,
  livereload: false,
  open: false,
  dirAlias: {},
  onStart: noop,
  onStop: noop,
  log: true
};

function runServer (rootpath, options) {
  options = options || {};

  if( typeof rootpath === 'object' && rootpath != null ) {
    options = rootpath;
  } else {
    options.root = rootpath;
  }

  options = extend( Object.create(defaultOptions), options);

  if( options.cwd ) {
    cwd = path.resolve(cwd,options.cwd);
  }

  if( options.debug ) {
    console.log('options : ' + JSON.stringify(options));
  }

  var matchAlias = {};
  Object.keys(options.dirAlias).forEach(function(dir){
    matchAlias[dir] = new RegExp('^' + clearSlash(dir));
  });

  var documentRoot = cwd.replace(/\/$/,'') + ( options.root ? ('/' + options.root) : '' );
  var server = http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname,
        uriClear = clearSlash(uri),
        uriLog = uri,
        basePath = documentRoot,
        // filename = path.join(basePath, uri),
        contentType = "text/plain";

    // if( options.addExtension && /[a-z]$/.test(filename) && !/[a-z]+\.[a-z]+$/.test(filename) ) {
    //   filename += '.' + options.addExtension;
    // }

    if( options.headers ) {
      for( var header in options.headers ) {
        response.setHeader(header, options.headers[header]);
      }
    }

    Object.keys(options.dirAlias).forEach(function (dir) {
      if( matchAlias[dir].test(uriClear) ) {
        var uriRelative = uriClear.replace(matchAlias[dir],'').replace(/^\//,'');
        basePath = cwd;

        // filename = path.join( path.resolve(cwd,options.dirAlias[dir]), uriRelative );
        uri = path.join( options.dirAlias[dir], uriRelative );

        uriLog = ( '/' + dir ).blue + '/' + uriRelative;
      }
    });

    tryFilesFn( basePath, uri.replace(/\/$/, ''), ['$uri'].concat( typeof options.tryFiles === 'string' ? options.tryFiles.split(/\s+/) : (options.tryFiles && options.tryFiles.slice() || ['$uri.html']) ) ).then(function (filepath) {

      if( /\w+\.\w+/.test(filepath) ) {
        contentType = ( mime.lookup( filepath ) || contentType ) + '; charset=UTF-8';
      }

      fs.readFile(filepath, 'binary', function(err, file) {
          if(err) {
              response.writeHead(500, { 'Content-Type': contentType });
              response.write(err + '\n');
              response.end();
              if(options.log) {
                console.log('[500]'.lightred + (' ' + uriLog).cyan );
              }
              return;
          }

          response.writeHead(200, { 'Content-Type': contentType });
          response.write(file, 'binary');
          response.end();
          if(options.log) {
            console.log('[200]'.green + (' ' + uriLog).white + ( '  (' + contentType + ')' ).yellow );
          }
      });

    }, function () {

      response.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8'});
      response.write('<div style=\"text-align: center;\"><div style=\"display: inline-block; min-width: 80%; border: 1px solid #999; padding: 0.5em; text-align: left;\"><div><span style=\"color: red;\">404</span> <span style=\"font-weight: bold;\">'+uri+'</span></div><div>Not Found</div></div></div>');
      response.end();
      if( options.log ) {
        console.log('[404]'.red + (' ' + uriLog).cyan );
      }

    });

  }).listen(parseInt(options.port, 10), options.hostname,function () {
      var url = ( 'http://'+( ( options.hostname === '0.0.0.0' ) ? 'localhost': options.hostname ) + ':' + options.port );

      if( options.log ) {
        console.log('\nStatic file server running at\n  => '.yellow + url.green + '/\nCTRL + C to shutdown\n'.yellow );
        console.log('Root directory is: '.yellow + path.join(cwd, options.root).green + '\n' );
      }

      if( options.onStart instanceof Function ) {
        options.onStart.call(server);
      }

      if( options.openInBrowser ) {
        autoRequire('opn')(url, (typeof options.openInBrowser === 'string') ? { app: options.openInBrowser } : null );
      }

      if( options.livereload ) {
        var watchDirs = [ options.root ],
            livereloadOptions = ( typeof options.livereload === 'number' ) ? {
              port: options.livereload
            } : ( typeof options.livereload === 'object' ? ( options.livereload || {} ) : {} );

        for( var d in options.dirAlias ) {
          watchDirs.push( options.dirAlias[d] );
        }

        if( options.log ) {
          console.log('livereload'.cyan);

          console.log('  dirs'.yellow, watchDirs);
          console.log('  options'.yellow, livereloadOptions);
          console.log('\n');
        }

        autoRequire('livereload').createServer(livereloadOptions).watch(watchDirs.map(function (dir) {
          return path.join(cwd, dir);
        }));
      }
  });

  return server;
}

module.exports = runServer;
