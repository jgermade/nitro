'use strict';

module.exports = function (nitro) {

  var _ = nitro.tools,
      fs = require('fs'),
      path = require('path'),
      defaultDirs = {
        npm: 'node_modules',
        bower: 'bower_components'
      },
      pkgFiles = {
        npm: ['package.json'],
        bower: ['bower.json', '.bower.json']
      };

  function pkgFileName (pkgName, cwd) {
    cwd = cwd || '.';

    return ( pkgFiles[pkgName] || [] ).find(function (filename) {
      return nitro.file.exists( path.join(cwd, filename) );
    });
  }

  function readPkg (pkgName, cwd) {
    var filename = pkgFileName(pkgName, cwd);

    if( !filename ) {
      throw new Error(filename + ' not found in ' + path.join(process.cwd(), cwd || '.') + ' for pkg: ' + pkgName);
    }

    return nitro.file.readJSON( path.join(cwd || '.', filename) );
  }

  // Dependencies

  function getDependenciesDir (pkgName) {
    try {
      return JSON.parse( fs.readFileSync( '.' + pkgName + 'rc', { encoding: 'utf8' }) ).directory;
    } catch (err) {
      return defaultDirs[pkgName];
    }
  }

  function Dependencies ( pkg, type ) {
    var dependenciesKey = type ? ( type + 'Dependencies' ) : 'dependencies';
    this.pkg = pkg;

    this.dependencies = pkg.data[dependenciesKey];
  }

  Dependencies.prototype.getList = function () {
    return this.dependencies;
  };

  Dependencies.prototype.each = function (handler) {
    for( var key in this.dependencies ) {
      handler(key, this.dependencies[key]);
    }

    return this;
  };

  function expandDependencies (dependencies, options, found, map) {
    options = options || {};
    found = found || [];
    map = map || {};

    var meta = dependencies.pkg.meta,
        filter = options.filter || function () { return true; };

    dependencies.each(function (dependence, version) {
      if( map[dependence] || !filter(dependence, version) ) {
        return;
      }
      map[dependence] = true;

      var pkg = readPkg(meta.name, path.join(meta.dependenciesdir, dependence) ),
          dependencedir = path.join( meta.dependenciesdir, dependence ),
          pkgMain = dependencies.pkg.data.overrides && dependencies.pkg.data.overrides[dependence] && dependencies.pkg.data.overrides[dependence].main || pkg.main;

      _.extend(pkg, (dependencies.pkg.data.extend || {})[dependence] || {});
      _.merge(pkg, (dependencies.pkg.data.merge || {})[dependence] || {});

      if( pkgMain ) {
        found = found.concat( nitro.dir( dependencedir ).expand(pkgMain).map(function (filename) {
          return path.join(dependence, filename);
        }) );
      }

      if( options.inCascade && pkg.dependencies ) {
        var cwd;
        if( nitro.dir.exists( path.join(dependencedir, meta.dependenciesdir) ) ) {
          cwd = process.cwd();
          process.chdir( dependencedir );
        }

        found = found.concat(
          expandDependencies( new Package(pkg, meta).dependencies(), options, [], map )
            .map(function (filepath) {
              return cwd ? path.join(dependencedir, filepath) : filepath;
            })
        );

        if( cwd ) {
          process.chdir( cwd );
        }
      }
    });

    return found;
  }

  function inDependenceList (dependenceName) {
    return function (matcher) {
      return matcher instanceof RegExp ? matcher.test(dependenceName) : dependenceName === matcher;
    };
  }

  Dependencies.prototype.expand = function (inCascade, options) {

    if( typeof inCascade === 'boolean' )   options = options ||{ inCascade: inCascade };
    else if( typeof options === 'string' ) options = { filter: [inCascade] };
    else if( options instanceof Array )    options = { filter: inCascade };
    else options = inCascade || {};

    options.filter = options.filter || (options.only && function (dependenceName) {
      return options.only.some( inDependenceList(dependenceName) );
    }) || (options.exclude && function (dependenceName) {
      return !options.exclude.some( inDependenceList(dependenceName) );
    }) || undefined;

    return expandDependencies( this, options );
  };

  Dependencies.prototype.copy = function (dest, options) {
    var dependenciesdir = this.pkg.meta.dependenciesdir;

    options = options || {};
    if( options.expand === undefined ) {
      options.expand = true;
    }

    expandDependencies( this, options ).forEach(function (filepath) {
      var filepathFull = path.join(dependenciesdir, filepath);

      if( nitro.isFile(filepathFull) ) {
        nitro.file.copy( filepathFull, path.join(dest, options.expand ? filepath : nitro.file.parsePath(filepath).filename ) );
      } else if( nitro.isDir(filepathFull) ) {
        nitro.dir.copy( filepathFull, path.join( dest, filepath ) );
      }
    });
    return this;
  };

  // Package

  function Package (data, meta) {
    this.data = data;
    this.meta = meta;
  }

  Package.prototype.dependencies = function (type) {
    return new Dependencies(this, type);
  };

  var partIndex = {
    mayor: 0,
    minor: 1,
    build: 2,
    patch: 2
  };

  Package.prototype.version = function (part) {
    if( part ) {
      return this.data.version.split('.')[partIndex[part]];
    }
    return this.data.version;
  };

  Package.prototype.setVersion = function (version) {
    var filename = pkgFileName(this.meta.name);
    this.data.version = version;
    nitro.file.writeJSON(filename, this.data, '  ');
    return this;
  };

  Package.prototype.increaseVersion = function (part) {
    part = part || 'build';

    if( part ) {
      var versionParts = this.data.version.split('.');
      versionParts[partIndex[part]] = Number(versionParts[partIndex[part]]) + 1;
      this.setVersion( versionParts.join('.') );
    }
    return this;
  };

  function getPackage (pkgName, dependenciesdir ) {
    pkgName = pkgName || 'npm';

    return new Package(
      readPkg(pkgName), {
        name: pkgName,
        dependenciesdir: dependenciesdir || getDependenciesDir(pkgName)
      });
  }

  return getPackage;

};
