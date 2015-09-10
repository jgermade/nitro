
'use strict';

function timestamp () {
  return new Date().getTime();
}

function timingLog ( dest, action, fn ) {
  if( dest instanceof Function ) {
    fn = dest;
    dest = null;
  }

  if( action instanceof Function ) {
    fn = action;
    action = null;
  }

  var start = timestamp();
  fn();
  var elapsedTime = timestamp() - start;
  if( dest ) {
    if( action ) {
      console.log('\n' + dest, action.green, ( elapsedTime + 'ms' ).yellow, '\n' );
    } else {
      console.log('\n' + dest, ( elapsedTime + 'ms' ).yellow, '\n' );
    }
  }
  return timestamp() - start;
}

module.exports = {
  stamp: timestamp,
  log: timingLog
};
