
var arrayPush = Array.prototype.push,
    arraySlice = Array.prototype.slice;

function _sanitizePath(path, i, last) {
  if( i > 0 ) path = path.replace(/^\.*\//, '');
  if( !last ) path = path.replace(/\/$/, '');
  return path.split(/\/+/);
}

function _joinPaths (paths) {
  var last = paths.length - 1;
  return paths.reduce(function (result, path, i) {

    if( path === '.' ) return result;
    if( /^\//.test(path) ) return _sanitizePath(path, 0, i === last );

    path = path.replace(/\.\.\//g, function () {
      result = result.slice(0, -1);
      return '';
    }).replace(/\.\//, '');

    arrayPush.apply( result, _sanitizePath(path, i, i === last) );

    return result;

  }, []).join('/');
}

function _unraise (paths) {
  var result = [];

  paths.forEach(function (path) {
    if( !path ) return;

    // https://jsperf.com/array-prototype-push-apply-vs-concat/17
    if( path instanceof Array ) arrayPush.apply(result, _unraise(path) );
    else if( typeof path === 'string' ) result.push(path);
    else throw new Error('paths parts should be Array or String');
  });

  return result;
}

function joinPaths () {
  return _joinPaths( _unraise(arraySlice.call(arguments)) );
}

// node env

var cwd = process.cwd();
joinPaths.root = function () {
  return joinPaths(cwd, arraySlice.call(arguments) );
};

joinPaths.cwd = function () {
  return joinPaths(process.cwd(), arraySlice.call(arguments) );
};

module.exports = joinPaths;
