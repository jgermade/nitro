'use strict';

module.exports = function (nitro) {

  var fs = require('fs'),
      path = require('path'),
      defaultDirs = {
        npm: 'node_modules',
        bower: 'bower_components'
      },
      pkgFiles = {
        npm: ['package.json'],
        bower: ['bower.json', '.bower.json']
      };

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

  Dependencies.prototype.expand = function (handler) {
    this.each(function (dependence, version) {
      console.log(  );
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

  function getPackage (pkgName, dependenciesdir ) {
    if( typeof pkgName !== 'string' ) {
      throw new Error('package name is required (npm, bower)');
    }
    var filename = ( pkgFiles[pkgName] || [] ).find(function (filename) {
      return nitro.file.exists(filename);
    });

    if( !filename ) {
      throw new Error(filename + 'not found');
    }

    return new Package(
      nitro.file.readJSON(filename), {
        dependenciesdir: dependenciesdir || getDependenciesDir(pkgName)
      });
  }

  return getPackage;

};
