nitro [![wercker status](https://app.wercker.com/status/4518d69bc996c3a4b3e20249ccacb487/s/master "wercker status")](https://app.wercker.com/project/bykey/4518d69bc996c3a4b3e20249ccacb487)
=================

About
------------
nitro was developed to provide an easy build system for modern languages stack like,
sass, less, coffeescript, or custom stuff through syncronous but fast processing

Installation
------------
``` sh
npm install nitro --save-dev
```

Quick Example
-------------
``` js
var nitro = require('nitro');

nitro.cwd('src').load('*.{sass,scss}').process('sass').write('dist/assets/css');

nitro.cwd('src').load('*.{js}').process('uglify').write('dist/js');

nitro.watch('src')
  .when('{,**/}*.{scss,sass}', function (filename) {
    console.log('sass file', filename, 'has been changed');
  })
  .when('{,**/}*.js', function (filename) {
    console.log('js file', filename, 'has been changed');
  })
;

```

Basics
------

> nitro.cwd()

``` js
nitro.cwd('path/to/folder', function (cwd) {
  console.log('value of cwd should match process.cwd()', cwd === process.cwd() );
});
```

> nitro.exec()
> allows execution of shell commands

``` js
nitro.exec('ls -la');
```

Files and Directories Processing
--------------------------------

> nitro.file

``` js

// returns true/false if file exists
nitro.file.exists('path/to/file.txt');

// returns file contents
nitro.file.read('path/to/file.txt');

// returns JSON parsed file contents
nitro.file.readJSON('path/to/file.json');

// writes contents to file
nitro.file.write('path/to/file.txt', 'new content');

// writes contents to file in JSON format indented by tabs
nitro.file.writeJSON('path/to/file.json', { new: 'content' });

// copies through fs stream file to destination
nitro.file.copy('path/to/file.txt', 'destination/file.txt');

// returns a function that matches specified filter (string or array of strings)
nitro.file.filter(filter);

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
  console.log('path', f.getPath() );
  console.log('src', f.getSrc() );
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
