
## NITRO 4

### Install
``` sh
npm i -D nitro@4
```

### JavaScript
  
``` js
import { eachFile } from 'nitro/eachFile'

eachFile('{,**/}* ; !{,**/}*.sass', filepath => {
  console.log(`found file: ${filepath}`)
})

eachFile(['{,**/}*', '!{,**/}*.sass'], filepath => {
  console.log(`found file: ${filepath}`)
})

```

``` js
import WatchDir from 'nitro/WatchDir'

new WatchDir('./src')
  .when('{,**/}* ; !{,**/}*.sass', filepath => {
    console.log(`${filepath} file has changed`)
  })
  .when('{,**/}*.sass', filepath => {
    console.log('sass files changed')
  })
  .run(() => {
    console.log('all when detected has finished')
  })

```


### CLI

``` sh
npx nitro -d ./src \
  --each '{,**/}*.sass' 'sass ${FILE_PATH} -o ${FILE_DIR}${FILE_NAME}.css'
```

``` sh
npx nitro -d ./src \
  --watch '{,**/}* ; !{,**/}*.sass' 'echo "file ${FILE_PATH} has changed"' \
  --watch '{,**/}*.sass' 'make css' \
  --after-watch 'echo "any watch has matched and all have finished"'
```

> These are the environment variables injected to each command:
``` js
┌────────────────────────────────────────────────────────┐
│                    FILE_CWDPATH                        │
├─────────────────────────────────┬──────────────────────┤
│          FILE_CWDDIR            │       FILE_BASE      │
├────────────┬────────────────────┴──────────────────────┤
│            │                FILE_PATH                  │
│  FILE_CWD  ├────────────────────┬───────────┬──────────┤
│            │      FILE_DIR      │ FILE_NAME │ FILE_EXT │
│            │                    │           │          │
"     src    /   component/styles / component     .css   "
└────────────┴────────────────────┴───────────┴──────────┘

Also: `FILE_ROOTPATH` is filepath from system root 
```
