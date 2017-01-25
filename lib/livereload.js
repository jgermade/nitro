
var ws = require('ws'),
    path = require('path'),
    // fs = require('fs'),
    chokidar = require('chokidar');

module.exports = function (server, dirpath, options) {

  options = options || {};

  var filepaths = [],
      notify,
      listeners = [];

  (dirpath instanceof Array ? dirpath : [dirpath]).forEach(function (dirpath, i) {

    // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
    // nodeWatch(dirpath, function (filepath, eventType) {

    var RE_removeBase = new RegExp('^' + path.join(process.cwd(), dirpath) + '\\/');

    chokidar.watch( path.join(process.cwd(), dirpath), {
      ignoreInitial: true
    }).on('all', function (event, filepath) {

      filepaths.push({
        path: ( i ? ( dirpath + '/' ) : '' ) + filepath.replace(RE_removeBase, ''),
        event: event,
        time: Date.now()
      });

      if( notify ) clearTimeout(notify);

      notify = setTimeout(function () {
        console.log('livereload', filepaths);
        listeners.forEach(function (listener) {
          listener(filepaths);
        });
        filepaths.splice(0, filepaths.length);
        clearTimeout(notify);
      }, 10);

    });

  });

  var socket = new ws.Server({ server: server });
  socket.on('connection', function(w) {

    var livereload = function (data) {
      try {
        w.send(JSON.stringify(data));
      } catch(err) {}
    };

    listeners.push(livereload);

    // w.on('message', function(msg){
    //   console.log('message from client', msg);
    // });

    w.on('close', function() {
      var index = listeners.indexOf(livereload);
      if( index != -1 ) listeners.splice(index, 1);
    });
  });

  var highlight = options.highlight || function (value) { return value.cyan; };

  function listeningLog() {
console.log('\nlivereload snippet:'.yellow + highlight(`\n
(function (h,s) {
  s.type='text/javascript';s.src='//' + location.hostname + ':${ server.address().port }/livereload.js';h.appendChild(s);
})(document.getElementsByTagName('head')[0], document.createElement('script') );\n`) );
  }

  if( server.listening ) listeningLog();
  else server.on('listening', listeningLog);
};
