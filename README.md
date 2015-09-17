nitro [![wercker status](https://app.wercker.com/status/4518d69bc996c3a4b3e20249ccacb487/s/master "wercker status")](https://app.wercker.com/project/bykey/4518d69bc996c3a4b3e20249ccacb487)
=================

```sh
npm install nitro --save-dev
```

```js
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
