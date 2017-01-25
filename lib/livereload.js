
var ws = require('ws'),
    fs = require('fs');
    nodeWatch = require('node-watch');

module.exports = function (server, dirpath, options) {

  options = options || {};

  var filepaths = [],
      notify,
      listeners = [];

  (dirpath instanceof Array ? dirpath : [dirpath]).forEach(function (dirpath, i) {

    // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
    nodeWatch(dirpath, function (filepath, eventType) {

      filepaths.push({
        path: ( i ? ( dirpath + '/' ) : '' ) + filepath,
        event: eventType,
        time: Date.now()
      });

      if( notify ) clearTimeout(notify);

      notify = setTimeout(function () {
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
