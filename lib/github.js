
module.exports = function (nitro) {

  var remotes,
      getRemotes = function () {

        if( remotes ) {
          return remotes;
        }

        var remoteLines = ('' + nitro.exec('git remote -v')).split('\n').filter(function (line) {
          return line.length;
        }),
        remotes = {};

        remoteLines.forEach(function (line) {
          var matched = line.match(/(\w+)\sgit@(\w+\.\w+):(.*?)\/(.*?)\.git \((.*?)\)$/);

          if( matched ) {
            remotes[matched[1] + '-' + matched[5] ] = {
              line: matched[0],
              hostname: matched[2],
              owner: matched[3],
              repo: matched[4]
            };
          } else {
            matched = line.match(/(\w+)\shttps:\/\/(\w+\.\w+)\/(.*?)\/(.*?)\.git \((.*?)\)$/);

            if( matched ) {
              remotes[matched[1] + '-' + matched[5] ] = {
                line: matched[0],
                hostname: matched[2],
                owner: matched[3],
                repo: matched[4]
              };
            }
          }
        });

        if( !remotes['origin-fetch'] ) {
          console.warn('origin fetch missing');
        }

        if( !remotes['origin-push'] ) {
          console.warn('origin push missing');
        }

        var remote = remotes['origin-fetch'];

        remotes.default = remote;
        remotes.isGithub = remote.hostname === 'github.com';

        return remotes;
      },
      parseVersion = function (tag_name) {
        var matches = tag_name.match(/^v(.*?)\.(.*?)\.(.*?)$/);

        return {
          major: Number(matches[1]),
          minor: Number(matches[2]),
          build: Number(matches[3])
        };
      }

  return {
    release: function (releaseName, release, done) {
      release = release || {};

      var _ = nitro.tools,
          remotes = getRemotes(),
          remote = remotes.default;

      if( typeof releaseName === 'object' && releaseName !== null ) {
        done = release;
        release = releaseName;
        releaseName = release.name;
      }

      done = done || nitro.noop;

      if( !remotes.isGithub ) {
        throw new Error('origin is not github');
      }

      var releasesUrl = `https://api.github.com/repos/${remote.owner}/${remote.repo}/releases`;

      console.log('creating release', `${remote.owner}/${remote.repo}`);

      var fetch = nitro.require('node-fetch');

      // fetching latest release
      fetch(releasesUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': `release-${remote.owner}-${remote.repo}`,
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
          }
        })
        .then(function(res) {
          if( res.status >= 200 && res.status < 300 ) {
            return res.json();
          }

          return null;
        }, function () {
          console.error(res);
          process.exit(2);
        })
        .then(function(releases) {
          var v = (releases && releases.length) ? releases.reduce(function (prev, release) {
            var version = parseVersion(release.tag_name);

            if( prev ) {
              if( prev.major > version.major ) {
                return prev;
              } else if( prev.major < version.major ) {
                return version;
              } else if( prev.minor > version.minor ) {
                return prev;
              } else if( prev.minor < version.minor ) {
                return version;
              } else if( prev.build > version.build ) {
                return prev;
              }
              return version;
            }
            return version;
          }, null) : { major: 0, minor: 0, build: 0 };

          return v;
        })

      .then(function (v) {
        var version;

        if( releaseName === 'build' || releaseName === undefined ) {
          v.build = v.build + 1;
        } else if( releaseName === 'minor' ) {
          v.minor = v.minor + 1;
        } else if( releaseName === 'major' ) {
          v.major = v.major + 1;
        } else {
          version = releaseName;
        }

        if( !version ) {
          version = `v${v.major}.${v.minor}.${v.build}`;
        }
        console.log('version', version);

        return fetch(releasesUrl, {
            method: 'POST',
            body: JSON.stringify({
              "tag_name": release.tag || version,
              "target_commitish": release.branch || 'master',
              "name": version,
              "body": ` Release ${version}`,
              "draft": false,
              "prerelease": false
            }),
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': `release-${remote.owner}-${remote.repo}`,
              'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
          }).then(function(res) {
            if( res.status >= 200 && res.status < 300 ) {
              // console.log(res.ok);
              // console.log(res.status);
              // console.log(res.statusText);
              // console.log(res.headers.raw());
              return res.json();
            }
            console.error(res);
            throw res;
          });
      }, function () {
        console.error('bye', res);
        process.exit(2);
      })

      .then(function (r) {
        // console.log('release', r);

        var attachments = typeof release.attach === 'string' ? [release.attach] : release.attach;

        if( attachments ) {
          // console.log('attachments', attachments );

          var mime = nitro.require('mime');

          return nitro.require('q-promise').all(
            nitro.load(attachments).each(function (f) {
              return fetch(`https://uploads.github.com/repos/${remote.owner}/${remote.repo}/releases/${r.id}/assets?name=${ f.path.split('/').pop() }`, {
                method: 'POST',
                body: f.src,
                headers: {
                  'Accept': 'application/vnd.github.v3+json',
                  'Content-Type': mime.lookup(f.path),
                  'User-Agent': `release-${remote.owner}-${remote.repo}`,
                  'Authorization': `token ${process.env.GITHUB_TOKEN}`
                }
              });
            }, [])
          ).then(function () {
            done(null);
          }, function (res) {
            done(res);
          });
        }

        done(null);

      }, function (err) {
        console.error(err);
      });
    }
  };

  // console.log( remoteLines, remotes );

};
