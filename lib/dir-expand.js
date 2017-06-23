
var mmmatch = require('minimatch'),
    Minimatch = mmmatch.Minimatch,
    fs = require('fs'),
    join = require('path').join,
    arrShift = Array.prototype.shift,
    mapPatterns = function (pattern) {
      return new Minimatch(pattern.replace(/^\.\//, ''));
    };

function filePathMatch (filepath, mmatches) {
  return mmatches.reduce(function (matches, mm) {
    if( mm.negate ) return matches && mm.match(filepath);
    return matches || mm.match(filepath);
  }, false);
}

function _expandDir (cwd, dirpath, mmatches) {
  var files = [],
      directories = [];

  fs.readdirSync( join(cwd, dirpath) ).forEach(function (filename) {
    var filepath = join(dirpath, filename),
        stat = fs.statSync( join(cwd, filepath) );

    if( stat.isFile() && filePathMatch(filepath, mmatches) ) files.push(filepath);
    else if( stat.isDirectory() ) directories.push.apply(directories, _expandDir(cwd, filepath, mmatches) );

  });

  return files.concat(directories);
}

function orderFiles (files, mmatches) {
  var results = [], tmp = files.slice();

  mmatches.forEach(function (mm) {
    var pushFile = function (file) {
      if( mm.match(file) ) results.push(file);
      else tmp.push(file);
    };

    if( mm.negate ) results.splice(0, results.length).forEach(pushFile);
    else tmp.splice(0, tmp.length).forEach(pushFile);
  });

  return results;
}

function expandDir (/* patterns[, dirpath][, options][, done] */) {

  var patterns = arrShift.call(arguments),
      done = arrShift.call(arguments),
      dirpath = '',
      options = {};

  if( typeof done === 'string' ) {
    dirpath = done; done = arrShift.call(arguments);
  }
  if( typeof done === 'object' ) {
    options = done; done = arrShift.call(arguments);
  }

  var mmatches = (typeof patterns === 'string' ? [patterns] : patterns).map(mapPatterns),
      cwd = /^\//.test(options.cwd || '') ? options.cwd : join(process.cwd(), options.cwd || ''), stat;

  try{
    stat = fs.statSync( join(cwd, dirpath) );
  } catch(err) {
    return [];
  }

  return orderFiles( (stat && stat.isDirectory()) ? _expandDir( join(cwd, dirpath), '', mmatches ) : [] , mmatches);
}

expandDir.filter = function (expandedList, globList) {
  return orderFiles( expandedList, (typeof globList === 'string' ? [globList] : globList).map(mapPatterns) );
};

module.exports = expandDir;
