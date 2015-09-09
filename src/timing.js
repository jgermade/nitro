
'use strict';

function timestamp () {
  return new Date().getTime();
}

function timingLog ( dest, fn ) {
  if( dest instanceof Function ) {
    fn = dest;
    dest = null;
  }

  var start = timestamp();
  fn();
  var elapsedTime = timestamp() - start;
  if( dest ) {
    console.log('\n' + dest, 'updated'.green, ( elapsedTime + 'ms' ).yellow, '\n' );
  }
  return timestamp() - start;
}

module.exports = {
  stamp: timestamp,
  log: timingLog
};
