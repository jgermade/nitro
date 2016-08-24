'use strict';

module.exports = function (nitro) {

  nitro.addPreset('sitemap', function () {

    var file = nitro.file,
        template = nitro.template,
        $q = nitro.require('q-promise'),
        fetch = nitro.require('node-fetch');

    return function (list, options) {

      if( typeof options === 'string' ) {
        options = { baseUrl: options };
      } else if( !options ) {
        throw new Error('sitemap requires options');
      }

      if( !options.baseUrl ) {
        throw new Error('sitemap requires options.baseUrl');
      }

      var sitemap = template( file.read(__dirname + '/sitemap.xml') ),
          locations = [],
          stamp = new Date().toString(),
          baseUrl = options.baseUrl.replace(/\/$/, '') + '/',
          getText = function (res) {
            return res.text();
          };

      return nitro.deasync(function (done) {

        fetch( baseUrl + 'sitemap.xml' ).then( getText )
          .then(function (body) {

            if( !/^<\?xml version="1.0" encoding="UTF-8"\?>/.test(body) ) {
              throw new Error('sitemap missing');
            }

            var currentSitemap = {};
            body.replace(/<url>([\n.]+)<\/url>/, function (url, content) {
              var matches = content.match(/<loc>([\n.]+)<\/loc>[\n.]*<lastmod>([\n.]+)<\/lastmod>/);

              if( matches ) {
                currentSitemap[ matches[1] ] = matches[2];
              }
            });

            $q.all(list.each(function (f) {

              return fetch( baseUrl + f.getPath().replace(/^\//, '') )
                .then(function (res) {
                  return res.text().then(function (body) {
                    f.changed = body !== f.getSrc();
                    return f;
                  });
                }, function () {
                  f.changed = true;
                  return f;
                });

            }, [])).then(function (fetched) {

              done(null, list.new([new list.File({
                cwd: '.',
                filename: 'sitemap.xml',
                src: sitemap({
                  baseUrl: baseUrl,
                  locations: [].map.call(fetched, function (f) {
                    return {
                      url: f.getPath(),
                      stamp: f.changed ? stamp : currentSitemap[ baseUrl + f.getPath().replace(/index\.\w+$/, '') ]
                    };
                  })
                })
              })]) );

            });

          }).catch(function () {
            done(null, list.new([new list.File({
              cwd: '.',
              filename: 'sitemap.xml',
              src: sitemap({
                baseUrl: options.baseUrl.replace(/\/$/, '') + '/',
                locations: list.each(function (f) { return { url: f.getPath().replace(/index\.\w+$/, ''), stamp: stamp }; }, [])
              })
            })]) );
          });

      })();
    };

  }, true);

};
