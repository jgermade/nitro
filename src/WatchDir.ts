
import chokidar from 'chokidar'

import { matchFilter } from './helpers/glob.helpers'
import { Watcher } from './Watcher'

interface WatchDirOptions {
  dir?: string
  manualBoot?: boolean
  debounceWatch?: boolean
}

export class WatchDir {
  watcher: Watcher
  cwd: string
  options: WatchDirOptions

  constructor (cwd: string|WatchDirOptions = '.', options: WatchDirOptions = {}) {
    if (typeof cwd === 'object') {
      options = cwd
      cwd = options.dir ?? '.'
    }
    this.watcher = new Watcher()
    this.cwd = cwd
    this.options = options

    if (options.manualBoot !== true) this.watch(cwd)
  }

  when (pattern: string|string[], cbFn: Function): WatchDir {
    const matches = matchFilter(pattern)

    this.watcher.when(
      (filesChanged: string[]) => filesChanged.some((file_path: string) => matches(file_path)),
      cbFn,
    )

    return this
  }

  watch (cwd: string = this.cwd): WatchDir {
    const { debounceWatch = false } = this.options
    const filesChanged: string[] = []

    const _processFiles = (): void => {
      if (filesChanged.length === 0) return

      this.watcher.process(
        debounceWatch
          ? filesChanged.splice(0)
          : [filesChanged.shift()]
      )
        .then(_processFiles)
        .catch(console.error) // eslint-disable-line no-console
    }

    chokidar
      .watch('.', {
        cwd,
        ignoreInitial: true,
      })
      .on('all', (_event, path) => {
        if (!filesChanged.includes(path)) filesChanged.push(path)

        _processFiles()
      })

    return this
  }
}

module.exports = WatchDir
