
const { performance } = require('perf_hooks')

const { yellow, cyan, magenta, black } = require('chalk')

const { reducePatterns, reducePromises, runCommand, getFileENV, getmSeconds } = require('./helpers')

const { eachFile } = require('../eachFile')
const WatchDir = require('../WatchDir')

module.exports = {
  cmd: '$0',
  description: 'default command',
  config: yargs => {
    yargs
      .usage(`
    $0 \\
      --each '{,**/*.js}' 'echo $FILE_NAME' \\
      --watch '{,**/*.js}' 'echo "\${FILE_NAME} has changed"'
  
    Environment variables added to each command:
  
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
  
    Also: \`FILE_ROOTPATH\` is filepath from system root 
    `)
      .option('dir', {
        alias: 'd',
        type: 'string',
        default: '.',
        description: 'directory to be watched',
      })
      .option('stdout', {
        type: 'boolean',
        default: true,
        description: 'print commands stdout',
      })
      .option('stderr', {
        type: 'boolean',
        default: true,
        description: 'print commands stderr',
      })
      .option('each', {
        alias: 'p',
        type: 'array',
        nargs: 2,
        default: [],
        description: "'<pattern>' '<command>'",
      })
      .option('watch', {
        alias: 'w',
        type: 'array',
        nargs: 2,
        default: [],
        // eslint-disable-next-line no-template-curly-in-string
        description: "'<pattern>' '<command>'",
      })
      .option('after-watch', {
        type: 'array',
        nargs: 1,
        default: [],
        description: "'<command>'",
      })
      .option('debounce-watch', {
        type: 'boolean',
        default: false,
        description: 'if true, watch command will be executed in groups between executions, this is the only case when variables are not being injected',
      })
      .option('concurrent', {
        alias: 'c',
        type: 'boolean',
        nargs: 0,
        description: 'runs each/watch commands concurrently',
      })
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        nargs: 1,
        // default: ( process.env.MAKEFLAGS && /s/.test(process.env.MAKEFLAGS) ? false : true ),
        default: true,
      })
  },
  fn: async argv => {
    const eachPatterns = reducePatterns(argv.each)
    const watchPatterns = reducePatterns(argv.watch)
    const cwd = argv.dir
    const { debounceWatch } = argv
  
    const eachPattern = eachPatterns.map(pattern => async () => {
      await eachFile(pattern.pattern, {
        cwd,
      }, async (filepath) => {
        await runCommand(pattern.command, {
          env: getFileENV(filepath, { cwd }),
          stdout: argv.stdout,
          stderr: argv.stderr,
        })
      })
    })
  
    await (argv.concurrent
      ? Promise.all(eachPattern.map(
        (run) => run())
      )
      : reducePromises(eachPattern)
    )
  
    if (!watchPatterns.length) return
  
    const watcher = new WatchDir(cwd, { debounceWatch })
  
    async function _runCommand (command, env = process.env) {
      var _start = performance.now()
      // eslint-disable-next-line no-console
      argv.verbose && console.log(`\n${magenta('running')} ${command}`)
      await runCommand(command, {
        env,
        stdout: argv.stdout,
        stderr: argv.stderr,
      })
        .catch(console.error) // eslint-disable-line no-console
      // eslint-disable-next-line no-console
      argv.verbose && console.log(`${cyan('finished')} ${black(getmSeconds(performance.now() - _start))}`)
    }
  
    watchPatterns.forEach(
      (_watch) => {
        watcher.when(
          _watch.pattern,
          (filepath) => _runCommand(
            _watch.command,
            getFileENV(filepath[0], { cwd })
          )
        )
      }
    )
  
    argv.afterWatch.forEach((command) => {
      watcher.run(() => _runCommand(command))
    })
  
    /* eslint-disable no-console */
    argv.verbose && console.log(`\n${yellow('watching')}: ${cwd}`)
    argv.verbose && watcher.run(() => {
      console.log(`\n${yellow('waiting')}...`)
    })
    /* eslint-enable no-console */
  },
}
