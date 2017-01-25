
var ws = require('ws'),
    fs = require('fs');
    // watch = require('node-watch');

module.exports = function (server, dirpath, options) {

  options = options || {};

  var filepaths = [],
      notify,
      listeners = [];

  (dirpath instanceof Array ? dirpath : [dirpath]).forEach(function (dirpath, i) {

    fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {

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

  // watch(dirpath, function (filepath) {
  // fs.watch(dirpath, { recursive: true }, function (eventType, filepath) {
  //
  //   filepaths.push({
  //     filepath: filepath,
  //     event: eventType,
  //     time: Date.now()
  //   });
  //
  //   if( notify ) clearTimeout(notify);
  //
  //   notify = setTimeout(function () {
  //     listeners.forEach(function (listener) {
  //       listener(filepaths);
  //     });
  //     filepaths.splice(0, filepaths.length);
  //     clearTimeout(notify);
  //   }, 10);
  //
  // });

  // var wss = options.server || server(__dirname + '/livereload', { port: options.port || 12345 });
  var socket = new ws.Server({ server: server });
  socket.on('connection', function(w) {

    var livereload = function (data) {
      w.send(JSON.stringify(data));
    };

    listeners.push(livereload);

    w.on('message', function(msg){
      console.log('message from client', msg);
    });

    w.on('close', function() {
      var index = listeners.indexOf(livereload);
      if( index != -1 ) listeners.splice(index, 1);
      // console.log('closing connection');
    });
  });

};
