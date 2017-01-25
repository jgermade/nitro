
// from: https://github.com/Marak/colors.js/blob/master/lib/colors.js
// @TODO https://en.wikipedia.org/wiki/ANSI_escape_code

const ESC = '\u001b';

var styles = {};
var color = {};

var codes = {
  reset: [0, 0],

  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  blackBright: [30, 39, true],
  redBright: [31, 39, true],
  greenBright: [32, 39, true],
  yellowBright: [33, 39, true],
  blueBright: [34, 39, true],
  magentaBright: [35, 39, true],
  cyanBright: [36, 39, true],
  whiteBright: [37, 39, true],
  grayBright: [90, 39, true],
  greyBright: [90, 39, true],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  // legacy styles for colors pre v1.0.0
  blackBG: [40, 49],
  redBG: [41, 49],
  greenBG: [42, 49],
  yellowBG: [43, 49],
  blueBG: [44, 49],
  magentaBG: [45, 49],
  cyanBG: [46, 49],
  whiteBG: [47, 49]

};

Object.keys(codes).forEach(function (key) {
  var val = codes[key];
  var style = styles[key] = [];
  style.open = ESC + '[' + (val[2] ? '1;' : '') + val[0] + 'm';
  style.close = ESC + '[' + (val[2] ? '0;' : '') + val[1] + 'm';
});

Object.keys(styles).forEach(function (key) {
  if( !styles[key] ) throw new Error('missing color ' + key);
  var open = styles[key].open,
      close = styles[key].close;
  color[key] = function (text) {
    return open + text + close;
  }

  // String.prototype.__defineGetter__(key, function () {
  //   return open + this + close;
  // });
});

module.exports = color;
