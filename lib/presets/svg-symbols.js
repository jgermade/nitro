'use strict';

module.exports = function (nitro) {

  return function (list, options) {

  	var svg = '<svg xmlns="http://www.w3.org/2000/svg">';

  	list.each(function (f) {
  		svg += '\n' + f.src
          .replace(/^(.|\n)*?\<svg/, '<symbol id="' + f.path.split('/').pop().replace(/\.svg$/, '') + '"')
          .replace(/\s*xmlns:\w+=".*?"/g, '')
          .replace(/<\/svg>/, '</symbol>');
  	});

  	return list.join('symbols.svg').each(function (f) {
  		f.src = svg + '</svg>';
  	});

  };

};
