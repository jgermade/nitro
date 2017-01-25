
'use strict';

function timestamp () {
  return new Date().getTime();
}

var color = require('./color');

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
      console.log('\n' + dest, color.green(action), color.yellow( elapsedTime + 'ms' ), '\n' );
    } else {
      console.log('\n' + dest, color.yellow( elapsedTime + 'ms' ), '\n' );
    }
  }
  return timestamp() - start;
}

module.exports = {
  stamp: timestamp,
  log: timingLog
};
