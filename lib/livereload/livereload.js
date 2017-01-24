
(function () {

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var matchedURL = currentScript.src.match(/https?:\/\/(.*?):(\d+)?\//);

  if( matchedURL ) {
    var ws = new Websocket('ws://' + matchedURL[1] + ':' + matchedURL[2]);

    ws.addEventListener('message', function (message) {

      var data = JSON.parse(message.data);

      console.log('changed', data.filepath);

    });
  }

})();
