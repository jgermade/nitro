# nitro

NodeJS code building library, focused on simplicicy

<img src="https://avatars1.githubusercontent.com/u/14299087?v=3&s=200" width="100px" align="right"/>

[![npm](https://img.shields.io/npm/v/nitro.svg?maxAge=2592000)](https://www.npmjs.com/package/nitro) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kiltjs/nitro/master/LICENSE)
[![Build Status](https://travis-ci.org/kiltjs/nitro.svg?branch=master)](https://travis-ci.org/kiltjs/nitro) [![npm](https://img.shields.io/npm/dt/nitro.svg?maxAge=2592000)](https://www.npmjs.com/package/nitro)


`nitro` was developed to provide an easy build system for modern languages stack like,
sass, less, coffeescript, or custom stuff through syncronous but fast processing

### Installation

``` sh
npm install nitro --save-dev
```

### Quick Example

``` js
var nitro = require('nitro');

nitro.dir('src').load('{,**/}*.{sass,scss}')
     .process('sass', {
       autoprefix: true,// this options applies postCSS autoprefixer plugin
       minify: true,    // this options applies postCSS cssnano plugin
       groupmedia: true // this applies group-css-media-queries to resulting css
     })
     .write('public/assets/css');

nitro.dir('src').load('{,**/}*.js')
     .process('uglify')
     .write('public/js');

nitro.watch('src')
  .when('{,**/}*.{scss,sass}', function (filename) {
    console.log('sass file', filename, 'has been changed');
  })
  .when('{,**/}*.js', function (filename) {
    console.log('js file', filename, 'has been changed');
  })
;

```

### Basics

> nitro.cwd()

``` js
nitro.cwd('path/to/folder', function (cwd) {
  console.log('value of cwd should match process.cwd()', cwd === process.cwd() );
});
```

> nitro.exec()
> allows syncronous execution of shell commands

``` js
nitro.exec('ls -la');
```

### Files and Directories Processing

> nitro.file

``` js

var file = nitro.file;

// returns true/false if file exists
file.exists('path/to/file.txt');

// returns file contents
file.read('path/to/file.txt');

// returns JSON parsed file contents
file.readJSON('path/to/file.json');

// writes contents to file
file.write('path/to/file.txt', 'new content');

// writes contents to file in JSON format indented by tabs
file.writeJSON('path/to/file.json', { new: 'content' });

// copies through fs stream file to destination
file.copy('path/to/file.txt', 'destination/file.txt');

// returns a function that matches specified filter (string or array of strings)
file.filter(filter);

```

> nitro.dir()
> returns a dir object

``` js
var dirSrc = nitro.dir('src');

// create sub folders :: returns (boolean)
dirSrc.create('sub/folder');

// check if folder exists :: returns (boolean)
dirSrc.exists();

// copy folder contents to destinarion :: returns (boolean)
// (optional) filter: string using minimatch format (https://github.com/isaacs/minimatch)
// dest: destination folder

dirSrc.copy(filter, dest);

// removes selected directory :: returns dirSrc
dirSrc.remove();

// expand contents of directory :: returns list of files that matches filter
// filter: string or array of strings using minimatch format (https://github.com/isaacs/minimatch)
dirSrc.expand(filter);

// alias of nitro.watch(dirPath, handler)
dirSrc.watch(handler);

// creates an instance of class Files() with files matching the filter :: returns filesList
// filter: string or array of strings using minimatch format (https://github.com/isaacs/minimatch)
dirSrc.load(filter);

// equivalent to nitro.load(filter, { cwd: 'src' });

```

> nitro.load(filter, options)

``` js
// creates an instance of class Files() with files matching the filter :: returns filesList
// filter: string or array of strings using minimatch format
var filesList = nitro.load(filter, options)
```



> class Files()
> instance methods, applied to loaded files

``` js
var filesList = nitro.dir('src').load('{,**/}*.js');

// iterate among files in list
filesList.each(function (f) {
  // f is an instance of class File()

  console.log('filename', f.filename );
  console.log('path', f.path );
  console.log('src', f.src );
});

// new loaded files (using same cwd) are appended to current list
filesList.load('{,**/}*.coffee');

  // is equivalent to: nitro.dir('src').load('{,**/}*.{js,coffee}')
  // or to: nitro.dir('src').load(['{,**/}*.js', '{,**/}*.coffee'])


// you can work with a subset of files and if a new list is returned,
// files will be extracted from initial list and appended to remaining files
filesList.with('{,**/}*.coffee', function (coffeeFiles) {
  coffeeFiles.process('coffee-script');
});

// this applies to both js as compiled coffee to js
filesList.process('uglify');

// writes files in defined folder
filesList.write('destination/folder');

// you can join all files into one by:
filesList.writeFile('destination/folder/bundle.js');

// or through:
filesList.join('bundle.js').write('destination/folder');

```

### Working with Tasks

``` js
// file: make.js

var nitro = require('nitro');

nitro.task('sass', function (target) {

  var dev = target === 'dev';

  nitro.dir('src').load('{,**/}*.{sass,scss}')
      .process('sass', {
        autoprefix: true,// this options applies postCSS autoprefixer plugin
        minify: !dev,    // this options applies postCSS cssnano plugin
        groupmedia: true // this applies group-css-media-queries to resulting css
      })
      .write('public/assets/css');

})

nitro.task('js', function (target) {

  var js = nitro.dir('src').load('{,**/}*.js');

  if( target === 'dev' ) {
    js = js.process('uglify').join('app.js');
  }

  js.write('public/js');

});

nitro.task('build', ['sass', 'js']);

nitro.task('build-dev', ['sass:dev', 'js:dev']);

nitro.task('watch', function () {

  nitro.watch('src')
    .when('{,**/}*.{scss,sass}', ['sass:dev'], function (filename) {
      console.log('sass file', filename, 'has been changed');
    })
    .when('{,**/}*.js', ['js:dev'], function (filename) {
      console.log('js file', filename, 'has been changed');
    });

});

nitro.task('dev', ['build-dev', 'watch'], function () {
  nitro.livereload('public', { port: 35729 });
});

nitro.task('live', ['dev'], function () {

  nitro.server('public', {
    livereload: { port: 35729 },
    openInBrowser: true
  });

});

// executing shell command
nitro.run();

```

> main options from shell

``` sh
node make dev
node make live
node make build
```

## Tests

``` sh
make test
```


Wercker: [![wercker status](https://app.wercker.com/status/4518d69bc996c3a4b3e20249ccacb487/s "wercker status")](https://app.wercker.com/project/bykey/4518d69bc996c3a4b3e20249ccacb487)

Travis: [![Build Status](https://travis-ci.org/kiltjs/nitro.svg?branch=master)](https://travis-ci.org/kiltjs/nitro)
