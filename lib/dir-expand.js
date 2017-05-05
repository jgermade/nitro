
var mmmatch = require('minimatch'),
    Minimatch = mmmatch.Minimatch,
    fs = require('fs'),
    join = require('path').join,
    arrShift = Array.prototype.shift,
    mapPatterns = function (pattern) {
      return new Minimatch(pattern);
    };

function filePathMatch (filepath, mmatches) {
  return mmatches.reduce(function (matches, mm) {
    if( mm.negate ) return matches && mm.match(filepath);
    return matches || mm.match(filepath);
  }, false);
}

function _expandDir (cwd, dirpath, mmatches) {
  return fs.readdirSync( join(cwd, dirpath) ).reduce(function (found, filename, i) {
    var filepath = join(dirpath, filename),
        stat = fs.statSync( join(cwd, filepath) );

    if( stat.isDirectory() ) found.push.apply(found, _expandDir(cwd, filepath, mmatches) );
    else if( stat.isFile() && filePathMatch(filepath, mmatches) ) found.push(filepath);

    return found;

  }, []);
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
      cwd = /^\//.test(options.cwd || '') ? options.cwd : join(process.cwd(), options.cwd || '');

  return _expandDir( join(cwd, dirpath), '', mmatches );
}

module.exports = expandDir;
