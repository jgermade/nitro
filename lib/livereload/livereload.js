
(function () {

  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function updateStyleHref (href) {
    var qs = href.split('?'),
        resource = qs[0];

    qs = (qs[1] || '').replace(/&livereload=\d+/, '');

    return resource + '?' + qs + (qs ? '&' : '') + 'livereload=' + new Date().getTime();
  }

  var matchedURL = currentScript.src.match(/https?:\/\/(.*?):(\d+)?\//);

  if( matchedURL ) {
    var ws = new WebSocket('ws://' + matchedURL[1] + ':' + matchedURL[2]);

    ws.addEventListener('message', function (message) {

      var filepaths = JSON.parse(message.data),
          baseURL = location.protocol + '//' + location.host + '/';
          styles = [];

      filepaths.forEach(function (f) {
        if( /\.css$/.test(f.path) ) styles.push(baseURL + f.path);
      });

      if( filepaths.length !== styles.length ) {
        location.reload();
      } else {
        console.log('updating', filepaths.map(function (f) { return f.path; }) );
        var links = {};
        [].forEach.call(document.querySelectorAll('link[rel=stylesheet]'), function (link) {
          links[ link.href.split('?')[0] ] = link;
        });
        styles.forEach(function (stylePath) {
          if( links[stylePath] ) links[stylePath].href = updateStyleHref(links[stylePath].href);
        });
      }

      // console.log('filepaths', filepaths);

    });
  }

})();
