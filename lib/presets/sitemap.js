'use strict';

module.exports = function (nitro) {

  var file = nitro.file,
      template = nitro.template,
      Parole = nitro.require('parole'),
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
        stamp = new Date().toISOString(),
        baseUrl = options.baseUrl.replace(/\/$/, '') + '/',
        getText = function (res) {
          return res.text();
        };

    return nitro.deasync(function (done) {

      fetch( baseUrl + 'sitemap.xml' ).then( getText )
        .then(function (sitemapOrigin) {

          if( !/^<\?xml version="1.0" encoding="UTF-8"\?>/.test(sitemapOrigin) ) {
            throw new Error('sitemap missing');
          }

          var currentSitemap = {};
          sitemapOrigin.replace(/<url>([\s\S]+?)<\/url>/g, function (url, content) {
            var matches = content.match(/<loc>([\s\S]+?)<\/loc>[\s\S]*?<lastmod>([\s\S]+?)<\/lastmod>/);

            if( matches ) {
              currentSitemap[ matches[1] ] = matches[2];
            }
          });

          Parole.all(list.each(function (f) {

            var localPath = f.path;

            return fetch( baseUrl + localPath.replace(/^\//, '') )
              .then(function (res) {
                return res.text().then(function (originSrc) {
                  if( typeof options.mapOrigin === 'function' ) {
                    originSrc = options.mapOrigin( originSrc, localPath );
                  }

                  var local = typeof options.mapLocal === 'function' ? options.mapLocal( f.src, localPath ) : f.src;

                  f.changed = originSrc !== local;
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
                  var filepath = f.path.replace(/index\.\w+$/, '');
                  return {
                    url: filepath,
                    stamp: f.changed ? stamp : ( currentSitemap[ baseUrl + filepath ] || stamp )
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
              locations: list.each(function (f) { return { url: f.path.replace(/index\.\w+$/, ''), stamp: stamp }; }, [])
            })
          })]) );
        });

    })();
  };

};
