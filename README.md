# nitro-tools

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
