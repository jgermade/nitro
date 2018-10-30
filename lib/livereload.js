
var ws = require('ws'),
    joinPaths = require('./join-paths'),
    color = require('./color'),
    // fs = require('fs'),
    chokidar = require('chokidar'),
    _remove = function (list, item) {
      for( var i = list.length - 1 ; i >= 0 ; i-- ) {
        if( list[i] === item ) list.splice(i, 1);
      }
    };

module.exports = function (server, dirpath, options) {

  options = options || {};

  var files = [],
      notify,
      listeners = [];

  (dirpath instanceof Array ? dirpath : [dirpath]).forEach(function (dirpath, i) {

    // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
    // nodeWatch(dirpath, function (filepath, eventType) {

    var RE_removeBase = new RegExp('^' + joinPaths.root(dirpath) + '\\/');

    chokidar.watch( joinPaths.root(dirpath), {
      ignoreInitial: true
    }).on('all', function (event, filepath) {

      files.push({
        path: ( i ? ( dirpath + '/' ) : '' ) + filepath.replace(RE_removeBase, ''),
        event: event,
        time: Date.now()
      });

      if( notify ) clearTimeout(notify);

      notify = setTimeout(function () {
        listeners.forEach(function (listener) {
          listener({ files: files, time: Date.now() });
        });
        files.splice(0, files.length);
        clearTimeout(notify);
      }, 400);

    });

  });

  var socket = new ws.Server({ server: server });
  socket.on('connection', function(w) {

    var listener = function (data) {
      try {
        if( w.readyState !== ws.OPEN ) return;
        w.send(JSON.stringify(data));
      } catch(err) {
        console.log('livereload.send:error', err);
      }
    };

    listeners.push(listener);

    // w.on('message', function(msg){
    //   console.log('message from client', msg);
    // });

    w.on('close', function() {
      _remove(listeners, listener);
    });
  });

  var highlight = options.highlight || function (value) { return color.blueBright(value); };

  function listeningLog() {
console.log(color.yellow('\nlivereload snippet:') + highlight(`\n
(function (h,s) {
  s.type='text/javascript';s.src='//' + location.hostname + ':${ server.address().port }/livereload.js';h.appendChild(s);
})(document.getElementsByTagName('head')[0], document.createElement('script') );\n`) );
  }

  if( server.listening ) listeningLog();
  else server.on('listening', listeningLog);
};
