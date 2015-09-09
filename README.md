# nitro-tools

```sh
npm install --save-dev nitro-tools
```

```js
var nitro = require('nitro-tools');

nitro.cwd('src').load('*.{sass,scss}').process('sass').write('dist/assets/css');

nitro.cwd('src').load('*.{js}').process('uglify').write('dist/js');
```
