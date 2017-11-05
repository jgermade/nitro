'use strict';

module.exports = function (_nitro) {

  return function (list, file_name) {

    var svg = '<svg xmlns="http://www.w3.org/2000/svg">';

    list.each(function (f) {
      svg += '\n' + f.src
          .replace(/^(.|\n)*?<svg/, '<symbol id="' + f.path.split('/').pop().replace(/\.svg$/, '') + '"')
          .replace(/\s*xmlns:\w+=".*?"/g, '')
          .replace(/<\/svg>/, '</symbol>');
    });

    return list.join(file_name || 'symbols.svg').each(function (f) {
      f.src = svg + '</svg>';
    });

  };

};
